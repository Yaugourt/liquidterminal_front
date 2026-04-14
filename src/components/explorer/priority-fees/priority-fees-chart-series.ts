import type { ChartDataPoint } from "@/components/common/charts/LightweightChart";
import type { PriorityFeesChartMetric, PriorityFeesStats } from "@/services/explorer/priority-fees";

/**
 * Maps indexer stats bucket arrays to lightweight-charts points (UI layer).
 */
export function statsToChartPoints(
  stats: PriorityFeesStats | null,
  metric: PriorityFeesChartMetric
): ChartDataPoint[] {
  if (!stats) return [];
  const series =
    (Array.isArray(stats.buckets) && stats.buckets) ||
    (Array.isArray(stats.hourly) && stats.hourly) ||
    (Array.isArray(stats.by_hour) && stats.by_hour) ||
    (Array.isArray(stats.time_series) && stats.time_series) ||
    [];

  const points: ChartDataPoint[] = [];
  for (const b of series) {
    const t =
      typeof b.timestamp === "number"
        ? b.timestamp
        : typeof b.t === "number"
          ? b.t
          : b.time
            ? Date.parse(b.time)
            : b.hour
              ? Date.parse(b.hour)
              : NaN;
    if (!Number.isFinite(t)) continue;
    const v =
      metric === "fill_count"
        ? Number(b.count ?? b.fills ?? 0)
        : Number(b.total_priority_gas ?? b.value ?? 0);
    if (!Number.isFinite(v)) continue;
    points.push({ time: t, value: v });
  }
  return points.sort((a, b) => a.time - b.time);
}
