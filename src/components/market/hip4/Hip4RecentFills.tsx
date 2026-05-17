"use client";

import { motion } from "framer-motion";
import { TypedDataTable, type Column } from "@/components/common";
import { LoadingState } from "@/components/ui/loading-state";
import type { Hip4FillRow } from "@/services/indexer/hip4";

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
  if (isLoading && fills.length === 0) return <LoadingState message="Loading fills..." withCard />;

  const columns: Column<Hip4FillRow>[] = [
    {
      key: "market",
      header: "Market",
      className: "max-w-[180px]",
      accessor: (row) => {
        const outcomeIdx = row.outcome_id != null && row.outcome_id >= 10 ? row.outcome_id % 10 : null;
        const outcomeName = outcomeIdx === 0 ? "Yes" : outcomeIdx === 1 ? "No" : null;
        return (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-semibold text-text-primary truncate">
              {marketNameIndex?.[row.coin] || row.coin}
            </span>
            {outcomeName && (
              <span
                className={`shrink-0 text-[9px] font-bold px-1 py-0.5 rounded ${
                  outcomeName === "Yes"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-rose-500/15 text-rose-400"
                }`}
              >
                {outcomeName}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "side",
      header: "Side",
      accessor: (row) => {
        const isBuy = row.side === "B" || row.side === "buy";
        return (
          <span className={`text-[11px] font-semibold ${isBuy ? "text-emerald-400" : "text-rose-400"}`}>
            {isBuy ? "Buy" : "Sell"}
          </span>
        );
      },
    },
    {
      key: "px",
      header: "Price",
      sortable: true,
      getSortValue: (row) => row.px ?? 0,
      accessor: (row) => (
        <span className="text-xs tabular-nums text-text-primary">
          {row.px != null ? `${(row.px * 100).toFixed(2)}%` : "—"}
        </span>
      ),
    },
    {
      key: "notional",
      header: "Notional",
      sortable: true,
      getSortValue: (row) => row.notional ?? 0,
      accessor: (row) => (
        <span className="text-xs tabular-nums text-text-secondary">
          {row.notional != null ? compactUsd(row.notional) : "—"}
        </span>
      ),
    },
    {
      key: "fee",
      header: "Fee",
      sortable: true,
      getSortValue: (row) => row.fee ?? 0,
      accessor: (row) => (
        <span className="text-xs tabular-nums text-brand-gold">
          {row.fee != null ? compactUsd(row.fee) : "—"}
        </span>
      ),
    },
    {
      key: "user",
      header: "User",
      accessor: (row) => (
        <span className="text-[11px] text-text-muted font-mono">{shortAddress(row.user)}</span>
      ),
    },
    {
      key: "time",
      header: "Time",
      sortable: true,
      getSortValue: (row) => new Date(row.time).getTime(),
      accessor: (row) => (
        <span className="text-[10px] text-text-muted tabular-nums">
          {new Date(row.time).toLocaleTimeString()}
        </span>
      ),
    },
  ];

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
        <span className="text-text-muted/60">· {fills.length}</span>
      </div>

      <TypedDataTable<Hip4FillRow>
        data={fills}
        columns={columns}
        getRowKey={(row, i) => `${row.hash}-${i}`}
        density="compact"
        emptyMessage="No fills yet"
        emptyDescription="Prediction market fills will appear here."
        paginate
        paginationVariant="full"
        itemsPerPage={10}
        rowsPerPageOptions={[5, 10, 25, 40, 50]}
        initialSort={{ field: "time", direction: "desc" }}
      />
    </motion.div>
  );
}
