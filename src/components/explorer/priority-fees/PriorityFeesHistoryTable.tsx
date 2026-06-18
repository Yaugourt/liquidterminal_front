"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddressDisplay } from "@/components/ui/address-display";
import { TypedDataTable, TokenAvatar, type Column } from "@/components/common";
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

const FILLS_PAGE_SIZE = 10;

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

function buildColumns(): Column<PriorityFeesFillRow>[] {
  return [
    {
      key: "time",
      header: "Time",
      accessor: (row) => (
        <span className="text-xs text-text-secondary whitespace-nowrap">
          {formatFillTime(row.time)}
        </span>
      ),
    },
    {
      key: "coin",
      header: "Coin",
      accessor: (row) =>
        row.coin ? (
          <span className="inline-flex items-center gap-1.5">
            <TokenAvatar assetName={row.coin} size="sm" />
            <span className="text-sm text-text-primary tabular-nums">{row.coin}</span>
          </span>
        ) : (
          <span className="text-sm text-text-secondary">—</span>
        ),
    },
    {
      key: "side",
      header: "Side",
      accessor: (row) => {
        const sideLabel = formatFillSideLabel(row.side);
        const sideClass = isFillSideBuy(row.side)
          ? "text-success"
          : isFillSideSell(row.side)
            ? "text-danger"
            : "text-text-secondary";
        return <span className={`text-sm ${sideClass}`}>{sideLabel}</span>;
      },
    },
    {
      key: "priority_gas",
      header: "Priority gas",
      type: "numeric",
      accessor: (row) => {
        const g = extractFillPriorityGas(row);
        return (
          <span className="text-sm text-text-primary tabular-nums">
            {formatPriorityFeeNumber(Number.isFinite(g) ? g : undefined)}
          </span>
        );
      },
    },
    {
      key: "user",
      header: "User",
      accessor: (row) =>
        row.user ? <AddressDisplay address={row.user} /> : <span className="text-text-tertiary">—</span>,
    },
  ];
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
        <div className="mb-3 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger flex flex-wrap items-center gap-3">
          <span>{error.message}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs text-brand hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="rounded-lg border border-border-subtle overflow-hidden">
        <TypedDataTable<PriorityFeesFillRow>
          data={data}
          columns={buildColumns()}
          getRowKey={(row, idx) => `${String(row.hash ?? row.tid ?? idx)}-${offset + idx}`}
          isLoading={isLoading && data.length === 0}
          emptyMessage="No recent fills with priority gas (> 0)"
          emptyDescription={page > 0 ? "on this page." : ""}
          density="compact"
          paginationVariant="none"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-text-tertiary">
          {FILLS_PAGE_SIZE} per page · B = buy, A = sell (indexer)
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-border-subtle bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary"
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
            className="border-border-subtle bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary"
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
    <Card className="p-5 border-border-subtle bg-surface/40 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="font-inter text-lg font-semibold text-text-primary tracking-tight">
          History &amp; activity
        </h2>
        <p className="text-xs text-text-tertiary mt-1">
          Recent fills with priority gas (live from the indexer).
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <RecentFillsSection />
      </div>
    </Card>
  );
}
