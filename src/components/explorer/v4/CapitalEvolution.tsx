"use client";

import { memo, useMemo, useState } from "react";
import { PieChart as PieIcon, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { useHLBridge } from "@/services/dashboard/hooks/useHLBridge";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { chartPalette } from "@/components/common";

/**
 * CapitalEvolution — two-panel "Capital Evolution · 30d" section.
 *
 * Left: vault TVL concentration donut (Top 5 vs rest).
 * Right: bridge TVL area chart over the last 30 days — the only honest
 * aggregated time-series we have. HYPE staked history isn't exposed by the
 * backend, so we keep this single-series (cf DESIGN_SYSTEM §11: no fake
 * historical data).
 */

const TOP_N = 5;

/** Sum DefiLlama `chainTvls` daily series across every chain so the curve
 *  reflects the TOTAL USDC bridged into Hyperliquid (Arbitrum + L1 + future). */
function combineChainTvls(
  chainTvls:
    | Record<string, { tvl: { date: number; totalLiquidityUSD: number }[] }>
    | undefined,
): { date: number; totalLiquidityUSD: number }[] {
  if (!chainTvls) return [];
  const dateMap = new Map<number, number>();
  for (const chain of Object.values(chainTvls)) {
    if (!chain?.tvl) continue;
    for (const point of chain.tvl) {
      dateMap.set(
        point.date,
        (dateMap.get(point.date) ?? 0) + point.totalLiquidityUSD,
      );
    }
  }
  return [...dateMap.entries()]
    .map(([date, totalLiquidityUSD]) => ({ date, totalLiquidityUSD }))
    .sort((a, b) => a.date - b.date);
}

function pickRecent30d(
  tvls: { date: number; totalLiquidityUSD: number }[],
): { date: number; totalLiquidityUSD: number }[] {
  // DefiLlama returns one point per UTC day. Keep the trailing 30 days.
  return tvls.slice(-30);
}

function CapitalDonut({
  topShare,
  topCount,
  restCount,
  topUsd,
  restUsd,
  totalTvl,
}: {
  topShare: number;
  topCount: number;
  restCount: number;
  topUsd: number;
  restUsd: number;
  totalTvl: number;
}) {
  // Donut geometry — radius 30, stroke 14, circumference = 2π·30 ≈ 188.5.
  const circumference = 2 * Math.PI * 30;
  const topLen = (topShare / 100) * circumference;
  const restLen = circumference - topLen;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <PieIcon size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">
          Vault concentration
        </h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          Top {topCount} vs rest
        </span>
      </div>

      <div className="p-4 flex flex-col items-center">
        <svg
          viewBox="0 0 80 80"
          width="144"
          height="144"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="40"
            cy="40"
            r="30"
            fill="none"
            stroke="rgb(var(--bg-surface-3))"
            strokeWidth="14"
          />
          <circle
            cx="40"
            cy="40"
            r="30"
            fill="none"
            stroke={chartPalette.accent}
            strokeWidth="14"
            strokeDasharray={`${topLen.toFixed(2)} ${restLen.toFixed(2)}`}
          />
        </svg>
        <div className="text-center mt-2">
          <div className="mono text-[20px] font-semibold tracking-[-0.02em]">
            {compactUsd(totalTvl)}
          </div>
          <div className="text-[10.5px] text-text-tertiary">Total vault TVL</div>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 py-1.5 border-b border-border-subtle">
          <span
            className="w-2 h-2 rounded-sm shrink-0"
            style={{ background: chartPalette.accent }}
          />
          <span className="text-[12px] text-text-primary flex-1">
            Top {topCount} vaults
          </span>
          <span className="mono text-[12px] text-text-primary font-semibold">
            {topShare.toFixed(0)}%
          </span>
          <span className="mono text-[10px] text-text-tertiary ml-2">
            {compactUsd(topUsd)}
          </span>
        </div>
        <div className="flex items-center gap-2 py-1.5">
          <span className="w-2 h-2 rounded-sm shrink-0 bg-surface-3 border border-border-default" />
          <span className="text-[12px] text-text-primary flex-1">
            Other {restCount} vaults
          </span>
          <span className="mono text-[12px] text-text-primary font-semibold">
            {(100 - topShare).toFixed(0)}%
          </span>
          <span className="mono text-[10px] text-text-tertiary ml-2">
            {compactUsd(restUsd)}
          </span>
        </div>
      </div>
    </Card>
  );
}

