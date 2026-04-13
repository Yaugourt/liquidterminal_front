"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { DataTable } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/pagination";
import { usePagination } from "@/hooks/core/usePagination";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDate } from "@/lib/formatters/dateFormatting";
import { VaultSummary } from "@/services/explorer/vault/types";

type SortField = "tvl" | "apr" | "created" | "name";
type SortDir = "asc" | "desc";

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <ChevronsUpDown className="h-3 w-3 text-text-muted ml-1 inline" />;
  return sortDir === "asc"
    ? <ChevronUp className="h-3 w-3 text-brand-accent ml-1 inline" />
    : <ChevronDown className="h-3 w-3 text-brand-accent ml-1 inline" />;
}

export function VaultEnhancedTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("tvl");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const { page, rowsPerPage, onPageChange, onRowsPerPageChange } = usePagination({
    initialRowsPerPage: 15,
  });

  // Fetch all vaults (client-side sort/filter/search)
  const { vaults, isLoading, error } = useVaults({ limit: 1000, sortBy: "tvl" });
  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();

  const handleSort = useCallback(
    (field: SortField) => {
      if (field === sortField) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("desc");
      }
    },
    [sortField]
  );

  const filteredSorted = useMemo(() => {
    let list = [...vaults];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.summary.name.toLowerCase().includes(q) ||
          v.summary.vaultAddress.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "tvl") cmp = parseFloat(a.summary.tvl) - parseFloat(b.summary.tvl);
      else if (sortField === "apr") cmp = a.apr - b.apr;
      else if (sortField === "created") cmp = a.summary.createTimeMillis - b.summary.createTimeMillis;
      else if (sortField === "name") cmp = a.summary.name.localeCompare(b.summary.name);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [vaults, search, sortField, sortDir]);

  const paginatedVaults = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSorted.slice(start, start + rowsPerPage);
  }, [filteredSorted, page, rowsPerPage]);

  const handleRowClick = useCallback((address: string) => {
    router.push(`/explorer/vaults/${address}`);
  }, [router]);

  const headCell = "py-3 px-3 cursor-pointer select-none hover:text-white transition-colors";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.4 }}
      className="glass-panel"
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-border-subtle">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <Input
            placeholder="Search vaults…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              onPageChange(0);
            }}
            className="pl-9 h-8 text-sm bg-white/5 border-border-subtle text-white placeholder:text-text-muted focus:border-brand-accent/50"
          />
        </div>
        <span className="text-text-muted text-xs ml-auto shrink-0">
          {filteredSorted.length} vault{filteredSorted.length !== 1 ? "s" : ""}
        </span>
      </div>

      <DataTable
        isLoading={isLoading}
        error={error}
        isEmpty={paginatedVaults.length === 0 && !isLoading}
        emptyState={{ title: "No vaults found", description: "Try adjusting your search or filters." }}
        className="!border-none !bg-transparent !shadow-none backdrop-blur-none"
      >
        <Table className="w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={headCell} onClick={() => handleSort("name")}>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  Name <SortIcon field="name" sortField={sortField} sortDir={sortDir} />
                </span>
              </TableHead>
              <TableHead className="py-3 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Status</span>
              </TableHead>
              <TableHead className={headCell} onClick={() => handleSort("tvl")}>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  TVL <SortIcon field="tvl" sortField={sortField} sortDir={sortDir} />
                </span>
              </TableHead>
              <TableHead className={`${headCell} text-right`} onClick={() => handleSort("apr")}>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  APR <SortIcon field="apr" sortField={sortField} sortDir={sortDir} />
                </span>
              </TableHead>
              <TableHead className="py-3 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Leader</span>
              </TableHead>
              <TableHead className={headCell} onClick={() => handleSort("created")}>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  Created <SortIcon field="created" sortField={sortField} sortDir={sortDir} />
                </span>
              </TableHead>
              <TableHead className="py-3 px-3 text-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Action</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVaults.map((vault: VaultSummary) => (
              <TableRow
                key={vault.summary.vaultAddress}
                className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                onClick={() => handleRowClick(vault.summary.vaultAddress)}
              >
                <TableCell className="py-3 px-3 text-sm font-medium text-white">
                  {vault.summary.name}
                </TableCell>
                <TableCell className="py-3 px-3 text-sm">
                  <StatusBadge variant={!vault.summary.isClosed ? "success" : "error"}>
                    {!vault.summary.isClosed ? "Open" : "Closed"}
                  </StatusBadge>
                </TableCell>
                <TableCell className="py-3 px-3 text-sm text-white font-medium">
                  ${formatNumber(parseFloat(vault.summary.tvl), format, { maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell
                  className={`py-3 px-3 text-sm text-right font-medium ${
                    vault.apr >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {formatNumber(vault.apr, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                </TableCell>
                <TableCell className="py-3 px-3 text-sm">
                  <AddressDisplay address={vault.summary.leader} />
                </TableCell>
                <TableCell className="py-3 px-3 text-sm text-text-secondary">
                  {formatDate(vault.summary.createTimeMillis, dateFormat)}
                </TableCell>
                <TableCell
                  className="py-3 px-3 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    onClick={() => window.open(`https://app.hyperliquid.xyz/vaults/${vault.summary.vaultAddress}`, "_blank")}
                    className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-bold px-3 py-1 h-7 text-xs flex items-center gap-1 mx-auto"
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

      <div className="px-4 py-3 border-t border-border-subtle">
        <Pagination
          total={filteredSorted.length}
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
