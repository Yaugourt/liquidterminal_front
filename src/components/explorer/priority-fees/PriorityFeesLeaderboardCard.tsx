"use client";

import { Loader2 } from "lucide-react";
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
    <Card className="p-5 border-border-subtle bg-brand-secondary/40 backdrop-blur-md h-full flex flex-col">
      <div className="mb-4">
        <h2 className="font-outfit text-lg font-semibold text-white tracking-tight">
          Top payers
        </h2>
        <p className="text-xs text-text-muted mt-1">
          Leaderboard by priority fees in the same window as the chart.
        </p>
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-sm text-rose-400 flex flex-col gap-2">
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

      <div className="flex-1 min-h-[240px] rounded-xl border border-border-subtle overflow-hidden">
        {isLoading && entries.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center flex-col gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
            <span className="text-text-muted text-sm">Loading leaderboard…</span>
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
                    <TableCell className="py-2.5 px-3 text-text-muted text-sm font-mono">
                      {rank}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-sm">
                      {addr ? (
                        <AddressDisplay address={addr} />
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-right text-sm text-white font-mono">
                      {formatPriorityFeeNumber(rowScore(row))}
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
