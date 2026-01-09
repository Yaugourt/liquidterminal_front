"use client";

import { useRecentLiquidations, Liquidation } from "@/services/explorer/liquidation";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { useCallback } from "react";
import { Pagination } from "@/components/common/pagination";
import { usePagination } from "@/hooks/core/usePagination";
import { DataTable } from "@/components/common/DataTable";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";

export function LiquidationsSection() {
  const {
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange
  } = usePagination({ initialRowsPerPage: 25 });

  const { liquidations, hasMore, isLoading, error, updateParams } = useRecentLiquidations({
    limit: rowsPerPage
  });

  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();

  const handlePageChange = useCallback((newPage: number) => {
    onPageChange(newPage);
    // Note: Keyset pagination doesn't support arbitrary page jumps
    // For now, we'll just update the limit
  }, [onPageChange]);

  const handleRowsPerPageChange = useCallback((newRows: number) => {
    onRowsPerPageChange(newRows);
    updateParams({ limit: newRows });
  }, [updateParams, onRowsPerPageChange]);

  // Estimate total based on hasMore
  const estimatedTotal = hasMore ? (page + 2) * rowsPerPage : (page + 1) * rowsPerPage;

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex flex-col flex-1">
        <div className="flex-1">
          <DataTable
            isLoading={isLoading}
            error={error}
            isEmpty={liquidations.length === 0}
            emptyState={{
              title: "No liquidations available"
            }}
            className="!border-none !bg-transparent !shadow-none backdrop-blur-none"
          >
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-border-subtle hover:bg-transparent">
                  <TableHead className="py-3 px-3">
                    <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Time</span>
                  </TableHead>
                  <TableHead className="py-3 px-3">
                    <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Coin</span>
                  </TableHead>
                  <TableHead className="py-3 px-3">
                    <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Side</span>
                  </TableHead>
                  <TableHead className="py-3 px-3 text-right">
                    <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Notional</span>
                  </TableHead>
                  <TableHead className="py-3 px-3 text-right max-lg:hidden">
                    <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Size</span>
                  </TableHead>
                  <TableHead className="py-3 px-3 text-right max-md:hidden">
                    <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Fee</span>
                  </TableHead>
                  <TableHead className="py-3 px-3 max-lg:hidden">
                    <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Method</span>
                  </TableHead>
                  <TableHead className="py-3 px-3">
                    <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">User</span>
                  </TableHead>
                  <TableHead className="py-3 px-3">
                    <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Hash</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liquidations.map((liq: Liquidation) => (
                  <TableRow key={liq.tid} className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors">
                    <TableCell className="py-3 px-3 text-white font-medium">
                      {formatDateTime(liq.time, dateFormat)}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-brand-accent font-medium">
                      {liq.coin}
                    </TableCell>
                    <TableCell className="py-3 px-3">
                      <StatusBadge variant={liq.liq_dir === 'Long' ? 'success' : 'error'}>
                        {liq.liq_dir}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right text-white font-medium">
                      ${formatNumber(liq.notional_total, format, { maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right text-white font-medium max-lg:hidden">
                      {formatNumber(liq.size_total, format, { maximumFractionDigits: 4 })}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right text-text-muted max-md:hidden">
                      ${formatNumber(liq.fee_total_liquidated, format, { maximumFractionDigits: 4 })}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-text-secondary max-lg:hidden">
                      {liq.method}
                    </TableCell>
                    <TableCell className="py-3 px-3">
                      <AddressDisplay address={liq.liquidated_user} />
                    </TableCell>
                    <TableCell className="py-3 px-3">
                      <AddressDisplay address={liq.hash} showExternalLink={true} showCopy={true} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTable>
        </div>
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <Pagination
            total={estimatedTotal}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </div>
      </div>
    </div>
  );
}