function BridgeTvlChart({
  points,
}: {
  points: { date: number; totalLiquidityUSD: number }[];
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const W = 600;
  const H = 220;
  const PAD_T = 8;
  const PAD_B = 4;
  const usableH = H - PAD_T - PAD_B;

  const { path, area, maxV, minV } = useMemo(() => {
    if (points.length === 0) return { path: "", area: "", maxV: 0, minV: 0 };
    const values = points.map((p) => p.totalLiquidityUSD);
    const maxV = Math.max(...values);
    const minV = Math.min(...values);
    const range = Math.max(maxV - minV, 1);

    const xOf = (i: number) =>
      points.length > 1 ? (i / (points.length - 1)) * W : W / 2;
    const yOf = (v: number) => PAD_T + (1 - (v - minV) / range) * usableH;

    const path = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(1)} ${yOf(p.totalLiquidityUSD).toFixed(1)}`)
      .join(" ");
    const area = `${path} L ${W} ${H} L 0 ${H} Z`;

    return { path, area, maxV, minV };
  }, [points, usableH]);

  const hovered = hoveredIdx != null ? points[hoveredIdx] : null;
  const tooltipLeftPct = hovered && points.length > 1
    ? (hoveredIdx! / (points.length - 1)) * 100
    : 50;

  const first = points[0];
  const last = points[points.length - 1];
  const totalChange = last && first ? last.totalLiquidityUSD - first.totalLiquidityUSD : 0;
  const totalChangePct = first && first.totalLiquidityUSD > 0
    ? (totalChange / first.totalLiquidityUSD) * 100
    : 0;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <TrendingUp size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">
          Bridge TVL · 30d
        </h3>
        <span className="ml-auto flex items-center gap-3 text-[10.5px]">
          <span className="text-text-tertiary mono">
            {compactUsd(minV)} – {compactUsd(maxV)}
          </span>
          <span
            className={`mono font-semibold ${
              totalChange >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {totalChange >= 0 ? "+" : ""}
            {totalChangePct.toFixed(1)}%
          </span>
        </span>
      </div>

      <div className="p-4 relative" onMouseLeave={() => setHoveredIdx(null)}>
        <div
          className={`pointer-events-none absolute z-20 transition-opacity duration-150 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            left: `calc(16px + ${tooltipLeftPct}% * (100% - 32px) / 100)`,
            top: "16px",
            transform: "translateX(-50%)",
          }}
        >
          {hovered && (
            <div className="bg-surface-2 border border-border-default rounded px-2.5 py-1.5 min-w-[140px] shadow-xl">
              <div className="mono text-[9px] text-text-tertiary">
                {new Date(hovered.date * 1000).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })}
              </div>
              <div className="mt-0.5 mono text-[12px] font-semibold text-text-primary">
                {compactUsd(hovered.totalLiquidityUSD)}
              </div>
            </div>
          )}
        </div>

        {points.length === 0 ? (
          <div className="grid place-items-center h-[170px] text-[11px] text-text-tertiary">
            No bridge data
          </div>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              className="w-full h-[220px] block cursor-crosshair"
            >
              <defs>
                <linearGradient id="bridgeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartPalette.accent} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={chartPalette.accent} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid */}
              {[0, 0.25, 0.5, 0.75].map((p) => (
                <line
                  key={p}
                  x1="0"
                  x2={W}
                  y1={PAD_T + p * usableH}
                  y2={PAD_T + p * usableH}
                  stroke="rgb(var(--border-subtle))"
                  strokeDasharray="3 4"
                />
              ))}
              <line
                x1="0"
                x2={W}
                y1={H - PAD_B}
                y2={H - PAD_B}
                stroke="rgb(var(--border-subtle))"
              />

              <path d={area} fill="url(#bridgeGrad)" />
              <path d={path} fill="none" stroke={chartPalette.accent} strokeWidth="2" />

              {hovered && points.length > 1 && (
                <line
                  x1={(hoveredIdx! / (points.length - 1)) * W}
                  x2={(hoveredIdx! / (points.length - 1)) * W}
                  y1="0"
                  y2={H}
                  stroke={chartPalette.accent}
                  strokeWidth="1"
                  strokeDasharray="2 3"
                  opacity="0.6"
                />
              )}

              {points.map((_, i) => {
                const w = W / points.length;
                return (
                  <rect
                    key={i}
                    x={i * w}
                    y={0}
                    width={w}
                    height={H}
                    fill="transparent"
                    onMouseEnter={() => setHoveredIdx(i)}
                  />
                );
              })}
            </svg>

            <div className="flex justify-between mt-1.5 text-[9px] text-text-tertiary mono">
              <span>
                {first
                  ? new Date(first.date * 1000).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })
                  : ""}
              </span>
              <span>
                {points[Math.floor(points.length / 2)]
                  ? new Date(points[Math.floor(points.length / 2)].date * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                  : ""}
              </span>
              <span>
                {last
                  ? new Date(last.date * 1000).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })
                  : ""}
              </span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

export const CapitalEvolution = memo(function CapitalEvolution() {
  const { vaults, totalTvl } = useVaults({ limit: 1000, sortBy: "tvl" });
  const { bridgeData } = useHLBridge();

  const concentration = useMemo(() => {
    if (!vaults?.length || !totalTvl) {
      return {
        topShare: 0,
        topCount: 0,
        restCount: 0,
        topUsd: 0,
        restUsd: 0,
      };
    }
    const withNumericTvl = vaults.map((v) => ({
      ref: v,
      tvl: parseFloat(v.summary.tvl) || 0,
    }));
    const sorted = withNumericTvl.sort((a, b) => b.tvl - a.tvl);
    const top = sorted.slice(0, TOP_N);
    const rest = sorted.slice(TOP_N);
    const topUsd = top.reduce((acc, v) => acc + v.tvl, 0);
    const restUsd = rest.reduce((acc, v) => acc + v.tvl, 0);
    return {
      topShare: totalTvl > 0 ? (topUsd / totalTvl) * 100 : 0,
      topCount: top.length,
      restCount: rest.length,
      topUsd,
      restUsd,
    };
  }, [vaults, totalTvl]);

  const bridgePoints = useMemo(
    () => pickRecent30d(combineChainTvls(bridgeData?.chainTvls)),
    [bridgeData],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
      <CapitalDonut
        topShare={concentration.topShare}
        topCount={concentration.topCount}
        restCount={concentration.restCount}
        topUsd={concentration.topUsd}
        restUsd={concentration.restUsd}
        totalTvl={totalTvl ?? 0}
      />
      <BridgeTvlChart points={bridgePoints} />
    </div>
  );
});
