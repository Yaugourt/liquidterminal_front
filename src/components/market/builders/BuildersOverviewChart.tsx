"use client";

import { useMemo, useState, useId } from "react";
import { motion } from "framer-motion";
import {
  ChartLoading,
  ChartEmpty,
  ChartWatermark,
  chartPalette,
  chartColors,
  DonutTopN,
} from "@/components/common";
import type { DonutSlice } from "@/components/common";
import { compactCount, compactUsd } from "@/lib/formatters/numberFormatting";
import type { BuilderTopRow } from "@/services/indexer/builders/types";
import { formatBuilderDisplayName } from "./formatBuilderDisplayName";

type Metric = "totalVolume" | "totalBuilderFees" | "fillCount";

const METRICS: { key: Metric; label: string }[] = [
  { key: "totalVolume", label: "Volume" },
  { key: "totalBuilderFees", label: "Builder Fees" },
  { key: "fillCount", label: "Fills" },
];

const SLICE_PALETTE = chartPalette.multiSeries;
const SLICE_FALLBACK = chartColors.textMuted;
const SLICE_OTHERS_COLOR = "rgb(82 82 91)"; // zinc-600 — neutral, distinct from palette

interface Slice extends DonutSlice {
  address: string;
}

interface BuildersOverviewChartProps {
  rows: BuilderTopRow[];
  isLoading: boolean;
  timeframe: string;
}

