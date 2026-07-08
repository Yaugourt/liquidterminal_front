"use client";

import { memo, useMemo, useState } from "react";
import { PieChart as PieIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBuildersGlobalStats } from "@/services/indexer/builders/hooks/useBuildersGlobalStats";
import { useBuildersTop } from "@/services/indexer/builders/hooks/useBuildersTop";
import { formatBuilderDisplayNameOrAddress } from "@/components/market/builders/formatBuilderDisplayName";
import { compactCount, compactUsd } from "@/lib/formatters/numberFormatting";
import { chartPalette, DonutTopN } from "@/components/common";
import type { DonutSlice } from "@/components/common";

/**
 * BuildersConcentrationCard — "Top 5 vs Rest" donut over 24h builder fees.
 *
 * Powered by the shared `<DonutTopN>` primitive — this component only owns:
 *   - the card-head (icon + title + tags),
 *   - the data shaping (Top 5 + Rest segment),
 *   - the center content + the right-side legend.
 *
 * Visual variant: `dim-others` (no active-arc Sector) — kept to match the
 * original dashboard render. To get the Builders ActiveArc style, switch to
 * `variant="active-arc"`.
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

interface Segment extends DonutSlice {
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
      key: b.builder ?? `top-${i}`,
      name: formatBuilderDisplayNameOrAddress(b.builderName, b.builder),
      value: b.totalBuilderFees ?? 0,
      color: SEGMENT_COLORS[i] ?? chartPalette.accent,
      isRest: false,
    }));

    if (restValue > 0 && totalFees > 0) {
      segs.push({
        key: "rest",
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
      {/* card-head V4 — title + 24h pill + Volume / Users live stats */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <PieIcon size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">
          Builders Code
        </h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          24h
        </span>
        <div className="ml-auto flex items-center gap-2.5 text-[10px] mono">
          <span className="text-text-tertiary">
            Vol{" "}
            <span className="text-text-primary font-semibold">
              {stats?.current?.totalVolume
                ? compactUsd(stats.current.totalVolume)
                : "—"}
            </span>
          </span>
          <span className="text-text-tertiary/40">·</span>
          <span className="text-text-tertiary">
            Users{" "}
            <span className="text-text-primary font-semibold">
              {stats?.current?.uniqueUsers
                ? compactCount(stats.current.uniqueUsers)
                : "—"}
            </span>
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="flex-1 grid place-items-center py-10 text-[11px] text-text-tertiary">
          {isLoading ? "Loading…" : "No builder fees in the last 24h"}
        </div>
      ) : (
        <>
          {/* Body — donut hero (left) + legend (right).
              flex-wrap + min-w sur la légende : quand la carte est étroite
              (grille lg), la légende passe sous le donut au lieu de clipper. */}
          <div className="flex-1 flex flex-wrap items-stretch gap-3 px-4 py-4">
            <div className="self-center shrink-0 mx-auto">
              <DonutTopN
                data={segments}
                size={164}
                outerRadius={1}
                paddingAngle={1.5}
                variant="dim-others"
                useGradient={false}
                activeGlow={false}
                activeIdx={hoveredIdx}
                onActiveChange={setHoveredIdx}
                center={
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
                }
              />
            </div>

            {/* Legend — one row per segment, vertically aligned */}
            <div className="flex-1 min-w-[150px] flex flex-col justify-center gap-px">
              {segments.map((s, i) => {
                const pct = total > 0 ? (s.value / total) * 100 : 0;
                const isHov = hoveredIdx === i;
                const dim = hoveredIdx != null && !isHov;
                return (
                  <button
                    type="button"
                    key={s.key}
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
