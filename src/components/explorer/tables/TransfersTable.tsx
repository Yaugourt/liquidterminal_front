"use client";

import { useTransfers } from "@/services/explorer";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDistanceToNowStrict } from "date-fns";
import { TypedDataTable, type Column } from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import type { FormattedTransfer } from "@/services/explorer/types";

export function TransfersTable() {
  const { format } = useNumberFormat();
  const { transfers, isLoading, error } = useTransfers();

  const allTransfers: FormattedTransfer[] = transfers || [];

  const columns: Column<FormattedTransfer>[] = [
    {
      key: "time",
      header: "Time",
      accessor: (t) => (
        <span className="text-text-primary font-medium">
          {formatDistanceToNowStrict(t.timestamp, { addSuffix: false })}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      accessor: (t) => {
        const numericAmount =
          typeof t.amount === "string" ? parseFloat(t.amount) : t.amount;
        return (
          <span className="text-text-primary font-medium">
            {formatNumber(numericAmount, format, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}{" "}
            {t.token}
          </span>
        );
      },
    },
    {
      key: "from",
      header: "From",
      accessor: (t) => <AddressDisplay address={t.from} />,
    },
    {
      key: "to",
      header: "To",
      accessor: (t) => <AddressDisplay address={t.to} />,
    },
  ];

  return (
    <TypedDataTable<FormattedTransfer>
      data={allTransfers}
      columns={columns}
      getRowKey={(t) => t.hash}
      isLoading={isLoading}
      error={error}
      errorTitle="Failed to load transfers"
      emptyMessage="No transfers available"
      emptyDescription="Come back later"
      paginate
      itemsPerPage={5}
      rowsPerPageOptions={[5, 10, 25, 50]}
      paginationVariant="full"
      paginationDisabled={isLoading}
    />
  );
}
