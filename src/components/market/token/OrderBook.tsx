"use client";

import { useMemo, useState } from "react";
import { useTokenWebSocket, marketIndexToCoinId } from "@/services/market/token";
import { useL4OrderBook } from "@/services/market/orderbook";
import type { L4BookLevel, L4BookTotals } from "@/services/market/orderbook";
import { cn } from "@/lib/utils";
import { PillTabs } from "@/components/ui/pill-tabs";
import { Card } from "@/components/ui/card";
import {
  compactCount,
  compactUsd,
  formatAssetTokenAmount,
} from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/** Levels per side the ladder renders. The feed carries 100. */
const DEPTH_OPTIONS = [10, 25, 100] as const;
type Depth = (typeof DEPTH_OPTIONS)[number];

interface OrderBookProps {
  symbol?: string;
  marketIndex?: number;
  tokenNameProp?: string;
  className?: string;
  /** Direct coinId for perpetual WebSocket (e.g., "BTC"). */
  perpCoinId?: string;
  /**
   * Tab styling. Defaults to the legacy boxed pills so the spot and perp pages
   * are untouched; the HIP-3 page passes "text", the minimal DS variant.
   */
  tabsVariant?: "pill" | "text";
}

/** A rendered ladder row: the level plus its running cumulative size. */
interface Row {
  px: number;
  sz: number;
  orders: number;
  makers: number;
  cumulative: number;
}

interface L2Level {
  px: string;
  sz: string;
  n: number;
}

/**
 * Merge the two feeds into one ladder, each where it is authoritative.
 *
 * Hyperliquid's `l2Book` is exact but stops at 20 levels. The L4 mirror covers
 * the whole book, but its delta stream does not announce every departing order
 * (measured 2026-08-07: resting orders the price traded through vanished with
 * no `remove` diff), so its top of book can lag by a few ticks between server
 * resyncs. Taking L2 for the levels it covers and L4 beyond them gives a ladder
 * that is tick-exact at the touch and still 5x deeper than L2 alone.
 *
 * Maker counts only exist in L4, so they are carried over wherever the two
 * feeds agree on a price.
 */
function mergeLadders(
  l4: L4BookLevel[],
  l2: L2Level[],
  side: "bid" | "ask"
): L4BookLevel[] {
  if (l2.length === 0) return l4;

  const makersByPx = new Map(l4.map((level) => [level[0], level[3]]));
  const merged: L4BookLevel[] = l2.map((level) => {
    const px = parseFloat(level.px);
    const orders = level.n;
    // The two feeds are sampled a moment apart, so L4's maker count can exceed
    // L2's order count for the same level. Makers can never outnumber orders.
    const makers = Math.min(makersByPx.get(px) ?? 0, orders);
    return [px, parseFloat(level.sz), orders, makers];
  });

  // Everything L2 cannot see: strictly worse than its last level.
  const boundary = merged[merged.length - 1][0];
  const isBeyond = (px: number) => (side === "bid" ? px < boundary : px > boundary);
  for (const level of l4) {
    if (isBeyond(level[0])) merged.push(level);
  }
  return merged;
}

function buildRows(levels: L4BookLevel[], depth: number): { rows: Row[]; maxCumulative: number } {
  const rows: Row[] = [];
  let cumulative = 0;
  for (const [px, sz, orders, makers] of levels.slice(0, depth)) {
    cumulative += sz;
    rows.push({ px, sz, orders, makers, cumulative });
  }
  return { rows, maxCumulative: cumulative };
}

/**
 * Live order book, sourced from the L4 (per-order) book via LiquidTerminal's
 * own websocket.
 *
 * Hyperliquid's public `l2Book` stream caps at 20 aggregated levels per side —
 * a few basis points of the market. L4 carries the whole book, so this shows up
 * to 100 levels, how many separate orders sit on each one, how many distinct
 * makers they belong to, and the total liquidity resting across every level
 * that exists. Falls back to the L2 stream when the L4 feed is unavailable, so
 * the panel never goes blank.
 */
