"use client";

import { memo, useMemo, useState } from "react";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useGlobalAliases } from "@/services/explorer";
import { TypedDataTable, ModuleAsset, CellValue, type Column } from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { StatusBadge } from "@/components/ui/status-badge";

interface HoldersTableProps {
  holders: Record<string, number>;
  isLoading: boolean;
  error: Error | null;
  tokenName: string;
  tokenPrice?: number;
  totalSupply?: number;
  stakedHolders?: Record<string, number>;
}

interface HolderRow {
  address: string;
  amount: number;
}

const formatPercentage = (amount: number, totalSupply: number, format: NumberFormatType) => {
  if (totalSupply === 0) return "0%";
  const percentage = (amount / totalSupply) * 100;
  return `${formatNumber(percentage, format, { maximumFractionDigits: 2 })}%`;
};

export const HoldersTable = memo(({ holders, isLoading, error, tokenPrice, totalSupply, stakedHolders }: HoldersTableProps) => {
  const { format } = useNumberFormat();
  const { getAlias } = useGlobalAliases();
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const holdersArray = useMemo<HolderRow[]>(
    () =>
      Object.entries(holders)
        .map(([address, amount]) => ({ address, amount }))
        .sort((a, b) => b.amount - a.amount),
    [holders]
  );

  const supplyForCalculation = totalSupply || holdersArray.reduce((sum, h) => sum + h.amount, 0);
  const startIndex = currentPage * rowsPerPage;
  const paginatedHolders = holdersArray.slice(startIndex, startIndex + rowsPerPage);

  const columns: Column<HolderRow>[] = [
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
          {stakedHolders?.[holder.address] ? <StatusBadge variant="gold">Staked</StatusBadge> : null}
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
    <TypedDataTable<HolderRow>
      data={paginatedHolders}
      columns={columns}
      getRowKey={(holder) => holder.address}
      isLoading={isLoading}
      error={error}
      errorTitle="Error loading holders"
      emptyMessage="No holders found"
      emptyDescription="No data available"
      total={holdersArray.length}
      page={currentPage}
      rowsPerPage={rowsPerPage}
      onPageChange={setCurrentPage}
      onRowsPerPageChange={setRowsPerPage}
      rowsPerPageOptions={[10, 25, 50, 100]}
      paginationVariant={holdersArray.length > 0 ? "full" : "none"}
      density="compact"
    />
  );
});

HoldersTable.displayName = "HoldersTable";
