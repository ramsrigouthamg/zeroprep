import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("V3 adds fullscreen and faithful PDF/PPTX delivery without V2 drift", async () => {
  const [v2Text, v3Text, pageSource, cssSource, packageText] =
    await Promise.all([
      readFile(new URL("config/v2.json", root), "utf8"),
      readFile(new URL("config/v3.json", root), "utf8"),
      readFile(new URL("app/page.tsx", root), "utf8"),
      readFile(new URL("app/globals.css", root), "utf8"),
      readFile(new URL("package.json", root), "utf8"),
    ]);
  const v2 = JSON.parse(v2Text);
  const v3 = JSON.parse(v3Text);
  const packageJson = JSON.parse(packageText);

  assert.equal(v3.release, "V3");
  assert.equal(v3.inherits, "V2");
  assert.deepEqual(v3.realtime, v2.realtime);
  assert.deepEqual(v3.presentation, v2.presentation);
  assert.deepEqual(v3.visuals, v2.visuals);
  assert.equal(v3.delivery.fullscreen, true);
  assert.equal(v3.delivery.export_after_stop, true);
  assert.equal(v3.delivery.export_width_px, 1600);
  assert.equal(v3.delivery.export_height_px, 900);
  assert.equal(v3.delivery.pdf.library, "jspdf");
  assert.equal(v3.delivery.pptx.library, "pptxgenjs");
  assert.equal(v3.delivery.capture.library, "html-to-image");

  assert.equal(packageJson.dependencies["html-to-image"], "^1.11.13");
  assert.equal(packageJson.dependencies.jspdf, "^4.2.1");
  assert.equal(packageJson.dependencies.pptxgenjs, "^4.0.1");

  assert.match(pageSource, /requestFullscreen/);
  assert.match(pageSource, /document\.exitFullscreen/);
  assert.match(pageSource, /import\("html-to-image"\)/);
  assert.match(pageSource, /import\("jspdf"\)/);
  assert.match(pageSource, /import\("pptxgenjs"\)/);
  assert.match(pageSource, /deckMutation === "update"/);
  assert.match(pageSource, /data-export-slide/);
  assert.match(cssSource, /\.stage-frame:fullscreen/);
  assert.match(cssSource, /\.export-slide/);
});
