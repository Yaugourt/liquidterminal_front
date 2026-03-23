import type { PerpDexAssetWithMarketData } from "@/services/market/perpDex/types";

export type PerpDexMarketsSortField = "dayNtlVlm" | "openInterest" | "priceChange24h";

function toSortNumber(value: number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function getSortNumericValue(
  field: PerpDexMarketsSortField,
  asset: PerpDexAssetWithMarketData
): number {
  switch (field) {
    case "dayNtlVlm":
      return toSortNumber(asset.dayNtlVlm);
    case "openInterest":
      return toSortNumber(asset.openInterest);
    case "priceChange24h":
      return toSortNumber(asset.priceChange24h);
    default:
      return 0;
  }
}

/**
 * Returns a new array of assets sorted by the given field (tie-break: name).
 */
export function sortPerpDexMarketsAssets(
  assets: PerpDexAssetWithMarketData[],
  sortField: PerpDexMarketsSortField,
  sortOrder: "asc" | "desc"
): PerpDexAssetWithMarketData[] {
  return [...assets].sort((a, b) => {
    const va = getSortNumericValue(sortField, a);
    const vb = getSortNumericValue(sortField, b);
    let comparison = va - vb;
    if (comparison === 0) {
      comparison = a.name.localeCompare(b.name);
    }
    return sortOrder === "desc" ? -comparison : comparison;
  });
}
