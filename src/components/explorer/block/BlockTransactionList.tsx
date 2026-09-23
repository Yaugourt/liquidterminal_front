"use client";

import { TypedDataTable, type Column } from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { BlockTransactionListProps } from "@/components/types/explorer.types";
import { useDateFormat } from "@/store/date-format.store";
import { useNumberFormat } from "@/store/number-format.store";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { BlockTransaction } from "@/services/explorer";

/**
 * Transactions of one block. Hash and user cells are `AddressDisplay` links
 * (`/explorer/transaction/…`, `/explorer/address/…`).
 */
export function BlockTransactionList({ transactions }: BlockTransactionListProps) {
  const { format: dateFormat } = useDateFormat();
  const { format: numberFormat } = useNumberFormat();

  const columns: Column<BlockTransaction>[] = [
    {
      key: "hash",
      header: "Hash",
      accessor: (tx) => (
        <AddressDisplay
          address={tx.hash}
          href={`/explorer/transaction/${tx.hash}`}
          copyMessage="Hash copied to clipboard"
        />
      ),
    },
    {
      key: "action",
      header: "Action",
      accessor: (tx) => <StatusBadge variant="neutral">{tx.action.type}</StatusBadge>,
    },
    {
      key: "block",
      header: "Block",
      type: "numeric",
      accessor: (tx) => formatNumber(tx.block, numberFormat, { maximumFractionDigits: 0 }),
    },
    {
      key: "time",
      header: "Time",
      type: "time",
      accessor: (tx) => formatDateTime(tx.time, dateFormat),
    },
    {
      key: "user",
      header: "User",
      accessor: (tx) => <AddressDisplay address={tx.user} />,
    },
  ];

  return (
    <TypedDataTable<BlockTransaction>
      title="Transactions"
      tag={transactions.length > 0 ? `${transactions.length} txs` : undefined}
      data={transactions}
      columns={columns}
      getRowKey={(tx) => tx.hash}
      emptyMessage="No transactions in this block"
      emptyDescription=""
      paginate
      itemsPerPage={15}
      rowsPerPageOptions={[10, 15, 25, 50]}
      paginationVariant={transactions.length > 15 ? "full" : "none"}
    />
  );
}
