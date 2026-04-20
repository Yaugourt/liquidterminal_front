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
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import type { BuilderTopRow } from "@/services/indexer/builders/types";
import { formatBuilderDisplayName } from "./formatBuilderDisplayName";
import { Loader2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

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

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const va = (a[sortKey] as number) ?? 0;
      const vb = (b[sortKey] as number) ?? 0;
      return sortAsc ? va - vb : vb - va;
    });
  }, [rows, sortKey, sortAsc]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const maxVolume = useMemo(
    () => Math.max(...rows.map((r) => r.totalVolume ?? 0), 1),
    [rows]
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); setPage(0); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortAsc ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />
    ) : null;

  if (error) {
    return <div className="glass-panel border border-rose-500/20 rounded-2xl p-4 text-rose-400 text-sm">{error.message}</div>;
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
      <Table>
        <TableHeader>
          <TableRow className="border-border-subtle hover:bg-transparent">
            <TableHead className="py-3 px-3 w-10">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">#</span>
            </TableHead>
            <TableHead className="py-3 px-3">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Builder</span>
            </TableHead>
            <TableHead className="py-3 px-3 text-right cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleSort("totalVolume")}>
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                Volume <SortIcon k="totalVolume" />
              </span>
            </TableHead>
            <TableHead className="py-3 px-3 text-right cursor-pointer select-none hover:text-white transition-colors hidden sm:table-cell" onClick={() => handleSort("totalBuilderFees")}>
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                Builder fees <SortIcon k="totalBuilderFees" />
              </span>
            </TableHead>
            <TableHead className="py-3 px-3 text-right cursor-pointer select-none hover:text-white transition-colors hidden md:table-cell" onClick={() => handleSort("uniqueUsers")}>
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                Users <SortIcon k="uniqueUsers" />
              </span>
            </TableHead>
            <TableHead className="py-3 px-3 text-right cursor-pointer select-none hover:text-white transition-colors hidden lg:table-cell" onClick={() => handleSort("fillCount")}>
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                Fills <SortIcon k="fillCount" />
              </span>
            </TableHead>
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
                <td className="py-3 px-3 w-10">
                  <span className={`text-sm font-bold tabular-nums ${RANK_COLORS[globalRank] ?? "text-text-muted"}`}>
                    {globalRank + 1}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-xs font-bold text-brand-accent shrink-0 group-hover:scale-105 transition-transform">
                      {initial.toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0 gap-0.5">
                      <span className="text-white text-sm font-medium truncate">{label}</span>
                      <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-accent/40 rounded-full" style={{ width: `${volumePct}%` }} />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-right text-sm text-white tabular-nums font-medium">
                  {formatNumber(row.totalVolume, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })}
                </td>
                <td className="py-3 px-3 text-right text-sm text-brand-gold tabular-nums hidden sm:table-cell">
                  {formatNumber(row.totalBuilderFees, format, { maximumFractionDigits: 2, currency: "$", showCurrency: true })}
                </td>
                <td className="py-3 px-3 text-right text-sm text-text-secondary tabular-nums hidden md:table-cell">
                  {formatNumber(row.uniqueUsers, format, { maximumFractionDigits: 0 })}
                </td>
                <td className="py-3 px-3 text-right text-sm text-text-secondary tabular-nums hidden lg:table-cell">
                  {formatNumber(row.fillCount, format, { maximumFractionDigits: 0 })}
                </td>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
          <span className="text-text-muted text-xs">{rows.length} builders</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-text-secondary hover:text-white hover:bg-white/5"
              disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-text-secondary text-xs tabular-nums">{page + 1} / {totalPages}</span>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-text-secondary hover:text-white hover:bg-white/5"
              disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
