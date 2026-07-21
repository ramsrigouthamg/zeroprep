export const PRESENTATION_ASSET_KINDS = [
  "person",
  "logo",
  "product",
  "screenshot",
  "chart",
  "photo",
  "illustration",
] as const;

export type PresentationAssetKind = (typeof PRESENTATION_ASSET_KINDS)[number];
export type PresentationAssetFit = "contain" | "cover";
export type PresentationAssetMode = "direct" | "reference";
export type PresentationAssetShape = "unknown" | "tall" | "portrait" | "square" | "landscape" | "wide";

export type PresentationAsset = {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  kind: PresentationAssetKind;
  mimeType: string;
  width?: number;
  height?: number;
  url: string;
  referenceUrl?: string;
};

export type PresentationAssetCatalogEntry = Pick<
  PresentationAsset,
  "id" | "name" | "aliases" | "description" | "kind"
> & {
  fit: PresentationAssetFit;
  mode: PresentationAssetMode;
  shape: PresentationAssetShape;
};

const WORD_CHARACTER = /[\p{L}\p{N}]/u;
const STOP_WORDS = new Set([
  "and",
  "are",
  "but",
  "for",
  "from",
  "has",
  "have",
  "into",
  "our",
  "that",
  "the",
  "their",
  "this",
  "was",
  "were",
  "with",
  "your",
]);

const KIND_TERMS: Record<PresentationAssetKind, string[]> = {
  person: ["person", "people", "founder", "speaker", "leader", "team", "employee", "customer"],
  logo: ["logo", "brand", "company", "partner", "customer", "sponsor"],
  product: ["product", "device", "packaging", "prototype", "merchandise"],
  screenshot: ["screenshot", "interface", "dashboard", "workflow", "app", "software", "demo"],
  chart: ["chart", "graph", "data", "metric", "growth", "results", "analytics"],
  photo: ["photo", "photograph", "event", "place", "location", "moment"],
  illustration: ["illustration", "artwork", "drawing", "diagram", "concept", "visual"],
};

function normalizeText(value: string, limit = 240) {
  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function tokens(value: string) {
  return new Set(
    (normalizeText(value).toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || [])
      .filter((token) => token.length >= 2 && !STOP_WORDS.has(token)),
  );
}

export function assetTerms(asset: Pick<PresentationAsset, "name" | "aliases">) {
  return [asset.name, ...asset.aliases]
    .map((term) => normalizeText(term, 64).toLocaleLowerCase())
    .filter((term) => term.length >= 2 && [...term].some((character) => WORD_CHARACTER.test(character)));
}

function includesTerm(haystack: string, term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, "iu").test(haystack);
}

/**
 * Local fallback ranking for demos and resilience. Live sessions primarily use
 * the Realtime director's explicit asset IDs, which are selected from the full
 * semantic catalog instead of forcing names into visible slide copy.
 */
export function matchPresentationAssets(
  content: string,
  assets: PresentationAsset[],
  limit = 3,
) {
  const normalizedContent = normalizeText(content, 1200).toLocaleLowerCase();
  const contentTokens = tokens(normalizedContent);

  return assets
    .map((asset) => {
      const terms = assetTerms(asset);
      const exactTermScore = terms.reduce(
        (score, term) => score + (includesTerm(normalizedContent, term) ? 28 + term.length : 0),
        0,
      );
      const nameTokenScore = [...tokens(asset.name)].reduce(
        (score, token) => score + (contentTokens.has(token) ? 14 : 0),
        0,
      );
      const descriptionScore = [...tokens(asset.description)].reduce(
        (score, token) => score + (contentTokens.has(token) ? 16 : 0),
        0,
      );
      const kindScore = KIND_TERMS[asset.kind].reduce(
        (score, term) => score + (contentTokens.has(term) ? 10 : 0),
        0,
      );
      return { asset, score: exactTermScore + nameTokenScore + descriptionScore + kindScore };
    })
    .filter((match) => match.score >= 12)
    .sort((left, right) => right.score - left.score || left.asset.name.localeCompare(right.asset.name))
    .slice(0, limit)
    .map((match) => match.asset);
}

