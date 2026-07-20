import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("defaults to Realtime 2.1 while keeping Mini selectable", async () => {
  const [configText, modelSource, pageSource, routeSource, cssSource] = await Promise.all([
    readFile(new URL("config/v7.json", root), "utf8"),
    readFile(new URL("lib/realtime-models.ts", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/api/realtime/route.ts", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  const config = JSON.parse(configText);

  assert.equal(config.realtime.model, "gpt-realtime-2.1");
  assert.match(modelSource, /id: "gpt-realtime-2\.1-mini"/);
  assert.match(modelSource, /id: "gpt-realtime-2\.1"/);
  assert.match(modelSource, /id: "gpt-realtime-2\.1"[\s\S]*?badge: "DEFAULT"/);
  assert.match(modelSource, /isRealtimeModel/);

  assert.match(pageSource, /zeroprep\.realtime-model\.v2/);
  assert.match(pageSource, /X-ZeroPrep-Realtime-Model/);
  assert.match(pageSource, /role="radiogroup"/);
  assert.match(pageSource, /Voice model settings/);
  assert.match(routeSource, /request\.headers\.get\("X-ZeroPrep-Realtime-Model"\)/);
  assert.match(routeSource, /isRealtimeModel\(requestedModel\)/);
  assert.match(cssSource, /\.model-settings-toggle/);
  assert.match(cssSource, /\.model-settings-panel/);
});
