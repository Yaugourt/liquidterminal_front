"use client";

import { memo, useMemo, useState } from "react";
import { PieChart as PieIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { useBuildersGlobalStats } from "@/services/indexer/builders/hooks/useBuildersGlobalStats";
import { useBuildersTop } from "@/services/indexer/builders/hooks/useBuildersTop";
import { formatBuilderDisplayNameOrAddress } from "@/components/market/builders/formatBuilderDisplayName";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { chartPalette } from "@/components/common";

/**
 * BuildersConcentrationCard — donut "Top 5 vs Rest" sur les builder fees 24h.
 *
 * Layout reflowé : donut hero à gauche (164px), légende détaillée à droite
 * (1 ligne par segment alignée à la hauteur des rows du tableau builders),
 * footer "Top 5 share" en bas. Hover synchronisé donut ↔ légende ; au repos
 * le centre du donut affiche le total fees 24h, au hover il bascule sur le
 * segment (%, $).
 */

const TOP_N = 5;

const SEGMENT_COLORS = [
  chartPalette.multiSeries[0], // brand cyan
  chartPalette.multiSeries[2], // gold
  chartPalette.multiSeries[3], // violet
  chartPalette.multiSeries[4], // pink
  chartPalette.multiSeries[5], // emerald
];

const REST_COLOR = "rgba(255,255,255,0.10)";

interface Segment {
  name: string;
  value: number;
  color: string;
  isRest: boolean;
}

export const BuildersConcentrationCard = memo(function BuildersConcentrationCard() {
  const { stats } = useBuildersGlobalStats("24h");
  const { data: top, isLoading } = useBuildersTop({
    timeframe: "24h",
    sort: "builder_fees",
    limit: TOP_N,
  });

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { segments, total, top5Sum } = useMemo(() => {
    const totalFees = stats?.current?.totalBuilderFees ?? 0;
    const topBuilders = [...(top?.builders ?? [])]
      .sort((a, b) => (b.totalBuilderFees ?? 0) - (a.totalBuilderFees ?? 0))
      .slice(0, TOP_N);

    const top5SumLocal = topBuilders.reduce(
      (acc, b) => acc + (b.totalBuilderFees ?? 0),
      0
    );
    const restValue = Math.max(0, totalFees - top5SumLocal);

    const segs: Segment[] = topBuilders.map((b, i) => ({
      name: formatBuilderDisplayNameOrAddress(b.builderName, b.builder),
      value: b.totalBuilderFees ?? 0,
      color: SEGMENT_COLORS[i] ?? chartPalette.accent,
      isRest: false,
    }));

    if (restValue > 0 && totalFees > 0) {
      segs.push({
        name: "Rest of builders",
        value: restValue,
        color: REST_COLOR,
        isRest: true,
      });
    }

    return { segments: segs, total: totalFees, top5Sum: top5SumLocal };
  }, [stats, top]);

  const top5Pct = total > 0 ? (top5Sum / total) * 100 : 0;
  const hovered =
    hoveredIdx != null && hoveredIdx < segments.length
      ? segments[hoveredIdx]
      : null;
  const hoveredPct = hovered && total > 0 ? (hovered.value / total) * 100 : 0;

  const hasData = total > 0 && segments.length > 0;

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* card-head V4 */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <PieIcon size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">
          Fees Concentration
        </h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          24h
        </span>
        <span className="ml-auto text-[10px] text-text-tertiary mono">
          Top 5 + rest
        </span>
      </div>

      {!hasData ? (
        <div className="flex-1 grid place-items-center py-10 text-[11px] text-text-tertiary">
          {isLoading ? "Loading…" : "No builder fees in the last 24h"}
        </div>
      ) : (
        <>
          {/* Body — donut hero (gauche) + légende détaillée (droite) */}
          <div className="flex-1 flex items-stretch gap-3 px-4 py-4">
            {/* Donut hero */}
            <div className="relative w-[164px] h-[164px] shrink-0 self-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={segments}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="100%"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                    paddingAngle={1.5}
                    onMouseEnter={(_, idx) => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {segments.map((s, i) => (
                      <Cell
                        key={s.name}
                        fill={s.color}
                        opacity={hoveredIdx == null || hoveredIdx === i ? 1 : 0.3}
                        style={{
                          transition: "opacity 150ms ease-out",
                          cursor: "pointer",
                          outline: "none",
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center px-2">
                  <div className="text-[9px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
                    {hovered ? (hovered.isRest ? "Rest" : "Share") : "Total"}
                  </div>
                  <div className="mono text-[17px] font-semibold text-text-primary leading-tight mt-0.5">
                    {hovered
                      ? `${hoveredPct.toFixed(1)}%`
                      : compactUsd(total)}
                  </div>
                  <div className="text-[9.5px] mono text-text-tertiary leading-tight mt-0.5">
                    {hovered ? compactUsd(hovered.value) : "fees 24h"}
                  </div>
                </div>
              </div>
            </div>

            {/* Légende — 1 row par segment, alignée verticalement */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-px">
              {segments.map((s, i) => {
                const pct = total > 0 ? (s.value / total) * 100 : 0;
                const isHov = hoveredIdx === i;
                const dim = hoveredIdx != null && !isHov;
                return (
                  <button
                    type="button"
                    key={s.name}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className={`group flex items-center gap-2.5 py-1.5 px-2 rounded text-left transition-all duration-150 ${
                      dim ? "opacity-40" : "opacity-100"
                    } ${isHov ? "bg-surface-2" : "hover:bg-surface-2"}`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ background: s.color }}
                    />
                    <span
                      className={`text-[12px] flex-1 truncate ${
                        s.isRest
                          ? "text-text-tertiary italic"
                          : "text-text-primary font-medium"
                      }`}
                    >
                      {s.name}
                    </span>
                    <span className="mono text-[11px] text-text-secondary tabular-nums">
                      {compactUsd(s.value)}
                    </span>
                    <span className="mono text-[11px] text-text-tertiary tabular-nums w-[44px] text-right">
                      {pct.toFixed(1)}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer — Top 5 share */}
          <div className="border-t border-border-subtle px-3.5 py-2 flex items-center justify-between">
            <span className="text-text-tertiary uppercase tracking-[0.06em] font-semibold text-[9.5px]">
              Top 5 share of ecosystem fees
            </span>
            <span className="mono text-[12px] font-semibold text-text-primary">
              {top5Pct.toFixed(1)}%
              <span className="text-text-tertiary text-[10.5px] ml-1.5">
                {compactUsd(top5Sum)}
              </span>
            </span>
          </div>
        </>
      )}
    </Card>
  );
});
