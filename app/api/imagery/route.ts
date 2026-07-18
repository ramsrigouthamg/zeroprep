import { GoogleGenAI } from "@google/genai";
import v7 from "@/config/v7.json";
import {
  checkRateLimit,
  hasMismatchedOrigin,
  rateLimitResponse,
} from "@/lib/request-guards";

export const runtime = "nodejs";
export const maxDuration = 60;

type ImageryRequest = {
  sceneId?: unknown;
  kind?: unknown;
  eyebrow?: unknown;
  title?: unknown;
  subtitle?: unknown;
  metric?: unknown;
  metricLabel?: unknown;
  quote?: unknown;
  cards?: unknown;
  accent?: unknown;
};

const SCENE_KINDS = new Set(["hero", "cards", "metric", "quote"]);
const ACCENT_DESCRIPTIONS: Record<string, string> = {
  ember: "electric orange-red",
  lime: "acid lime green",
  sky: "clear cyan blue",
  violet: "luminous violet",
};

function cleanText(value: unknown, limit: number) {
  return typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().slice(0, limit)
    : "";
}

function cardSummary(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value
    .slice(0, 4)
    .map((card) => {
      if (!card || typeof card !== "object") return "";
      const item = card as Record<string, unknown>;
      return [cleanText(item.title, 80), cleanText(item.body, 180)]
        .filter(Boolean)
        .join(": ");
    })
    .filter(Boolean)
    .join("; ")
    .slice(0, 700);
}

function compositionDirection(kind: string) {
  if (kind === "hero") {
    return "Create one unmistakable visual subject near the center. It must remain clear when the wide image is center-cropped into a tall right-side panel.";
  }
  if (kind === "cards") {
    return "Create a strong, wide establishing image with a clear center of interest. This will appear as a dedicated landscape panel above a row of information cards.";
  }
  if (kind === "metric") {
    return "Create one bold real-world visual metaphor for the metric, centered and easy to read inside a dedicated right-side image panel, without drawing a literal chart or any numbers.";
  }
  return "Create an atmospheric, emotionally resonant image with one clear subject that works inside a dedicated right-side panel.";
}

function buildPrompt(body: ImageryRequest) {
  const kind = cleanText(body.kind, 16);
  const title = cleanText(body.title, 180);
  const subtitle = cleanText(body.subtitle, 500);
  const quote = cleanText(body.quote, 500);
  const metric = cleanText(body.metric, 80);
  const metricLabel = cleanText(body.metricLabel, 120);
  const cards = cardSummary(body.cards);
  const accent = ACCENT_DESCRIPTIONS[cleanText(body.accent, 16)] || "vivid lime green";
  const subject = [
    title && `Main idea: ${title}`,
    subtitle && `Context: ${subtitle}`,
    quote && `Emotional theme: ${quote}`,
    metric && `Metric concept: ${metric} ${metricLabel}`,
    cards && `Related ideas: ${cards}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `Create one sophisticated 16:9 editorial presentation background image.

${subject}

Visual direction:
- Translate the idea into concrete, relevant imagery rather than generic abstract shapes.
- Contemporary editorial photography or tactile mixed-media collage, energetic and premium, with a subtle motion-graphics feeling.
- Warm ivory, deep black, and ${accent} may guide the palette.
- ${compositionDirection(kind)}
- The image will be shown unobstructed inside its own reserved presentation panel; make the subject bold, clear, and visually rich. No text will be placed over it, so do not reserve empty copy space.
- No words, letters, numbers, captions, logos, watermarks, presentation frames, charts with labels, app interfaces, or decorative fake text.
- Do not render a slide. Produce only the underlying cinematic imagery.
- Avoid identifiable public figures and branded products.
`;
}

export async function POST(request: Request) {
  if (hasMismatchedOrigin(request)) {
    return Response.json({ error: "Cross-origin imagery requests are not allowed." }, { status: 403 });
  }

  const rateLimit = checkRateLimit(
    request,
    "gemini-imagery",
    v7.security.imagery_requests_per_window,
    v7.security.rate_limit_window_ms,
  );
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Generated imagery needs GEMINI_API_KEY in the server environment." },
      { status: 503 },
    );
  }

  let body: ImageryRequest;
  try {
    body = (await request.json()) as ImageryRequest;
  } catch {
    return Response.json({ error: "A valid scene description is required." }, { status: 400 });
  }

  const sceneId = cleanText(body.sceneId, 120);
  const kind = cleanText(body.kind, 16);
  const title = cleanText(body.title, 180);
  if (!sceneId || !SCENE_KINDS.has(kind) || !title) {
    return Response.json({ error: "The scene is incomplete." }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const interaction = await ai.interactions.create(
      {
        model: v7.imagery.model,
        input: buildPrompt(body),
        store: false,
        response_format: {
          type: "image",
          mime_type: v7.imagery.mime_type,
          aspect_ratio: v7.imagery.aspect_ratio,
          image_size: v7.imagery.image_size,
        },
      },
      {
        timeout: v7.imagery.timeout_ms,
        maxRetries: 0,
        fetchOptions: { signal: request.signal },
      },
    );

    const generated = interaction.output_image;
    if (!generated?.data) {
      return Response.json(
        { error: "Gemini did not return an image for this scene." },
        { status: 502 },
      );
    }

    const mimeType = generated.mime_type || v7.imagery.mime_type;
    return new Response(Buffer.from(generated.data, "base64"), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "private, no-store, max-age=0",
        "X-ZeroPrep-Scene": sceneId,
        "X-ZeroPrep-Image-Model": v7.imagery.model,
      },
    });
  } catch (error) {
    if (request.signal.aborted) {
      return new Response(null, { status: 499 });
    }
    const message = error instanceof Error ? error.message : "Gemini imagery could not be generated.";
    return Response.json({ error: message }, { status: 502 });
  }
}
