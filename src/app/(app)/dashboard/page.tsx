"use client";

import { type ReactNode } from "react";
import { TrendingUp, Activity, Timer, Gavel, Zap, Hammer, Receipt } from "lucide-react";
import { KpiRibbon, SectionHead, type KpiCell } from "@/components/common";
import { Card } from "@/components/ui/card";
import { useDashboardStats } from "@/services/dashboard";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { useRevenueBreakdown } from "@/services/market/revenue/hooks/useRevenueBreakdown";
import { useLiquidationsData } from "@/services/explorer/liquidation/hooks/useLiquidationsData";
import { useTrendingPerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { useTrendingSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { useHypeBuyPressure } from "@/services/market/order/hooks/useHypeBuyPressure";
import { useTwapOrders } from "@/services/market/order/hooks/useTwapOrders";
import { useAuctionTiming } from "@/services/market/auction/hooks/useAuctionTiming";
import { useBuildersGlobalStats } from "@/services/indexer/builders/hooks/useBuildersGlobalStats";
import { useMetricHistory } from "@/services/market/metrics";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/**
 * Dashboard · Overview — "what's happening right now".
 *
 * Zone 1: the network bar (six scalars that never move). Zone 2: a live board
 * of the signals moving this minute. Depth lives in the sibling tabs (Market /
 * Capital / Ecosystem), which mount their own heavy hooks; this page stays on
 * light aggregate endpoints.
 */

const EMPTY = "—";

/** Compact sparkline; colour comes from the parent text token via currentColor. */
function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 120, h = 26, pad = 2;
  const mn = Math.min(...values), mx = Math.max(...values), rg = mx - mn || 1;
  const line = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - 2 * pad);
      const y = h - pad - ((v - mn) / rg) * (h - 2 * pad);
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-6 mt-auto" aria-hidden>
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function signedPct(v: number | null | undefined): { text: string; up: boolean } {
  if (v == null || !Number.isFinite(v)) return { text: EMPTY, up: true };
  return { text: `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`, up: v >= 0 };
}

/** A single big signal tile (Zone 2). */
function Signal({
  icon,
  label,
  value,
  valueClass,
  sub,
  bar,
  spark,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  valueClass?: string;
  sub?: ReactNode;
  bar?: ReactNode;
  spark?: ReactNode;
}) {
  return (
    <Card className="p-3.5 flex flex-col gap-2 min-h-[116px]">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
        <span className="text-brand">{icon}</span>
        {label}
      </div>
      <div className={`mono text-[22px] font-semibold leading-none tracking-[-0.01em] ${valueClass ?? "text-text-primary"}`}>
        {value}
      </div>
      {bar}
      {spark}
      {sub && <div className="text-[11px] text-text-secondary mt-auto">{sub}</div>}
    </Card>
  );
}

export default function DashboardOverview() {
  const { format } = useNumberFormat();
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { stats: perp } = usePerpGlobalStats();
  const { breakdown } = useRevenueBreakdown("7d");
  const { stats: liq } = useLiquidationsData("24h");
  const { data: perpMovers } = useTrendingPerpMarkets(1, "change24h", "desc");
  const { data: spotMovers } = useTrendingSpotTokens(1, "change24h", "desc");
  const { buyPressure, totalBuyValue, totalSellValue } = useHypeBuyPressure();
  const { totalVolume: twapVol, total: twapTotal, metadata: twapMeta } = useTwapOrders({ limit: 100, status: "active" });
  const { auctionState } = useAuctionTiming();
  const { stats: builders } = useBuildersGlobalStats("24h");
  const { history: feesHistory } = useMetricHistory("total_fees_24h", 168);

  const count = (v: number | null | undefined): string =>
    v == null || !Number.isFinite(v) ? EMPTY : formatNumber(v, format, { maximumFractionDigits: 0 });

  const revenue24h = breakdown?.days?.length ? breakdown.days[breakdown.days.length - 1].total : undefined;
  const liqTotal = liq?.totalVolume;
  const longPct = liq && liq.totalVolume > 0 ? Math.round((liq.longVolume / liq.totalVolume) * 100) : null;

  // Zone 1 — the network bar.
  const kpis: KpiCell[] = [
    { label: "24h Volume", value: statsLoading && !stats ? "…" : compactUsd(stats?.dailyVolume) },
    { label: "Open Interest", value: compactUsd(perp?.totalOpenInterest) },
    { label: "Revenue 24h", value: revenue24h != null ? compactUsd(revenue24h) : EMPTY, tone: "gold" },
    { label: "Vaults TVL", value: statsLoading && !stats ? "…" : compactUsd(stats?.vaultsTvl) },
    { label: "HYPE Staked", value: statsLoading && !stats ? "…" : count(stats?.totalHypeStake) },
    { label: "Liquidations 24h", value: liqTotal ? compactUsd(liqTotal) : EMPTY, sub: liq?.liquidationsCount ? `${count(liq.liquidationsCount)} events` : undefined },
  ];

  // Zone 2 — live signals.
  const perpMover = perpMovers?.[0];
  const spotMover = spotMovers?.[0];
  const perpChange = signedPct(perpMover?.change24h);
  const spotChange = signedPct(spotMover?.change24h);
  const auctionActive = auctionState?.isActive;
  const twapCount = twapMeta?.activeOrders ?? twapTotal;
  const buildersFees = builders?.current?.totalBuilderFees;
  const feesLatest = feesHistory.length ? feesHistory[feesHistory.length - 1].value : undefined;

  return (
    <div className="space-y-8">
      {/* ZONE 1 — network bar */}
      <section className="space-y-2.5">
        <SectionHead title="Network Pulse" subtitle="The state of Hyperliquid, one glance" />
        <KpiRibbon cells={kpis} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" />
      </section>

      {/* ZONE 2 — what's happening right now */}
      <section className="space-y-2.5">
        <SectionHead title="Happening now" subtitle="The signals moving this minute" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Signal
            icon={<TrendingUp size={13} />}
            label="Top mover · perp"
            value={perpMover?.name ?? EMPTY}
            sub={perpMover ? <span className={perpChange.up ? "text-success" : "text-danger"}>{perpChange.text} <span className="text-text-tertiary">· {compactUsd(perpMover.volume)} vol</span></span> : undefined}
          />
          <Signal
            icon={<TrendingUp size={13} />}
            label="Top mover · spot"
            value={spotMover?.name ?? EMPTY}
            sub={spotMover ? <span className={spotChange.up ? "text-success" : "text-danger"}>{spotChange.text} <span className="text-text-tertiary">· {compactUsd(spotMover.volume)} vol</span></span> : undefined}
          />
          <Signal
            icon={<Activity size={13} />}
            label="HYPE buy pressure"
            value={buyPressure != null ? `${buyPressure >= 0 ? "+" : "-"}${compactUsd(Math.abs(buyPressure))}` : EMPTY}
            valueClass={buyPressure == null ? "text-text-primary" : buyPressure >= 0 ? "text-success" : "text-danger"}
            sub={<span>Buys {compactUsd(totalBuyValue)} · sells {compactUsd(totalSellValue)}</span>}
            bar={
              totalBuyValue + totalSellValue > 0 ? (
                <div className="h-1.5 rounded-full overflow-hidden flex bg-surface-2">
                  <span className="bg-success" style={{ width: `${(totalBuyValue / (totalBuyValue + totalSellValue)) * 100}%` }} />
                  <span className="bg-danger" style={{ width: `${(totalSellValue / (totalBuyValue + totalSellValue)) * 100}%` }} />
                </div>
              ) : undefined
            }
          />
          <Signal
            icon={<Timer size={13} />}
            label="Active TWAPs"
            value={twapCount ? count(twapCount) : EMPTY}
            sub={twapVol ? <span>{compactUsd(twapVol)} in flight</span> : undefined}
          />
          <Signal
            icon={<Gavel size={13} />}
            label={auctionActive ? "Auction · live" : "Next auction"}
            value={auctionState ? `${formatNumber(auctionState.currentPrice, format)} HYPE` : EMPTY}
            sub={
              auctionState ? (
                auctionActive ? (
                  <span>≈ {compactUsd(auctionState.currentPriceUSD)} · {auctionState.timeRemaining} left</span>
                ) : (
                  <span>Opens in {auctionState.nextAuctionStart}</span>
                )
              ) : undefined
            }
            bar={
              auctionActive ? (
                <div className="h-1.5 rounded-full overflow-hidden bg-surface-2">
                  <span className="block h-full bg-brand" style={{ width: `${auctionState.progressPercentage}%` }} />
                </div>
              ) : undefined
            }
          />
          <Signal
            icon={<Zap size={13} />}
            label="Liquidations · 24h"
            value={liqTotal ? compactUsd(liqTotal) : EMPTY}
            sub={
              liq && longPct != null ? (
                <span>
                  <span className="text-success">Long {longPct}%</span> · <span className="text-danger">Short {100 - longPct}%</span> · top {liq.topCoin}
                </span>
              ) : undefined
            }
            bar={
              liq && liq.totalVolume > 0 ? (
                <div className="h-1.5 rounded-full overflow-hidden flex bg-surface-2">
                  <span className="bg-success" style={{ width: `${(liq.longVolume / liq.totalVolume) * 100}%` }} />
                  <span className="bg-danger" style={{ width: `${(liq.shortVolume / liq.totalVolume) * 100}%` }} />
                </div>
              ) : undefined
            }
          />
          <Signal
            icon={<Hammer size={13} />}
            label="Builder fees · 24h"
            value={buildersFees != null ? compactUsd(buildersFees) : EMPTY}
            sub={builders?.current?.uniqueUsers != null ? <span>{count(builders.current.uniqueUsers)} users routed</span> : undefined}
          />
          <Signal
            icon={<Receipt size={13} />}
            label="Protocol fees · 24h"
            value={feesLatest != null ? compactUsd(feesLatest) : EMPTY}
            valueClass="text-gold"
            spark={feesHistory.length >= 2 ? <span className="text-gold"><Spark values={feesHistory.map((p) => p.value)} /></span> : undefined}
          />
        </div>
      </section>
    </div>
  );
}