export function BuildersOverviewChart({ rows, isLoading, timeframe }: BuildersOverviewChartProps) {
  const [metric, setMetric] = useState<Metric>("totalVolume");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const layoutId = useId().replace(/:/g, "");

  // Top 10 by metric + "Others" aggregate
  const { slices, topRows, total } = useMemo(() => {
    if (!rows.length) return { slices: [] as Slice[], topRows: [], total: 0 };
    const sorted = [...rows].sort((a, b) => ((b[metric] as number) ?? 0) - ((a[metric] as number) ?? 0));
    const total = sorted.reduce((s, r) => s + ((r[metric] as number) ?? 0), 0);
    const top = sorted.slice(0, 10);
    const rest = sorted.slice(10);
    const othersValue = rest.reduce((s, r) => s + ((r[metric] as number) ?? 0), 0);

    const slices: Slice[] = top.map((r, i) => ({
      key: r.builder,
      name: formatBuilderDisplayName(r.builderName),
      address: r.builder,
      value: (r[metric] as number) ?? 0,
      color: SLICE_PALETTE[i] ?? SLICE_FALLBACK,
    }));
    if (othersValue > 0) {
      slices.push({
        key: "others",
        name: "Others",
        address: "others",
        value: othersValue,
        color: SLICE_OTHERS_COLOR,
      });
    }
    return { slices, topRows: top, total };
  }, [rows, metric]);

  const displayed = activeIdx !== null && slices[activeIdx] ? slices[activeIdx] : null;
  const displayedValue = displayed ? displayed.value : total;
  const displayedPct = total > 0 ? (displayedValue / total) * 100 : 0;

  const fmtValue = metric === "fillCount" ? compactCount : compactUsd;

  const topConcentration = useMemo(() => {
    if (!total) return 0;
    const top3 = topRows.slice(0, 3).reduce((s, r) => s + ((r[metric] as number) ?? 0), 0);
    return (top3 / total) * 100;
  }, [topRows, total, metric]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35 }}
      className="bg-surface border border-border-subtle rounded-lg overflow-hidden"
    >
      {/* CARD HEADER — title + tabs (V4 ref: px-3.5 py-3 border-b) */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-border-subtle gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-[5px] w-[5px] rounded-full bg-brand shrink-0" />
          <span className="text-[11px] uppercase tracking-wide font-medium text-text-tertiary truncate">
            Market Share · Top 10 · {timeframe}
          </span>
        </div>
        {/* Metric pills */}
        <div className="flex items-center bg-surface-2 rounded-md p-0.5 shrink-0">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                setMetric(m.key);
                setActiveIdx(null);
              }}
              className="relative rounded text-[10px] font-medium px-2 py-0.5"
            >
              {metric === m.key && (
                <motion.span
                  layoutId={`builders-metric-${layoutId}`}
                  className="absolute inset-0 rounded bg-brand"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              )}
              <span className={`relative z-10 ${metric === m.key ? "text-brand-text-on" : "text-text-tertiary hover:text-text-primary"}`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* CARD BODY — watermark + donut + legend */}
      <div className="relative p-3.5 min-h-[320px]">
        <ChartWatermark />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)] gap-5 items-center">
        {isLoading && slices.length === 0 ? (
          <div className="md:col-span-2">
            <ChartLoading />
          </div>
        ) : slices.length === 0 ? (
          <div className="md:col-span-2">
            <ChartEmpty message="No builder data" />
          </div>
        ) : (
          <>
            {/* DONUT — DonutTopN primitive, active-arc variant (Builders reference) */}
            <div className="relative">
              <DonutTopN
                data={slices}
                size={300}
                paddingAngle={2}
                activeIdx={activeIdx}
                onActiveChange={setActiveIdx}
                variant="active-arc"
                useGradient
                activeGlow
                center={
                  <motion.div
                    key={displayed?.address ?? "total"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center text-center px-4"
                  >
                    <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                      {displayed ? displayed.name : `Total ${timeframe}`}
                    </div>
                    <div className="mono mt-0.5 text-[20px] font-semibold text-text-primary tracking-tight">
                      {fmtValue(displayedValue)}
                    </div>
                    {displayed ? (
                      <div className="mono text-[11px] text-text-secondary">
                        {displayedPct.toFixed(1)}%
                      </div>
                    ) : (
                      <div className="mono text-[10px] text-text-tertiary mt-0.5">
                        Top 3 hold {topConcentration.toFixed(1)}% · {slices.length} slices
                      </div>
                    )}
                  </motion.div>
                }
              />
            </div>

            {/* LEGEND — V4 ref `.top-list` (compact, color dot squares) */}
            <div className="flex flex-col gap-1 max-h-[280px] overflow-y-auto pr-1 scrollbar-brand">
              {slices.map((s, i) => {
                const pct = total > 0 ? (s.value / total) * 100 : 0;
                const isActive = activeIdx === i;
                const isOthers = s.address === "others";
                const isAnonymous = !isOthers && (s.name === "—" || s.name.startsWith("0x"));
                return (
                  <button
                    key={s.key}
                    onMouseEnter={() => setActiveIdx(i)}
                    onMouseLeave={() => setActiveIdx(null)}
                    className={`grid grid-cols-[14px_8px_1fr_auto] gap-2 items-center px-2 py-1.5 rounded-md text-left transition-colors ${
                      isActive ? "bg-surface-2" : "hover:bg-surface-2"
                    }`}
                  >
                    <span className="mono text-[10px] text-text-tertiary">{i + 1}</span>
                    <span
                      className="h-2 w-2 rounded-[2px] shrink-0"
                      style={{ background: s.color }}
                    />
                    <span
                      className={`text-[12px] truncate ${
                        isAnonymous || isOthers ? "text-text-secondary" : "font-medium text-text-primary"
                      }`}
                    >
                      {isOthers ? `+ ${rows.length - 10} others` : s.name}
                    </span>
                    <div className="text-right">
                      <div className="mono text-[12px] text-text-secondary leading-tight">{fmtValue(s.value)}</div>
                      <div className="mono text-[10px] text-text-tertiary leading-tight">{pct.toFixed(1)}%</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
        </div>
      </div>

      {/* CARD FOOTER — V4 pedagogical */}
      {total > 0 && (
        <div className="px-3.5 py-2.5 border-t border-border-subtle flex items-center justify-between text-[10px] text-text-tertiary">
          <span>{slices.length} builders shown · sorted by {METRICS.find((m) => m.key === metric)?.label.toLowerCase()}</span>
          <span>
            Top 3: <span className="mono text-text-secondary">{topConcentration.toFixed(1)}%</span>
          </span>
        </div>
      )}
    </motion.div>
  );
}
