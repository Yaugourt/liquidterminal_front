"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { useTopTraders, type TopTrader } from "@/services/market/toptraders";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { TypedDataTable, type Column } from "@/components/common";

export function TopTradersPreview() {
  const { traders, isLoading, error, refetch } = useTopTraders({
    sort: "pnl_pos",
    limit: 50,
  });

  const columns: Column<TopTrader>[] = [
    {
      key: "rank",
      header: "Rank",
      accessor: (_t, _i, absoluteIndex) => (
        <span className="text-gold font-semibold">#{absoluteIndex + 1}</span>
      ),
    },
    {
      key: "trader",
      header: "Trader",
      accessor: (t) => (
        <Link
          href={`/market/tracker/wallet/${t.user}`}
          className="text-sm text-brand hover:underline"
        >
          {t.user.slice(0, 6)}...{t.user.slice(-4)}
        </Link>
      ),
    },
    {
      key: "tradeCount",
      header: "Trades",
      sortable: true,
      align: "right",
      getSortValue: (t) => t.tradeCount,
      accessor: (t) => t.tradeCount,
    },
    {
      key: "totalVolume",
      header: "Volume",
      sortable: true,
      align: "right",
      getSortValue: (t) => t.totalVolume,
      accessor: (t) => `$${formatLargeNumber(t.totalVolume)}`,
    },
    {
      key: "winRate",
      header: "Win Rate",
      sortable: true,
      align: "right",
      getSortValue: (t) => t.winRate,
      accessor: (t) => (
        <span className={t.winRate >= 0.5 ? "text-success" : "text-text-secondary"}>
          {(t.winRate * 100).toFixed(1)}%
        </span>
      ),
    },
    {
      key: "totalPnl",
      header: "PnL (24h)",
      sortable: true,
      align: "right",
      getSortValue: (t) => t.totalPnl,
      accessor: (t) => (
        <span className={t.totalPnl >= 0 ? "text-success" : "text-danger"}>
          {t.totalPnl >= 0 ? "+" : ""}${formatLargeNumber(Math.abs(t.totalPnl))}
        </span>
      ),
    },
  ];

  return (
    <TypedDataTable<TopTrader>
      title="Top Traders 24h"
      icon={<TrendingUp className="h-5 w-5 text-brand" />}
      subtitle={`${traders.length} traders`}
      data={traders}
      columns={columns}
      getRowKey={(t) => t.user}
      isLoading={isLoading}
      error={error}
      onErrorRetry={refetch}
      errorTitle="Failed to load top traders"
      emptyMessage="No traders data available"
      paginate
      itemsPerPage={10}
    />
  );
}
