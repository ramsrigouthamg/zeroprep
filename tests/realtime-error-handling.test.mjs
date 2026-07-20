import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("hides only the non-fatal overlapping Realtime response warning", async () => {
  const page = await readFile(new URL("app/page.tsx", root), "utf8");

  assert.match(page, /if \(\/active response in progress\/i\.test\(message\)\)/);
  assert.match(page, /setError\(""\);\s*return;/);
  assert.match(page, /setError\(message\);\s*setDirectorStatus\("Realtime error"\)/);
});
