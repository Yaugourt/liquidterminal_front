"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
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
  usePriorityFeesGossipHistory,
  usePriorityFeesRecentFills,
  extractFillPriorityGas,
  type PriorityFeesGossipRecord,
  type PriorityFeesFillRow,
} from "@/services/explorer/priority-fees";
import { formatPriorityFeeNumber } from "./priority-fees-format";

type HistoryTab = "gossip" | "fills";

const PAGE_SIZE = 25;

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

function formatGossipTs(s: unknown): string {
  if (typeof s !== "string") return "—";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}

function GossipHistorySection() {
  const [page, setPage] = useState(0);
  const offset = page * PAGE_SIZE;
  const { data, totalCount, isLoading, error, refetch } = usePriorityFeesGossipHistory({
    offset,
    limit: PAGE_SIZE,
  });

  const canPrev = page > 0;
  const canNext =
    totalCount !== null
      ? offset + data.length < totalCount
      : data.length === PAGE_SIZE;

  const rangeLabel =
    totalCount !== null && totalCount > 0
      ? `Rows ${offset + 1}–${offset + data.length} of ${totalCount}`
      : `Page ${page + 1} · ${PAGE_SIZE} per page`;

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
            <span className="text-text-muted text-sm">Loading gossip history…</span>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-text-secondary px-4 text-center">
            No gossip history rows for this page.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="py-3 px-3">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Snapshot
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Slot
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3 text-right">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Start gas
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3 text-right">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    End gas
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Winner
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row: PriorityFeesGossipRecord, idx: number) => (
                <TableRow
                  key={`gossip-${idx}-${String(row.snapshotTs ?? row.slotId ?? row.slot_id ?? idx)}`}
                  className="border-border-subtle hover:bg-white/[0.03]"
                >
                  <TableCell className="py-2.5 px-3 text-xs text-text-secondary whitespace-nowrap">
                    {formatGossipTs(row.snapshotTs)}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-sm font-mono text-white">
                    {row.slotId ?? row.slot_id ?? "—"}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right text-sm font-mono text-white">
                    {formatPriorityFeeNumber(row.startGas ?? row.start_gas)}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right text-sm font-mono text-white">
                    {formatPriorityFeeNumber(row.endGas)}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-xs text-text-secondary font-mono max-w-[180px] truncate">
                    {typeof row.winner === "string" && row.winner ? row.winner : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 gap-2">
        <span className="text-xs text-text-muted">{rangeLabel}</span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canPrev || isLoading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="border-border-subtle text-text-secondary hover:text-white"
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canNext || isLoading}
            onClick={() => setPage((p) => p + 1)}
            className="border-border-subtle text-text-secondary hover:text-white"
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
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
  const [tab, setTab] = useState<HistoryTab>("gossip");

  return (
    <Card className="p-5 border-border-subtle bg-brand-secondary/40 backdrop-blur-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="font-inter text-lg font-semibold text-white tracking-tight">
            History & activity
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Paginated gossip archive or live recent fills with priority gas.
          </p>
        </div>
        <div className="inline-flex rounded-lg p-1 border border-border-subtle bg-brand-primary/60">
          <button
            type="button"
            onClick={() => setTab("gossip")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === "gossip"
                ? "bg-brand-accent text-brand-tertiary"
                : "text-text-secondary hover:text-white"
            }`}
          >
            Gossip history
          </button>
          <button
            type="button"
            onClick={() => setTab("fills")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === "fills"
                ? "bg-brand-accent text-brand-tertiary"
                : "text-text-secondary hover:text-white"
            }`}
          >
            Recent fills
          </button>
        </div>
      </div>

      {tab === "gossip" ? <GossipHistorySection /> : <RecentFillsSection />}
    </Card>
  );
}