export function resolvePresentationAssets(
  ids: string[] | undefined,
  assets: PresentationAsset[],
  limit = 3,
) {
  if (!ids?.length) return [];
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
  return [...new Set(ids)]
    .map((id) => assetsById.get(id))
    .filter((asset): asset is PresentationAsset => Boolean(asset))
    .slice(0, limit);
}

export function presentationAssetCatalog(assets: PresentationAsset[]) {
  return assets.slice(0, 12).map((asset) => ({
    id: normalizeText(asset.id, 80),
    name: normalizeText(asset.name, 48),
    aliases: [...new Set(asset.aliases.map((alias) => normalizeText(alias, 48)).filter(Boolean))].slice(0, 4),
    description: normalizeText(asset.description, 180),
    kind: asset.kind,
    fit: presentationAssetFit(asset),
    mode: presentationAssetMode(asset),
    shape: presentationAssetShape(asset),
  })) satisfies PresentationAssetCatalogEntry[];
}

export function encodePresentationAssetCatalog(assets: PresentationAsset[]) {
  const bytes = new TextEncoder().encode(JSON.stringify(presentationAssetCatalog(assets)));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function inferPresentationAssetKind(description: string, fileName = ""): PresentationAssetKind {
  const value = (description.trim() || fileName).normalize("NFKC").toLocaleLowerCase();
  if (/\b(?:portrait|headshot|speaker|founder|co-?founder|team|person|people|employee|customer|human)\b/.test(value)) return "person";
  if (/\b(?:logo|brand|brandmark|mark|wordmark)\b/.test(value)) return "logo";
  if (/\b(?:screenshot|screen|dashboard|interface|ui|app|application)\b/.test(value)) return "screenshot";
  if (/\b(?:chart|graph|metric|analytics)\b/.test(value)) return "chart";
  if (/\b(?:product|device|pack|packaging|mockup)\b/.test(value)) return "product";
  if (/\b(?:illustration|drawing|art|artwork|diagram)\b/.test(value)) return "illustration";
  return "photo";
}

/**
 * Only transform-safe visual material becomes a Gemini reference. People,
 * logos, products, screenshots, charts, and ordinary photos remain original
 * client-rendered pixels. A description can identify a background/style asset
 * without adding another control to the upload flow.
 */
export function presentationAssetMode(
  asset: Pick<PresentationAsset, "kind" | "description" | "referenceUrl">,
): PresentationAssetMode {
  if (!asset.referenceUrl) return "direct";
  if (asset.kind === "illustration") return "reference";
  if (
    asset.kind === "photo" &&
    /\b(?:background|texture|style reference|visual style|moodboard|atmosphere|environment|scenery|landscape)\b/i.test(
      asset.description,
    )
  ) {
    return "reference";
  }
  return "direct";
}

export function presentationAssetShape(
  asset: Pick<PresentationAsset, "width" | "height">,
): PresentationAssetShape {
  if (!asset.width || !asset.height) return "unknown";
  const ratio = asset.width / asset.height;
  if (ratio > 2.2) return "wide";
  if (ratio > 1.15) return "landscape";
  if (ratio < 0.42) return "tall";
  if (ratio < 0.87) return "portrait";
  return "square";
}

/**
 * Preserve uploaded pixels and only decide whether the original can be safely
 * cropped into its slot. Identity, brand, product, UI, data, and artwork stay
 * untouched by the generative imagery layer.
 */
export function presentationAssetFit(
  asset: Pick<PresentationAsset, "kind" | "width" | "height">,
): PresentationAssetFit {
  if (["logo", "product", "screenshot", "chart", "illustration"].includes(asset.kind)) {
    return "contain";
  }

  const ratio = asset.width && asset.height ? asset.width / asset.height : 1;
  if (ratio > 2.2 || ratio < 0.42) return "contain";
  return "cover";
}
