import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("defines the ZeroPrep presentation studio and metadata", async () => {
  const [layout, page, css, brandText] = await Promise.all([
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL("config/brand.json", root), "utf8"),
  ]);
  const brand = JSON.parse(brandText);

  assert.equal(brand.name, "ZeroPrep");
  assert.match(layout, /Live presentations\. Zero prep\./);
  assert.match(layout, /\/og\.png/);
  assert.match(page, /ZEROPREP COVER \/ AWAITING SPEECH/);
  assert.match(page, /Start live presentation/);
  assert.match(page, /Listens continuously until stopped/);
  assert.match(page, /GPT-REALTIME-2\.1/);
  assert.match(css, /\.scene-cover/);
  assert.doesNotMatch(page, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});
