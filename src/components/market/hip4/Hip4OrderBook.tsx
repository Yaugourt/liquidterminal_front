"use client";

import { useMemo } from "react";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { compactCount, compactUsd } from "@/lib/formatters/numberFormatting";
import { useHip4OrderBook } from "@/services/indexer/hip4";
import { useL4OrderBook } from "@/services/market/orderbook";
import type { L4BookLevel, L4BookTotals } from "@/services/market/orderbook";

interface Hip4OrderBookProps {
  coin: string;
  /** Side label for the header (e.g. "Yes", "San Antonio"). */
  sideName?: string | null;
  enabled?: boolean;
  /** How many price levels per side to show. */
  depth?: number;
}

interface Row {
  px: number;
  sz: number;
  orders: number;
  makers: number;
  cum: number;
}

function buildRows(levels: L4BookLevel[], depth: number): { rows: Row[]; maxCum: number } {
  let cum = 0;
  const rows: Row[] = [];
  for (const [px, sz, orders, makers] of levels.slice(0, depth)) {
    if (!Number.isFinite(px) || !Number.isFinite(sz)) continue;
    cum += sz;
    rows.push({ px, sz, orders, makers, cum });
  }
  return { rows, maxCum: cum };
}

function cents(px: number): string {
  return `${(px * 100).toFixed(1)}¢`;
}

/**
 * Live order book for a HIP-4 outcome coin, sourced from the L4 (per-order)
 * book over LiquidTerminal's websocket — so it shows the whole book rather than
 * the 20 aggregated levels Hyperliquid's public feed returns, plus how many
 * separate orders and makers sit on each level.
 *
 * Falls back to the REST `l2Book` poll when the L4 feed is unavailable, and
 * degrades to an honest placeholder for expired/untradeable coins (which have
 * no book at all). Prices are implied probability (¢ = % chance).
 */
