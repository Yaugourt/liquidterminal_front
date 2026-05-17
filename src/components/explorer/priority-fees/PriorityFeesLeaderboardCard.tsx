"use client";

import { Card } from "@/components/ui/card";
import { AddressDisplay } from "@/components/ui/address-display";
import { TypedDataTable, type Column } from "@/components/common";
import type { PriorityFeesLeaderboardEntry } from "@/services/explorer/priority-fees";
import { formatPriorityFeeNumber } from "./priority-fees-format";

export interface PriorityFeesLeaderboardCardProps {
  entries: PriorityFeesLeaderboardEntry[];
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
}

function rowAddress(row: PriorityFeesLeaderboardEntry): string {
  return String(row.user ?? row.address ?? "").trim();
}

function rowScore(row: PriorityFeesLeaderboardEntry): unknown {
  return (
    row.total_priority_gas ??
    row.priority_fees ??
    row.score ??
    row.value ??
    row.volume
  );
}

const COLUMNS: Column<PriorityFeesLeaderboardEntry>[] = [
  {
    key: "rank",
    header: "#",
    accessor: (row, idx) => (
      <span className="text-text-muted text-sm tabular-nums">{row.rank ?? idx + 1}</span>
    ),
  },
  {
    key: "user",
    header: "User",
    accessor: (row) => {
      const addr = rowAddress(row);
      return addr ? (
        <AddressDisplay address={addr} />
      ) : (
        <span className="text-text-muted">—</span>
      );
    },
  },
  {
    key: "priority_fees",
    header: "Priority fees",
    type: "numeric",
    accessor: (row) => (
      <span className="text-sm text-text-primary tabular-nums">
        {formatPriorityFeeNumber(rowScore(row))}
      </span>
    ),
  },
  {
    key: "fill_count",
    header: "Fills",
    type: "numeric",
    accessor: (row) => (
      <span className="text-sm text-text-secondary tabular-nums">
        {row.fill_count !== undefined && row.fill_count !== null
          ? String(row.fill_count)
          : "—"}
      </span>
    ),
  },
];

export function PriorityFeesLeaderboardCard({
  entries,
  isLoading,
  error,
  onRetry,
}: PriorityFeesLeaderboardCardProps) {
  return (
    <Card className="p-5 border-border-subtle bg-brand-secondary/40 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="font-inter text-lg font-semibold text-text-primary tracking-tight">
          Top 11 payers
        </h2>
        <p className="text-xs text-text-muted mt-1">
          HypeDexer <code className="text-[10px]">by=priority_fees</code> — same hours window as the
          summary above.
        </p>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-sm text-rose-400 flex flex-col gap-2">
          <span>{error.message}</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs text-brand-accent hover:underline w-fit"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="flex-1 min-h-[240px] rounded-lg border border-border-subtle overflow-hidden">
        <TypedDataTable<PriorityFeesLeaderboardEntry>
          data={entries}
          columns={COLUMNS}
          getRowKey={(row, idx) => `${rowAddress(row)}-${row.rank ?? idx}`}
          isLoading={isLoading && entries.length === 0}
          emptyMessage="No leaderboard rows for this window."
          emptyDescription=""
          density="compact"
          paginationVariant="none"
        />
      </div>
    </Card>
  );
}
