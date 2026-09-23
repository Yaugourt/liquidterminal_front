"use client";

import { useMemo } from "react";
import {
  useAddressBalance,
  useLedgerUpdates,
  useTransactions,
  type NonFundingLedgerUpdate,
} from "@/services/explorer/address";
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
  useWalletRoundTrips,
  type WalletPerformance,
  type WalletRoundTrip,
} from "@/services/market/tracker/wallet-performance";
import { useAggregatePositioning, type AggregatePositioning } from "@/services/market/positioning";
import { usePredictedFundings } from "@/services/market/funding";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { getTokenName } from "@/services/explorer/address/formatters";
import type { FundingCarryRow } from "@/services/market/funding";
import type {
  HyperliquidBalance,
  HyperliquidPerpAssetPosition,
  HyperliquidPerpResponse,
} from "@/services/market/tracker/types";
import type { SourceBadgeStatus } from "@/components/common";
import { classifyWallet, type WalletArchetype } from "./walletArchetype";
import { deriveWalletInsights, type WalletInsight } from "./walletInsights";

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

export type DigestVariant = "explorer" | "tracker";

export interface BalanceBucket {
  key: "spot" | "perps" | "vault" | "staked" | "evm" | "defi" | "nft";
  label: string;
  value: number;
  /** 0..1 share of net worth. */
  share: number;
  /** HyperEVM-side bucket (Hyperfolio) — only opened on the tracker. */
  evm?: boolean;
}

export interface PeriodPnl {
  day: number | null;
  week: number | null;
  month: number | null;
  allTime: number | null;
  /** Perp-only all-time PnL (HL `perpAllTime`); spot = allTime − perp. */
  perpAllTime: number | null;
}

