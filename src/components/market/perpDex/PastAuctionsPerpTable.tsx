"use client";

import { TypedDataTable, TokenAvatar, type Column } from "@/components/common";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { usePastAuctionsPerp } from "@/services/market/perpDex/hooks";
import { useNumberFormat, type NumberFormatType } from "@/store/number-format.store";
import { useDateFormat, type DateFormatType } from "@/store/date-format.store";
import type { PastAuctionPerp } from "@/services/market/perpDex/types";
import { AddressDisplay } from "@/components/ui/address-display";
import { ExternalLink } from "lucide-react";

const PAGE_SIZE = 10;

function buildColumns(
  numberFormat: NumberFormatType,
  dateFormat: DateFormatType
): Column<PastAuctionPerp>[] {
  return [
    {
      key: "time",
      header: "Date",
      sortable: true,
      getSortValue: (row) => row.time.getTime(),
      accessor: (row) => (
        <span className="text-text-primary text-sm">
          {formatDateTime(row.time, dateFormat)}
        </span>
      ),
    },
    {
      key: "symbol",
      header: "Symbol",
      sortable: true,
      getSortValue: (row) => row.symbol.toLowerCase(),
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <TokenAvatar assetName={`xyz:${row.symbol}`} size="lg" />
          <div className="flex flex-col">
            <span className="text-text-primary text-sm font-medium">{row.symbol}</span>
            <span className="text-brand text-xs">{row.coin}</span>
          </div>
        </div>
      ),
    },
    {
      key: "dex",
      header: "DEX",
      sortable: true,
      getSortValue: (row) => row.dex.toLowerCase(),
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="text-text-primary text-sm font-medium">{row.dex}</span>
          {row.dexFullName && (
            <span className="text-text-tertiary text-xs">{row.dexFullName}</span>
          )}
        </div>
      ),
    },
    {
      key: "oraclePx",
      header: "Oracle Price",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.oraclePx,
      accessor: (row) =>
        formatNumber(row.oraclePx, numberFormat, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
          currency: '$',
          showCurrency: true,
        }),
    },
    {
      key: "maxGas",
      header: "Gas (HYPE)",
      type: "fees",
      sortable: true,
      getSortValue: (row) => row.maxGas ?? 0,
      accessor: (row) =>
        row.maxGas !== null
          ? formatNumber(row.maxGas, numberFormat, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })
          : '-',
    },
    {
      key: "user",
      header: "Deployer",
      sortable: true,
      getSortValue: (row) => row.user.toLowerCase(),
      accessor: (row) => <AddressDisplay address={row.user} showCopy={true} />,
    },
    {
      key: "hash",
      header: "Tx",
      accessor: (row) => (
        <a
          href={`https://app.hyperliquid.xyz/explorer/tx/${row.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-brand hover:text-text-primary transition-colors text-sm"
        >
          View
          <ExternalLink className="w-3 h-3" />
        </a>
      ),
    },
  ];
}

export function PastAuctionsPerpTable() {
  const { format: numberFormat } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();
  const { auctions, isLoading } = usePastAuctionsPerp();

  return (
    <TypedDataTable<PastAuctionPerp>
      data={auctions}
      columns={buildColumns(numberFormat, dateFormat)}
      getRowKey={(row) => row.hash}
      isLoading={isLoading && auctions.length === 0}
      emptyMessage="No auction pairs found"
      emptyDescription="Check back later"
      paginate
      itemsPerPage={PAGE_SIZE}
      initialSort={{ field: "time", direction: "desc" }}
      paginationVariant="full"
      rowsPerPageOptions={[5, 10, 15, 20]}
    />
  );
}
