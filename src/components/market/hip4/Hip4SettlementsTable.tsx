"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TypedDataTable, type Column } from "@/components/common";
import { LoadingState } from "@/components/ui/loading-state";
import type { Hip4SettlementRow } from "@/services/indexer/hip4";

interface Hip4SettlementsTableProps {
  settlements: Hip4SettlementRow[];
  isLoading: boolean;
}

function formatSettledPrice(px: number | null | undefined): string {
  if (px == null) return "—";
  if (px >= 10) {
    return `$${px.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${(px * 100).toFixed(1)}¢`;
}

function formatSettledAt(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }) + " UTC";
}

export function Hip4SettlementsTable({ settlements, isLoading }: Hip4SettlementsTableProps) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  if (isLoading && settlements.length === 0) return <LoadingState message="Loading settlements..." withCard />;

  const columns: Column<Hip4SettlementRow>[] = [
    {
      key: "market",
      header: "Market",
      accessor: (row) => (
        <span className="text-xs font-semibold text-white line-clamp-1">
          {row.question_name ?? row.coin ?? `#${row.outcome_id}`}
        </span>
      ),
    },
    {
      key: "settledPrice",
      header: "Settled Price",
      accessor: (row) => (
        <span className="text-xs tabular-nums text-brand-accent">
          {formatSettledPrice(row.settled_px)}
        </span>
      ),
    },
    {
      key: "winner",
      header: "Winner",
      accessor: (row) => {
        const winner = row.winner_name ?? (row.winner_side === 0 ? "Yes" : row.winner_side === 1 ? "No" : "—");
        const isYes = row.winner_name === "Yes" || (row.winner_name == null && row.winner_side === 0);
        const isNo = row.winner_name === "No" || (row.winner_name == null && row.winner_side === 1);
        const winColor = isYes
          ? "text-emerald-400 bg-emerald-500/10"
          : isNo
          ? "text-rose-400 bg-rose-500/10"
          : row.winner_name
          ? "text-brand-accent bg-brand-accent/10"
          : "text-text-muted bg-white/5";
        return (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${winColor}`}>
            {winner}
          </span>
        );
      },
    },
    {
      key: "settledAt",
      header: "Settled At",
      accessor: (row) => (
        <span className="text-[11px] text-text-muted tabular-nums">
          {formatSettledAt(row.settled_at)}
        </span>
      ),
    },
  ];

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

      <TypedDataTable<Hip4SettlementRow>
        data={settlements}
        columns={columns}
        getRowKey={(row, i) => `${row.outcome_id}-${i}`}
        density="compact"
        emptyMessage="No settlements yet"
        emptyDescription="Market resolutions will appear here."
        total={settlements.length}
        page={page}
        rowsPerPage={pageSize}
        onPageChange={setPage}
        onRowsPerPageChange={(n) => { setPageSize(n); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25, 40, 50]}
        paginationVariant="full"
      />
    </motion.div>
  );
}
