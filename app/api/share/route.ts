import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import v7 from "@/config/v7.json";
import {
  checkRateLimit,
  hasMismatchedOrigin,
  rateLimitResponse,
} from "@/lib/request-guards";

const PRESENTATION_PATH = /^presentations\/[a-f0-9]{32}\/[a-z0-9][a-z0-9._-]{0,96}\.pdf$/i;

function safePdfFilename(value: unknown) {
  const raw = typeof value === "string" ? value : "zeroprep-presentation.pdf";
  const stem = raw
    .replace(/\.pdf$/i, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
  return `${stem || "zeroprep-presentation"}.pdf`;
}

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "Vercel Blob is not connected. Add BLOB_READ_WRITE_TOKEN and redeploy." },
      { status: 503 },
    );
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return Response.json({ error: "A valid Vercel Blob upload request is required." }, { status: 400 });
  }

  if (body.type === "blob.generate-client-token") {
    if (hasMismatchedOrigin(request)) {
      return Response.json({ error: "Cross-origin upload requests are not allowed." }, { status: 403 });
    }
    const rateLimit = checkRateLimit(
      request,
      "share-token",
      v7.security.share_tokens_per_window,
      v7.security.rate_limit_window_ms,
    );
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!PRESENTATION_PATH.test(pathname)) {
          throw new Error("Invalid presentation filename.");
        }

        let requestedFilename = pathname.split("/").at(-1) || "";
        if (clientPayload) {
          try {
            const payload = JSON.parse(clientPayload) as { filename?: unknown };
            requestedFilename = safePdfFilename(payload.filename);
          } catch {
            throw new Error("Invalid presentation upload metadata.");
          }
        }
        if (!pathname.endsWith(`/${requestedFilename}`)) {
          throw new Error("Presentation filename does not match its upload metadata.");
        }

        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: v7.delivery.sharing.max_pdf_bytes,
          validUntil: Date.now() + v7.delivery.sharing.upload_token_ttl_ms,
          addRandomSuffix: false,
          cacheControlMaxAge: v7.delivery.sharing.cache_control_max_age_seconds,
          tokenPayload: JSON.stringify({ filename: requestedFilename }),
        };
      },
      onUploadCompleted: async () => {
        // The public, unlisted Blob URL is returned directly to the browser.
      },
    });

    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The PDF upload could not be authorized.";
    return Response.json({ error: message }, { status: 400 });
  }
}
