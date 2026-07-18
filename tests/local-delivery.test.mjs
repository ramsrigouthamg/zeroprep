import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("keeps presentation exports local and removes public file sharing", async () => {
  const [v7Text, pageSource, packageText, readme] = await Promise.all([
    readFile(new URL("config/v7.json", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
    readFile(new URL("README.md", root), "utf8"),
  ]);

  const v7 = JSON.parse(v7Text);
  const packageJson = JSON.parse(packageText);

  assert.equal(v7.delivery.sharing, undefined);
  assert.equal(v7.security.share_tokens_per_window, undefined);
  assert.equal(packageJson.dependencies["@vercel/blob"], undefined);
  assert.equal(packageJson.dependencies.qrcode, undefined);
  assert.equal(packageJson.devDependencies["@types/qrcode"], undefined);

  assert.match(pageSource, /pdf\.save\(`/);
  assert.match(pageSource, /pptx\.writeFile/);
  assert.doesNotMatch(pageSource, /Share QR|api\/share|published\.downloadUrl|qrcode/i);
  assert.doesNotMatch(readme, /BLOB_READ_WRITE_TOKEN|Vercel Blob|Share QR/);
  await assert.rejects(readFile(new URL("app/api/share/route.ts", root), "utf8"));
});
