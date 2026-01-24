"use client";

import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";

import { DataTable } from "@/components/common/DataTable";

import { Pagination } from "@/components/common/pagination";
import { usePagination } from "@/hooks/core/usePagination";
import { BlockTransactionListProps } from "@/components/types/explorer.types";
import { useDateFormat } from "@/store/date-format.store";
import { useNumberFormat } from "@/store/number-format.store";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export function BlockTransactionList({
  transactions,
  onTransactionClick,
  onAddressClick,
}: BlockTransactionListProps) {
  const {
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    startIndex,
    endIndex
  } = usePagination({ initialRowsPerPage: 15 });
  const { format: dateFormat } = useDateFormat();
  const { format: numberFormat } = useNumberFormat();

  // Calculate pagination
  const displayedTransactions = transactions.slice(startIndex, endIndex);

  return (
    <Card className="p-4 flex flex-col">
      <div className="flex flex-col flex-1">
        <div className="flex-1">
          <DataTable
            isLoading={false}
            error={null}
            isEmpty={transactions.length === 0}
            emptyState={{
              title: "Aucune transaction dans ce bloc",
              description: "Come later"
            }}
            className="-mx-4 px-4"
          >
            <Table className="w-full text-sm text-white font-inter table-fixed">
              {transactions.length > 0 && (
                <>
                  <TableHeader>
                    <TableRow className="border-b border-border-subtle hover:bg-transparent">
                      <TableHead className="text-left py-3 pl-0 pr-4 w-1/5">Hash</TableHead>
                      <TableHead className="text-left py-3 px-4 w-1/5">Action</TableHead>
                      <TableHead className="text-left py-3 px-4 w-1/5">Block</TableHead>
                      <TableHead className="text-left py-3 px-4 w-1/5">Time</TableHead>
                      <TableHead className="text-left py-3 px-4 w-1/5">User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedTransactions.map((tx) => (
                      <TableRow
                        key={tx.hash}
                        className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors"
                      >
                        <TableCell className="py-3 pl-0 pr-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-brand-accent text-sm font-mono cursor-pointer hover:text-brand-accent/80 transition-colors"
                              onClick={() => onTransactionClick(tx.hash)}
                            >
                              {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                            </span>
                            <CopyButton text={tx.hash} />
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <span className="inline-block px-2 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400">
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
                              className="text-brand-accent text-sm font-mono cursor-pointer hover:text-brand-accent/80 transition-colors"
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
            </Table>
          </DataTable>
        </div>
        {transactions.length > rowsPerPage && (
          <div className="mt-4">
            <Pagination
              total={transactions.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
              rowsPerPageOptions={[10, 15, 25, 50]}
            />
          </div>
        )}
      </div>
    </Card>
  );
} 