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
  const sceneCanvas = page.slice(
    page.indexOf("function SceneCanvas"),
    page.indexOf("function exportFileStem"),
  );
  const loopingCanvasRules = [...css.matchAll(/([^{}]+)\{([^{}]*\banimation\s*:[^{}]*?)\}/g)]
    .filter(([, selector, body]) =>
      /(?:scene-|hero-|card-|idea-card|metric-|quote-|stage-(?:canvas|progress))/.test(
        selector,
      ) && /\binfinite\b/.test(body),
    )
    .map(([, selector]) => selector.trim());

  assert.equal(brand.name, "ZeroPrep");
  assert.match(layout, /Live presentations\. Zero prep\./);
  assert.match(layout, /\/og\.png/);
  assert.match(page, /ZEROPREP COVER \/ AWAITING SPEECH/);
  assert.match(page, /Start live presentation/);
  assert.match(page, /Listens continuously until stopped/);
  assert.match(page, /selectedRealtimeModelOption\.shortLabel/);
  assert.match(page, /cards-count-\$\{cardCount\}/);
  assert.match(css, /\.scene-cover/);
  assert.match(css, /\.card-grid\.cards-count-2/);
  assert.match(css, /container-type:\s*inline-size/);
  assert.match(css, /grid-template-rows:\s*auto minmax\(0, 1fr\)/);
  assert.match(css, /font-size:\s*clamp\(11px, 1\.05cqw, 17px\)/);
  assert.match(page, /fitSceneToCanvas\(next\)/);
  assert.match(page, /sceneNumber=\{stageSceneNumber\}/);
  assert.match(page, /key=\{`scene-\$\{stageSceneNumber\}`\}/);
  assert.match(page, /key=\{`card-\$\{index\}`\}/);
  assert.match(sceneCanvas, /key=\{scene\.backgroundImage\}/);
  assert.doesNotMatch(page, /key=\{scene\.id\}/);
  assert.match(page, /nextSceneSequenceRef/);
  assert.match(page, /const isLogicalSceneUpdate/);
  assert.match(page, /startsLogicalScene &&/);
  assert.match(page, /backgroundImage: outgoing\.backgroundImage/);
  assert.match(page, /sceneRef\.current\.sequence === requestedSceneSequence/);
  assert.match(page, /\{brand\.display_name\} \/ LIVE CANVAS/);
  assert.match(page, /\{brand\.display_name\} \/ AUTO-DIRECTOR/);
  assert.match(page, /disabled=\{connection === "live" \|\| connection === "connecting"\}/);
  assert.doesNotMatch(page, /scene\.id === "opening" \? "00" : "02"/);
  assert.doesNotMatch(page, /formatSequenceNumber\(sceneNumber\)/);
  assert.doesNotMatch(sceneCanvas, /hero-index|formatSequenceNumber\(sceneNumber\)/);
  assert.doesNotMatch(page, /motionBeat|is-reactive|is-live-focus|EXPORTED SCENE/);
  assert.doesNotMatch(css, /\.idea-card:nth-child\(2\)/);
  assert.match(css, /\.scene-layer\.is-exiting \*::before,[\s\S]*?animation: none !important/);
  assert.match(css, /animation:\s*generatedImageDockIn/);
  assert.match(css, /animation:\s*cardRise/);
  assert.match(css, /animation:\s*iconPop/);
  assert.match(css, /animation:\s*metricSpin/);
  assert.doesNotMatch(css, /hero-index|is-reactive|is-live-focus|live-sweep/);
  assert.doesNotMatch(
    css,
    /progressDrift|liveSweep|orbitFloat|livePulse|iconSignal|metricBreathe/,
  );
  assert.deepEqual(loopingCanvasRules, []);
  assert.doesNotMatch(css, /\.hero-layout h1\s*\{[^}]*line-height:\s*0\.84/s);
  assert.match(css, /\.hero-layout h1\s*\{[^}]*line-height:\s*1\.02/s);
  assert.match(css, /\.metric-unit\s*\{[^}]*-webkit-line-clamp:\s*2/s);
  assert.match(css, /\.export-slide \.scene-cards\.has-generated-background\.copy-dense \.scene-heading h2/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*?\.stage-frame \.scene-heading/);
  assert.doesNotMatch(css, /\.cards-layout\s*\{[^}]*justify-content:\s*flex-end/s);
  assert.doesNotMatch(css, /\.(?:cards|metric|quote)-layout\s*\{[^}]*height:\s*calc\(100% - 18px\)/s);
  assert.doesNotMatch(page, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});
