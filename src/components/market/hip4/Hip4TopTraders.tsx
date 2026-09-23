"use client";

import { TypedDataTable, CellValue, CellBar, type Column } from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { compactUsd, signedCompactUsd } from "@/lib/formatters/numberFormatting";
import type { Hip4TraderFlow } from "@/lib/hip4/trade-flow";

interface Hip4TopTradersProps {
  traders: Hip4TraderFlow[];
  /** Total flow volume across all traders — for the share column. */
  totalVolume: number;
  /** Selected outcome label, shown in the subtitle. */
  outcomeLabel?: string;
  isLoading?: boolean;
}


/**
 * Top Traders — the honest substitute for the competitor's "Top Holders". With
 * no holdings endpoint, we rank by OBSERVED net trade flow / volume on the
 * selected outcome (settlement + protocol fills already excluded by
 * `buildTradeFlow`), and label it as trade flow, never holdings.
 */
export function Hip4TopTraders({
  traders,
  totalVolume,
  outcomeLabel,
  isLoading,
}: Hip4TopTradersProps) {
  const columns: Column<Hip4TraderFlow>[] = [
    {
      key: "rank",
      header: "#",
      type: "rank",
      width: 44,
      accessor: (_row, _i, abs) => abs + 1,
    },
    {
      key: "user",
      header: "Trader",
      accessor: (row) => <AddressDisplay address={row.user} showCopy={false} />,
    },
    {
      key: "net",
      header: "Net Flow",
      type: "change",
      sortable: true,
      getSortValue: (row) => row.net,
      accessor: (row) => (row.net === 0 ? compactUsd(0) : signedCompactUsd(row.net)),
    },
    {
      key: "buy",
      header: "Bought",
      type: "numeric",
      tone: () => "muted",
      sortable: true,
      getSortValue: (row) => row.buy,
      accessor: (row) => compactUsd(row.buy),
    },
    {
      key: "sell",
      header: "Sold",
      type: "numeric",
      tone: () => "muted",
      sortable: true,
      getSortValue: (row) => row.sell,
      accessor: (row) => compactUsd(row.sell),
    },
    {
      key: "volume",
      header: "Volume",
      align: "right",
      sortable: true,
      getSortValue: (row) => row.volume,
      accessor: (row) => {
        const share = totalVolume > 0 ? row.volume / totalVolume : 0;
        return <CellBar value={share} width={56} label={<CellValue value={compactUsd(row.volume)} />} />;
      },
    },
  ];

  return (
    <TypedDataTable<Hip4TraderFlow>
      data={traders}
      columns={columns}
      getRowKey={(row) => row.user}
      isLoading={isLoading && traders.length === 0}
      density="compact"
      title="Top Traders"
      subtitle={`By volume · observed fills${outcomeLabel ? ` · ${outcomeLabel}` : ""}`}
      emptyMessage="No traders yet"
      emptyDescription="Trades on this outcome will appear here."
      paginate
      paginationVariant="compact"
      itemsPerPage={10}
      initialSort={{ field: "volume", direction: "desc" }}
    />
  );
}
