"use client";

import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { useCallback } from "react";
import { Pagination } from "@/components/common/pagination";
import { usePagination } from "@/hooks/core/usePagination";
import { DataTable } from "@/components/common/DataTable";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { ExternalLink } from "lucide-react";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDate } from "@/lib/formatters/dateFormatting";
import { VaultSummary } from "@/services/explorer/vault/types";

export function VaultSection() {
  const {
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange
  } = usePagination({ initialRowsPerPage: 10 });

  const { vaults, totalCount, isLoading, error, updateParams } = useVaults({
    page: page + 1,
    limit: rowsPerPage,
    sortBy: 'tvl'
  });

  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();

  const handlePageChange = useCallback((newPage: number) => {
    onPageChange(newPage);
    updateParams({ page: newPage + 1 });
  }, [updateParams, onPageChange]);

  const handleRowsPerPageChange = useCallback((newRows: number) => {
    onRowsPerPageChange(newRows);
    updateParams({ limit: newRows, page: 1 });
  }, [updateParams, onRowsPerPageChange]);

  const handleDepositClick = (vaultAddress: string) => {
    window.open(`https://app.hyperliquid.xyz/vaults/${vaultAddress}`, "_blank");
  };

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex flex-col flex-1">
        <div className="flex-1">
          <DataTable
            isLoading={isLoading}
            error={error}
            isEmpty={vaults.length === 0}
            emptyState={{
              title: "No vaults available"
            }}
            className="!border-none !bg-transparent !shadow-none backdrop-blur-none"
          >
            <Table className="w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>TVL</TableHead>
                  <TableHead className="text-right">APR</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vaults.map((vault: VaultSummary) => (
                  <TableRow key={vault.summary.vaultAddress} className="hover:bg-white/[0.02]">
                    <TableCell>{vault.summary.name}</TableCell>
                    <TableCell>
                      <StatusBadge variant={!vault.summary.isClosed ? 'success' : 'error'}>
                        {!vault.summary.isClosed ? 'Open' : 'Closed'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      ${formatNumber(parseFloat(vault.summary.tvl), format, { maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className={`text-right ${vault.apr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatNumber(vault.apr, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                    </TableCell>
                    <TableCell>
                      <AddressDisplay address={vault.summary.leader} />
                    </TableCell>
                    <TableCell>
                      {formatDate(vault.summary.createTimeMillis, dateFormat)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        onClick={() => handleDepositClick(vault.summary.vaultAddress)}
                        className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-bold px-3 py-1 flex items-center gap-1 mx-auto"
                        disabled={vault.summary.isClosed}
                      >
                        Deposit
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTable>
        </div>
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <Pagination
            total={totalCount}
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