"use client";

import { useMemo, useState } from "react";
import {
  useChartFormat,
  ChartPeriod,
  PeriodSelector,
  ChartLoading,
  ChartEmpty,
  AuroraAreaChart,
  chartColors,
} from "@/components/common";
import type { PortfolioHistory } from "@/services/market/tracker/hyperfolio";

const PERIOD_DAYS: Partial<Record<ChartPeriod, number>> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

interface NetWorthSectionProps {
  history: PortfolioHistory | null;
  isLoading?: boolean;
}

const signedPct = (v: number | null): string =>
  v === null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;

/**
 * Full net-worth history (HyperCore + HyperEVM tokens + DeFi + NFTs) from the
 * Hyperfolio daily snapshots. Sibling of `PerformanceSection`, which charts the
 * HyperCore account value only. Only rendered when snapshots exist.
 */
export function NetWorthSection({ history, isLoading = false }: NetWorthSectionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>("30d");
  const { formatValue } = useChartFormat();

  const availablePeriods: ChartPeriod[] = ["7d", "30d", "90d", "1y", "allTime"];

  const auroraData = useMemo(() => {
    if (!history) return [];
    const days = PERIOD_DAYS[selectedPeriod];
    const since = days ? Date.now() - days * 86_400_000 : 0;
    return history.snapshots.filter((s) => s.time >= since).map((s) => ({ time: s.time, value: s.total }));
  }, [history, selectedPeriod]);

  const pnlPercentage = useMemo(() => {
    if (auroraData.length < 2) return 0;
    const first = auroraData[0].value;
    const last = auroraData[auroraData.length - 1].value;
    return first === 0 ? 0 : ((last - first) / first) * 100;
  }, [auroraData]);

  const isPositive = pnlPercentage >= 0;
  const lineColor = isPositive ? chartColors.emerald : chartColors.rose;

  const formatOptions = useMemo(
    () => ({ currency: "USD" as const, showCurrency: true, minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    []
  );

  const formatTime = (ms: number) => new Date(ms).toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <>
      <div
        className={`pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full blur-3xl transition-colors duration-500 ${
          isPositive ? "bg-success/[0.08]" : "bg-danger/[0.08]"
        }`}
      />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-brand/[0.06] blur-3xl" />

      <div className="absolute top-2 right-3 sm:right-6 z-20">
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {history && (
            <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-2/60 px-2 py-0.5 text-[10px] font-semibold mono text-text-tertiary">
              {(
                [
                  ["24h", history.percent24h],
                  ["7d", history.percent7d],
                  ["30d", history.percent30d],
                ] as const
              ).map(([label, pct]) => (
                <span key={label} className="inline-flex items-center gap-1">
                  <span>{label}</span>
                  <span className={pct === null ? "" : pct >= 0 ? "text-success" : "text-danger"}>{signedPct(pct)}</span>
                </span>
              ))}
            </div>
          )}
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
              isPositive ? "border-success/30 bg-success/10 text-success" : "border-danger/30 bg-danger/10 text-danger"
            }`}
          >
            <span className={`h-1 w-1 rounded-full ${isPositive ? "bg-success" : "bg-danger"}`} />
            {isPositive ? "+" : ""}
            {pnlPercentage.toFixed(2)}%
          </div>
          <PeriodSelector selected={selectedPeriod} onChange={setSelectedPeriod} options={availablePeriods} variant="aurora" />
        </div>
      </div>

      <div className="absolute inset-0 p-4 pt-12 z-10">
        {isLoading ? (
          <ChartLoading />
        ) : auroraData.length === 0 ? (
          <ChartEmpty message="No net-worth snapshots for this period" />
        ) : (
          <AuroraAreaChart
            data={auroraData}
            lineColor={lineColor}
            formatValue={(v) => formatValue(v, formatOptions)}
            formatTime={formatTime}
          />
        )}
      </div>
    </>
  );
}
