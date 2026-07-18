import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("V7 migrates delivery to native Next.js and Vercel Blob without presentation drift", async () => {
  const [
    v6Text,
    v7Text,
    pageSource,
    shareRoute,
    realtimeRoute,
    guardsSource,
    packageText,
    readme,
  ] = await Promise.all([
    readFile(new URL("config/v6.json", root), "utf8"),
    readFile(new URL("config/v7.json", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/api/share/route.ts", root), "utf8"),
    readFile(new URL("app/api/realtime/route.ts", root), "utf8"),
    readFile(new URL("lib/request-guards.ts", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
    readFile(new URL("README.md", root), "utf8"),
  ]);

  const v6 = JSON.parse(v6Text);
  const v7 = JSON.parse(v7Text);
  const packageJson = JSON.parse(packageText);

  assert.equal(v7.release, "V7");
  assert.equal(v7.inherits, "V6");
  assert.deepEqual(v7.realtime, v6.realtime);
  assert.deepEqual(v7.presentation, v6.presentation);
  assert.deepEqual(v7.visuals, v6.visuals);
  assert.deepEqual(v7.brand, v6.brand);
  assert.equal(v7.delivery.sharing.storage, "vercel_blob");
  assert.equal(v7.delivery.sharing.upload_mode, "client");
  assert.equal(v7.delivery.sharing.access, "public_unlisted");
  assert.equal(v7.delivery.sharing.max_pdf_bytes, 26_214_400);

  assert.equal(packageJson.version, "7.0.0");
  assert.equal(packageJson.scripts.dev, "next dev");
  assert.equal(packageJson.scripts.build, "next build");
  assert.equal(packageJson.dependencies["@vercel/blob"], "^2.6.1");

  assert.match(pageSource, /import v7 from "@\/config\/v7\.json"/);
  assert.match(pageSource, /import\("@vercel\/blob\/client"\)/);
  assert.match(pageSource, /published\.downloadUrl/);
  assert.match(pageSource, /pdf\.output\("blob"\)/);
  assert.match(shareRoute, /handleUpload/);
  assert.match(shareRoute, /allowedContentTypes: \["application\/pdf"\]/);
  assert.match(shareRoute, /maximumSizeInBytes/);
  assert.match(shareRoute, /validUntil/);
  assert.match(realtimeRoute, /checkRateLimit/);
  assert.match(guardsSource, /hasMismatchedOrigin/);
  assert.match(readme, /Import `https:\/\/github\.com\/ramsrigouthamg\/zeroprep` into Vercel/);
});
