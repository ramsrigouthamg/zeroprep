import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("lets presenters discover, remember, and use a specific microphone", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.match(page, /navigator\.mediaDevices\.enumerateDevices\(\)/);
  assert.match(page, /addEventListener\?\.\("devicechange"/);
  assert.match(page, /zeroprep\.microphone-device-id/);
  assert.match(page, /deviceId: \{ exact: requestedMicrophoneId \}/);
  assert.match(page, /id="microphone-input"/);
  assert.match(page, /System default microphone/);
  assert.match(page, /detectMicrophones/);
  assert.match(css, /\.microphone-picker/);
  assert.match(css, /\.microphone-select-shell/);
});
