"use client";

import { memo, useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useGlobalAliases } from "@/services/explorer";
import { TypedDataTable, type Column } from "@/components/common";
import { Card } from "@/components/ui/card";
import Link from "next/link";

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

const formatAddress = (address: string) => {
  if (!address || address.length <= 20) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatPercentage = (amount: number, totalSupply: number, format: NumberFormatType) => {
  if (totalSupply === 0) return "0%";
  const percentage = (amount / totalSupply) * 100;
  return `${formatNumber(percentage, format, { maximumFractionDigits: 2 })}%`;
};

export const HoldersTable = memo(({ holders, isLoading, error, tokenPrice, totalSupply, stakedHolders }: HoldersTableProps) => {
  const { format } = useNumberFormat();
  const { getAlias } = useGlobalAliases();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      // Error handled silently
    }
  };

  const columns: Column<HolderRow>[] = [
    {
      key: "address",
      header: "Address",
      accessor: (holder, index) => (
        <div className="flex items-center gap-1">
          <span className="text-text-tertiary text-xs">{startIndex + index + 1}.</span>
          <div className="flex items-center gap-1">
            <Link
              href={`/explorer/address/${holder.address}`}
              className="text-brand text-xs hover:text-text-primary transition-colors"
            >
              {formatAddress(holder.address)}
            </Link>
            {getAlias(holder.address) && (
              <span className="text-text-tertiary text-xs ml-1">
                ({getAlias(holder.address)})
              </span>
            )}
            <button
              onClick={() => copyToClipboard(holder.address)}
              className="group p-1 rounded transition-colors hover:bg-white/5"
            >
              {copiedAddress === holder.address ? (
                <Check className="h-3.5 w-3.5 text-emerald-400 transition-all duration-200" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
              )}
            </button>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      accessor: (holder) => (
        <div className="flex items-center gap-1">
          <span>{formatNumber(holder.amount, format, { maximumFractionDigits: 2 })}</span>
          {stakedHolders && stakedHolders[holder.address] && (
            <span className="px-1.5 py-0.5 rounded-md text-xs font-medium bg-gold/10 text-gold">
              (staked)
            </span>
          )}
        </div>
      ),
    },
    {
      key: "value",
      header: "Value",
      accessor: (holder) =>
        tokenPrice
          ? `$${formatNumber(holder.amount * tokenPrice, format, { maximumFractionDigits: 2 })}`
          : "N/A",
    },
    {
      key: "percentage",
      header: "Percentage",
      accessor: (holder) => formatPercentage(holder.amount, supplyForCalculation, format),
    },
  ];

  return (
    <Card>
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
      />
    </Card>
  );
});

HoldersTable.displayName = "HoldersTable";
