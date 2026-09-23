"use client";

import type { ReactNode } from "react";
import { TypedDataTable, ModuleAsset, type Column } from "@/components/common";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { usePastAuctionsPerp } from "@/services/market/perpDex/hooks";
import { useNumberFormat, type NumberFormatType } from "@/store/number-format.store";
import { useDateFormat, type DateFormatType } from "@/store/date-format.store";
import type { PastAuctionPerp } from "@/services/market/perpDex/types";
import { AddressDisplay } from "@/components/ui/address-display";

const PAGE_SIZE = 10;

function buildColumns(
  numberFormat: NumberFormatType,
  dateFormat: DateFormatType
): Column<PastAuctionPerp>[] {
  return [
    {
      key: "time",
      header: "Date",
      type: "time",
      sortable: true,
      getSortValue: (row) => row.time.getTime(),
      accessor: (row) => formatDateTime(row.time, dateFormat),
    },
    {
      key: "symbol",
      header: "Symbol",
      sortable: true,
      getSortValue: (row) => row.symbol.toLowerCase(),
      accessor: (row) => (
        <ModuleAsset assetName={row.coin} name={row.symbol} sub={row.coin} />
      ),
    },
    {
      key: "dex",
      header: "DEX",
      sortable: true,
      getSortValue: (row) => row.dex.toLowerCase(),
      accessor: (row) => <ModuleAsset name={row.dex} sub={row.dexFullName || undefined} />,
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
      tone: (row) => (row.maxGas ? undefined : "muted"),
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
      accessor: (row) => <AddressDisplay address={row.user} />,
    },
    {
      key: "hash",
      header: "Tx",
      accessor: (row) => (
        <AddressDisplay
          address={row.hash}
          href={`/explorer/transaction/${row.hash}`}
          copyMessage="Hash copied to clipboard"
        />
      ),
    },
  ];
}

interface PastAuctionsPerpTableProps {
  /** Card title — omit when the page frames the table with its own tabs. */
  title?: ReactNode;
  /** Right slot of the head (e.g. `SourceBadge`). Needs `title`. */
  headerAction?: ReactNode;
  /** Strip under the head (view switcher owned by the page). */
  toolbar?: ReactNode;
}

export function PastAuctionsPerpTable({ title, headerAction, toolbar }: PastAuctionsPerpTableProps = {}) {
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
      title={title}
      headerAction={headerAction}
      toolbar={toolbar}
    />
  );
}
