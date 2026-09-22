"use client";

import { useMemo } from "react";
import { useAddressBalance, useTransactions } from "@/services/explorer/address";
import { usePortfolio } from "@/services/explorer/address/hooks/usePortfolio";
import type { PortfolioApiResponse } from "@/services/explorer/address/types";
import { useUserLiquidations } from "@/services/explorer/liquidation";
import type { Liquidation } from "@/services/explorer/liquidation";
import {
  useWalletCoinDistribution,
  useWalletCoins,
  useWalletFundingSummary,
  useWalletOverview,
  useWalletPerformance,
  type WalletPerformance,
} from "@/services/market/tracker/wallet-performance";
import type { HyperliquidPerpAssetPosition } from "@/services/market/tracker/types";
import type { SourceBadgeStatus } from "@/components/common";
import { classifyWallet, type WalletArchetype } from "./walletArchetype";

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

export interface BalanceBucket {
  key: "spot" | "perps" | "vault" | "staked";
  label: string;
  value: number;
  /** 0..1 share of net worth. */
  share: number;
}

export interface PeriodPnl {
  day: number | null;
  week: number | null;
  month: number | null;
  allTime: number | null;
}

interface MarketShare {
  coin: string;
  volume: number;
  /** 0..1 share of lifetime volume. */
  share: number;
}

export interface MarketsProfile {
  top: MarketShare[];
  othersShare: number;
  count: number;
  top3Share: number;
  focus: "Concentrated" | "Balanced" | "Diversified";
}

export interface ByCoinRow {
  coin: string;
  volume: number;
  share: number | null;
  pnl: number;
  fees: number;
  fills: number;
  /** Net funding on this coin, USD — null when the funding feed is unavailable. */
  funding: number | null;
}

export interface OpenPositionRisk {
  coin: string;
  side: "long" | "short";
  leverage: number;
  notional: number;
  markPx: number;
  liquidationPx: number | null;
  /** Signed move (fraction of mark) that would trigger liquidation; null when
   *  the position has no liquidation price (e.g. fully collateralised). */
  distance: number | null;
}

export interface RiskProfile {
  positions: OpenPositionRisk[];
  /** The open position closest to its liquidation price. */
  nearest: OpenPositionRisk | null;
  /** Cross margin in use as a fraction of account value (0..1), null without perps. */
  marginUtilisation: number | null;
  liquidations: {
    count: number;
    totalNotional: number;
    last: Liquidation | null;
    hasMore: boolean;
  };
}

export interface TradingProfile {
  fills: number;
  trades: number;
  uniqueCoins: number;
  volume: number;
  fees: number;
  winRate: number;
  wins: number | null;
  losses: number | null;
  profitFactor: number | null;
  avgWin: number | null;
  avgLoss: number | null;
  bestTrade: number | null;
  worstTrade: number | null;
  longPct: number | null;
  equityDrawdownUsd: number | null;
  equityDrawdownPct: number | null;
  fundingNet: number | null;
  fundingReceived: number | null;
  fundingPaid: number | null;
  fundingEvents: number | null;
}

