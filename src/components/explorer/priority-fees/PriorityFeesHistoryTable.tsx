"use client";

import { useMemo } from "react";
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
import {
  usePriorityFeesRecentFills,
  extractFillPriorityGas,
  type PriorityFeesFillRow,
} from "@/services/explorer/priority-fees";
import { formatPriorityFeeNumber } from "./priority-fees-format";

function formatFillTime(t: unknown): string {
  if (typeof t === "number" && Number.isFinite(t)) {
    const ms = t < 1e12 ? t * 1000 : t;
    return new Date(ms).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  }
  if (typeof t === "string") {
    const d = new Date(t);
    return Number.isNaN(d.getTime()) ? t : d.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  }
  return "—";
}

function RecentFillsSection() {
  const { data, isLoading, error, refetch } = usePriorityFeesRecentFills({
    limit: 50,
    has_priority_gas: true,
  });

  const visibleRows = useMemo(
    () =>
      data.filter((row) => {
        const n = extractFillPriorityGas(row);
        return Number.isFinite(n) && n > 0;
      }),
    [data]
  );

  return (
    <>
      {error && (
        <div className="mb-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-sm text-rose-400 flex flex-wrap items-center gap-3">
          <span>{error.message}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs text-brand-accent hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="rounded-xl border border-border-subtle overflow-x-auto">
        {isLoading && data.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center flex-col gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
            <span className="text-text-muted text-sm">Loading fills…</span>
          </div>
        ) : visibleRows.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-text-secondary px-4 text-center">
            No recent fills with priority gas (&gt; 0).
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="py-3 px-3">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Time
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Coin
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Side
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3 text-right">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Priority gas
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Block
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    User
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map((row: PriorityFeesFillRow, idx: number) => {
                const g = extractFillPriorityGas(row);
                return (
                  <TableRow
                    key={`${String(row.hash ?? row.tid ?? idx)}-${idx}`}
                    className="border-border-subtle hover:bg-white/[0.03]"
                  >
                    <TableCell className="py-2.5 px-3 text-xs text-text-secondary whitespace-nowrap">
                      {formatFillTime(row.time)}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-sm text-white font-mono">
                      {row.coin ?? "—"}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-sm">
                      <span
                        className={
                          row.side === "B" || row.side === "buy" || row.side === "Buy"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }
                      >
                        {row.side ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-right text-sm font-mono text-white">
                      {formatPriorityFeeNumber(Number.isFinite(g) ? g : undefined)}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-xs text-text-muted font-mono">
                      {row.block_number ?? row.blockNumber ?? "—"}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-sm min-w-[140px]">
                      {row.user ? <AddressDisplay address={row.user} /> : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}

export function PriorityFeesHistoryTable() {
  return (
    <Card className="p-5 border-border-subtle bg-brand-secondary/40 backdrop-blur-md">
      <div className="mb-4">
        <h2 className="font-inter text-lg font-semibold text-white tracking-tight">
          History & activity
        </h2>
        <p className="text-xs text-text-muted mt-1">
          Recent fills with priority gas (live from the indexer).
        </p>
      </div>

      <RecentFillsSection />
    </Card>
  );
}
