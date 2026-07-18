import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("V6 preserves the original public PDF QR sharing contract", async () => {
  const [v5Text, v6Text, baseline, packageText] = await Promise.all([
    readFile(new URL("config/v5.json", root), "utf8"),
    readFile(new URL("config/v6.json", root), "utf8"),
    readFile(new URL("V6_BASELINE.md", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
  ]);

  const v5 = JSON.parse(v5Text);
  const v6 = JSON.parse(v6Text);
  const packageJson = JSON.parse(packageText);

  assert.equal(v6.release, "V6");
  assert.equal(v6.inherits, "V5");
  assert.deepEqual(v6.realtime, v5.realtime);
  assert.deepEqual(v6.presentation, v5.presentation);
  assert.deepEqual(v6.visuals, v5.visuals);
  assert.deepEqual(v6.brand, v5.brand);
  assert.equal(v6.delivery.sharing.enabled, true);
  assert.equal(v6.delivery.sharing.format, "pdf");
  assert.equal(v6.delivery.sharing.r2_binding, "PRESENTATIONS");
  assert.equal(v6.delivery.sharing.access, "anyone_with_link");
  assert.equal(packageJson.dependencies.qrcode, "^1.5.4");
  assert.match(baseline, /Cloudflare R2/);
  assert.match(baseline, /V7 replaces only the hosting and storage adapter/);
});
