import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("generated imagery enriches only the current scene without blocking composition", async () => {
  const [configText, pageSource, routeSource, cssSource, envExample, packageText] =
    await Promise.all([
      readFile(new URL("config/v7.json", root), "utf8"),
      readFile(new URL("app/page.tsx", root), "utf8"),
      readFile(new URL("app/api/imagery/route.ts", root), "utf8"),
      readFile(new URL("app/globals.css", root), "utf8"),
      readFile(new URL(".env.example", root), "utf8"),
      readFile(new URL("package.json", root), "utf8"),
    ]);

  const config = JSON.parse(configText);
  const packageJson = JSON.parse(packageText);

  assert.equal(config.imagery.model, "gemini-3.1-flash-lite-image");
  assert.equal(config.imagery.aspect_ratio, "16:9");
  assert.equal(config.imagery.image_size, "1K");
  assert.equal(packageJson.dependencies["@google/genai"], "^2.12.0");
  assert.match(envExample, /GEMINI_API_KEY=/);

  assert.match(routeSource, /new GoogleGenAI/);
  assert.match(routeSource, /interaction\.output_image/);
  assert.match(routeSource, /hasMismatchedOrigin/);
  assert.match(routeSource, /checkRateLimit/);
  assert.match(routeSource, /No words, letters, numbers/);

  assert.match(pageSource, /backgroundStatus: "generating"/);
  assert.match(pageSource, /sceneRef\.current\.id !== requestedSceneId/);
  assert.match(pageSource, /imageryAbortRef\.current\?\.abort\(\)/);
  assert.match(pageSource, /URL\.createObjectURL/);
  assert.match(pageSource, /backgroundStatus: "ready"/);
  assert.match(cssSource, /generatedImageDockIn/);
  assert.match(cssSource, /scene-background-wash/);
  assert.match(cssSource, /padding-right: 48%/);
});
