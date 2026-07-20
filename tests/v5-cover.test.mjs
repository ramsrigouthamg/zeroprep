import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("V5 opens on the ZeroPrep cover and replaces it on first speech", async () => {
  const [v4Text, v5Text, pageSource, routeSource, cssSource, packageText] =
    await Promise.all([
      readFile(new URL("config/v4.json", root), "utf8"),
      readFile(new URL("config/v5.json", root), "utf8"),
      readFile(new URL("app/page.tsx", root), "utf8"),
      readFile(new URL("app/api/realtime/route.ts", root), "utf8"),
      readFile(new URL("app/globals.css", root), "utf8"),
      readFile(new URL("package.json", root), "utf8"),
    ]);
  const v4 = JSON.parse(v4Text);
  const v5 = JSON.parse(v5Text);
  const packageJson = JSON.parse(packageText);

  assert.equal(v5.release, "V5");
  assert.equal(v5.inherits, "V4");
  assert.deepEqual(v5.realtime, v4.realtime);
  assert.deepEqual(v5.visuals, v4.visuals);
  assert.deepEqual(v5.delivery, v4.delivery);
  assert.deepEqual(v5.brand, v4.brand);
  assert.equal(v5.presentation.initial_scene, "brand_cover");
  assert.equal(v5.presentation.initial_scene_number, 0);
  assert.equal(v5.presentation.initial_scene_asset, "/og.png");
  assert.equal(v5.presentation.first_speech_action, "replace");
  assert.equal(v5.presentation.include_cover_in_export, false);
  assert.equal(v5.presentation.motion_beat_ms, v4.presentation.motion_beat_ms);
  assert.equal(v5.presentation.recent_scene_limit, v4.presentation.recent_scene_limit);

  assert.equal(packageJson.name, "zeroprep-live-presentations");
  assert.match(pageSource, /kind:\s*"cover"/);
  assert.match(pageSource, /scene\.kind === "cover"/);
  assert.match(pageSource, /numberedNext\.kind !== "cover"/);
  assert.match(pageSource, /selectedRealtimeModelOption\.shortLabel/);
  assert.match(routeSource, /starts on the ZeroPrep welcome cover/);
  assert.match(routeSource, /turn_detection:\s*v\d\.realtime\.turn_detection/);
  assert.match(cssSource, /\.scene-cover/);
  assert.match(cssSource, /url\("\/og\.png"\)/);
});
