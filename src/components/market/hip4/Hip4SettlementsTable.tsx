"use client";

import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollableTable } from "@/components/common/ScrollableTable";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckCircle2 } from "lucide-react";
import type { Hip4SettlementRow } from "@/services/indexer/hip4";

interface Hip4SettlementsTableProps {
  settlements: Hip4SettlementRow[];
  isLoading: boolean;
}

export function Hip4SettlementsTable({ settlements, isLoading }: Hip4SettlementsTableProps) {
  if (isLoading && settlements.length === 0) return <LoadingState message="Loading settlements..." withCard />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      className="glass-panel p-4 space-y-3"
    >
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
        <span className="h-1 w-1 rounded-full bg-emerald-400" />
        Settled Markets
        <span className="text-text-muted/60">· {settlements.length}</span>
      </div>

      {settlements.length === 0 ? (
        <EmptyState title="No settlements yet" description="Market resolutions will appear here." icon={<CheckCircle2 className="h-6 w-6" />} withCard={false} />
      ) : (
        <ScrollableTable>
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="py-2 px-3"><span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">Market</span></TableHead>
                <TableHead className="py-2 px-3"><span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">Settled Price</span></TableHead>
                <TableHead className="py-2 px-3"><span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">Winner</span></TableHead>
                <TableHead className="py-2 px-3"><span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">Settled At</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlements.map((row, i) => {
                const winner = row.winner_side === 0 ? "Yes" : row.winner_side === 1 ? "No" : "—";
                const winColor = row.winner_side === 0 ? "text-emerald-400 bg-emerald-500/10" : row.winner_side === 1 ? "text-rose-400 bg-rose-500/10" : "text-text-muted bg-white/5";
                return (
                  <TableRow key={`${row.outcome_id}-${i}`} className="border-border-subtle hover:bg-white/[0.02] transition-colors">
                    <TableCell className="py-2.5 px-3">
                      <span className="text-xs font-semibold text-white">{row.coin ?? `#${row.outcome_id}`}</span>
                    </TableCell>
                    <TableCell className="py-2.5 px-3">
                      <span className="text-xs tabular-nums text-brand-accent">
                        {row.settled_px != null ? `${(row.settled_px * 100).toFixed(2)}%` : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 px-3">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${winColor}`}>{winner}</span>
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-[11px] text-text-muted tabular-nums">
                      {new Date(row.settled_at).toLocaleDateString()}
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
