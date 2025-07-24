"use client";

import { useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";

import { Copy, Check, Loader2, Database } from "lucide-react";
import { format } from "date-fns";
import { Pagination } from "@/components/common/pagination";
import { BlockTransactionListProps } from "@/components/types/explorer.types";
import { useDateFormat } from "@/store/date-format.store";
import { useNumberFormat } from "@/store/number-format.store";
import { formatDateTime } from "@/lib/dateFormatting";
import { formatNumber } from "@/lib/numberFormatting";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

// DataTable component similar to ValidatorsVaults
function DataTable({ isLoading, error, emptyMessage, children }: any) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF] mb-3" />
          <span className="text-[#FFFFFF80] text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="flex flex-col items-center text-center px-4">
          <Database className="w-12 h-12 mb-4 text-[#83E9FF4D]" />
          <p className="text-[#FF5757] text-lg mb-2">Une erreur est survenue</p>
          <p className="text-[#FFFFFF80] text-sm">{error.message || "Une erreur est survenue"}</p>
        </div>
      </div>
    );
  }

  if (!children) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="flex flex-col items-center text-center px-4">
          <Database className="w-12 h-12 mb-4 text-[#83E9FF4D]" />
          <p className="text-white text-lg mb-2">{emptyMessage}</p>
          <p className="text-[#FFFFFF80] text-sm">Revenez plus tard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent -mx-4 px-4">
      <Table className="w-full text-sm text-white font-inter table-fixed">
        {children}
      </Table>
    </div>
  );
}

// CopyButton component similar to ValidatorsVaults
const CopyButton = ({ text }: { text: string }) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        copyToClipboard(text);
      }}
      className="group p-1 rounded transition-colors"
    >
      {copiedAddress === text ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100" />
      )}
    </button>
  );
};

export function TransactionList({
  transactions,
  onTransactionClick,
  onAddressClick,
}: BlockTransactionListProps) {
  const [page, setPage] = useState(0); // 0-based for common pagination
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const { format: dateFormat } = useDateFormat();
  const { format: numberFormat } = useNumberFormat();

  // Calculate pagination
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedTransactions = transactions.slice(startIndex, endIndex);

  return (
    <Card className="bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-4 flex flex-col">
      <div className="flex flex-col flex-1">
        <div className="flex-1">
          <DataTable 
            isLoading={false} 
            error={null}
            emptyMessage="Aucune transaction dans ce bloc"
          >
            {transactions.length > 0 && (
              <>
                <TableHeader className="text-white">
                  <TableRow>
                    <TableHead className="text-left py-2 pl-0 pr-4 font-normal w-1/5">Hash</TableHead>
                    <TableHead className="text-left py-2 px-4 font-normal w-1/5">Action</TableHead>
                    <TableHead className="text-left py-2 px-4 font-normal w-1/5">Block</TableHead>
                    <TableHead className="text-left py-2 px-4 font-normal w-1/5">Time</TableHead>
                    <TableHead className="text-left py-2 px-4 font-normal w-1/5">User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedTransactions.map((tx) => (
                    <TableRow
                      key={tx.hash}
                      className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]"
                    >
                      <TableCell className="py-3 pl-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[#83E9FF] text-sm cursor-pointer hover:text-[#83E9FF]/80 transition-colors"
                            onClick={() => onTransactionClick(tx.hash)}
                          >
                            {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                          </span>
                          <CopyButton text={tx.hash} />
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-[#83E9FF20] text-[#83E9FF] border border-[#83E9FF40]">
                          {tx.action.type}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-white text-sm">{formatNumber(tx.block, numberFormat, { maximumFractionDigits: 0 })}</TableCell>
                      <TableCell className="py-3 px-4 text-white text-sm">
                        {formatDateTime(tx.time, dateFormat)}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[#83E9FF] text-sm cursor-pointer hover:text-[#83E9FF]/80 transition-colors"
                            onClick={() => onAddressClick(tx.user)}
                          >
                            {tx.user.slice(0, 12)}...{tx.user.slice(-8)}
                          </span>
                          <CopyButton text={tx.user} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}
          </DataTable>
        </div>
        {transactions.length > rowsPerPage && (
          <div className="mt-4">
            <Pagination
              total={transactions.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={(newRowsPerPage) => {
                setRowsPerPage(newRowsPerPage);
                setPage(0); // Reset to first page when changing rows per page
              }}
              rowsPerPageOptions={[10, 15, 25, 50]}
            />
          </div>
        )}
      </div>
    </Card>
  );
} 