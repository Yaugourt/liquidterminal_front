/**
 * Extract asset ticker from full HIP-3 name (e.g. "xyz:AAPL" → "AAPL").
 */
export function extractPerpDexAssetTicker(assetName: string): string {
  const parts = assetName.split(":");
  return parts.length > 1 ? parts[1] : assetName;
}
