"use client";

import { memo, useMemo } from "react";
import { Activity } from "lucide-react";
import { TypedDataTable, type Column } from "@/components/common";
import { useTwapOrders } from "@/services/market/order";
import type { EnrichedTwapOrder } from "@/services/market/order/types";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/**
 * TwapCard — ordres TWAP actifs.
 *
 * Sorti de la zone vault/twap legacy. En-tête enrichi avec la metadata
 * (nombre d'ordres actifs + volume total) jusqu'ici ignorée ; ajoute la
 * colonne Duration (déjà dans les données, jamais affichée).
 */

const TOP_N = 8;

function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export const TwapCard = memo(function TwapCard() {
  const { format } = useNumberFormat();
  const { orders, isLoading, error, total, totalVolume, metadata } = useTwapOrders({
    limit: 100,
    status: "active",
  });

  const rows = useMemo(
    () => [...orders].sort((a, b) => b.totalValueUSD - a.totalValueUSD).slice(0, TOP_N),
    [orders],
  );

  const columns: Column<EnrichedTwapOrder>[] = useMemo(
    () => [
      {
        key: "value",
        header: "Order",
        accessor: (o) => {
          const isBuy = o.action.twap.b;
          return (
            <div className="flex items-center gap-2">
              <span
                className={`mono text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  isBuy ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                }`}
              >
                {isBuy ? "BUY" : "SELL"}
              </span>
              <span className="mono text-text-primary">{compactUsd(o.totalValueUSD)}</span>
            </div>
          );
        },
      },
      {
        key: "token",
        header: "Size",
        align: "right",
        accessor: (o) => (
          <span className="mono text-text-secondary">
            {formatNumber(parseFloat(o.action.twap.s), format)}{" "}
            <span className="text-text-tertiary">{o.tokenSymbol}</span>
          </span>
        ),
      },
      {
        key: "duration",
        header: "Duration",
        type: "numeric",
        accessor: (o) => fmtDuration(o.action.twap.m),
      },
      {
        key: "user",
        header: "User",
        type: "address",
        accessor: "user",
      },
      {
        key: "progression",
        header: "Progress",
        align: "right",
        accessor: (o) => {
          const pct = Math.min(100, Math.max(0, Math.round(o.progressionPercent)));
          return (
            <div className="flex items-center gap-2 justify-end">
              <div className="w-16 h-1 rounded-full bg-surface-3 overflow-hidden">
                <div
                  className="h-full bg-brand transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="mono text-[11px] text-text-secondary w-9 text-right">{pct}%</span>
            </div>
          );
        },
      },
    ],
    [format],
  );

  return (
    <TypedDataTable<EnrichedTwapOrder>
      title="Active TWAPs"
      icon={<Activity size={14} className="text-brand" />}
      subtitle={
        <span className="text-text-tertiary">
          <span className="mono text-text-secondary">{metadata?.activeOrders ?? total}</span> active
          <span className="mx-1">·</span>
          <span className="mono text-text-secondary">{compactUsd(totalVolume)}</span> volume
        </span>
      }
      data={rows}
      columns={columns}
      getRowKey={(o) => o.hash}
      isLoading={isLoading}
      error={error}
      emptyMessage="No active TWAP orders"
      emptyDescription=""
      density="compact"
      rowMotion
    />
  );
});