export function Hip4OrderBook({ coin, sideName, enabled = true, depth = 9 }: Hip4OrderBookProps) {
  const eligible = enabled && /^#\d+$/.test(coin);
  const l4 = useL4OrderBook(coin, eligible);

  // Only poll REST while L4 isn't carrying the book.
  const rest = useHip4OrderBook(coin, eligible && !l4.isLive);

  const { bids, asks, totals, isL4 } = useMemo(() => {
    if (l4.isLive && (l4.bids.length > 0 || l4.asks.length > 0)) {
      return { bids: l4.bids, asks: l4.asks, totals: l4.totals, isL4: true };
    }
    const toLevels = (levels: { px: string; sz: string }[]): L4BookLevel[] =>
      levels.map((l) => [parseFloat(l.px), parseFloat(l.sz), 0, 0]);
    return {
      bids: toLevels(rest.bids),
      asks: toLevels(rest.asks),
      totals: null as L4BookTotals | null,
      isL4: false,
    };
  }, [l4.isLive, l4.bids, l4.asks, l4.totals, rest.bids, rest.asks]);

  const { mid, spread, spreadPct } = useMemo(() => {
    const bestBid = bids[0]?.[0] ?? null;
    const bestAsk = asks[0]?.[0] ?? null;
    if (bestBid === null || bestAsk === null) return { mid: null, spread: null, spreadPct: null };
    const midPx = (bestBid + bestAsk) / 2;
    const spreadPx = bestAsk - bestBid;
    return {
      mid: midPx,
      spread: spreadPx,
      spreadPct: midPx > 0 ? (spreadPx / midPx) * 100 : null,
    };
  }, [bids, asks]);

  const askData = useMemo(() => buildRows(asks, depth), [asks, depth]);
  const bidData = useMemo(() => buildRows(bids, depth), [bids, depth]);
  const maxCum = Math.max(askData.maxCum, bidData.maxCum, 1);

  const available = bids.length > 0 || asks.length > 0;
  // "Unavailable" from the L4 feed is a verdict; while it's still connecting we
  // may yet get a book from either source.
  const isLoading = !available && (l4.isLoading || rest.isLoading);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border-subtle px-3.5 py-2.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand/10">
          <BookOpen size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Order Book</h3>
        {sideName && (
          <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-text-tertiary">
            {sideName}
          </span>
        )}
        {available && (
          <span
            className={`mono rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
              isL4 ? "bg-brand/15 text-brand" : "bg-surface-2 text-text-tertiary"
            }`}
            title={
              isL4
                ? "Per-order (L4) book: every resting order, not just the top aggregated levels"
                : "Aggregated (L2) book, polled over REST"
            }
          >
            {isL4 ? "L4" : "L2"}
          </span>
        )}
        {available && spread != null && (
          <span className="ml-auto mono text-[10.5px] text-text-tertiary">
            Spread {(spread * 100).toFixed(1)}¢
            {spreadPct != null ? ` · ${spreadPct.toFixed(1)}%` : ""}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <InlineSpinner className="h-5 w-5 text-brand" />
        </div>
      ) : !available ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 py-10 text-center">
          <p className="text-[12px] font-semibold text-text-secondary">No live book</p>
          <p className="max-w-[200px] text-[11px] text-text-tertiary">
            This outcome isn&apos;t actively quoted. See recent fills below for its latest trades.
          </p>
        </div>
      ) : (
        <div className="flex flex-col p-2">
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-2 pb-1 text-[9.5px] font-semibold uppercase tracking-wider text-text-tertiary">
            <span>Price</span>
            <span className="text-right">Size</span>
            <span className="text-right">Total</span>
            <span className="w-6 text-right" title="Resting orders on this level">
              Ord
            </span>
          </div>

          {/* Asks — best (lowest) ask nearest the mid, so render reversed. */}
          <div className="flex flex-col-reverse">
            {askData.rows.map((r) => (
              <BookRow key={`a-${r.px}`} row={r} maxCum={maxCum} tone="danger" />
            ))}
          </div>

          <div className="my-1 flex items-center justify-between rounded bg-surface-2 px-2 py-1">
            <span className="text-[9.5px] font-semibold uppercase tracking-wider text-text-tertiary">
              Mid
            </span>
            <span className="mono text-[12px] font-semibold text-text-primary">
              {mid != null ? cents(mid) : "—"}
            </span>
          </div>

          {/* Bids — best (highest) bid nearest the mid. */}
          <div className="flex flex-col">
            {bidData.rows.map((r) => (
              <BookRow key={`b-${r.px}`} row={r} maxCum={maxCum} tone="success" />
            ))}
          </div>

          {totals && (
            <div className="mt-2 flex items-center justify-between border-t border-border-subtle pt-2 text-[10px]">
              <span className="mono text-success">
                {compactUsd(totals.bidNotional)}
                <span className="text-text-tertiary"> · {compactCount(totals.bidLevels)} lvl</span>
              </span>
              <span className="text-text-tertiary">{compactCount(totals.makers)} makers</span>
              <span className="mono text-danger">
                <span className="text-text-tertiary">{compactCount(totals.askLevels)} lvl · </span>
                {compactUsd(totals.askNotional)}
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function BookRow({ row, maxCum, tone }: { row: Row; maxCum: number; tone: "success" | "danger" }) {
  const ratio = Math.max(0, Math.min(1, row.cum / maxCum));
  const barClass = tone === "success" ? "bg-success/10" : "bg-danger/10";
  const pxClass = tone === "success" ? "text-success" : "text-danger";
  // One maker holding several orders is a single actor's wall, not a queue.
  const isWall = row.orders > 1 && row.makers === 1;

  return (
    <div
      className="relative"
      title={
        row.makers > 0
          ? `${row.orders} order${row.orders > 1 ? "s" : ""} · ${row.makers} maker${row.makers > 1 ? "s" : ""}`
          : undefined
      }
    >
      <div
        className={`absolute inset-y-0 right-0 ${barClass}`}
        style={{ width: `${ratio * 100}%` }}
        aria-hidden
      />
      <div className="relative grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-2 py-[3px] text-[11px]">
        <span className={`mono font-semibold ${pxClass}`}>{cents(row.px)}</span>
        <span className="mono text-right text-text-secondary">{compactCount(row.sz)}</span>
        <span className="mono text-right text-text-tertiary">{compactCount(row.cum)}</span>
        <span
          className={`mono w-6 text-right ${isWall ? "text-gold" : "text-text-tertiary"}`}
        >
          {row.orders || "—"}
        </span>
      </div>
    </div>
  );
}
