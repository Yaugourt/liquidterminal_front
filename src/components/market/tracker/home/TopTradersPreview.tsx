"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { useTopTraders, type TopTrader } from "@/services/market/toptraders";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { SortablePaginatedTableCard } from "@/components/common";

type SortField = "tradeCount" | "totalVolume" | "winRate" | "totalPnl";

/**
 * Composant Top Traders avec pagination et tri par colonnes.
 *
 * Backed by `SortablePaginatedTableCard` — pure config + cell renderers.
 */
export function TopTradersPreview() {
  const { traders, isLoading, error, refetch } = useTopTraders({
    sort: "pnl_pos",
    limit: 50,
  });

  return (
    <SortablePaginatedTableCard<TopTrader, SortField>
      title="Top Traders 24h"
      icon={<TrendingUp className="h-5 w-5 text-brand-accent" />}
      subtitle={`${traders.length} traders`}
      isLoading={isLoading}
      error={error}
      onErrorRetry={refetch}
      errorTitle="Failed to load top traders"
      emptyTitle="No traders data available"
      data={traders}
      getRowKey={(t) => t.user}
      getSortValue={(t, field) => t[field]}
      columns={[
        {
          key: "rank",
          label: "Rank",
          render: (_t, _i, absoluteIndex) => (
            <span className="text-brand-gold font-semibold">#{absoluteIndex + 1}</span>
          ),
        },
        {
          key: "trader",
          label: "Trader",
          render: (t) => (
            <Link
              href={`/market/tracker/wallet/${t.user}`}
              className="text-sm text-brand-accent hover:underline"
            >
              {t.user.slice(0, 6)}...{t.user.slice(-4)}
            </Link>
          ),
        },
        {
          key: "tradeCount",
          label: "Trades",
          sortable: true,
          align: "right",
          render: (t) => t.tradeCount,
        },
        {
          key: "totalVolume",
          label: "Volume",
          sortable: true,
          align: "right",
          render: (t) => `$${formatLargeNumber(t.totalVolume)}`,
        },
        {
          key: "winRate",
          label: "Win Rate",
          sortable: true,
          align: "right",
          render: (t) => (
            <span className={t.winRate >= 0.5 ? "text-emerald-400" : "text-zinc-400"}>
              {(t.winRate * 100).toFixed(1)}%
            </span>
          ),
        },
        {
          key: "totalPnl",
          label: "PnL (24h)",
          sortable: true,
          align: "right",
          render: (t) => (
            <span className={t.totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {t.totalPnl >= 0 ? "+" : ""}${formatLargeNumber(Math.abs(t.totalPnl))}
            </span>
          ),
        },
      ]}
    />
  );
}
