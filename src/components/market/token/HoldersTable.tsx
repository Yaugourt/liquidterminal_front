"use client";

import { memo, useState } from "react";
import { Loader2, Database, Copy, Check } from "lucide-react";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useGlobalAliases } from "@/services/explorer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollableTable } from "@/components/common/ScrollableTable";
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

  const holdersArray = Object.entries(holders)
    .map(([address, amount]) => ({ address, amount }))
    .sort((a, b) => b.amount - a.amount);

  const supplyForCalculation = totalSupply || holdersArray.reduce((sum, holder) => sum + holder.amount, 0);

  // Pagination
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

  if (isLoading) {
    return (
      <Card className="flex justify-center items-center h-[200px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand-accent mb-2" />
          <span className="text-text-muted text-sm">Loading holders...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex justify-center items-center h-[200px]">
        <div className="flex flex-col items-center">
          <Database className="w-10 h-10 mb-3 text-text-muted" />
          <p className="text-text-secondary text-sm mb-1">Error loading holders</p>
          <p className="text-text-muted text-xs">{error.message}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <ScrollableTable
      pagination={holdersArray.length > 0 ? {
        total: holdersArray.length,
        page: currentPage,
        rowsPerPage,
        onPageChange: setCurrentPage,
        onRowsPerPageChange: setRowsPerPage,
        rowsPerPageOptions: [10, 25, 50, 100],
      } : undefined}
    >
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Address</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedHolders.length > 0 ? (
            paginatedHolders.map((holder, index) => (
              <TableRow
                key={holder.address}
                className="hover:bg-white/[0.02]"
              >
                <TableCell className="text-sm text-white font-medium">
                  <div className="flex items-center gap-1">
                    <span className="text-text-muted text-xs">{startIndex + index + 1}.</span>
                    <div className="flex items-center gap-1">
                      <Link 
                        href={`/explorer/address/${holder.address}`} 
                        className="text-brand-accent font-mono text-xs hover:text-white transition-colors"
                      >
                        {formatAddress(holder.address)}
                      </Link>
                      {getAlias(holder.address) && (
                        <span className="text-text-muted text-xs ml-1">
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
                          <Copy className="h-3.5 w-3.5 text-brand-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
                        )}
                      </button>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-white font-medium">
                  <div className="flex items-center gap-1">
                    <span>{formatNumber(holder.amount, format, { maximumFractionDigits: 2 })}</span>
                    {stakedHolders && stakedHolders[holder.address] && (
                      <span className="px-1.5 py-0.5 rounded-md text-xs font-medium bg-brand-gold/10 text-brand-gold">
                        (staked)
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-white font-medium">
                  {tokenPrice ? `$${formatNumber(holder.amount * tokenPrice, format, { maximumFractionDigits: 2 })}` : 'N/A'}
                </TableCell>
                <TableCell className="text-sm text-white font-medium">
                  {formatPercentage(holder.amount, supplyForCalculation, format)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-8"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <Database className="w-10 h-10 mb-3 text-text-muted" />
                  <p className="text-text-secondary text-sm mb-1">No holders found</p>
                  <p className="text-text-muted text-xs">No data available</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ScrollableTable>
    </Card>
  );
});

HoldersTable.displayName = 'HoldersTable';
