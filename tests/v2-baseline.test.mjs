import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("V2 adds semantic visuals without drifting from V1 voice behavior", async () => {
  const [v1Text, v2Text, baselineSource, iconSource] = await Promise.all([
    readFile(new URL("config/v1.json", root), "utf8"),
    readFile(new URL("config/v2.json", root), "utf8"),
    readFile(new URL("V2_BASELINE.md", root), "utf8"),
    readFile(new URL("lib/iconography.ts", root), "utf8"),
  ]);
  const v1 = JSON.parse(v1Text);
  const v2 = JSON.parse(v2Text);

  assert.equal(v2.release, "V2");
  assert.equal(v2.inherits, "V1");
  assert.equal(v2.locked_at, "2026-07-18");
  assert.equal(v2.status, "locked");
  assert.deepEqual(v2.realtime, v1.realtime);
  assert.deepEqual(v2.presentation, v1.presentation);
  assert.equal(v2.visuals.iconography.library, "lucide-react");
  assert.equal(v2.visuals.iconography.license, "ISC");
  assert.equal(v2.visuals.iconography.installed_catalog_size, 1748);
  assert.equal(v2.visuals.iconography.director_vocabulary_size, 119);
  assert.equal(v2.visuals.diagram_connectors, true);

  const iconNames = [...iconSource.matchAll(/^\s+"([a-z-]+)",$/gm)].map((match) => match[1]);
  assert.equal(iconNames.length, 119);
  assert.equal(new Set(iconNames).size, 119);
  assert.equal(
    createHash("sha256").update(iconSource).digest("hex"),
    v2.visuals.iconography.vocabulary_sha256,
  );
  assert.match(baselineSource, /Treat V2 as immutable/);
  assert.match(baselineSource, /exactly 119 unique semantic icons/);
});
