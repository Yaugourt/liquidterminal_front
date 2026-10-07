"use client";

import { useTopTraders, type TopTrader } from "@/services/market/toptraders";
import { compactCount, compactUsd, signedCompactUsd } from "@/lib/formatters/numberFormatting";
import { TypedDataTable, type Column } from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";

export function TopTradersPreview() {
  const { traders, isLoading, error, refetch } = useTopTraders({
    sort: "pnl_pos",
    limit: 50,
  });

  const columns: Column<TopTrader>[] = [
    {
      key: "rank",
      header: "#",
      type: "rank",
      className: "hidden sm:table-cell",
      accessor: (_t, _i, absoluteIndex) => absoluteIndex + 1,
    },
    {
      key: "trader",
      header: "Trader",
      accessor: (t) => (
        <AddressDisplay address={t.user} href={`/market/tracker/wallet/${t.user}`} showCopy={false} />
      ),
    },
    {
      key: "tradeCount",
      header: "Trades",
      sortable: true,
      getSortValue: (t) => t.tradeCount,
      type: "numeric",
      // Dropped in the half-width xl column, where it pushed the table 7px past its card.
      className: "hidden sm:table-cell xl:hidden 2xl:table-cell",
      accessor: (t) => compactCount(t.tradeCount),
    },
    {
      key: "totalVolume",
      header: "Volume",
      sortable: true,
      getSortValue: (t) => t.totalVolume,
      type: "numeric",
      className: "whitespace-nowrap",
      accessor: (t) => compactUsd(t.totalVolume),
    },
    {
      key: "winRate",
      header: "Win Rate",
      sortable: true,
      getSortValue: (t) => t.winRate,
      type: "numeric",
      tone: (t) => (t.winRate >= 0.5 ? "success" : "muted"),
      className: "hidden sm:table-cell whitespace-nowrap",
      accessor: (t) => `${(t.winRate * 100).toFixed(1)}%`,
    },
    {
      key: "totalPnl",
      header: "PnL (24h)",
      sortable: true,
      getSortValue: (t) => t.totalPnl,
      type: "change",
      className: "whitespace-nowrap",
      accessor: (t) => signedCompactUsd(t.totalPnl),
    },
  ];

  return (
    <TypedDataTable<TopTrader>
      title="Top Traders 24h"
      tag={`${traders.length} traders`}
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
      density="compact"
    />
  );
}
