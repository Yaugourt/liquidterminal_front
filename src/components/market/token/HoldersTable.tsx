"use client";

import { memo, useState } from "react";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useGlobalAliases } from "@/services/explorer";
import { TypedDataTable, ModuleAsset, CellValue, type Column } from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { useTokenHolders } from "@/services/market/spot/hooks/useTokenHolders";
import type { TokenHolderRow } from "@/services/market/spot/types";

interface HoldersTableProps {
  tokenName: string;
  tokenPrice?: number;
  totalSupply?: number;
}

const formatPercentage = (amount: number, totalSupply: number, format: NumberFormatType) => {
  if (totalSupply === 0) return "0%";
  const percentage = (amount / totalSupply) * 100;
  return `${formatNumber(percentage, format, { maximumFractionDigits: 2 })}%`;
};

/**
 * Paged server-side: each page is one small `/market/holders/:token` read
 * (the backend keeps the largest 10,000 holders of each token).
 */
export const HoldersTable = memo(({ tokenName, tokenPrice, totalSupply }: HoldersTableProps) => {
  const { format } = useNumberFormat();
  const { getAlias } = useGlobalAliases();
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { holders, rowsPage, rowsLimit, total, totalBalance, isLoading, error } =
    useTokenHolders(tokenName, currentPage, rowsPerPage);

  const supplyForCalculation = totalSupply || totalBalance;
  // Ranks follow the rows on screen: the previous page stays up while the next loads.
  const startIndex = rowsPage * rowsLimit;

  const columns: Column<TokenHolderRow>[] = [
    {
      key: "rank",
      header: "#",
      type: "rank",
      width: 48,
      accessor: (_holder, index) => startIndex + index + 1,
    },
    {
      key: "address",
      header: "Address",
      accessor: (holder) => {
        const alias = getAlias(holder.address);
        if (!alias) return <AddressDisplay address={holder.address} />;
        return <ModuleAsset name={alias} sub={<AddressDisplay address={holder.address} />} />;
      },
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      accessor: (holder) => (
        <span className="inline-flex items-center justify-end gap-1.5">
          {holder.staked > 0 ? <StatusBadge variant="gold">Staked</StatusBadge> : null}
          <CellValue value={formatNumber(holder.amount, format, { maximumFractionDigits: 2 })} />
        </span>
      ),
    },
    {
      key: "value",
      header: "Value",
      type: "numeric",
      accessor: (holder) =>
        tokenPrice
          ? `$${formatNumber(holder.amount * tokenPrice, format, { maximumFractionDigits: 2 })}`
          : "N/A",
    },
    {
      key: "percentage",
      header: "Share",
      type: "numeric",
      tone: () => "muted",
      accessor: (holder) => formatPercentage(holder.amount, supplyForCalculation, format),
    },
  ];

  return (
    <TypedDataTable<TokenHolderRow>
      data={holders}
      columns={columns}
      getRowKey={(holder) => holder.address}
      isLoading={isLoading && holders.length === 0}
      paginationDisabled={isLoading}
      error={error}
      errorTitle="Error loading holders"
      emptyMessage="No holders found"
      emptyDescription="No data available"
      total={total}
      page={currentPage}
      rowsPerPage={rowsPerPage}
      onPageChange={setCurrentPage}
      onRowsPerPageChange={(rows) => {
        setRowsPerPage(rows);
        setCurrentPage(0);
      }}
      rowsPerPageOptions={[10, 25, 50, 100]}
      paginationVariant={total > 0 ? "full" : "none"}
      density="compact"
    />
  );
});

HoldersTable.displayName = "HoldersTable";
