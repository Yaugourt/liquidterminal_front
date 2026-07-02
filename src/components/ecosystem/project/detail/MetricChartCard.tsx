"use client";

import { useMemo, useState } from "react";
import { AuroraAreaChart } from "@/components/common";
import { PillTabs, TabOption } from "@/components/ui/pill-tabs";
import { SeriesPoint } from "@/services/ecosystem/project/types";

const TIMEFRAMES: { value: string; label: string; days: number | null }[] = [
  { value: "7D", label: "7D", days: 7 },
  { value: "30D", label: "30D", days: 30 },
  { value: "90D", label: "90D", days: 90 },
  { value: "1Y", label: "1Y", days: 365 },
  { value: "ALL", label: "All", days: null },
];

const TAB_OPTIONS: TabOption[] = TIMEFRAMES.map(({ value, label }) => ({ value, label }));

interface MetricChartCardProps {
  title: string;
  series: SeriesPoint[];
  /** Latest value, already formatted (shown next to the title). */
  currentValue?: string;
  color: string;
  formatValue: (value: number) => string;
  /** Default selected timeframe. */
  defaultTimeframe?: string;
  height?: number;
}

/**
 * A titled card wrapping an AuroraAreaChart with a client-side timeframe filter.
 * The full historical series comes from the metrics endpoint; tabs only slice
 * the view window (no extra fetch, no fabricated data).
 */
export function MetricChartCard({
  title,
  series,
  currentValue,
  color,
  formatValue,
  defaultTimeframe = "90D",
  height = 260,
}: MetricChartCardProps) {
  const [timeframe, setTimeframe] = useState(defaultTimeframe);

  const data = useMemo(() => {
    const sorted = [...series].sort((a, b) => a.t - b.t);
    const tf = TIMEFRAMES.find((t) => t.value === timeframe);
    if (!tf || tf.days == null || sorted.length === 0) {
      return sorted.map((p) => ({ time: p.t, value: p.v }));
    }
    const lastT = sorted[sorted.length - 1].t;
    const cutoff = lastT - tf.days * 24 * 60 * 60 * 1000;
    return sorted.filter((p) => p.t >= cutoff).map((p) => ({ time: p.t, value: p.v }));
  }, [series, timeframe]);

  return (
    <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle">
        <h3 className="text-[13px] font-medium text-text-primary">{title}</h3>
        {currentValue && <span className="mono text-[11px] text-text-tertiary">{currentValue}</span>}
        <div className="ml-auto">
          <PillTabs tabs={TAB_OPTIONS} activeTab={timeframe} onTabChange={setTimeframe} variant="text" />
        </div>
      </div>
      <div className="px-1 pt-3 pb-1">
        <AuroraAreaChart data={data} height={height} lineColor={color} formatValue={formatValue} />
      </div>
    </div>
  );
}
