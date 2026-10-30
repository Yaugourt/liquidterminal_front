"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  useTwapOrders,
  useHypeBuyPressure,
  isTwapStalled,
  twapDoneFraction,
  type EnrichedTwapOrder,
  type TwapMarketType,
} from "@/services/market/order";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks/usePerpDexMarketData";
import { extractPerpDexAssetTicker } from "@/services/market/perpDex/utils";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { CardHead, TokenAvatar, DataStatus, SourceBadge, sourceStatus } from "@/components/common";

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

/** What a row shows, from one fraction: sorting and display cannot disagree. */
interface PanelRow {
  order: EnrichedTwapOrder;
  /** 0-100, executed share when exact, elapsed time floored by the executed size otherwise. */
  pct: number;
  remainingAmount: number;
  remainingValue: number;
}

export const TwapPanel = memo(function TwapPanel() {
  // Every active TWAP: the sort and the running count need the whole list, not the newest hundred.
  const { orders, totalVolume, isLoading, error, isStale } = useTwapOrders({
    limit: 10_000,
    status: "active",
  });

  // The remaining amounts move with the clock, not only with the 15s refetch and the live pushes.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, []);
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

  // Running now, like the board: a stalled TWAP (followed since its start, not filling and
  // behind its schedule, see isTwapStalled) is no longer counted (it stays in the list).
  const count = useMemo(
    () => orders.filter((o) => now < o.time + o.action.twap.m * 60_000 && !isTwapStalled(o, now)).length,
    [orders, now],
  );

  /** Effective REMAINING USD value per order — what the rightmost column
   * actually shows. Sorting on `totalValueUSD` (initial) caused inversions:
   * a $1M TWAP filled at 90% (= $100K remaining) outranked a $200K TWAP at
   * 10% (= $180K remaining), even though $180K renders above $100K visually.
   *
   * The fraction is the board's (`twapDoneFraction`): the executed share when
   * the feed has followed the TWAP since its start, the time elapsed floored by
   * the executed size otherwise. The same numbers feed the sort and the cells,
   * and they tick every second together.
   *
   * HIP-3 orders have `totalValueUSD = 0` (no upstream price) → derive from
   * oracle price × remaining size instead. */
  const sortedRows = useMemo<PanelRow[]>(() => {
    const rows = orders.map((order): PanelRow => {
      const fraction = twapDoneFraction(order, now);
      const totalSize = parseFloat(order.action.twap.s);
      const remainingAmount = Number.isFinite(totalSize) ? totalSize * (1 - fraction) : 0;
      // HIP-3 has no upstream price → totalValueUSD is 0, so the WS
      // oracle price is the only way to display a meaningful Value.
      const hip3Px =
        order.marketType === "hip3" ? hip3PriceMap.get(order.tokenSymbol.toUpperCase()) ?? 0 : 0;
      const remainingValue =
        order.marketType === "hip3"
          ? remainingAmount * hip3Px
          : order.totalValueUSD * (1 - fraction);
      return { order, pct: Math.min(100, Math.max(0, fraction * 100)), remainingAmount, remainingValue };
    });
    return rows.sort((a, b) => b.remainingValue - a.remainingValue);
  }, [orders, hip3PriceMap, now]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / ROWS_PER_PAGE));
  const [page, setPage] = useState(0);
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = useMemo(
    () =>
      sortedRows.slice(
        safePage * ROWS_PER_PAGE,
        safePage * ROWS_PER_PAGE + ROWS_PER_PAGE,
      ),
    [sortedRows, safePage],
  );

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
      <CardHead
        title="Active TWAP Orders"
        tag={
          <>
            {count} active · <span className="mono">{compactUsd(totalVolume)} vol</span>
          </>
        }
        actions={
          <>
            {/* Rows come from the HypeDexer indexer (Hypurrscan is only the fallback). */}
            <SourceBadge source="hypedexer" status={sourceStatus(error, isLoading, isStale)} />
            <DataStatus variant="live" connected={!error && !isStale} />
          </>
        }
      />

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
          <div className="flex-1 px-3 py-2.5 border-r border-border-subtle bg-surface-2/40">
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
          <span className="w-[100px] lg:w-auto xl:w-[100px] text-right hidden sm:block">Filled</span>
          <span className="w-[72px] text-right">Value</span>
        </div>

        {pageRows.length === 0 ? (
          <div className="px-3.5 py-6 text-center text-[11px] text-text-tertiary">
            No active TWAP orders
          </div>
        ) : (
          pageRows.map(({ order, pct, remainingAmount, remainingValue }) => {
            const { twap } = order.action;
            const isBuy = twap.b;
            const shownPct = Math.round(pct);

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
                <div className="min-w-0">
                  <div
                    className="mono text-[12.5px] font-semibold text-text-primary leading-tight truncate"
                    title={`${formatSize(String(remainingAmount))} ${order.tokenSymbol}`}
                  >
                    {formatSize(String(remainingAmount))}{" "}
                    {/* The ticker column already names the unit; the narrow lg column drops it. */}
                    <span className="text-[10px] text-text-tertiary font-normal lg:hidden xl:inline">
                      {order.tokenSymbol}
                    </span>
                  </div>
                  <div className="text-[10.5px] text-text-tertiary mono leading-tight mt-0.5">
                    {formatDuration(twap.m)}
                  </div>
                </div>
                {/* In the narrow lg column only the percentage stays, the bar needs room. */}
                <div className="w-[100px] lg:w-auto xl:w-[100px] hidden sm:flex items-center gap-2">
                  <span className="flex-1 h-1.5 rounded bg-base overflow-hidden lg:hidden xl:block">
                    <i
                      className={`block h-full ${
                        isBuy ? "bg-success" : "bg-danger"
                      }`}
                      style={{ width: `${shownPct}%` }}
                    />
                  </span>
                  <span className="mono text-[10.5px] text-text-secondary font-semibold w-7 text-right">
                    {shownPct}%
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
      {sortedRows.length > ROWS_PER_PAGE && (
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
