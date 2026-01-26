import React, { useState } from "react";
import Link from "next/link";
import { Copy, Check, Database } from "lucide-react";
import { useVaultDeposits } from '@/services/explorer/vault/hooks/useVaultDeposits';
import { useVaults } from '@/services/explorer/vault/hooks/useVaults';
import { useNumberFormat } from '@/store/number-format.store';
import { formatNumber } from '@/lib/formatters/numberFormatting';
import { ScrollableTable } from '@/components/common/ScrollableTable';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface VaultDepositListProps {
  address: string;
}

export function VaultDepositList({ address }: VaultDepositListProps) {
  const { enrichedDeposits: rows, isLoading, error } = useVaultDeposits(address);
  const { isLoading: vaultsLoading } = useVaults();
  const { format } = useNumberFormat();

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const total = rows.length;
  const paginatedRows = rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  // Copy state
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      // Error handled silently
    }
  };

  // Format time lock
  const formatTimeLock = (timestamp?: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Format equity
  const formatEquity = (equity: string) => {
    return formatNumber(parseFloat(equity), format, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  };

  // Format TVL
  const formatTVL = (tvl: number | null) => {
    if (tvl == null) return '-';
    return formatNumber(tvl, format, { currency: '$', showCurrency: true });
  };

  // Format APR
  const formatAPR = (apr: number | null) => {
    if (apr == null) return '-';
    return formatNumber(apr, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  };

  // Table style
  const containerClass = "glass-panel overflow-hidden flex flex-col";

  if (isLoading || vaultsLoading) {
    return (
      <div className="flex items-center justify-center h-[400px] glass-panel">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] glass-panel text-rose-500">
        {error.message}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center h-[200px] glass-panel">
        <div className="flex flex-col items-center text-center px-4">
          <Database className="w-8 h-8 mb-3 text-brand-accent/30" />
          <p className="text-white text-sm mb-1">No vault deposits found</p>
          <p className="text-text-muted text-xs">This address has not deposited in any vault yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <ScrollableTable
        pagination={total > 10 ? {
          total,
          page,
          rowsPerPage,
          onPageChange: setPage,
          onRowsPerPageChange: (newRowsPerPage) => {
            setRowsPerPage(newRowsPerPage);
            setPage(0);
          },
        } : undefined}
      >
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-border-subtle hover:bg-transparent bg-transparent">
              <TableHead className="py-3 px-4 text-left">Name</TableHead>
              <TableHead className="py-3 px-4 text-left">User deposits</TableHead>
              <TableHead className="py-3 px-4 text-left">APR</TableHead>
              <TableHead className="py-3 px-4 text-left">TVL</TableHead>
              <TableHead className="py-3 px-4 text-left">Time lock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-transparent">
            {paginatedRows.map((row) => (
              <TableRow key={row.vaultAddress} className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors">
                <TableCell className="py-3 px-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/explorer/address/${row.vaultAddress}`}
                      className="text-white font-inter hover:text-brand-accent transition-colors"
                      title={row.vaultAddress}
                    >
                      {row.name}
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        copyToClipboard(row.vaultAddress);
                      }}
                      className="group p-1 rounded transition-colors"
                    >
                      {copiedAddress === row.vaultAddress ? (
                        <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-brand-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
                      )}
                    </button>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4 text-sm text-left text-white">${formatEquity(row.equity)}</TableCell>
                <TableCell className="py-3 px-4 text-sm text-left" style={{ color: '#4ADE80' }}>{formatAPR(row.apr)}</TableCell>
                <TableCell className="py-3 px-4 text-sm text-left text-white">{formatTVL(row.tvl)}</TableCell>
                <TableCell className="py-3 px-4 text-sm text-left text-white">{formatTimeLock(row.lockedUntilTimestamp)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollableTable>
    </div>
  );
} 
