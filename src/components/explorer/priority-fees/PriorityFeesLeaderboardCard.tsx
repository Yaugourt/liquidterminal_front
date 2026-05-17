"use client";

import { LoadingState } from "@/components/ui/loading-state";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddressDisplay } from "@/components/ui/address-display";
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
        {isLoading && entries.length === 0 ? (
          <div className="flex h-[240px]">
            <LoadingState message="Loading leaderboard…" size="sm" withCard={false} />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center px-4 text-center text-sm text-text-secondary">
            No leaderboard rows for this window.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="py-3 px-3">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    #
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    User
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3 text-right">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Priority fees
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3 text-right">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Fills
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((row, idx) => {
                const addr = rowAddress(row);
                const rank = row.rank ?? idx + 1;
                return (
                  <TableRow
                    key={`${addr}-${rank}`}
                    className="border-border-subtle hover:bg-white/[0.03]"
                  >
                    <TableCell className="py-2.5 px-3 text-text-muted text-sm tabular-nums">
                      {rank}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-sm">
                      {addr ? (
                        <AddressDisplay address={addr} />
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-right text-sm text-text-primary tabular-nums">
                      {formatPriorityFeeNumber(rowScore(row))}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-right text-sm text-text-secondary tabular-nums">
                      {row.fill_count !== undefined && row.fill_count !== null
                        ? String(row.fill_count)
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  );
}
