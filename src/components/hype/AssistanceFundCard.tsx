"use client";

import { memo, useMemo, type ReactNode } from "react";
import { Landmark } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KpiRibbon, AuroraAreaChart, chartPalette } from "@/components/common";
import type { KpiCell } from "@/components/common";
import { useHypeOverview, useAfBuybacks } from "@/services/market/hype";
import { compactHype } from "@/lib/formatters/numberFormatting";
import { FlywheelDiagram } from "./FlywheelDiagram";
import { fmtUsd, fmtUsdFull, fmtHype, fmtPct, fmtSignedPct } from "./format";

/** "3m" / "5h" / "2d" ago. */
const ago = (t: number): string => {
  const m = Math.floor((Date.now() - t) / 60_000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

/**
 * AssistanceFundCard — the buyback engine on real on-chain data. Holdings,
 * cost basis and unrealized PnL up top; the actual buyback rate (per day /
 * week / month, aggregated from the fund's HYPE buy fills) with a 14-day
 * buyback chart and a live fill feed; the flywheel at the bottom.
 */
export const AssistanceFundCard = memo(function AssistanceFundCard() {
  const { overview } = useHypeOverview();
  const { data: bb } = useAfBuybacks();

  const af = overview?.af ?? null;
  const buybackYield =
    bb && overview && overview.marketCap > 0
      ? ((bb.avgDailyUsd * 365) / overview.marketCap) * 100
      : null;
  const pnlTone = af && af.unrealizedPnlUsd >= 0 ? "success" : "danger";

  const stats: KpiCell[] = [
    {
      key: "holdings",
      label: "Holdings",
      value: af ? `${compactHype(af.hypeBalance)} HYPE` : "—",
      sub: overview ? `${fmtPct(overview.afPctOfMax ?? 0)} of max supply` : undefined,
    },
    {
      key: "value",
      label: "Market value",
      value: fmtUsd(af?.hypeValueUsd),
      tone: "gold",
      sub: overview ? `at ${fmtUsd(overview.price)} /HYPE` : undefined,
    },
    {
      key: "cost",
      label: "Cost basis",
      value: fmtUsd(af?.costBasisUsd),
      sub: af ? `avg ${fmtUsd(af.avgEntryPrice)} /HYPE` : undefined,
    },
    {
      key: "pnl",
      label: "Unrealized PnL",
      value: fmtUsd(af?.unrealizedPnlUsd),
      tone: pnlTone,
      sub: af ? fmtSignedPct(af.unrealizedPnlPct) : undefined,
    },
    {
      key: "circ",
      label: "Share of float",
      value: fmtPct(overview?.afPctOfCirculating ?? null),
      sub: "of circulating",
    },
    {
      key: "removed",
      label: "Out of float",
      value: fmtPct(overview?.removedFromFloatPct ?? null),
      sub: "AF + burned",
    },
  ];

  const chartData = useMemo(
    () => (bb?.daily ?? []).map((d) => ({ time: d.time, value: d.usd })),
    [bb],
  );

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* card-head */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Landmark size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Assistance Fund</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono">
          0xfefe…fe
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] text-text-tertiary">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          live on-chain
        </span>
      </div>

      {/* on-chain position */}
      <div className="p-3.5 border-b border-border-subtle">
        <KpiRibbon cells={stats} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-6" />
      </div>

      {/* real buyback rate */}
      <div className="px-3.5 pt-3.5 pb-4 border-b border-border-subtle">
        <div className="flex items-baseline gap-2 mb-2.5">
          <span className="text-[10px] uppercase tracking-[0.07em] text-text-tertiary font-semibold">
            Buyback rate
          </span>
          <span className="text-[10.5px] text-text-tertiary">
            from the fund&apos;s HYPE buys{bb ? ` · ${bb.windowDays}d avg · avg buy ${fmtUsd(bb.avgPrice)}` : ""}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <BuybackTile label="Per day" usd={fmtUsd(bb?.avgDailyUsd)} hype={fmtHype(bb?.avgDailyHype, 0)} />
          <BuybackTile label="Per week" usd={fmtUsd(bb?.weeklyUsd)} hype={fmtHype(bb?.weeklyHype, 0)} />
          <BuybackTile label="Per month" usd={fmtUsd(bb?.monthlyUsd)} hype={fmtHype(bb?.monthlyHype, 0)} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[11px] text-text-tertiary">
          <span>
            Annualized{" "}
            <span className="mono text-text-secondary font-semibold">
              {fmtUsd(bb ? bb.avgDailyUsd * 365 : null)}
            </span>
          </span>
          {buybackYield != null && (
            <span>
              Buyback yield{" "}
              <span className="mono text-success font-semibold">~{fmtPct(buybackYield)}</span> of mcap
            </span>
          )}
          <span>
            Lifetime spend{" "}
            <span className="mono text-text-secondary font-semibold">{fmtUsdFull(af?.costBasisUsd)}</span>
          </span>
        </div>
      </div>

      {/* daily buyback chart + recent feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-border-subtle">
        <div className="px-3.5 py-3 lg:border-r border-border-subtle">
          <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-1">
            Daily buyback · {chartData.length}d (USD)
          </div>
          <div style={{ height: 150 }}>
            {chartData.length > 1 ? (
              <AuroraAreaChart
                data={chartData}
                lineColor={chartPalette.gold}
                height={150}
                yAxisWidth={44}
                formatValue={(v) => fmtUsd(v)}
                formatTime={(ts) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-[11px] text-text-tertiary">
                Loading buybacks…
              </div>
            )}
          </div>
        </div>

        <div className="px-3.5 py-3">
          <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-1.5">
            Recent buys
          </div>
          {bb && bb.recent.length > 0 ? (
            <div className="flex flex-col gap-1">
              {bb.recent.slice(0, 6).map((f, i) => (
                <div key={`${f.time}-${i}`} className="flex items-center gap-2 text-[11.5px]">
                  <span className="mono text-text-tertiary w-8 shrink-0">{ago(f.time)}</span>
                  <span className="text-success font-semibold">Buy</span>
                  <span className="mono text-text-primary">{compactHype(f.sz)} HYPE</span>
                  <span className="mono text-text-tertiary">@ {fmtUsd(f.px)}</span>
                  <span className="mono text-text-secondary ml-auto">{fmtUsd(f.sz * f.px)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-text-tertiary py-2">Loading fills…</div>
          )}
        </div>
      </div>

      {/* flywheel */}
      <div className="px-3.5 py-3.5 border-b border-border-subtle">
        <FlywheelDiagram
          dailyRevenueUsd={fmtUsd(bb?.avgDailyUsd)}
          dailyBuybackHype={fmtHype(bb?.avgDailyHype, 0)}
          feeSharePct={99}
        />
      </div>

      {/* explainer */}
      <div className="px-3.5 py-3 flex-1">
        <p className="text-[11.5px] leading-relaxed text-text-secondary">
          The Assistance Fund is an L1 system address with no private key. The protocol routes the
          large majority (~97–99%) of net perp and spot trading fees to it, and it continuously buys
          HYPE on the open market — every figure above is aggregated from its actual on-chain buy
          fills. HYPE that lands there cannot be withdrawn, so more volume means more buybacks and a
          tighter float.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Source: Hyperliquid info · AF fills &amp; balance (live, on-chain)</span>
      </div>
    </Card>
  );
});

function BuybackTile({
  label,
  usd,
  hype,
}: {
  label: string;
  usd: ReactNode;
  hype: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-2/40 px-3.5 py-3">
      <div className="text-[10px] uppercase tracking-[0.07em] text-text-tertiary font-semibold">
        {label}
      </div>
      <div className="mono text-[22px] font-semibold text-gold leading-none mt-2 tracking-[-0.01em]">
        {usd}
      </div>
      <div className="mono text-[11px] text-text-tertiary mt-1.5">≈ {hype}</div>
    </div>
  );
}
