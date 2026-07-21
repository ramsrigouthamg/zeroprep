export type PresentationAsset = {
  id: string;
  name: string;
  aliases: string[];
  url: string;
};

const WORD_CHARACTER = /[a-z0-9]/i;

export function assetTerms(asset: Pick<PresentationAsset, "name" | "aliases">) {
  return [asset.name, ...asset.aliases]
    .map((term) => term.trim().toLowerCase())
    .filter((term) => term.length >= 2 && [...term].some((character) => WORD_CHARACTER.test(character)));
}

function includesTerm(haystack: string, term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, "i").test(haystack);
}

export function matchPresentationAssets(
  content: string,
  assets: PresentationAsset[],
  limit = 2,
) {
  const normalizedContent = content.toLowerCase();
  return assets
    .map((asset) => ({
      asset,
      score: assetTerms(asset).reduce(
        (score, term) => score + (includesTerm(normalizedContent, term) ? term.length : 0),
        0,
      ),
    }))
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score || left.asset.name.localeCompare(right.asset.name))
    .slice(0, limit)
    .map((match) => match.asset);
}

export function assetCatalog(assets: PresentationAsset[]) {
  return assets
    .map((asset) => `${asset.name}${asset.aliases.length ? ` (also: ${asset.aliases.join(", ")})` : ""}`)
    .join("; ");
}
