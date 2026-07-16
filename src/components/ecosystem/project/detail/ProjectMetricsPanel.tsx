"use client";

import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { KpiRibbon, KpiCell, chartPalette } from "@/components/common";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { compactUsd, compactCount, formatMetricValue } from "@/lib/formatters/numberFormatting";
import { NormalizedMetrics, SeriesPoint } from "@/services/ecosystem/project/types";
import { MetricChartCard } from "./MetricChartCard";

// Literal class strings so Tailwind's JIT picks them up (no dynamic interpolation).
const COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6",
};

const cols = (n: number) => COLS[Math.min(Math.max(n, 1), 6)];

function formatPriceValue(value: number): string {
  return formatMetricValue(value, {
    prefix: "$",
    format: "US",
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 5 : 2,
  });
}

function formatChange(value: number): { text: string; tone: "success" | "danger" } {
  const sign = value >= 0 ? "+" : "";
  return { text: `${sign}${value.toFixed(2)}%`, tone: value >= 0 ? "success" : "danger" };
}

/** Real % change over the last `days` of a series (null if not enough history). */
function pctChangeOverDays(series: SeriesPoint[] | undefined, days: number): string | undefined {
  if (!series || series.length < 2) return undefined;
  const sorted = [...series].sort((a, b) => a.t - b.t);
  const last = sorted[sorted.length - 1];
  const cutoff = last.t - days * 24 * 60 * 60 * 1000;
  const ref = sorted.find((p) => p.t >= cutoff);
  if (!ref || ref.v === 0 || ref.t === last.t) return undefined;
  const pct = ((last.v - ref.v) / ref.v) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}% ${days}d`;
}

interface ProjectMetricsPanelProps {
  metrics: NormalizedMetrics | undefined;
  isLoading: boolean;
}

export function ProjectMetricsPanel({ metrics, isLoading }: ProjectMetricsPanelProps) {
  // "Protocol" data = the DeFiLlama-style metrics a plain token doesn't have.
  // When absent (token-only project), we skip the fundamentals ribbon entirely
  // and fold volume into the single token ribbon — avoids a redundant Market Cap.
  const hasProtocol = !!(metrics?.tvl || metrics?.fees24h || metrics?.revenue24h);

  const fundamentals = useMemo<KpiCell[]>(() => {
    if (!metrics || !hasProtocol) return [];
    const cells: KpiCell[] = [];
    if (metrics.tvl) {
      cells.push({
        key: "tvl",
        label: "TVL",
        value: compactUsd(metrics.tvl.value),
        sub: pctChangeOverDays(metrics.series?.tvl, 7),
      });
    }
    if (metrics.volume24h) {
      cells.push({ key: "vol", label: "Volume 24h", value: compactUsd(metrics.volume24h.value) });
    }
    if (metrics.fees24h) {
      cells.push({ key: "fees", label: "Fees 24h", value: compactUsd(metrics.fees24h.value), tone: "gold" });
    }
    if (metrics.revenue24h) {
      cells.push({ key: "rev", label: "Revenue 24h", value: compactUsd(metrics.revenue24h.value) });
    }
    return cells;
  }, [metrics, hasProtocol]);

  const token = useMemo<KpiCell[]>(() => {
    if (!metrics) return [];
    const cells: KpiCell[] = [];
    if (metrics.price) {
      cells.push({ key: "price", label: "Price", value: formatPriceValue(metrics.price.value) });
    }
    if (metrics.change24h) {
      const c = formatChange(metrics.change24h.value);
      cells.push({ key: "chg", label: "24h", value: c.text, tone: c.tone });
    }
    // Token-only projects show volume here (protocol projects show it in fundamentals).
    if (metrics.volume24h && !hasProtocol) {
      cells.push({ key: "tvol", label: "Volume 24h", value: compactUsd(metrics.volume24h.value) });
    }
    if (metrics.marketCap) {
      cells.push({ key: "tmcap", label: "Market Cap", value: compactUsd(metrics.marketCap.value) });
    }
    if (metrics.fdv) {
      cells.push({ key: "fdv", label: "FDV", value: compactUsd(metrics.fdv.value) });
    }
    if (metrics.holders) {
      cells.push({ key: "holders", label: "Holders", value: compactCount(metrics.holders.value) });
    }
    return cells;
  }, [metrics, hasProtocol]);

  if (isLoading && !metrics) {
    return <LoadingState message="Loading metrics..." size="sm" />;
  }

  const series = metrics?.series;
  const hasTvlChart = !!series?.tvl?.length;
  const hasFeesChart = !!series?.fees?.length;
  const hasVolumeChart = !!series?.volume?.length;
  const hasAnything =
    fundamentals.length > 0 || token.length > 0 || hasTvlChart || hasFeesChart || hasVolumeChart;

  if (!hasAnything) {
    return (
      <EmptyState
        icon={<BarChart3 className="w-5 h-5" />}
        title="No on-chain metrics yet"
        description="This project hasn't been mapped to a data source. Once a DeFiLlama slug or HL token is attached, TVL, fees and token metrics appear here."
      />
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      {fundamentals.length > 0 && (
        <KpiRibbon variant="plain" cells={fundamentals} columns={cols(fundamentals.length)} />
      )}

      {hasTvlChart && (
        <MetricChartCard
          title="Total Value Locked"
          series={series!.tvl!}
          currentValue={metrics?.tvl ? compactUsd(metrics.tvl.value) : undefined}
          color={chartPalette.accent}
          formatValue={(v) => compactUsd(v)}
        />
      )}

      {(hasFeesChart || hasVolumeChart) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hasFeesChart && (
            <MetricChartCard
              title="Fees"
              series={series!.fees!}
              color={chartPalette.gold}
              formatValue={(v) => compactUsd(v)}
              height={150}
            />
          )}
          {hasVolumeChart && (
            <MetricChartCard
              title="Volume"
              series={series!.volume!}
              color={chartPalette.violet}
              formatValue={(v) => compactUsd(v)}
              height={150}
            />
          )}
        </div>
      )}

      {token.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[13px] font-semibold text-text-primary">Token</h2>
            {metrics?.price?.source && (
              <span className="text-[11px] text-text-tertiary">via {metrics.price.source}</span>
            )}
          </div>
          <KpiRibbon variant="plain" cells={token} columns={cols(token.length)} />
        </section>
      )}
    </div>
  );
}
