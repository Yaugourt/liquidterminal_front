import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Copy, Check, Database } from "lucide-react";
import { useVaultDeposits } from '@/services/vault/hooks/useVaultDeposits';
import { useVaults } from '@/services/vault/hooks/useVaults';
import { useNumberFormat } from '@/store/number-format.store';
import { formatNumber } from '@/lib/numberFormatting';
import { Pagination } from '@/components/common';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface VaultDepositListProps {
  address: string;
}

export function VaultDepositList({ address }: VaultDepositListProps) {
  const { enrichedDeposits: rows, isLoading, error } = useVaultDeposits(address);
  const { vaults, isLoading: vaultsLoading } = useVaults();
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
    } catch (err) {
      console.error('Failed to copy address: ', err);
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

  // Table style (copié de TransactionList)
  const containerClass = "bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg flex flex-col";
  const tableContainerClass = "overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent flex-1";

  if (isLoading || vaultsLoading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#83E9FF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg text-red-500">
        {error.message}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
        <div className="flex flex-col items-center text-center px-4">
          <Database className="w-8 h-8 mb-3 text-[#83E9FF4D]" />
          <p className="text-white text-sm mb-1">No vault deposits found</p>
          <p className="text-[#FFFFFF80] text-xs">This address has not deposited in any vault yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className={tableContainerClass}>
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-none bg-[#051728]">
              <TableHead className="text-white font-normal py-2 px-4 bg-[#051728] text-left text-xs">Name</TableHead>
              <TableHead className="text-white font-normal py-2 px-4 bg-[#051728] text-left text-xs">User deposits</TableHead>
              <TableHead className="text-white font-normal py-2 px-4 bg-[#051728] text-left text-xs">APR</TableHead>
              <TableHead className="text-white font-normal py-2 px-4 bg-[#051728] text-left text-xs">TVL</TableHead>
              <TableHead className="text-white font-normal py-2 px-4 bg-[#051728] text-left text-xs">Time lock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#051728]">
            {paginatedRows.map((row) => (
              <TableRow key={row.vaultAddress} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A] transition-colors">
                <TableCell className="py-3 px-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/explorer/address/${row.vaultAddress}`}
                      className="text-white font-inter hover:text-[#83E9FF] transition-colors"
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
                        <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100 transition-all duration-200" />
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
      </div>
      {total > 10 && (
        <div className="border-t border-[#FFFFFF1A] flex items-center mt-auto">
          <div className="w-full px-4 py-3">
            <Pagination
              total={total}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={(newRowsPerPage) => {
                setRowsPerPage(newRowsPerPage);
                setPage(0);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 
