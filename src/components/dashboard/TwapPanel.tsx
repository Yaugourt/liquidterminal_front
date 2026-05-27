"use client";

import { memo, useMemo, useState } from "react";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  useTwapOrders,
  useHypeBuyPressure,
  useTwapRealTime,
  type TwapProgressionInput,
  type TwapMarketType,
} from "@/services/market/order";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks/usePerpDexMarketData";
import { extractPerpDexAssetTicker } from "@/services/market/perpDex/utils";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { TokenAvatar } from "@/components/common";

/**
 * TwapPanel — carte « Active TWAP Orders » du Dashboard (Variant A).
 *
 * Section haute : **HYPE Buy Pressure** en stat-strip 3 cellules
 *   (Buys · Net dominant · Sells) + barre split sous les cellules.
 * Section basse : table TWAPs en colonnes alignées (Side · Token · Filled
 *   · Value) avec entêtes mono, paginée 6 lignes / page.
 */

const ROWS_PER_PAGE = 6;

/** Mini-tag identifying the Hyperliquid market family of a TWAP order. */
function MarketTypeBadge({ type }: { type: TwapMarketType }) {
  const { label, cls } =
    type === "spot"
      ? { label: "SPOT", cls: "bg-brand/10 text-brand border-brand/25" }
      : type === "hip3"
        ? { label: "HIP-3", cls: "bg-gold/10 text-gold border-gold/25" }
        : { label: "PERP", cls: "bg-text-secondary/10 text-text-secondary border-border-default" };
  return (
    <span
      className={`shrink-0 text-[8px] font-bold tracking-[0.04em] px-1 py-[1px] rounded border ${cls}`}
    >
      {label}
    </span>
  );
}

