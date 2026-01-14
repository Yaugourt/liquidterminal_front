"use client";

import { Liquidation } from "@/services/explorer/liquidation";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { useCallback, useMemo } from "react";
import { Pagination } from "@/components/common/pagination";
import { usePagination } from "@/hooks/core/usePagination";
import { DataTable } from "@/components/common/DataTable";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { useLiquidationsContext } from "./LiquidationsContext";

export function LiquidationsSection() {
  const {
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange
  } = usePagination({ initialRowsPerPage: 25 });

  // Utilise les données du Context
  const { liquidations: allLiquidations, isLoading, error } = useLiquidationsContext();

  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();

  // Pagination locale sur les données du Context
  const paginatedLiquidations = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return allLiquidations.slice(start, end);
  }, [allLiquidations, page, rowsPerPage]);

  const handlePageChange = useCallback((newPage: number) => {
    onPageChange(newPage);
  }, [onPageChange]);

  const handleRowsPerPageChange = useCallback((newRows: number) => {
    onRowsPerPageChange(newRows);
  }, [onRowsPerPageChange]);

  // Total basé sur les données disponibles
  const total = allLiquidations.length;

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex flex-col flex-1">
        <div className="flex-1">
          <DataTable
            isLoading={isLoading}
            error={error}
            isEmpty={paginatedLiquidations.length === 0}
            emptyState={{
              title: "No liquidations available"
            }}
            className="!border-none !bg-transparent !shadow-none backdrop-blur-none"
          >
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-border-subtle hover:bg-transparent">
                  <TableHead className="py-3 px-3">Time</TableHead>
                  <TableHead className="py-3 px-3">Coin</TableHead>
                  <TableHead className="py-3 px-3">Side</TableHead>
                  <TableHead className="py-3 px-3 text-right">Notional</TableHead>
                  <TableHead className="py-3 px-3 text-right max-lg:hidden">Size</TableHead>
                  <TableHead className="py-3 px-3 text-right max-md:hidden">Fee</TableHead>
                  <TableHead className="py-3 px-3 max-lg:hidden">Method</TableHead>
                  <TableHead className="py-3 px-3">User</TableHead>
                  <TableHead className="py-3 px-3">Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLiquidations.map((liq: Liquidation, index: number) => (
                  <TableRow key={`${liq.tid}-${liq.time_ms}-${index}`} className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors">
                    <TableCell className="py-3 px-3">
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
                    <TableCell className="py-3 px-3 text-right font-medium">
                      ${formatNumber(liq.notional_total, format, { maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right font-medium max-lg:hidden">
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
            total={total}
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
