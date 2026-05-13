"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useVaultLedger } from "@/services/explorer/vault/hooks/useVaultLedger";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { usePagination } from "@/hooks/core/usePagination";
import { DataTable } from "@/components/common";
import { Pagination } from "@/components/common";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { VaultLedgerEntry } from "@/services/explorer/vault/types";

interface VaultLedgerTableProps {
  vaultAddress: string;
}

/** Determine if an entry is a deposit or withdrawal based on direction */
function getLedgerType(entry: VaultLedgerEntry, vaultAddress: string): "deposit" | "withdraw" {
  return entry.userTo.toLowerCase() === vaultAddress.toLowerCase() ? "deposit" : "withdraw";
}

export function VaultLedgerTable({ vaultAddress }: VaultLedgerTableProps) {
  const [filterQuery, setFilterQuery] = useState("");

  const { page, rowsPerPage, onPageChange, onRowsPerPageChange } = usePagination({
    initialRowsPerPage: 15,
  });

  const { entries, isLoading, error } = useVaultLedger({
    vaultAddress,
    limit: 500,
  });

  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();

  const handleFilterChange = useCallback(
    (val: string) => {
      setFilterQuery(val);
      onPageChange(0);
    },
    [onPageChange]
  );

  const filtered = useMemo(() => {
    if (!filterQuery.trim()) return entries;
    const q = filterQuery.toLowerCase();
    return entries.filter(
      (e) =>
        e.userFrom.toLowerCase().includes(q) ||
        e.userTo.toLowerCase().includes(q) ||
        e.txHash.toLowerCase().includes(q)
    );
  }, [entries, filterQuery]);

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35 }}
      className="glass-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <h3 className="text-sm font-semibold text-white">Ledger</h3>
        <input
          placeholder="Filter by address or hash…"
          value={filterQuery}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="h-7 px-3 text-xs bg-white/5 border border-border-subtle rounded-md text-white placeholder:text-text-muted focus:outline-none focus:border-brand-accent/50 w-52"
        />
      </div>

      <DataTable
        isLoading={isLoading}
        error={error}
        isEmpty={paginated.length === 0 && !isLoading}
        emptyState={{ title: "No ledger entries found" }}
        className="!border-none !bg-transparent !shadow-none backdrop-blur-none"
      >
        <Table className="w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-3 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Time</span>
              </TableHead>
              <TableHead className="py-3 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Type</span>
              </TableHead>
              <TableHead className="py-3 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">User</span>
              </TableHead>
              <TableHead className="py-3 px-3 text-right">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Amount</span>
              </TableHead>
              <TableHead className="py-3 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Tx Hash</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((entry: VaultLedgerEntry) => {
              const type = getLedgerType(entry, vaultAddress);
              const user = type === "deposit" ? entry.userFrom : entry.userTo;
              return (
                <TableRow key={`${entry.txHash}-${entry.time}`} className="hover:bg-white/[0.02]">
                  <TableCell className="py-3 px-3 text-sm text-text-secondary">
                    {formatDateTime(entry.time, dateFormat)}
                  </TableCell>
                  <TableCell className="py-3 px-3 text-sm">
                    <StatusBadge variant={type === "deposit" ? "success" : "error"}>
                      {type}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="py-3 px-3 text-sm">
                    <AddressDisplay address={user} />
                  </TableCell>
                  <TableCell
                    className={`py-3 px-3 text-sm text-right font-medium ${
                      type === "deposit" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {type === "deposit" ? "+" : "-"}
                    ${formatNumber(entry.amount, format, { maximumFractionDigits: 2 })}{" "}
                    <span className="text-text-muted text-[10px]">{entry.token}</span>
                  </TableCell>
                  <TableCell className="py-3 px-3 text-sm">
                    <AddressDisplay address={entry.txHash} showExternalLink showCopy />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DataTable>

      <div className="px-4 py-3 border-t border-border-subtle">
        <Pagination
          total={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 15, 25, 50]}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </div>
    </motion.div>
  );
}