export interface AddressDigestModel {
  address: string;
  netWorth: { total: number; buckets: BalanceBucket[] };
  /** Exchange-reported PnL (HL `portfolio`), deposits/withdrawals excluded. */
  pnl: PeriodPnl;
  activity: { firstSeen: number | null; lastSeen: number | null; recentTxCount: number };
  /** null when the wallet has no Hyperliquid trading history. */
  trading: TradingProfile | null;
  markets: MarketsProfile | null;
  byCoin: ByCoinRow[];
  risk: RiskProfile;
  archetype: WalletArchetype | null;
  /** First-paint loading — balances not yet known. */
  isLoading: boolean;
  /** Indexer-backed sections still resolving. */
  tradingLoading: boolean;
  /** Indexer reachable? Drives the card's `<SourceBadge>` health dot. */
  indexerStatus: SourceBadgeStatus;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const TOP_MARKETS = 6;

function periodPnl(portfolio: PortfolioApiResponse | null, key: string): number | null {
  const series = portfolio?.find((entry) => entry[0] === key)?.[1]?.pnlHistory;
  if (!series || series.length === 0) return null;
  const first = parseFloat(series[0][1]);
  const last = parseFloat(series[series.length - 1][1]);
  if (!Number.isFinite(first) || !Number.isFinite(last)) return null;
  return last - first;
}

function positionRisk(entry: HyperliquidPerpAssetPosition): OpenPositionRisk | null {
  const p = entry.position;
  const szi = parseFloat(p.szi);
  const notional = Math.abs(parseFloat(p.positionValue));
  if (!Number.isFinite(szi) || szi === 0 || !Number.isFinite(notional)) return null;
  const markPx = notional / Math.abs(szi);
  const liq = p.liquidationPx == null ? NaN : parseFloat(p.liquidationPx);
  const liquidationPx = Number.isFinite(liq) && liq > 0 ? liq : null;
  return {
    coin: p.coin,
    side: szi > 0 ? "long" : "short",
    leverage: p.leverage?.value ?? 0,
    notional,
    markPx,
    liquidationPx,
    distance: liquidationPx != null && markPx > 0 ? (liquidationPx - markPx) / markPx : null,
  };
}

function marketsProfile(shares: { coin: string; volume: number }[]): MarketsProfile | null {
  const rows = shares
    .filter((s) => s.volume > 0 && s.coin && s.coin !== "UNKNOWN")
    .sort((a, b) => b.volume - a.volume);
  const total = rows.reduce((s, r) => s + r.volume, 0);
  if (rows.length === 0 || total <= 0) return null;
  const top = rows.slice(0, TOP_MARKETS).map((r) => ({
    coin: r.coin,
    volume: r.volume,
    share: r.volume / total,
  }));
  const othersShare = Math.max(0, 1 - top.reduce((s, r) => s + r.share, 0));
  const top3Share = rows.slice(0, 3).reduce((s, r) => s + r.volume, 0) / total;
  return {
    top,
    othersShare,
    count: rows.length,
    top3Share,
    focus: top3Share >= 0.8 ? "Concentrated" : top3Share >= 0.5 ? "Balanced" : "Diversified",
  };
}

function tradingProfile(
  overview: { fill_count: number; total_trades: number; unique_coins: number; total_volume: number; total_fees: number; win_rate: number } | null,
  perf: WalletPerformance | null,
  funding: { net_usdc: number; received_usdc: number; paid_usdc: number; event_count: number } | null
): TradingProfile | null {
  if (!overview || overview.fill_count === 0) return null;
  const hasPerf = !!perf && perf.total_trades > 0;
  const hasFunding = !!funding && funding.event_count > 0;
  return {
    fills: overview.fill_count,
    trades: overview.total_trades,
    uniqueCoins: overview.unique_coins,
    volume: overview.total_volume,
    fees: overview.total_fees,
    winRate: overview.win_rate,
    wins: hasPerf ? perf.wins : null,
    losses: hasPerf ? perf.losses : null,
    profitFactor: hasPerf ? perf.profit_factor : null,
    avgWin: hasPerf ? perf.avg_win : null,
    avgLoss: hasPerf ? perf.avg_loss : null,
    bestTrade: hasPerf ? perf.best_trade_pnl : null,
    worstTrade: hasPerf ? perf.worst_trade_pnl : null,
    longPct: hasPerf ? perf.long_pct : null,
    equityDrawdownUsd: hasPerf && perf.equity_max_drawdown_usd > 0 ? perf.equity_max_drawdown_usd : null,
    equityDrawdownPct: hasPerf && perf.equity_max_drawdown_pct > 0 ? perf.equity_max_drawdown_pct : null,
    fundingNet: hasFunding ? funding.net_usdc : null,
    fundingReceived: hasFunding ? funding.received_usdc : null,
    fundingPaid: hasFunding ? funding.paid_usdc : null,
    fundingEvents: hasFunding ? funding.event_count : null,
  };
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

/**
 * Single data source for the explorer address digest (KPI ribbon + wallet
 * profile card). Opens each feed once and derives every cross-cut figure
 * here, so the presentational components only format.
 */
export function useAddressDigest(address: string): AddressDigestModel {
  const balanceFeed = useAddressBalance(address);
  const { data: portfolio } = usePortfolio(address);
  const { transactions } = useTransactions(address);
  const overviewFeed = useWalletOverview(address);
  const perfFeed = useWalletPerformance(address, { lifetime: true });
  const coinsFeed = useWalletCoins(address, 8);
  const sharesFeed = useWalletCoinDistribution(address);
  const fundingFeed = useWalletFundingSummary(address);
  const liqFeed = useUserLiquidations(address);

  const { balances, perpPositions } = balanceFeed;
  const overview = overviewFeed.overview ?? null;
  const perf = perfFeed.performance ?? null;
  const funding = fundingFeed.funding ?? null;
  const { coins } = coinsFeed;
  const { shares } = sharesFeed;

  const netWorth = useMemo(() => {
    const total = balances.totalBalance;
    const raw: Omit<BalanceBucket, "share">[] = [
      { key: "spot", label: "Spot", value: balances.spotBalance },
      { key: "perps", label: "Perps", value: balances.perpBalance },
      { key: "vault", label: "Vault", value: balances.vaultBalance },
      { key: "staked", label: "Staked", value: balances.stakedBalance },
    ];
    return {
      total,
      buckets: raw.map((b) => ({ ...b, share: total > 0 ? b.value / total : 0 })),
    };
  }, [balances]);

  const pnl = useMemo<PeriodPnl>(
    () => ({
      day: periodPnl(portfolio, "day"),
      week: periodPnl(portfolio, "week"),
      month: periodPnl(portfolio, "month"),
      allTime: periodPnl(portfolio, "allTime"),
    }),
    [portfolio]
  );

  const activity = useMemo(() => {
    const txs = transactions ?? [];
    const lastTx = txs[0]?.time ?? null;
    const lastFill = overview?.last_activity ? new Date(overview.last_activity + "Z").getTime() : NaN;
    const lastSeen =
      lastTx != null && Number.isFinite(lastFill) ? Math.max(lastTx, lastFill)
      : lastTx ?? (Number.isFinite(lastFill) ? lastFill : null);
    return {
      firstSeen: txs.length > 0 ? txs[txs.length - 1].time : null,
      lastSeen,
      recentTxCount: txs.length,
    };
  }, [transactions, overview]);

  const trading = useMemo(() => tradingProfile(overview, perf, funding), [overview, perf, funding]);

  const markets = useMemo(() => {
    const source = shares.length > 0 ? shares : coins.map((c) => ({ coin: c.coin, volume: c.total_volume }));
    return marketsProfile(source);
  }, [shares, coins]);

  const byCoin = useMemo<ByCoinRow[]>(() => {
    const totalVolume = shares.reduce((s, r) => s + r.volume, 0);
    const shareByCoin = new Map(shares.map((s) => [s.coin, totalVolume > 0 ? s.volume / totalVolume : null]));
    const fundingByCoin = new Map(funding?.by_coin.map((c) => [c.coin, c.net_usdc]) ?? []);
    return coins
      .filter((c) => c.coin && c.coin !== "UNKNOWN" && c.total_volume > 0)
      .map((c) => ({
        coin: c.coin,
        volume: c.total_volume,
        share: shareByCoin.get(c.coin) ?? null,
        pnl: c.total_pnl,
        fees: c.total_fees,
        fills: c.fill_count,
        funding: funding ? fundingByCoin.get(c.coin) ?? 0 : null,
      }));
  }, [coins, shares, funding]);

  const risk = useMemo<RiskProfile>(() => {
    const positions = (perpPositions?.assetPositions ?? [])
      .map(positionRisk)
      .filter((p): p is OpenPositionRisk => p != null)
      .sort((a, b) => {
        const da = a.distance == null ? Infinity : Math.abs(a.distance);
        const db = b.distance == null ? Infinity : Math.abs(b.distance);
        return da - db;
      });
    const accountValue = parseFloat(perpPositions?.marginSummary.accountValue ?? "0");
    const marginUsed = parseFloat(perpPositions?.marginSummary.totalMarginUsed ?? "0");
    return {
      positions,
      nearest: positions.find((p) => p.distance != null) ?? null,
      marginUtilisation:
        positions.length > 0 && accountValue > 0 && Number.isFinite(marginUsed)
          ? marginUsed / accountValue
          : null,
      liquidations: {
        count: liqFeed.liquidations.length,
        totalNotional: liqFeed.totalNotional,
        last: liqFeed.liquidations[0] ?? null,
        hasMore: liqFeed.hasMore,
      },
    };
  }, [perpPositions, liqFeed.liquidations, liqFeed.totalNotional, liqFeed.hasMore]);

  const archetype = useMemo(
    () => classifyWallet({ transactions, overview, balances }),
    [transactions, overview, balances]
  );

  const indexerLoading = overviewFeed.isLoading && !overview;
  const indexerStatus: SourceBadgeStatus = indexerLoading
    ? "loading"
    : overviewFeed.error || perfFeed.error || coinsFeed.error
      ? "error"
      : "ok";

  return {
    address,
    netWorth,
    pnl,
    activity,
    trading,
    markets,
    byCoin,
    risk,
    archetype,
    isLoading: balanceFeed.isLoading && balances.totalBalance === 0,
    tradingLoading: indexerLoading || (perfFeed.isLoading && !perf),
    indexerStatus,
  };
}
