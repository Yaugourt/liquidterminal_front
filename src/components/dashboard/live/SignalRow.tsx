"use client";

import { memo, type ReactNode } from "react";
import Link from "next/link";
import { TrendingUp, Activity, Timer, Gavel, Hammer, Receipt, Trophy, Vault, Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TokenAvatar } from "@/components/common";
import { useDashboardStats } from "@/services/dashboard";
import { useTrendingPerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { useTrendingSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { useHypeBuyPressure } from "@/services/market/order/hooks/useHypeBuyPressure";
import { useTwapOrders } from "@/services/market/order/hooks/useTwapOrders";
import { useAuctionTiming } from "@/services/market/auction/hooks/useAuctionTiming";
import { useBuildersGlobalStats } from "@/services/indexer/builders/hooks/useBuildersGlobalStats";
import { useMetricHistory } from "@/services/market/metrics";
import { useBiggestTrades } from "@/services/market/biggest-trades";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

const EMPTY = "—";

/** Compact sparkline; colour comes from the parent text token via currentColor. */
function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 120, h = 22, pad = 2;
  const mn = Math.min(...values), mx = Math.max(...values), rg = mx - mn || 1;
  const line = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - 2 * pad);
      const y = h - pad - ((v - mn) / rg) * (h - 2 * pad);
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-5 mt-auto" aria-hidden>
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function signedPct(v: number | null | undefined): { text: string; up: boolean } {
  if (v == null || !Number.isFinite(v)) return { text: EMPTY, up: true };
  return { text: `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`, up: v >= 0 };
}

/** A compact signal tile; with `href` the whole tile opens the page that goes deeper. */
function Signal({
  icon,
  label,
  value,
  valueClass,
  sub,
  bar,
  spark,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  valueClass?: string;
  sub?: ReactNode;
  bar?: ReactNode;
  spark?: ReactNode;
  href?: string;
}) {
  const tile = (
    <Card className="p-3 flex flex-col gap-1.5 min-h-[96px] h-full">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
        <span className="text-brand">{icon}</span>
        {label}
      </div>
      <div className={`mono text-[17px] font-semibold leading-none tracking-[-0.01em] truncate ${valueClass ?? "text-text-primary"}`}>
        {value}
      </div>
      {bar}
      {spark}
      {sub && <div className="text-[11px] text-text-secondary mt-auto truncate">{sub}</div>}
    </Card>
  );
  if (!href) return tile;
  return (
    <Link href={href} className="block rounded-lg focus-ring group [&>div]:group-hover:bg-surface-2/60">
      {tile}
    </Link>
  );
}

/**
 * The slower signals of the Overview: 24h aggregates on light polled
 * endpoints. Self-contained (own hooks, no props) so the once-per-second live
 * flush of the page never re-renders it.
 */
export const SignalRow = memo(function SignalRow() {
  const { format } = useNumberFormat();
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { data: perpMovers } = useTrendingPerpMarkets(1, "change24h", "desc");
  const { data: spotMovers } = useTrendingSpotTokens(1, "change24h", "desc");
  const { buyPressure, totalBuyValue, totalSellValue } = useHypeBuyPressure();
  const { totalVolume: twapVol, total: twapTotal, metadata: twapMeta } = useTwapOrders({ limit: 100, status: "active" });
  const { auctionState } = useAuctionTiming();
  const { stats: builders } = useBuildersGlobalStats("24h");
  const { history: feesHistory } = useMetricHistory("total_fees_24h", 168);
  const { trades: bestTrades } = useBiggestTrades("DESC", 1, 24);

  const count = (v: number | null | undefined): string =>
    v == null || !Number.isFinite(v) ? EMPTY : formatNumber(v, format, { maximumFractionDigits: 0 });

  const perpMover = perpMovers?.[0];
  const spotMover = spotMovers?.[0];
  const perpChange = signedPct(perpMover?.change24h);
  const spotChange = signedPct(spotMover?.change24h);
  const auctionActive = auctionState?.isActive;
  const twapCount = twapMeta?.activeOrders ?? twapTotal;
  const buildersFees = builders?.current?.totalBuilderFees;
  const feesLatest = feesHistory.length ? feesHistory[feesHistory.length - 1].value : undefined;
  const best = bestTrades[0];
  const flowTotal = totalBuyValue + totalSellValue;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <Signal
        icon={<TrendingUp size={12} />}
        label="Top mover · perp"
        href={perpMover ? `/market/perp/${encodeURIComponent(perpMover.name)}` : "/market/perp"}
        value={perpMover ? <span className="inline-flex items-center gap-1.5"><TokenAvatar assetName={perpMover.name} src={perpMover.logo} size="sm" />{perpMover.name}</span> : EMPTY}
        sub={perpMover ? <span className={perpChange.up ? "text-success" : "text-danger"}>{perpChange.text} <span className="text-text-tertiary">· {compactUsd(perpMover.volume)} vol</span></span> : undefined}
      />
      <Signal
        icon={<TrendingUp size={12} />}
        label="Top mover · spot"
        href={spotMover ? `/market/spot/${encodeURIComponent(spotMover.name)}` : "/market/spot"}
        value={spotMover ? <span className="inline-flex items-center gap-1.5"><TokenAvatar assetName={spotMover.name} src={spotMover.logo} kind="spot" size="sm" />{spotMover.name}</span> : EMPTY}
        sub={spotMover ? <span className={spotChange.up ? "text-success" : "text-danger"}>{spotChange.text} <span className="text-text-tertiary">· {compactUsd(spotMover.volume)} vol</span></span> : undefined}
      />
      <Signal
        icon={<Activity size={12} />}
        label="HYPE buy pressure"
        href="/hype"
        value={buyPressure != null ? `${buyPressure >= 0 ? "+" : "-"}${compactUsd(Math.abs(buyPressure))}` : EMPTY}
        valueClass={buyPressure == null ? "text-text-primary" : buyPressure >= 0 ? "text-success" : "text-danger"}
        sub={<span>Buys {compactUsd(totalBuyValue)} · sells {compactUsd(totalSellValue)}</span>}
        bar={
          flowTotal > 0 ? (
            <div className="h-1.5 rounded-full overflow-hidden flex bg-surface-2">
              <span className="bg-success" style={{ width: `${(totalBuyValue / flowTotal) * 100}%` }} />
              <span className="bg-danger" style={{ width: `${(totalSellValue / flowTotal) * 100}%` }} />
            </div>
          ) : undefined
        }
      />
      <Signal
        icon={<Timer size={12} />}
        label="Active TWAPs"
        href="/dashboard/market"
        value={twapCount ? count(twapCount) : EMPTY}
        sub={twapVol ? <span>{compactUsd(twapVol)} in flight</span> : undefined}
      />
      <Signal
        icon={<Gavel size={12} />}
        label={auctionActive ? "Auction · live" : "Next auction"}
        href="/market/spot/auction"
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
        icon={<Trophy size={12} />}
        label="Biggest win · 24h"
        href={best ? `/market/tracker/wallet/${best.user}` : "/market/trades"}
        value={best ? `${best.pnl_realized >= 0 ? "+" : "-"}${compactUsd(Math.abs(best.pnl_realized))}` : EMPTY}
        valueClass={best && best.pnl_realized < 0 ? "text-danger" : "text-success"}
        sub={
          best ? (
            <span>
              <span className="inline-flex items-center gap-1 align-middle"><TokenAvatar assetName={best.coin} size="xs" />{best.coin}</span> {best.direction} · {best.user.slice(0, 6)}…{best.user.slice(-4)}
            </span>
          ) : undefined
        }
      />
      <Signal
        icon={<Hammer size={12} />}
        label="Builder fees · 24h"
        href="/market/builders"
        value={buildersFees != null ? compactUsd(buildersFees) : EMPTY}
        sub={builders?.current?.uniqueUsers != null ? <span>{count(builders.current.uniqueUsers)} users routed</span> : undefined}
      />
      <Signal
        icon={<Receipt size={12} />}
        label="Protocol fees · 24h"
        href="/dashboard/capital"
        value={feesLatest != null ? compactUsd(feesLatest) : EMPTY}
        valueClass="text-gold"
        spark={feesHistory.length >= 2 ? <span className="text-gold"><Spark values={feesHistory.map((p) => p.value)} /></span> : undefined}
      />
      <Signal
        icon={<Vault size={12} />}
        label="Vaults TVL"
        href="/explorer/vaults"
        value={statsLoading && !stats ? "…" : compactUsd(stats?.vaultsTvl)}
      />
      <Signal
        icon={<Coins size={12} />}
        label="HYPE staked"
        href="/explorer/validator"
        value={statsLoading && !stats ? "…" : count(stats?.totalHypeStake)}
      />
    </div>
  );
});
