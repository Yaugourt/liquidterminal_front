"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, SortableTableHead } from "@/components/ui/table";
import { ScrollableTable } from "@/components/common";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity } from "lucide-react";
import type { Hip4FillRow } from "@/services/indexer/hip4";

type SortKey = "time" | "notional" | "px" | "fee";
type SortDir = "asc" | "desc";

function compactUsd(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

interface Hip4RecentFillsProps {
  fills: Hip4FillRow[];
  isLoading: boolean;
  /** Map of `coin` → human-readable `display_name` (derived from markets-enriched). */
  marketNameIndex?: Record<string, string>;
}

export function Hip4RecentFills({ fills, isLoading, marketNameIndex }: Hip4RecentFillsProps) {
  const [sortKey, setSortKey] = useState<SortKey>("time");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (key: SortKey) => {
    setPage(0);
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const rows = useMemo(() => {
    return [...(Array.isArray(fills) ? fills : [])].sort((a, b) => {
      const va = sortKey === "time" ? new Date(a.time).getTime() : (a[sortKey] ?? 0);
      const vb = sortKey === "time" ? new Date(b.time).getTime() : (b[sortKey] ?? 0);
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [fills, sortKey, sortDir]);

  if (isLoading && fills.length === 0) return <LoadingState message="Loading fills..." withCard />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.3 }}
      className="glass-panel p-4 space-y-3"
    >
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
        <span className="h-1 w-1 rounded-full bg-brand-accent animate-pulse" />
        Recent Fills
        <span className="text-text-muted/60">· {rows.length}</span>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No fills yet" description="Prediction market fills will appear here." icon={<Activity className="h-6 w-6" />} withCard={false} />
      ) : (
        <ScrollableTable
          pagination={{
            total: rows.length,
            page,
            rowsPerPage: pageSize,
            rowsPerPageOptions: [5, 10, 25, 40, 50],
            onPageChange: setPage,
            onRowsPerPageChange: (n) => { setPageSize(n); setPage(0); },
            hidePageNavigation: false,
          }}
        >
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="py-2 px-3">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">Market</span>
                </TableHead>
                <TableHead className="py-2 px-3">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">Side</span>
                </TableHead>
                <SortableTableHead label="Price" isActive={sortKey === "px"} sortDirection={sortKey === "px" ? sortDir : undefined} onClick={() => handleSort("px")} />
                <SortableTableHead label="Notional" isActive={sortKey === "notional"} sortDirection={sortKey === "notional" ? sortDir : undefined} onClick={() => handleSort("notional")} />
                <SortableTableHead label="Fee" isActive={sortKey === "fee"} sortDirection={sortKey === "fee" ? sortDir : undefined} onClick={() => handleSort("fee")} />
                <TableHead className="py-2 px-3">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">User</span>
                </TableHead>
                <SortableTableHead label="Time" isActive={sortKey === "time"} sortDirection={sortKey === "time" ? sortDir : undefined} onClick={() => handleSort("time")} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(page * pageSize, (page + 1) * pageSize).map((row, i) => {
                const isBuy = row.side === "B" || row.side === "buy";
                const outcomeIdx = row.outcome_id != null && row.outcome_id >= 10 ? row.outcome_id % 10 : null;
                const outcomeName = outcomeIdx === 0 ? "Yes" : outcomeIdx === 1 ? "No" : null;
                return (
                <TableRow key={`${row.hash}-${i}`} className="border-border-subtle hover:bg-white/[0.02] transition-colors">
                  <TableCell className="py-2 px-3 max-w-[180px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-semibold text-white truncate">{marketNameIndex?.[row.coin] || row.coin}</span>
                      {outcomeName && (
                        <span className={`shrink-0 text-[9px] font-bold px-1 py-0.5 rounded ${outcomeName === "Yes" ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
                          {outcomeName}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <span className={`text-[11px] font-semibold ${isBuy ? "text-emerald-400" : "text-rose-400"}`}>
                      {isBuy ? "Buy" : "Sell"}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 px-3 text-xs tabular-nums text-white">{row.px != null ? `${(row.px * 100).toFixed(2)}%` : "—"}</TableCell>
                  <TableCell className="py-2 px-3 text-xs tabular-nums text-text-secondary">{row.notional != null ? compactUsd(row.notional) : "—"}</TableCell>
                  <TableCell className="py-2 px-3 text-xs tabular-nums text-brand-gold">{row.fee != null ? compactUsd(row.fee) : "—"}</TableCell>
                  <TableCell className="py-2 px-3 text-[11px] text-text-muted font-mono">{shortAddress(row.user)}</TableCell>
                  <TableCell className="py-2 px-3 text-[10px] text-text-muted tabular-nums">
                    {new Date(row.time).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollableTable>
      )}
    </motion.div>
  );
}