export function OrderBook({
  symbol,
  marketIndex,
  tokenNameProp,
  className,
  perpCoinId,
  tabsVariant = "pill",
}: OrderBookProps) {
  const [activeTab, setActiveTab] = useState<"orderbook" | "trades">("orderbook");
  const [depth, setDepth] = useState<Depth>(25);
  const { format } = useNumberFormat();

  // Use perpCoinId directly for perpetuals, or convert marketIndex for spot tokens.
  const coinId =
    perpCoinId || (marketIndex !== undefined ? marketIndexToCoinId(marketIndex, tokenNameProp) : "");

  // Trades and last price still come from Hyperliquid's public stream; only the
  // book moved to L4.
  const { orderBook: l2Book, trades } = useTokenWebSocket(coinId);
  const l4 = useL4OrderBook(coinId);

  // L2 also keeps the panel populated while the L4 snapshot is in flight, and
  // carries it alone if the L4 feed drops.
  const { bids, asks, totals, isL4 } = useMemo(() => {
    const l2Bids = (l2Book.bids ?? []) as L2Level[];
    const l2Asks = (l2Book.asks ?? []) as L2Level[];
    const hasL4 = l4.isLive && (l4.bids.length > 0 || l4.asks.length > 0);

    if (hasL4) {
      return {
        bids: mergeLadders(l4.bids, l2Bids, "bid"),
        asks: mergeLadders(l4.asks, l2Asks, "ask"),
        totals: l4.totals,
        isL4: true,
      };
    }
    // L2 alone: no maker attribution, hence makers = 0.
    const toLevels = (levels: L2Level[]): L4BookLevel[] =>
      levels.map((l) => [parseFloat(l.px), parseFloat(l.sz), l.n, 0]);
    return {
      bids: toLevels(l2Bids),
      asks: toLevels(l2Asks),
      totals: null as L4BookTotals | null,
      isL4: false,
    };
  }, [l4.isLive, l4.bids, l4.asks, l4.totals, l2Book.bids, l2Book.asks]);

  const askData = useMemo(() => buildRows(asks, depth), [asks, depth]);
  const bidData = useMemo(() => buildRows(bids, depth), [bids, depth]);
  const maxCumulative = Math.max(askData.maxCumulative, bidData.maxCumulative, 1);

  const spread = useMemo(() => {
    const bestBid = bids[0]?.[0];
    const bestAsk = asks[0]?.[0];
    if (bestBid === undefined || bestAsk === undefined) return null;
    const absolute = bestAsk - bestBid;
    return { absolute, percentage: bestAsk > 0 ? (absolute / bestAsk) * 100 : 0 };
  }, [bids, asks]);

  const formatPrice = (price: number) =>
    price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  // Adaptive precision: small sizes (e.g. 0.0004 BTC) must not collapse to 0.00.
  const formatSize = (size: number) => formatAssetTokenAmount(size, format);

  // Extract token name from symbol (e.g., "HYPE/USDC" -> "HYPE", "BTC-PERP" -> "BTC").
  const tokenName = symbol ? symbol.split("/")[0].replace("-PERP", "") : "TOKEN";

  const displayTrades = trades || [];

  return (
    // Capped so the ladder scrolls inside the card instead of stretching the
    // row: at 100 levels a side it would otherwise be several screens tall.
    <Card className={`flex flex-col h-full max-h-[600px] ${className || ""}`}>
      <div className="p-4 flex-shrink-0 border-b border-border-subtle flex items-center gap-2 flex-wrap">
        <PillTabs
          tabs={[
            { value: "orderbook", label: "Order Book" },
            { value: "trades", label: "Trades" },
          ]}
          activeTab={activeTab}
          onTabChange={(val) => setActiveTab(val as "orderbook" | "trades")}
          variant={tabsVariant}
          className={tabsVariant === "pill" ? "bg-base border border-border-subtle" : undefined}
        />

        {activeTab === "orderbook" && (
          <div className="ml-auto flex items-center gap-2">
            <span
              className={cn(
                "mono text-[9px] font-semibold uppercase tracking-wider rounded px-1.5 py-0.5",
                isL4 ? "bg-brand/15 text-brand" : "bg-surface-2 text-text-tertiary"
              )}
              title={
                isL4
                  ? "Per-order (L4) book: every resting order, not just the top 20 aggregated levels"
                  : "Aggregated (L2) book — top 20 levels. Falls back here when the L4 feed is unavailable."
              }
            >
              {isL4 ? "L4" : "L2"}
            </span>
            <div className="flex items-center bg-surface-2 rounded-md p-0.5">
              {DEPTH_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setDepth(option)}
                  className={cn(
                    "mono rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                    depth === option
                      ? "bg-brand text-brand-text-on"
                      : "text-text-tertiary hover:text-text-primary"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col min-h-0">
        {activeTab === "orderbook" ? (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header */}
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-label text-text-secondary flex-shrink-0 mb-2 pr-2.5">
              <span>Price</span>
              <span className="text-right">Size ({tokenName})</span>
              <span className="text-right">Total</span>
              <span className="text-right w-8" title="Resting orders on this level">
                Ord
              </span>
            </div>

            {l4.status === "unavailable" && bids.length === 0 && asks.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 py-8 text-center">
                <p className="text-[12px] font-semibold text-text-secondary">No live book</p>
                <p className="max-w-[200px] text-[11px] text-text-tertiary">
                  This market isn&apos;t actively quoted right now.
                </p>
              </div>
            ) : (
              <>
                {/* Asks — best (lowest) ask sits against the spread, so the
                    column is reversed and scrolls away from it. */}
                <div className="flex-1 min-h-0 flex flex-col-reverse overflow-y-auto pr-1 scrollbar-brand">
                  {askData.rows.map((row) => (
                    <BookRow
                      key={`ask-${row.px}`}
                      row={row}
                      maxCumulative={maxCumulative}
                      tone="danger"
                      formatPrice={formatPrice}
                      formatSize={formatSize}
                    />
                  ))}
                </div>

                {/* Spread */}
                <div className="border-y border-border-subtle py-2 text-center my-2 mx-1 flex items-center justify-center gap-5 flex-shrink-0">
                  <span className="text-label text-text-secondary">Spread</span>
                  <span className="mono text-xs text-text-primary font-medium">
                    {spread && spread.absolute > 0
                      ? `${spread.absolute.toFixed(4)} (${spread.percentage.toFixed(4)}%)`
                      : "N/A"}
                  </span>
                </div>

                {/* Bids — best (highest) bid against the spread. */}
                <div className="flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-brand">
                  {bidData.rows.map((row) => (
                    <BookRow
                      key={`bid-${row.px}`}
                      row={row}
                      maxCumulative={maxCumulative}
                      tone="success"
                      formatPrice={formatPrice}
                      formatSize={formatSize}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Whole-book depth — the part an L2 feed cannot report at all. */}
            {totals && <BookDepthFooter totals={totals} />}
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header */}
            <div className="grid grid-cols-3 gap-2 text-label text-text-secondary border-b border-border-subtle pb-2 flex-shrink-0 mb-2 px-1 pr-[14px]">
              <span>Price</span>
              <span className="text-right">Size ({tokenName})</span>
              <span className="text-right">Time</span>
            </div>

            {/* Trades - Scrollable */}
            <div className="h-[402px] overflow-y-auto pr-1 scrollbar-brand">
              <div className="space-y-1">
                {displayTrades.slice(0, 50).map((trade, index) => {
                  const tradeType = trade.side === "B" ? "Buy" : "Sell";
                  const tradePrice = parseFloat(trade.px);
                  const tradeSize = parseFloat(trade.sz);
                  const tradeTime = new Date(trade.time).toLocaleTimeString();

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-3 gap-2 text-xs hover:bg-surface-2 py-1 rounded px-1 transition-colors"
                    >
                      <span
                        className={cn(
                          "font-medium mono",
                          tradeType === "Buy" ? "text-success" : "text-danger"
                        )}
                      >
                        ${formatPrice(tradePrice)}
                      </span>
                      <span className="mono text-text-primary text-right">{formatSize(tradeSize)}</span>
                      <span className="mono text-text-secondary text-right text-xs">{tradeTime}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function BookRow({
  row,
  maxCumulative,
  tone,
  formatPrice,
  formatSize,
}: {
  row: Row;
  maxCumulative: number;
  tone: "success" | "danger";
  formatPrice: (px: number) => string;
  formatSize: (sz: number) => string;
}) {
  const depthPercentage = maxCumulative > 0 ? (row.cumulative / maxCumulative) * 100 : 0;
  const isWall = row.orders > 1 && row.makers === 1;

  return (
    <div
      className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs hover:bg-surface-2 py-1 rounded relative transition-colors"
      title={
        row.makers > 0
          ? `${row.orders} order${row.orders > 1 ? "s" : ""} · ${row.makers} maker${row.makers > 1 ? "s" : ""}`
          : `${row.orders} order${row.orders > 1 ? "s" : ""}`
      }
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 rounded",
          tone === "success" ? "bg-success/20" : "bg-danger/20"
        )}
        style={{ width: `${Math.min(depthPercentage, 100)}%` }}
        aria-hidden
      />
      <span
        className={cn(
          "mono relative z-10 font-medium",
          tone === "success" ? "text-success" : "text-danger"
        )}
      >
        {formatPrice(row.px)}
      </span>
      <span className="mono text-text-primary text-right relative z-10">{formatSize(row.sz)}</span>
      <span className="mono text-text-secondary text-right relative z-10">
        {formatSize(row.cumulative)}
      </span>
      <span
        className={cn(
          "mono text-right relative z-10 w-8 tabular-nums",
          // One maker holding several orders is a single actor's wall, not a queue.
          isWall ? "text-gold" : "text-text-tertiary"
        )}
      >
        {row.orders || "—"}
      </span>
    </div>
  );
}

/**
 * Liquidity resting across the entire book, not just the rendered ladder.
 * Only L4 can measure this: the public L2 feed stops at 20 levels.
 */
function BookDepthFooter({ totals }: { totals: L4BookTotals }) {
  const total = totals.bidNotional + totals.askNotional;
  const bidShare = total > 0 ? (totals.bidNotional / total) * 100 : 50;

  return (
    <div className="flex-shrink-0 mt-2 pt-2 border-t border-border-subtle space-y-1.5">
      <div className="flex items-center justify-between text-[10px]">
        <span className="mono text-success">
          {compactUsd(totals.bidNotional)}
          <span className="text-text-tertiary"> · {compactCount(totals.bidLevels)} lvl</span>
        </span>
        <span className="text-text-tertiary" title="Distinct addresses resting an order in this book">
          {compactCount(totals.makers)} makers
        </span>
        <span className="mono text-danger">
          <span className="text-text-tertiary">{compactCount(totals.askLevels)} lvl · </span>
          {compactUsd(totals.askNotional)}
        </span>
      </div>
      <div
        className="h-1 w-full rounded-full bg-danger/40 overflow-hidden"
        title={`Book imbalance: ${bidShare.toFixed(1)}% of resting notional is on the bid`}
      >
        <div className="h-full bg-success/70" style={{ width: `${bidShare}%` }} />
      </div>
    </div>
  );
}
