"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, SortableTableHead } from "@/components/ui/table";
import { ScrollableTable } from "@/components/common/ScrollableTable";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchBar } from "@/components/common/SearchBar";
import { BarChart3 } from "lucide-react";
import type { Hip4MarketRow } from "@/services/indexer/hip4";

type SortKey = "name" | "total_volume" | "volume_24h" | "open_interest" | "mid_price";
type SortDir = "asc" | "desc";

function compactUsd(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function pctBadge(px: number | null) {
  if (px == null || !Number.isFinite(px)) return <span className="text-text-muted">—</span>;
  const pct = px * 100;
  const cls = pct >= 70 ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
    : pct >= 50 ? "bg-brand-gold/15 text-brand-gold border-brand-gold/25"
    : "bg-rose-500/15 text-rose-300 border-rose-500/25";
  return (
    <span className={`inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${cls}`}>
      {pct.toFixed(1)}%
    </span>
  );
}

interface Hip4MarketsTableProps {
  markets: Hip4MarketRow[];
  isLoading: boolean;
  error: Error | null;
}

export function Hip4MarketsTable({ markets, isLoading, error }: Hip4MarketsTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("total_volume");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = (Array.isArray(markets) ? markets : []).filter((m) => {
      const label = (m.name ?? m.coin ?? "").toLowerCase();
      return !q || label.includes(q) || (m.class ?? "").toLowerCase().includes(q);
    });
    return [...filtered].sort((a, b) => {
      let va: number | string;
      let vb: number | string;
      if (sortKey === "name") {
        va = (a.name ?? a.coin ?? "").toLowerCase();
        vb = (b.name ?? b.coin ?? "").toLowerCase();
      } else {
        va = a[sortKey] ?? 0;
        vb = b[sortKey] ?? 0;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [markets, search, sortKey, sortDir]);

  if (isLoading && markets.length === 0) {
    return <LoadingState message="Loading markets..." withCard />;
  }
  if (error) {
    return (
      <div className="glass-panel p-6 text-center text-rose-400 text-sm">
        Failed to load markets — {error.message}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="glass-panel p-4 space-y-3"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
          <span className="h-1 w-1 rounded-full bg-brand-accent" />
          All Markets
          <span className="text-text-muted/60">· {rows.length}</span>
        </div>
        <SearchBar onSearch={setSearch} placeholder="Search markets..." debounceMs={200} />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No markets found" description="Try a different search." icon={<BarChart3 className="h-6 w-6" />} withCard={false} />
      ) : (
        <ScrollableTable>
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="py-2 px-3 w-8">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">#</span>
                </TableHead>
                <SortableTableHead label="Market" isActive={sortKey === "name"} sortDirection={sortKey === "name" ? sortDir : undefined} onClick={() => handleSort("name")} />
                <TableHead className="py-2 px-3">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">Class</span>
                </TableHead>
                <SortableTableHead label="Probability" isActive={sortKey === "mid_price"} sortDirection={sortKey === "mid_price" ? sortDir : undefined} onClick={() => handleSort("mid_price")} />
                <SortableTableHead label="Total Volume" isActive={sortKey === "total_volume"} sortDirection={sortKey === "total_volume" ? sortDir : undefined} onClick={() => handleSort("total_volume")} />
                <SortableTableHead label="Volume 24h" isActive={sortKey === "volume_24h"} sortDirection={sortKey === "volume_24h" ? sortDir : undefined} onClick={() => handleSort("volume_24h")} />
                <SortableTableHead label="Open Interest" isActive={sortKey === "open_interest"} sortDirection={sortKey === "open_interest" ? sortDir : undefined} onClick={() => handleSort("open_interest")} />
                <TableHead className="py-2 px-3">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">Status</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={row.outcome_id} className="border-border-subtle hover:bg-white/[0.02] transition-colors">
                  <TableCell className="py-2.5 px-3 text-text-muted text-xs tabular-nums">{i + 1}</TableCell>
                  <TableCell className="py-2.5 px-3">
                    <div className="font-semibold text-white text-xs truncate max-w-[200px]">{row.name ?? row.coin}</div>
                    <div className="text-[10px] text-text-muted">{row.coin}</div>
                  </TableCell>
                  <TableCell className="py-2.5 px-3">
                    <span className="text-[11px] text-text-secondary capitalize">{row.class ?? "—"}</span>
                  </TableCell>
                  <TableCell className="py-2.5 px-3">{pctBadge(row.mid_price)}</TableCell>
                  <TableCell className="py-2.5 px-3 text-xs text-white tabular-nums">{compactUsd(row.total_volume)}</TableCell>
                  <TableCell className="py-2.5 px-3 text-xs text-text-secondary tabular-nums">{compactUsd(row.volume_24h)}</TableCell>
                  <TableCell className="py-2.5 px-3 text-xs text-text-secondary tabular-nums">{compactUsd(row.open_interest)}</TableCell>
                  <TableCell className="py-2.5 px-3">
                    {row.is_settled ? (
                      <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">Settled</span>
                    ) : (
                      <span className="text-[10px] font-medium text-brand-accent bg-brand-accent/10 px-1.5 py-0.5 rounded-md">Active</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollableTable>
      )}
    </motion.div>
  );
}
