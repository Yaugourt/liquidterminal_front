"use client";

import { useCallback } from "react";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { usePagination } from "@/hooks/core/usePagination";
import { TypedDataTable, type Column } from "@/components/common";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { ExternalLink } from "lucide-react";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDate } from "@/lib/formatters/dateFormatting";
import { VaultSummary } from "@/services/explorer/vault/types";

export function VaultSection() {
  const {
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
  } = usePagination({ initialRowsPerPage: 10 });

  const { vaults, totalCount, isLoading, error, updateParams } = useVaults({
    page: page + 1,
    limit: rowsPerPage,
    sortBy: "tvl",
  });

  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();

  const handlePageChange = useCallback(
    (newPage: number) => {
      onPageChange(newPage);
      updateParams({ page: newPage + 1 });
    },
    [updateParams, onPageChange]
  );

  const handleRowsPerPageChange = useCallback(
    (newRows: number) => {
      onRowsPerPageChange(newRows);
      updateParams({ limit: newRows, page: 1 });
    },
    [updateParams, onRowsPerPageChange]
  );

  const columns: Column<VaultSummary>[] = [
    {
      key: "name",
      header: "Name",
      accessor: (v) => v.summary.name,
    },
    {
      key: "status",
      header: "Status",
      accessor: (v) => (
        <StatusBadge variant={!v.summary.isClosed ? "success" : "error"}>
          {!v.summary.isClosed ? "Open" : "Closed"}
        </StatusBadge>
      ),
    },
    {
      key: "tvl",
      header: "TVL",
      type: "numeric",
      accessor: (v) =>
        `$${formatNumber(parseFloat(v.summary.tvl), format, { maximumFractionDigits: 2 })}`,
    },
    {
      key: "apr",
      header: "APR",
      type: "numeric",
      accessor: (v) => (
        <span className={v.apr >= 0 ? "text-emerald-400" : "text-rose-400"}>
          {formatNumber(v.apr, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
        </span>
      ),
    },
    {
      key: "leader",
      header: "Leader",
      accessor: (v) => <AddressDisplay address={v.summary.leader} />,
    },
    {
      key: "created",
      header: "Created",
      accessor: (v) => formatDate(v.summary.createTimeMillis, dateFormat),
    },
    {
      key: "action",
      header: "Action",
      align: "center",
      headerAlign: "center",
      accessor: (v) => (
        <Button
          onClick={() =>
            window.open(
              `https://app.hyperliquid.xyz/vaults/${v.summary.vaultAddress}`,
              "_blank"
            )
          }
          className="bg-brand hover:bg-brand/90 text-brand-text-on font-bold px-3 py-1 flex items-center gap-1 mx-auto"
          disabled={v.summary.isClosed}
        >
          Deposit
          <ExternalLink className="h-3 w-3" />
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full h-full flex flex-col p-4">
      <TypedDataTable<VaultSummary>
        data={vaults}
        columns={columns}
        getRowKey={(v) => v.summary.vaultAddress}
        isLoading={isLoading}
        error={error}
        errorTitle="Failed to load vaults"
        emptyMessage="No vaults available"
        total={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[10, 25, 50, 100]}
        paginationVariant="full"
      />
    </div>
  );
}