/** Traded notional per HL portfolio window, total and perp-only. */
export interface VolumeWindow {
  key: "day" | "week" | "month" | "allTime";
  label: string;
  total: number;
  perp: number;
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
  /** Display name — spot pairs (`@107`) resolved to their base token. */
  label: string;
  market: "perp" | "spot";
  volume: number;
  share: number | null;
  /** Indexer realized PnL; null when nothing closed on this market (the
   *  indexer reports 0 for spot pairs and still-open positions). */
  pnl: number | null;
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

/** Open perp exposure — what a follower would be copying right now. */
export interface ExposureProfile {
  longNotional: number;
  shortNotional: number;
  grossNotional: number;
  /** 0..1, long share of gross notional; null with no open position. */
  longShare: number | null;
  /** Gross notional / perp account value; null without perps. */
  effectiveLeverage: number | null;
  withdrawable: number | null;
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
  /** Indexer realized PnL (lifetime) — partial vs the exchange figure. */
  realizedPnl: number | null;
}

export type TradingStyle = "Scalper" | "Intraday" | "Swing" | "Position";

/** Rhythm of the wallet's latest closed round-trips — how copyable it is. */
export interface CadenceProfile {
  /** Round-trips in the sample (the feed's most recent N). */
  sample: number;
  medianHoldS: number;
  /** Share of round-trips held under 5 minutes, 0..1. */
  under5mShare: number;
  /** Days spanned by the sample, first entry → last exit. */
  spanDays: number;
  tradesPerDay: number;
  /** Win rate over the sample, 0..1. */
  recentWinRate: number;
  recentPnl: number;
  longShare: number;
  style: TradingStyle;
  lastClosed: number | null;
}

export interface LinkedAccount {
  address: string;
  /** USD sent from this wallet to the account minus what came back. */
  netOut: number;
  count: number;
  lastTime: number;
}

/** Capital in and out of the wallet (HL non-funding ledger). */
export interface CapitalFlows {
  deposits: number;
  withdrawals: number;
  /** USD moved to other HL accounts (sub-account / spot / usd sends), net. */
  transfersOut: number;
  transfersIn: number;
  /** USD value moved HyperCore → HyperEVM (and back) via the system addresses. */
  toEvm: number;
  fromEvm: number;
  /** Capital that stayed on HyperCore: deposits − withdrawals + transfersIn −
   *  transfersOut − (toEvm − fromEvm). */
  netCapitalIn: number;
  vaultDeposits: number;
  vaultWithdrawals: number;
  /** Counterparties sorted by |net| — the parent / sub-accounts of this wallet. */
  linked: LinkedAccount[];
  /** Ledger-recorded liquidation events (distinct from the local DB feed). */
  liquidationEvents: number;
  liquidatedNotional: number;
  firstTime: number | null;
  lastTime: number | null;
  events: number;
}

/** One open position against the smart-money cohort's stance on that coin. */
export interface SmartMoneyRow {
  coin: string;
  side: "long" | "short";
  notional: number;
  /** Cohort long share of notional on this coin, 0..1. */
  cohortLongShare: number;
  cohortTraders: number;
  aligned: boolean;
}

export interface SmartMoneyAlignment {
  rows: SmartMoneyRow[];
  cohortSize: number;
  updatedAt: string;
}

export interface CarryRow {
  coin: string;
  side: "long" | "short";
  notional: number;
  /** Hyperliquid predicted funding, APR %. */
  hlApr: number;
  /** Signed USD per day at the current rate (negative = the wallet pays). */
  dailyUsd: number;
}

/** Funding the open book earns or pays per day at the predicted HL rate. */
export interface CarryProfile {
  rows: CarryRow[];
  dailyUsd: number;
}

export interface AddressDigestModel {
  address: string;
  variant: DigestVariant;
  netWorth: { total: number; buckets: BalanceBucket[]; hyperCore: number; hyperEvm: number };
  /** HyperEVM feeds (tracker only) — still streaming / failed. */
  evm: { enabled: boolean; loading: boolean; error: Error | null };
  /** Exchange-reported PnL (HL `portfolio`), deposits/withdrawals excluded. */
  pnl: PeriodPnl;
  volumes: VolumeWindow[];
  activity: { firstSeen: number | null; lastSeen: number | null; recentTxCount: number };
  /** null when the wallet has no Hyperliquid trading history. */
  trading: TradingProfile | null;
  markets: MarketsProfile | null;
  byCoin: ByCoinRow[];
  risk: RiskProfile;
  exposure: ExposureProfile;
  /** null until the round-trip feed answers, or with fewer than 5 closed trades. */
  cadence: CadenceProfile | null;
  /** null until the ledger answers or when it is empty. */
  flows: CapitalFlows | null;
  /** null with no open perp position or while the cohort snapshot loads. */
  smartMoney: SmartMoneyAlignment | null;
  carry: CarryProfile | null;
  archetype: WalletArchetype | null;
  insights: WalletInsight[];
  /** Raw feeds the tracker's chart needs — no second subscription. */
  raw: {
    portfolio: PortfolioApiResponse | null;
    portfolioLoading: boolean;
    spotBalances: HyperliquidBalance[];
    balancesLoading: boolean;
  };
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
const ROUND_TRIP_SAMPLE = 100;
const DAY_MS = 86_400_000;

const num = (v: string | number | undefined | null): number => {
  const n = typeof v === "number" ? v : parseFloat(v ?? "");
  return Number.isFinite(n) ? n : 0;
};

function periodEntry(portfolio: PortfolioApiResponse | null, key: string) {
  return portfolio?.find((entry) => entry[0] === key)?.[1] ?? null;
}

function periodPnl(portfolio: PortfolioApiResponse | null, key: string): number | null {
  const series = periodEntry(portfolio, key)?.pnlHistory;
  if (!series || series.length === 0) return null;
  const first = parseFloat(series[0][1]);
  const last = parseFloat(series[series.length - 1][1]);
  if (!Number.isFinite(first) || !Number.isFinite(last)) return null;
  return last - first;
}

/** HL answers a zero-filled portfolio for any address, even one that never
 *  touched HyperCore — treat that as "no history" rather than a $0 PnL. */
function hasPortfolioHistory(portfolio: PortfolioApiResponse | null): boolean {
  const entry = periodEntry(portfolio, "allTime");
  if (!entry) return false;
  if (num(entry.vlm) > 0) return true;
  return (
    (entry.accountValueHistory ?? []).some(([, v]) => num(v) !== 0) ||
    entry.pnlHistory.some(([, v]) => num(v) !== 0)
  );
}

const VOLUME_WINDOWS: { key: VolumeWindow["key"]; label: string; perpKey: string }[] = [
  { key: "day", label: "24h", perpKey: "perpDay" },
  { key: "week", label: "7d", perpKey: "perpWeek" },
  { key: "month", label: "30d", perpKey: "perpMonth" },
  { key: "allTime", label: "All", perpKey: "perpAllTime" },
];

function volumeWindows(portfolio: PortfolioApiResponse | null): VolumeWindow[] {
  if (!portfolio || portfolio.length === 0) return [];
  return VOLUME_WINDOWS.map(({ key, label, perpKey }) => ({
    key,
    label,
    total: num(periodEntry(portfolio, key)?.vlm),
    perp: num(periodEntry(portfolio, perpKey)?.vlm),
  }));
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

function exposureProfile(
  positions: OpenPositionRisk[],
  perp: HyperliquidPerpResponse | null | undefined
): ExposureProfile {
  const longNotional = positions.filter((p) => p.side === "long").reduce((s, p) => s + p.notional, 0);
  const shortNotional = positions.filter((p) => p.side === "short").reduce((s, p) => s + p.notional, 0);
  const grossNotional = longNotional + shortNotional;
  const accountValue = num(perp?.marginSummary.accountValue);
  const withdrawable = perp?.withdrawable != null ? num(perp.withdrawable) : null;
  return {
    longNotional,
    shortNotional,
    grossNotional,
    longShare: grossNotional > 0 ? longNotional / grossNotional : null,
    effectiveLeverage: grossNotional > 0 && accountValue > 0 ? grossNotional / accountValue : null,
    withdrawable,
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
  overview: { fill_count: number; total_trades: number; unique_coins: number; total_volume: number; total_fees: number; win_rate: number; total_pnl: number } | null,
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
    realizedPnl: Number.isFinite(overview.total_pnl) ? overview.total_pnl : null,
  };
}

const median = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

/** Indexer timestamps come without a zone and are UTC. */
const utcMs = (iso: string): number => new Date(iso.endsWith("Z") ? iso : `${iso}Z`).getTime();

function cadenceProfile(trades: WalletRoundTrip[]): CadenceProfile | null {
  const rows = trades.filter((t) => Number.isFinite(t.duration_s) && t.duration_s >= 0);
  if (rows.length < 5) return null;
  const holds = rows.map((t) => t.duration_s);
  const medianHoldS = median(holds);
  const starts = rows.map((t) => utcMs(t.start_time)).filter(Number.isFinite);
  const ends = rows.map((t) => utcMs(t.end_time)).filter(Number.isFinite);
  const spanMs = Math.max(0, Math.max(...ends) - Math.min(...starts));
  // Floor the span at one hour so a burst of scalps does not divide by ~0.
  const spanDays = Math.max(spanMs, 3_600_000) / DAY_MS;
  const wins = rows.filter((t) => t.pnl_realized > 0).length;
  const style: TradingStyle =
    medianHoldS < 300 ? "Scalper" : medianHoldS < DAY_MS / 1000 ? "Intraday" : medianHoldS < 14 * DAY_MS / 1000 ? "Swing" : "Position";
  return {
    sample: rows.length,
    medianHoldS,
    under5mShare: holds.filter((h) => h < 300).length / rows.length,
    spanDays,
    tradesPerDay: rows.length / spanDays,
    recentWinRate: wins / rows.length,
    recentPnl: rows.reduce((s, t) => s + t.pnl_realized, 0),
    longShare: rows.filter((t) => t.direction === "long").length / rows.length,
    style,
    lastClosed: ends.length > 0 ? Math.max(...ends) : null,
  };
}

/** HL system addresses that are not counterparties (null, HIP-2). */
const SYSTEM_ADDRESS = /^0x(0{40}|f{40})$/i;
/** HyperCore ↔ HyperEVM bridge: 0x2222… for HYPE, 0x20 00…00 <token index>
 *  for every other spot token. Capital leaving HyperCore, not a counterparty. */
const EVM_BRIDGE_ADDRESS = /^0x(2{40}|200{30}[0-9a-f]{8})$/i;
/** Indexer placeholder for a wallet that never traded (`1970-01-01T00:00:00`). */
const MIN_REAL_TIME = Date.UTC(2020, 0, 1);

/** Ledger deltas that move USD between two HL accounts. */
const TRANSFER_TYPES = new Set(["subAccountTransfer", "spotTransfer", "send", "internalTransfer", "usdSend"]);

function capitalFlows(updates: NonFundingLedgerUpdate[], address: string): CapitalFlows | null {
  if (updates.length === 0) return null;
  const me = address.toLowerCase();
  const flows: CapitalFlows = {
    deposits: 0,
    withdrawals: 0,
    transfersOut: 0,
    transfersIn: 0,
    toEvm: 0,
    fromEvm: 0,
    netCapitalIn: 0,
    vaultDeposits: 0,
    vaultWithdrawals: 0,
    linked: [],
    liquidationEvents: 0,
    liquidatedNotional: 0,
    firstTime: null,
    lastTime: null,
    events: updates.length,
  };
  const linked = new Map<string, LinkedAccount>();
  for (const u of updates) {
    const d = u.delta;
    flows.firstTime = flows.firstTime == null ? u.time : Math.min(flows.firstTime, u.time);
    flows.lastTime = flows.lastTime == null ? u.time : Math.max(flows.lastTime, u.time);
    switch (d.type) {
      case "deposit":
        flows.deposits += num(d.usdc);
        break;
      case "withdraw":
        flows.withdrawals += num(d.usdc);
        break;
      case "vaultDeposit":
        flows.vaultDeposits += num(d.usdc);
        break;
      case "vaultWithdraw":
        flows.vaultWithdrawals += num((d as { requestedUsd?: string }).requestedUsd ?? d.usdc);
        break;
      case "liquidation":
        flows.liquidationEvents += 1;
        flows.liquidatedNotional += num((d as { liquidatedNtlPos?: string }).liquidatedNtlPos);
        break;
      default: {
        if (!TRANSFER_TYPES.has(d.type) || !d.user || !d.destination) break;
        const usd = num(d.usdcValue ?? d.usdc);
        if (usd <= 0) break;
        const sender = d.user.toLowerCase();
        const receiver = d.destination.toLowerCase();
        if (sender === receiver) break; // spot ↔ perp moves on the same account
        if (EVM_BRIDGE_ADDRESS.test(receiver)) {
          if (sender === me) flows.toEvm += usd;
          break;
        }
        if (EVM_BRIDGE_ADDRESS.test(sender)) {
          if (receiver === me) flows.fromEvm += usd;
          break;
        }
        if (SYSTEM_ADDRESS.test(sender) || SYSTEM_ADDRESS.test(receiver)) break;
        const out = sender === me;
        const other = out ? receiver : sender;
        if (out) flows.transfersOut += usd;
        else flows.transfersIn += usd;
        const row = linked.get(other) ?? { address: other, netOut: 0, count: 0, lastTime: 0 };
        row.netOut += out ? usd : -usd;
        row.count += 1;
        row.lastTime = Math.max(row.lastTime, u.time);
        linked.set(other, row);
      }
    }
  }
  flows.netCapitalIn =
    flows.deposits - flows.withdrawals + flows.transfersIn - flows.transfersOut - (flows.toEvm - flows.fromEvm);
  flows.linked = [...linked.values()].sort((a, b) => Math.abs(b.netOut) - Math.abs(a.netOut)).slice(0, 3);
  return flows;
}

function smartMoneyAlignment(
  positions: OpenPositionRisk[],
  cohort: AggregatePositioning | null
): SmartMoneyAlignment | null {
  if (!cohort || positions.length === 0) return null;
  const byCoin = new Map(cohort.coins.map((c) => [c.coin, c]));
  const rows: SmartMoneyRow[] = [];
  for (const p of positions) {
    const c = byCoin.get(p.coin);
    if (!c) continue;
    const gross = c.longNotional + c.shortNotional;
    if (gross <= 0 || c.traderCount < 3) continue;
    const cohortLongShare = c.longNotional / gross;
    const cohortSide: "long" | "short" = cohortLongShare >= 0.5 ? "long" : "short";
    rows.push({
      coin: p.coin,
      side: p.side,
      notional: p.notional,
      cohortLongShare,
      cohortTraders: c.traderCount,
      aligned: cohortSide === p.side,
    });
  }
  if (rows.length === 0) return null;
  rows.sort((a, b) => b.notional - a.notional);
  return { rows, cohortSize: cohort.cohortSize, updatedAt: cohort.updatedAt };
}

function carryProfile(positions: OpenPositionRisk[], fundings: FundingCarryRow[]): CarryProfile | null {
  if (positions.length === 0 || fundings.length === 0) return null;
  const aprByCoin = new Map(fundings.filter((f) => f.hlApr != null).map((f) => [f.coin, f.hlApr as number]));
  const rows: CarryRow[] = [];
  for (const p of positions) {
    const hlApr = aprByCoin.get(p.coin);
    if (hlApr == null) continue;
    // Positive funding: longs pay shorts.
    const dailyUsd = (p.notional * (hlApr / 100)) / 365 * (p.side === "long" ? -1 : 1);
    rows.push({ coin: p.coin, side: p.side, notional: p.notional, hlApr, dailyUsd });
  }
  if (rows.length === 0) return null;
  rows.sort((a, b) => Math.abs(b.dailyUsd) - Math.abs(a.dailyUsd));
  return { rows, dailyUsd: rows.reduce((s, r) => s + r.dailyUsd, 0) };
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

/**
 * Single data source for the address digest (KPI ribbon + wallet profile
 * card, and the tracker's performance chart). Opens each feed once and
 * derives every cross-cut figure here, so the presentational components only
 * format. The tracker variant additionally folds HyperEVM balances in.
 */
export function useAddressDigest(address: string, variant: DigestVariant = "explorer"): AddressDigestModel {
  const isTracker = variant === "tracker";
  const balanceFeed = useAddressBalance(address, { includeEvm: isTracker });
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio(address);
  const { transactions } = useTransactions(address);
  const ledgerFeed = useLedgerUpdates(address);
  const overviewFeed = useWalletOverview(address);
  const perfFeed = useWalletPerformance(address, { lifetime: true });
  const coinsFeed = useWalletCoins(address, 8);
  const sharesFeed = useWalletCoinDistribution(address);
  const fundingFeed = useWalletFundingSummary(address);
  const roundTripFeed = useWalletRoundTrips(address, ROUND_TRIP_SAMPLE);
  const liqFeed = useUserLiquidations(address);
  const { positioning } = useAggregatePositioning();
  // Same query as the Holdings tab (`useWalletData`) so it is served once.
  const { data: spotTokens } = useSpotTokens({ limit: 200, sortBy: "volume", sortOrder: "desc" });
  const { rows: predictedFundings } = usePredictedFundings();

  const { balances, perpPositions, spotBalances } = balanceFeed;
  const overview = overviewFeed.overview ?? null;
  const perf = perfFeed.performance ?? null;
  const funding = fundingFeed.funding ?? null;
  const { coins } = coinsFeed;
  const { shares } = sharesFeed;

  const netWorth = useMemo(() => {
    const total = balances.totalBalance;
    const core: Omit<BalanceBucket, "share">[] = [
      { key: "spot", label: "Spot", value: balances.spotBalance },
      { key: "perps", label: "Perps", value: balances.perpBalance },
      { key: "vault", label: "Vault", value: balances.vaultBalance },
      { key: "staked", label: "Staked", value: balances.stakedBalance },
    ];
    const evm: Omit<BalanceBucket, "share">[] = isTracker
      ? [
          { key: "evm", label: "EVM wallet", value: balances.evmBalance, evm: true },
          { key: "defi", label: "DeFi", value: balances.defiBalance, evm: true },
          { key: "nft", label: "NFTs", value: balances.nftBalance, evm: true },
        ]
      : [];
    const hyperEvm = balances.evmBalance + balances.defiBalance + balances.nftBalance;
    return {
      total,
      hyperCore: total - hyperEvm,
      hyperEvm,
      buckets: [...core, ...evm].map((b) => ({ ...b, share: total > 0 ? b.value / total : 0 })),
    };
  }, [balances, isTracker]);

  const pnl = useMemo<PeriodPnl>(() => {
    if (!hasPortfolioHistory(portfolio)) {
      return { day: null, week: null, month: null, allTime: null, perpAllTime: null };
    }
    return {
      day: periodPnl(portfolio, "day"),
      week: periodPnl(portfolio, "week"),
      month: periodPnl(portfolio, "month"),
      allTime: periodPnl(portfolio, "allTime"),
      perpAllTime: periodPnl(portfolio, "perpAllTime"),
    };
  }, [portfolio]);

  const volumes = useMemo(() => volumeWindows(portfolio), [portfolio]);

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
      .map((c) => {
        const spot = c.coin.startsWith("@");
        return {
          coin: c.coin,
          label: spot ? getTokenName(c.coin, spotTokens) : c.coin,
          market: spot ? ("spot" as const) : ("perp" as const),
          volume: c.total_volume,
          share: shareByCoin.get(c.coin) ?? null,
          pnl: c.total_pnl !== 0 ? c.total_pnl : null,
          fees: c.total_fees,
          fills: c.fill_count,
          // Spot pairs carry no funding — a dash, not a misleading $0.
          funding: funding && !spot ? fundingByCoin.get(c.coin) ?? 0 : null,
        };
      });
  }, [coins, shares, funding, spotTokens]);

  const positions = useMemo(
    () =>
      (perpPositions?.assetPositions ?? [])
        .map(positionRisk)
        .filter((p): p is OpenPositionRisk => p != null)
        .sort((a, b) => {
          const da = a.distance == null ? Infinity : Math.abs(a.distance);
          const db = b.distance == null ? Infinity : Math.abs(b.distance);
          return da - db;
        }),
    [perpPositions]
  );

  const risk = useMemo<RiskProfile>(() => {
    const accountValue = num(perpPositions?.marginSummary.accountValue);
    const marginUsed = num(perpPositions?.marginSummary.totalMarginUsed);
    return {
      positions,
      nearest: positions.find((p) => p.distance != null) ?? null,
      marginUtilisation: positions.length > 0 && accountValue > 0 ? marginUsed / accountValue : null,
      liquidations: {
        count: liqFeed.liquidations.length,
        totalNotional: liqFeed.totalNotional,
        last: liqFeed.liquidations[0] ?? null,
        hasMore: liqFeed.hasMore,
      },
    };
  }, [positions, perpPositions, liqFeed.liquidations, liqFeed.totalNotional, liqFeed.hasMore]);

  const exposure = useMemo(() => exposureProfile(positions, perpPositions), [positions, perpPositions]);
  const cadence = useMemo(() => cadenceProfile(roundTripFeed.trades), [roundTripFeed.trades]);
  const flows = useMemo(() => capitalFlows(ledgerFeed.updates, address), [ledgerFeed.updates, address]);

  // Recency crosses three feeds: explorer txs, indexer fills, HL ledger. The
  // tx list is only the recent window, so the ledger often reaches further back.
  const activity = useMemo(() => {
    const txs = transactions ?? [];
    const realTime = (t: number | null | undefined): number | null =>
      t != null && Number.isFinite(t) && t >= MIN_REAL_TIME ? t : null;
    const lastFill = realTime(overview?.last_activity ? utcMs(overview.last_activity) : null);
    const lasts = [realTime(txs[0]?.time), lastFill, realTime(flows?.lastTime)].filter((t): t is number => t != null);
    const firsts = [realTime(txs[txs.length - 1]?.time), realTime(flows?.firstTime)].filter((t): t is number => t != null);
    return {
      firstSeen: firsts.length > 0 ? Math.min(...firsts) : null,
      lastSeen: lasts.length > 0 ? Math.max(...lasts) : null,
      recentTxCount: txs.length,
    };
  }, [transactions, overview, flows]);
  const smartMoney = useMemo(() => smartMoneyAlignment(positions, positioning), [positions, positioning]);
  const carry = useMemo(() => carryProfile(positions, predictedFundings), [positions, predictedFundings]);

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

  const insights = useMemo(
    () =>
      deriveWalletInsights({
        address,
        pnl,
        netWorth,
        trading,
        cadence,
        flows,
        smartMoney,
        carry,
        risk,
        exposure,
      }),
    [address, pnl, netWorth, trading, cadence, flows, smartMoney, carry, risk, exposure]
  );

  return {
    address,
    variant,
    netWorth,
    evm: { enabled: isTracker, loading: balanceFeed.evmLoading, error: balanceFeed.evmError },
    pnl,
    volumes,
    activity,
    trading,
    markets,
    byCoin,
    risk,
    exposure,
    cadence,
    flows,
    smartMoney,
    carry,
    archetype,
    insights,
    raw: {
      portfolio: portfolio ?? null,
      portfolioLoading,
      spotBalances: spotBalances ?? [],
      balancesLoading: balanceFeed.isLoading,
    },
    isLoading: balanceFeed.isLoading && balances.totalBalance === 0,
    tradingLoading: indexerLoading || (perfFeed.isLoading && !perf),
    indexerStatus,
  };
}
