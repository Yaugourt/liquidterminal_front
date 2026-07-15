import type { BuilderDetailStatsPayload } from "@/services/indexer/builders/types";

/**
 * True when the indexer returned an all-zero window for a builder. The 1h/24h
 * aggregations are frequently empty upstream while 7d/30d carry data, so
 * rendering "$0" cards for those windows would be misleading. Callers show an
 * explicit "no data for this window" state instead.
 */
export function isBuilderWindowEmpty(stats: BuilderDetailStatsPayload): boolean {
  const c = stats.current;
  return (
    c.fillCount === 0 &&
    c.totalVolume === 0 &&
    c.totalFees === 0 &&
    c.totalBuilderFees === 0 &&
    c.uniqueUsers === 0
  );
}