/** Formate une durée en minutes vers un libellé compact "Xh Ym". */
function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Formate une taille (string décimale) en nombre compact lisible. */
function formatSize(size: string): string {
  const n = Number(size);
  if (!Number.isFinite(n)) return size;
  if (Math.abs(n) >= 1000) return compactUsd(n).replace("$", "");
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

/** Montant USD signé : "+$1.24M" / "-$842K". */
function formatSignedUsd(v: number): string {
  if (!Number.isFinite(v)) return "—";
  const sign = v >= 0 ? "+" : "-";
  return `${sign}${compactUsd(Math.abs(v))}`;
}

export const TwapPanel = memo(function TwapPanel() {
  const { orders, total, totalVolume, metadata } = useTwapOrders({
    limit: 100,
    status: "active",
  });
  const {
    buyPressure,
    totalBuyValue,
    totalSellValue,
    isLoading: pressureLoading,
  } = useHypeBuyPressure();

  // HIP-3 oracle price map (REST enrichment leaves HIP-3 prices at 0).
  const { dexs: perpDexs } = usePerpDexMarketData();
  const hip3PriceMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const dex of perpDexs) {
      for (const asset of dex.assetsWithMarketData) {
        const ticker = extractPerpDexAssetTicker(asset.name).toUpperCase();
        if (asset.oraclePx && asset.oraclePx > 0) map.set(ticker, asset.oraclePx);
      }
    }
    return map;
  }, [perpDexs]);

  const count = metadata?.activeOrders ?? total;

  /** Effective REMAINING USD value per order — what the rightmost column
   * actually shows. Sorting on `totalValueUSD` (initial) caused inversions:
   * a $1M TWAP filled at 90% (= $100K remaining) outranked a $200K TWAP at
   * 10% (= $180K remaining), even though $180K renders above $100K visually.
   *
   * HIP-3 orders have `totalValueUSD = 0` (no upstream price) → derive from
   * oracle price × remaining size instead.
   *
   * We use the static `progressionPercent` snapshot (not the 50ms realtime
   * tick) to keep the order stable between ticks. */
  const sortedOrders = useMemo(() => {
    const remainingUsd = (o: (typeof orders)[number]): number => {
      if (o.marketType === "hip3") {
        const px = hip3PriceMap.get(o.tokenSymbol.toUpperCase()) ?? 0;
        if (px <= 0) return 0;
        const totalSize = parseFloat(o.action.twap.s);
        if (!Number.isFinite(totalSize)) return 0;
        const remaining = totalSize * (1 - Math.min(1, Math.max(0, o.progressionPercent / 100)));
        return remaining * px;
      }
      const pct = Math.min(1, Math.max(0, o.progressionPercent / 100));
      return o.totalValueUSD * (1 - pct);
    };
    return [...orders].sort((a, b) => remainingUsd(b) - remainingUsd(a));
  }, [orders, hip3PriceMap]);

  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / ROWS_PER_PAGE));
  const [page, setPage] = useState(0);
  const safePage = Math.min(page, totalPages - 1);
  // Memoise the page slice — otherwise its reference changes every render
  // and downstream effects (useTwapRealTime) loop forever.
  const pageOrders = useMemo(
    () =>
      sortedOrders.slice(
        safePage * ROWS_PER_PAGE,
        safePage * ROWS_PER_PAGE + ROWS_PER_PAGE,
      ),
    [sortedOrders, safePage],
  );

  // Real-time tick (50ms) for the rows currently on screen — keeps Filled %
  // and remaining amount/value moving live, like the full TwapTable.
  const realtimeInputs = useMemo<
    (TwapProgressionInput & { ended?: string | null; error?: string | null })[]
  >(
    () =>
      pageOrders.map((order) => ({
        id: order.hash,
        time: order.time,
        duration: order.action.twap.m,
        amount: order.action.twap.s,
        value: order.totalValueUSD,
        ended: order.ended ?? null,
        error: order.error,
      })),
    [pageOrders],
  );
  const realtimeMap = useTwapRealTime(realtimeInputs);

  /** Répartition Buy/Sell HYPE en pourcent — pour la barre. */
  const { buyPct, sellPct } = useMemo(() => {
    const tot = totalBuyValue + totalSellValue;
    if (tot <= 0) return { buyPct: 50, sellPct: 50 };
    return {
      buyPct: (totalBuyValue / tot) * 100,
      sellPct: (totalSellValue / tot) * 100,
    };
  }, [totalBuyValue, totalSellValue]);

  const netPositive = buyPressure >= 0;
  const hasHypeData = totalBuyValue > 0 || totalSellValue > 0;

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* Card-head V4 : icône + titre + tag actifs + tag volume */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Activity size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">
          Active TWAP Orders
        </h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          {count} active
        </span>
        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand/10 text-brand border border-brand/25 mono">
          {compactUsd(totalVolume)} vol
        </span>
      </div>

      {/* HYPE Buy Pressure — spot HYPE + perp HYPE combined */}
      <div className="border-b border-border-subtle">
        <div className="flex">
          <div className="flex-1 px-3 py-2.5 border-r border-border-subtle">
            <div className="text-[9px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
              Buys HYPE
            </div>
            <div className="mono text-[15px] font-semibold text-success mt-0.5">
              {hasHypeData ? compactUsd(totalBuyValue) : pressureLoading ? "…" : "—"}
            </div>
          </div>
          <div className="flex-1 px-3 py-2.5 border-r border-border-subtle bg-gradient-to-b from-brand/[0.04] to-transparent">
            <div className="text-[9px] uppercase tracking-[0.06em] text-text-tertiary font-semibold text-center">
              Net Pressure
            </div>
            <div
              className={`mono text-[20px] font-bold mt-0.5 tracking-tight text-center ${
                netPositive ? "text-success" : "text-danger"
              }`}
            >
              {hasHypeData ? formatSignedUsd(buyPressure) : pressureLoading ? "…" : "—"}
            </div>
          </div>
          <div className="flex-1 px-3 py-2.5">
            <div className="text-[9px] uppercase tracking-[0.06em] text-text-tertiary font-semibold text-right">
              Sells HYPE
            </div>
            <div className="mono text-[15px] font-semibold text-danger mt-0.5 text-right">
              {hasHypeData ? compactUsd(totalSellValue) : pressureLoading ? "…" : "—"}
            </div>
          </div>
        </div>
        <div className="px-3.5 pb-2.5 pt-0.5">
          <div className="flex h-1 rounded overflow-hidden bg-base">
            <span className="bg-success" style={{ width: `${buyPct}%` }} />
            <span className="bg-danger" style={{ width: `${sellPct}%` }} />
          </div>
        </div>
      </div>

      {/* TWAP table — column headers + rows */}
      <div className="flex-1">
        {/* Headers */}
        <div className="flex items-center justify-between gap-2 px-3.5 py-1.5 bg-surface-2/40 text-[9px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
          <span className="shrink-0">Side</span>
          <span className="shrink-0">Ticker</span>
          <span className="shrink-0">Amount</span>
          <span className="w-[100px] text-right">Filled</span>
          <span className="w-[72px] text-right">Value</span>
        </div>

        {pageOrders.length === 0 ? (
          <div className="px-3.5 py-6 text-center text-[11px] text-text-tertiary">
            No active TWAP orders
          </div>
        ) : (
          pageOrders.map((order) => {
            const { twap } = order.action;
            const isBuy = twap.b;
            const realtime = realtimeMap.get(order.hash);
            const pct = Math.min(
              100,
              Math.max(
                0,
                Math.round(realtime?.progression ?? order.progressionPercent),
              ),
            );
            const remainingAmount =
              realtime?.remainingAmount ?? parseFloat(twap.s);
            // HIP-3 has no upstream price → totalValueUSD is 0, so the WS
            // oracle price is the only way to display a meaningful Value.
            const hip3Px =
              order.marketType === "hip3"
                ? hip3PriceMap.get(order.tokenSymbol.toUpperCase()) ?? 0
                : 0;
            const remainingValue =
              order.marketType === "hip3" && hip3Px > 0
                ? remainingAmount * hip3Px
                : realtime?.remainingValue ?? order.totalValueUSD;

            return (
              <div
                key={order.hash}
                className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-border-subtle last:border-b-0 hover:bg-surface-2 transition-colors"
              >
                <span
                  className={`shrink-0 text-[10px] font-bold px-1.5 py-1 rounded ${
                    isBuy
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }`}
                >
                  {isBuy ? "BUY" : "SELL"}
                </span>
                <div className="shrink-0 flex items-center gap-2 min-w-0">
                  <TokenAvatar
                    assetName={
                      order.marketType === "hip3"
                        ? `xyz:${order.tokenSymbol}`
                        : order.tokenSymbol
                    }
                    kind={order.marketType === "spot" ? "spot" : "auto"}
                    size="md"
                  />
                  <span className="text-[12.5px] font-semibold text-text-primary truncate">
                    {order.tokenSymbol}
                  </span>
                  <MarketTypeBadge type={order.marketType} />
                </div>
                <div className="shrink-0 min-w-0">
                  <div className="mono text-[12.5px] font-semibold text-text-primary leading-tight truncate">
                    {formatSize(String(remainingAmount))}{" "}
                    <span className="text-[10px] text-text-tertiary font-normal">
                      {order.tokenSymbol}
                    </span>
                  </div>
                  <div className="text-[10.5px] text-text-tertiary mono leading-tight mt-0.5">
                    {formatDuration(twap.m)}
                  </div>
                </div>
                <div className="w-[100px] flex items-center gap-2">
                  <span className="flex-1 h-1.5 rounded bg-base overflow-hidden">
                    <i
                      className={`block h-full ${
                        isBuy ? "bg-success" : "bg-danger"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="mono text-[10.5px] text-text-secondary font-semibold w-7 text-right">
                    {pct}%
                  </span>
                </div>
                <div className="w-[72px] mono text-[13px] font-semibold text-text-primary text-right tracking-tight">
                  {compactUsd(remainingValue)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {sortedOrders.length > ROWS_PER_PAGE && (
        <div className="flex items-center justify-between px-3.5 py-2 border-t border-border-subtle">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage <= 0}
            className="p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-2 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-tertiary transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[10px] text-text-tertiary mono">
            Page {safePage + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
            className="p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-2 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-tertiary transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </Card>
  );
});
