import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("uploaded assets use one description field with automatic semantic routing", async () => {
  const [page, assets, route, css, ramsri, danish] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("lib/presentation-assets.ts", root), "utf8"),
    readFile(new URL("app/api/realtime/route.ts", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL("public/demo-ramsri.jpg", root)),
    readFile(new URL("public/demo-danish.jpg", root)),
  ]);

  assert.match(page, /PRESENTATION ASSETS/);
  assert.match(page, /Just start speaking and a live presentation will be created/);
  assert.match(page, /We’re Ramsri and Danish/);
  assert.match(page, /DEMO_ASSETS/);
  assert.match(page, /Demo assets loaded — Ramsri \+ Danish/);
  assert.match(page, /accept="image\/\*"/);
  assert.match(page, /MAX_PRESENTATION_ASSETS = 12/);
  assert.match(page, /MAX_PRESENTATION_ASSET_BYTES/);
  const {
    encodePresentationAssetCatalog,
    inferPresentationAssetKind,
    matchPresentationAssets,
    presentationAssetFit,
    presentationAssetMode,
    presentationAssetShape,
    resolvePresentationAssets,
  } = await import(new URL("lib/presentation-assets.ts", root));
  const sampleAssets = [
    {
      id: "asset-ramsri",
      name: "Ramsri",
      aliases: ["ram sri"],
      description: "ZeroPrep co-founder and product lead",
      kind: "person",
      mimeType: "image/jpeg",
      url: "data:image/jpeg;base64,private-pixels",
      referenceUrl: "data:image/webp;base64,reference-copy",
    },
    {
      id: "asset-logo",
      name: "ZeroPrep mark",
      aliases: [],
      description: "Official company identity for title and closing moments",
      kind: "logo",
      mimeType: "image/png",
      url: "data:image/png;base64,private-logo",
      referenceUrl: "data:image/webp;base64,reference-logo",
    },
  ];

  assert.deepEqual(
    matchPresentationAssets("Our co-founder leads the product vision", sampleAssets).map((asset) => asset.id),
    ["asset-ramsri"],
  );
  assert.deepEqual(resolvePresentationAssets(["asset-logo", "missing"], sampleAssets).map((asset) => asset.id), ["asset-logo"]);
  assert.equal(presentationAssetFit(sampleAssets[0]), "cover");
  assert.equal(presentationAssetFit(sampleAssets[1]), "contain");
  assert.equal(presentationAssetFit({ kind: "photo", width: 3000, height: 500 }), "contain");
  assert.equal(presentationAssetFit({ kind: "photo", width: 1600, height: 1000 }), "cover");
  assert.equal(presentationAssetShape({ width: 600, height: 1200 }), "portrait");
  assert.equal(presentationAssetShape({ width: 1600, height: 900 }), "landscape");
  assert.equal(presentationAssetShape({ width: 2400, height: 700 }), "wide");
  assert.equal(presentationAssetShape({}), "unknown");
  assert.equal(presentationAssetMode(sampleAssets[0]), "direct");
  assert.equal(presentationAssetMode(sampleAssets[1]), "direct");
  assert.equal(
    presentationAssetMode({
      kind: "illustration",
      description: "Abstract workflow illustration",
      referenceUrl: "data:image/webp;base64,safe-reference",
    }),
    "reference",
  );
  assert.equal(
    presentationAssetMode({
      kind: "photo",
      description: "Warm office background and visual style",
      referenceUrl: "data:image/webp;base64,safe-reference",
    }),
    "reference",
  );
  assert.equal(
    presentationAssetMode({
      kind: "photo",
      description: "Customer event photo",
      referenceUrl: "data:image/webp;base64,reference-copy",
    }),
    "direct",
  );
  assert.equal(inferPresentationAssetKind("Person Ramsri building Questgen", "logo.png"), "person");
  assert.equal(inferPresentationAssetKind("Product image of Questgen"), "product");
  assert.equal(inferPresentationAssetKind("Logo of ZeroPrep"), "logo");
  assert.equal(inferPresentationAssetKind("Questgen app screenshot"), "screenshot");
  const encodedCatalog = encodePresentationAssetCatalog(sampleAssets);
  const decodedCatalog = JSON.parse(Buffer.from(encodedCatalog, "base64url").toString("utf8"));
  assert.equal(decodedCatalog[0].description, "ZeroPrep co-founder and product lead");
  assert.equal(decodedCatalog[0].mode, "direct");
  assert.equal(decodedCatalog[0].fit, "cover");
  assert.equal(decodedCatalog[0].shape, "unknown");
  assert.equal("url" in decodedCatalog[0], false);

  assert.match(page, /assetIds:/);
  assert.match(page, /encodePresentationAssetCatalog/);
  assert.match(page, /DESCRIBE IMAGE \{assetNumber\}/);
  assert.match(page, /Who or what is shown\?/);
  assert.match(page, /Add images ZeroPrep can use\./);
  assert.match(page, /Describe each image\. ZeroPrep chooses when to show it\./);
  assert.match(page, /presentationAssetMode\(asset\)/);
  assert.match(page, /Gemini composition/);
  assert.match(page, /Original · safe crop/);
  assert.match(page, /exactAssetKinds/);
  assert.match(page, /referenceAssets: referenceAssets\.map/);
  assert.match(page, /X-ZeroPrep-Asset-Catalog/);
  assert.match(page, /scene-assets/);
  const sceneCanvas = page.slice(
    page.indexOf("function SceneCanvas"),
    page.indexOf("function exportFileStem"),
  );
  assert.doesNotMatch(sceneCanvas, /<figcaption/);
  assert.doesNotMatch(sceneCanvas, /alt=\{(?:asset|cardAsset)\.(?:description|name)/);
  assert.match(sceneCanvas, /<NextImage src=\{asset\.url\} alt=""/);
  assert.match(sceneCanvas, /src=\{cardAsset\.url\}[\s\S]*?alt=""/);
  assert.doesNotMatch(page, /aria-label=\{`Description for \$\{asset\.name\}`\}/);
  assert.doesNotMatch(page, /aria-label=\{`Remove \$\{asset\.description \|\| asset\.name\}`\}/);
  assert.ok(page.indexOf('<section className="asset-library"') > page.indexOf('className="mic-button"'));
  const assetLibrary = page.slice(
    page.indexOf('<section className="asset-library"'),
    page.indexOf("{error &&"),
  );
  assert.doesNotMatch(assetLibrary, /<select/);
  assert.doesNotMatch(page, /THE DIRECTOR DECIDES/);
  assert.match(assets, /export function matchPresentationAssets/);
  assert.match(assets, /export function resolvePresentationAssets/);
  assert.match(assets, /export function presentationAssetFit/);
  assert.match(assets, /export function presentationAssetMode/);
  assert.match(assets, /export function presentationAssetShape/);
  assert.match(assets, /export function inferPresentationAssetKind/);
  assert.match(assets, /encodePresentationAssetCatalog/);
  assert.match(assets, /includesTerm/);
  assert.match(route, /asset_catalog_json/);
  assert.match(route, /Select uploaded assets by semantic relevance/);
  assert.match(route, /human-written description as the primary source of meaning/);
  assert.match(route, /mode=reference assets in scene-level assetIds/);
  assert.match(route, /Shape and fit are automatic hints/);
  assert.match(route, /maxItems: assetIds\.length \? 3 : 0/);
  assert.match(route, /required: \["action", "assetIds"\]/);
  assert.doesNotMatch(route, /visible copy includes that exact name/);
  assert.doesNotMatch(css, /\.scene-asset figcaption/);
  assert.ok(ramsri.byteLength > 10_000);
  assert.ok(danish.byteLength > 10_000);
});
