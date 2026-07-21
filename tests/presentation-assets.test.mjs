import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("uploaded presentation assets are matched locally and passed to the live director by name", async () => {
  const [page, assets, route, ramsri, danish] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("lib/presentation-assets.ts", root), "utf8"),
    readFile(new URL("app/api/realtime/route.ts", root), "utf8"),
    readFile(new URL("public/demo-ramsri.jpg", root)),
    readFile(new URL("public/demo-danish.jpg", root)),
  ]);

  assert.match(page, /PRESENTATION ASSETS/);
  assert.match(page, /We’re Ramsri and Danish/);
  assert.match(page, /DEMO_ASSETS/);
  assert.match(page, /Demo assets loaded — Ramsri \+ Danish/);
  assert.match(page, /accept="image\/\*"/);
  assert.match(page, /MAX_PRESENTATION_ASSETS = 12/);
  assert.match(page, /MAX_PRESENTATION_ASSET_BYTES/);
  assert.match(page, /matchPresentationAssets\(sceneText\(fittedNext\), presentationAssetsRef\.current\)/);
  assert.match(page, /X-ZeroPrep-Asset-Catalog/);
  assert.match(page, /scene-assets/);
  assert.match(page, /images stay in this browser/);
  assert.match(assets, /export function matchPresentationAssets/);
  assert.match(assets, /includesTerm/);
  assert.match(route, /Presentation asset library:/);
  assert.match(route, /visible copy includes that exact name/);
  assert.ok(ramsri.byteLength > 10_000);
  assert.ok(danish.byteLength > 10_000);
});
