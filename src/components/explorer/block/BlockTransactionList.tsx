"use client";

import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { TypedDataTable, type Column } from "@/components/common";
import { BlockTransactionListProps } from "@/components/types/explorer.types";
import { useDateFormat } from "@/store/date-format.store";
import { useNumberFormat } from "@/store/number-format.store";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { BlockTransaction } from "@/services/explorer";

export function BlockTransactionList({
  transactions,
  onTransactionClick,
  onAddressClick,
}: BlockTransactionListProps) {
  const { format: dateFormat } = useDateFormat();
  const { format: numberFormat } = useNumberFormat();

  const columns: Column<BlockTransaction>[] = [
    {
      key: "hash",
      header: "Hash",
      accessor: (tx) => (
        <div className="flex items-center gap-2">
          <span
            className="text-brand text-sm cursor-pointer hover:text-brand/80 transition-colors"
            onClick={() => onTransactionClick(tx.hash)}
          >
            {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
          </span>
          <CopyButton text={tx.hash} />
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      accessor: (tx) => (
        <span className="inline-block px-2 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400">
          {tx.action.type}
        </span>
      ),
    },
    {
      key: "block",
      header: "Block",
      type: "numeric",
      accessor: (tx) => (
        <span className="text-text-primary text-sm">
          {formatNumber(tx.block, numberFormat, { maximumFractionDigits: 0 })}
        </span>
      ),
    },
    {
      key: "time",
      header: "Time",
      accessor: (tx) => (
        <span className="text-text-primary text-sm">
          {formatDateTime(tx.time, dateFormat)}
        </span>
      ),
    },
    {
      key: "user",
      header: "User",
      accessor: (tx) => (
        <div className="flex items-center gap-2">
          <span
            className="text-brand text-sm cursor-pointer hover:text-brand/80 transition-colors"
            onClick={() => onAddressClick(tx.user)}
          >
            {tx.user.slice(0, 12)}...{tx.user.slice(-8)}
          </span>
          <CopyButton text={tx.user} />
        </div>
      ),
    },
  ];

  return (
    <Card className="p-4 flex flex-col">
      <TypedDataTable<BlockTransaction>
        data={transactions}
        columns={columns}
        getRowKey={(tx) => tx.hash}
        emptyMessage="Aucune transaction dans ce bloc"
        emptyDescription="Come later"
        paginate
        itemsPerPage={15}
        rowsPerPageOptions={[10, 15, 25, 50]}
        paginationVariant={transactions.length > 15 ? "full" : "none"}
      />
    </Card>
  );
}
