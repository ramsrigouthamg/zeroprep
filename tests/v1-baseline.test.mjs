import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("V1 realtime and presentation behavior stays locked", async () => {
  const [configText, baselineSource] = await Promise.all([
    readFile(new URL("config/v1.json", root), "utf8"),
    readFile(new URL("V1_BASELINE.md", root), "utf8"),
  ]);
  const config = JSON.parse(configText);

  assert.equal(config.release, "V1");
  assert.equal(config.realtime.model, "gpt-realtime-2.1");
  assert.equal(config.realtime.transcription_model, "gpt-realtime-whisper");
  assert.equal(config.realtime.noise_reduction, "far_field");
  assert.deepEqual(config.realtime.turn_detection, {
    type: "server_vad",
    threshold: 0.3,
    prefix_padding_ms: 300,
    silence_duration_ms: 200,
    create_response: true,
    interrupt_response: false,
  });
  assert.equal(config.realtime.tool_choice, "required");
  assert.deepEqual(config.realtime.output_modalities, ["text"]);
  assert.equal(config.presentation.initial_scene, "blank");
  assert.equal(config.presentation.initial_scene_number, 0);
  assert.equal(config.presentation.motion_beat_ms, 1600);

  assert.match(baselineSource, /Treat V1 as immutable/);
  assert.match(baselineSource, /config\/v1\.json/);
});
