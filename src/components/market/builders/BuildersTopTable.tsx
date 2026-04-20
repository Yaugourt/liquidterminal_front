"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  SortableTableHead,
  TableHeadLabel,
} from "@/components/ui/table";
import { ScrollableTable } from "@/components/common/ScrollableTable";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import type { BuilderTopRow } from "@/services/indexer/builders/types";
import { formatBuilderDisplayName } from "./formatBuilderDisplayName";
import { Loader2 } from "lucide-react";

interface BuildersTopTableProps {
  rows: BuilderTopRow[];
  isLoading: boolean;
  error: Error | null;
}

type SortKey = "totalVolume" | "totalBuilderFees" | "uniqueUsers" | "fillCount";

const PAGE_SIZE = 25;
const RANK_COLORS = ["text-brand-gold", "text-zinc-300", "text-amber-600"];

export function BuildersTopTable({ rows, isLoading, error }: BuildersTopTableProps) {
  const router = useRouter();
  const { format } = useNumberFormat();
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("totalVolume");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const va = (a[sortKey] as number) ?? 0;
        const vb = (b[sortKey] as number) ?? 0;
        return sortAsc ? va - vb : vb - va;
      }),
    [rows, sortKey, sortAsc]
  );

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const maxVolume = useMemo(
    () => Math.max(...rows.map((r) => r.totalVolume ?? 0), 1),
    [rows]
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(false);
      setPage(0);
    }
  };

  if (error) {
    return (
      <div className="glass-panel border border-rose-500/20 rounded-2xl p-4 text-rose-400 text-sm">
        {error.message}
      </div>
    );
  }

  if (isLoading && rows.length === 0) {
    return (
      <div className="flex justify-center items-center h-[200px] glass-panel rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
          <span className="text-text-muted text-xs">Loading builders…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
      <ScrollableTable
        pagination={
          totalPages > 1
            ? {
                total: sorted.length,
                page,
                rowsPerPage: PAGE_SIZE,
                rowsPerPageOptions: [25],
                onPageChange: setPage,
                onRowsPerPageChange: () => {},
                hidePageNavigation: false,
              }
            : undefined
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border-subtle hover:bg-transparent">
              <TableHead className="py-3 px-4 w-10">
                <TableHeadLabel>#</TableHeadLabel>
              </TableHead>
              <TableHead className="py-3 px-4">
                <TableHeadLabel>Builder</TableHeadLabel>
              </TableHead>
              <SortableTableHead
                className="py-3 px-4"
                label="Volume"
                isActive={sortKey === "totalVolume"}
                sortDirection={sortKey === "totalVolume" ? (sortAsc ? "asc" : "desc") : undefined}
                onClick={() => handleSort("totalVolume")}
              />
              <SortableTableHead
                className="py-3 px-4 hidden sm:table-cell"
                label="Builder Fees"
                isActive={sortKey === "totalBuilderFees"}
                sortDirection={sortKey === "totalBuilderFees" ? (sortAsc ? "asc" : "desc") : undefined}
                onClick={() => handleSort("totalBuilderFees")}
              />
              <SortableTableHead
                className="py-3 px-4 hidden md:table-cell"
                label="Users"
                isActive={sortKey === "uniqueUsers"}
                sortDirection={sortKey === "uniqueUsers" ? (sortAsc ? "asc" : "desc") : undefined}
                onClick={() => handleSort("uniqueUsers")}
              />
              <SortableTableHead
                className="py-3 px-4 hidden lg:table-cell"
                label="Fills"
                isActive={sortKey === "fillCount"}
                sortDirection={sortKey === "fillCount" ? (sortAsc ? "asc" : "desc") : undefined}
                onClick={() => handleSort("fillCount")}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row, idx) => {
              const globalRank = page * PAGE_SIZE + idx;
              const label = formatBuilderDisplayName(row.builderName);
              const initial = label === "—" ? row.builder.slice(2, 3) : label.charAt(0);
              const volumePct = (row.totalVolume / maxVolume) * 100;

              return (
                <motion.tr
                  key={row.builder}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02, duration: 0.2 }}
                  className="border-b border-border-subtle hover:bg-white/[0.02] cursor-pointer transition-colors group"
                  onClick={() => router.push(`/market/builders/${encodeURIComponent(row.builder)}`)}
                >
                  <TableCell className="py-3 px-4 w-10">
                    <span className={`text-sm font-bold tabular-nums ${RANK_COLORS[globalRank] ?? "text-text-muted"}`}>
                      {globalRank + 1}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-xs font-bold text-brand-accent shrink-0 group-hover:scale-105 transition-transform">
                        {initial.toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0 gap-0.5">
                        <span className="text-white text-sm font-medium truncate">{label}</span>
                        <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-accent/40 rounded-full"
                            style={{ width: `${volumePct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right text-sm text-white tabular-nums font-medium">
                    {formatNumber(row.totalVolume, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right text-sm text-brand-gold tabular-nums hidden sm:table-cell">
                    {formatNumber(row.totalBuilderFees, format, { maximumFractionDigits: 2, currency: "$", showCurrency: true })}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right text-sm text-text-secondary tabular-nums hidden md:table-cell">
                    {formatNumber(row.uniqueUsers, format, { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right text-sm text-text-secondary tabular-nums hidden lg:table-cell">
                    {formatNumber(row.fillCount, format, { maximumFractionDigits: 0 })}
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </ScrollableTable>
    </div>
  );
}
