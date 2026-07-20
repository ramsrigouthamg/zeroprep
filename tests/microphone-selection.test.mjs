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
  assert.match(css, /\.microphone-picker\s*\{[^}]*padding:\s*10px 11px 9px/s);
  assert.match(css, /\.microphone-select-shell\s*\{[^}]*min-height:\s*36px/s);
  assert.doesNotMatch(
    page,
    /What are you saying next|OR SIMULATE A LINE|microphone-picker-heading-copy|microphone-signal|microphone-picker-footer/,
  );
  assert.doesNotMatch(css, /\.director-rule|\.line-form/);
});
