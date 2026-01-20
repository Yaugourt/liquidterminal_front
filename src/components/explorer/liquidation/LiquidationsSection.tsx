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
import { useLiquidationsContext, MIN_AMOUNT_PRESETS } from "./LiquidationsContext";
import { Filter, RefreshCw } from "lucide-react";

export function LiquidationsSection() {
  const {
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange
  } = usePagination({ initialRowsPerPage: 25 });

  // Utilise les données filtrées du Context
  const { 
    filteredLiquidations: allLiquidations, 
    isLoading, 
    error,
    minAmount,
    setMinAmount,
    lastUpdated,
    refreshData
  } = useLiquidationsContext();

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
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <h3 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
            Recent Liquidations
          </h3>
          {lastUpdated && (
            <span className="text-[10px] text-text-muted">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={refreshData}
            className="p-1.5 rounded-md hover-subtle text-text-muted hover:text-text-secondary"
            title="Refresh data"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        
        {/* Min Amount Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-text-muted" />
          <div className="flex bg-brand-dark rounded-lg p-0.5 border border-border-subtle">
            {MIN_AMOUNT_PRESETS.map(preset => (
              <button
                key={preset.value}
                onClick={() => setMinAmount(preset.value)}
                className={`px-2.5 py-1 rounded-md text-label transition-all ${
                  minAmount === preset.value
                    ? 'bg-brand-accent text-brand-tertiary font-bold'
                    : 'tab-inactive'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex-1">
          <DataTable
            isLoading={isLoading}
            error={error}
            isEmpty={paginatedLiquidations.length === 0}
            emptyState={{
              title: minAmount > 0 
                ? `No liquidations above $${(minAmount / 1000).toFixed(0)}K` 
                : "No liquidations available"
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

