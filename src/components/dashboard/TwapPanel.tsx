"use client";

import { memo, useMemo, useState } from "react";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTwapOrders, useHypeBuyPressure } from "@/services/market/order";
import { compactUsd } from "@/lib/formatters/numberFormatting";

/**
 * TwapPanel — carte « Active TWAP Orders » du Dashboard.
 *
 * Section haute : **HYPE Buy Pressure** (net + répartition buys/sells)
 * calculée par `useHypeBuyPressure` sur les TWAP HYPE actifs.
 * Section basse : liste paginée des TWAP les plus gros.
 */

const ROWS_PER_PAGE = 8;

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

  const count = metadata?.activeOrders ?? total;

  /** TWAP triés par valeur USD décroissante. */
  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => b.totalValueUSD - a.totalValueUSD),
    [orders]
  );

  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / ROWS_PER_PAGE));
  const [page, setPage] = useState(0);
  const safePage = Math.min(page, totalPages - 1);
  const pageOrders = sortedOrders.slice(
    safePage * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE + ROWS_PER_PAGE
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

      {/* HYPE Buy Pressure — section réservée, net + répartition */}
      <div className="px-3.5 py-2.5 border-b border-border-subtle bg-gradient-to-b from-brand/[0.04] to-transparent">
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <span className="text-[9px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            HYPE Buy Pressure
          </span>
          <span
            className={`mono text-[14px] font-semibold ${
              netPositive ? "text-success" : "text-danger"
            }`}
          >
            {hasHypeData ? formatSignedUsd(buyPressure) : pressureLoading ? "…" : "—"}
          </span>
        </div>
        <div className="flex h-1.5 rounded overflow-hidden border border-border-default">
          <span className="bg-success" style={{ width: `${buyPct}%` }} />
          <span className="bg-danger" style={{ width: `${sellPct}%` }} />
        </div>
        <div className="flex items-center justify-between mt-1 text-[10px] mono">
          <span className="text-success font-semibold">
            Buy {compactUsd(totalBuyValue)}
          </span>
          <span className="text-danger font-semibold">
            {compactUsd(totalSellValue)} Sell
          </span>
        </div>
      </div>

      {/* twap-row : side tag + barre de progression + % filled */}
      <div className="flex-1">
        {pageOrders.length === 0 ? (
          <div className="px-3.5 py-6 text-center text-[11px] text-text-tertiary">
            No active TWAP orders
          </div>
        ) : (
          pageOrders.map((order) => {
            const { twap } = order.action;
            const isBuy = twap.b;
            const pct = Math.min(
              100,
              Math.max(0, Math.round(order.progressionPercent))
            );

            return (
              <div
                key={order.hash}
                className="px-3.5 py-2.5 border-b border-border-subtle last:border-b-0"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isBuy ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    }`}
                  >
                    {isBuy ? "BUY" : "SELL"}
                  </span>
                  <span className="font-semibold text-[12px] text-text-primary truncate">
                    {order.tokenSymbol}
                  </span>
                  <span className="mono text-[11px] text-text-tertiary">
                    {formatSize(twap.s)}
                  </span>
                  <span className="mono text-[10px] text-text-tertiary">
                    {formatDuration(twap.m)}
                  </span>
                  <span className="mono text-[12px] font-semibold text-text-primary ml-auto">
                    {compactUsd(order.totalValueUSD)}
                  </span>
                </div>
                <span className="block h-[5px] rounded bg-base overflow-hidden border border-border-default">
                  <i
                    className={`block h-full rounded ${
                      isBuy ? "bg-success" : "bg-danger"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <div className="text-[10px] text-text-tertiary mt-1">
                  {pct}% filled
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
