"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  formatFillSideLabel,
  formatPriorityFeeNumber,
  isFillSideBuy,
  isFillSideSell,
} from "./priority-fees-format";

const FILLS_PAGE_SIZE = 11;

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
    return Number.isNaN(d.getTime())
      ? t
      : d.toLocaleString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          month: "short",
          day: "numeric",
        });
  }
  return "—";
}

function RecentFillsSection() {
  const [page, setPage] = useState(0);
  const offset = page * FILLS_PAGE_SIZE;
  const { data, isLoading, error, refetch } = usePriorityFeesRecentFills({
    limit: FILLS_PAGE_SIZE,
    offset,
    has_priority_gas: true,
  });

  const hasPrev = page > 0;
  const hasNext = data.length === FILLS_PAGE_SIZE;

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
        ) : data.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-text-secondary px-4 text-center">
            No recent fills with priority gas (&gt; 0)
            {page > 0 ? " on this page." : "."}
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
                    User
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row: PriorityFeesFillRow, idx: number) => {
                const g = extractFillPriorityGas(row);
                const sideLabel = formatFillSideLabel(row.side);
                const sideClass = isFillSideBuy(row.side)
                  ? "text-emerald-400"
                  : isFillSideSell(row.side)
                    ? "text-rose-400"
                    : "text-text-secondary";
                return (
                  <TableRow
                    key={`${String(row.hash ?? row.tid ?? idx)}-${offset + idx}`}
                    className="border-border-subtle hover:bg-white/[0.03]"
                  >
                    <TableCell className="py-2.5 px-3 text-xs text-text-secondary whitespace-nowrap">
                      {formatFillTime(row.time)}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-sm text-white font-mono">
                      {row.coin ?? "—"}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-sm">
                      <span className={sideClass}>{sideLabel}</span>
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-right text-sm font-mono text-white">
                      {formatPriorityFeeNumber(Number.isFinite(g) ? g : undefined)}
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-text-muted">
          {FILLS_PAGE_SIZE} per page · B = buy, A = sell (indexer)
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-border-subtle bg-transparent text-text-secondary hover:bg-white/[0.05] hover:text-white"
            disabled={!hasPrev || isLoading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-text-secondary tabular-nums min-w-[4.5rem] text-center">
            Page {page + 1}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-border-subtle bg-transparent text-text-secondary hover:bg-white/[0.05] hover:text-white"
            disabled={!hasNext || isLoading}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

export function PriorityFeesHistoryTable() {
  return (
    <Card className="p-5 border-border-subtle bg-brand-secondary/40 backdrop-blur-md h-full flex flex-col">
      <div className="mb-4">
        <h2 className="font-inter text-lg font-semibold text-white tracking-tight">
          History & activity
        </h2>
        <p className="text-xs text-text-muted mt-1">
          Recent fills with priority gas (live from the indexer).
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <RecentFillsSection />
      </div>
    </Card>
  );
}
