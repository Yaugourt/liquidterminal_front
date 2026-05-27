"use client";

import { Activity } from "lucide-react";
import { TypedDataTable, type Column } from "@/components/common";
import { LoadingState } from "@/components/ui/loading-state";
import { Card } from "@/components/ui/card";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { Hip4FillRow } from "@/services/indexer/hip4";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Per-coin metadata used to label fills. `sideName` is only set when the
 * market is provably binary (parsed_sides length === 2). Multi-outcome markets
 * leave it null so we don't fabricate a Yes/No chip. */
export interface Hip4FillMarketMeta {
  name: string;
  sideName?: string | null;
  isBinary?: boolean;
}

interface Hip4RecentFillsProps {
  fills: Hip4FillRow[];
  isLoading: boolean;
  /** Map of `coin` → market metadata (derived from markets-enriched). */
  marketIndex?: Record<string, Hip4FillMarketMeta>;
}

export function Hip4RecentFills({ fills, isLoading, marketIndex }: Hip4RecentFillsProps) {
  if (isLoading && fills.length === 0) return <LoadingState message="Loading fills..." withCard />;

  const columns: Column<Hip4FillRow>[] = [
    {
      key: "market",
      header: "Market",
      className: "max-w-[180px]",
      accessor: (row) => {
        const meta = marketIndex?.[row.coin];
        const outcomeName = meta?.isBinary ? meta.sideName ?? null : null;
        return (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[12px] font-semibold text-text-primary truncate">
              {meta?.name || row.coin}
            </span>
            {outcomeName && (
              <span
                className={`shrink-0 text-[9px] font-bold px-1 py-0.5 rounded ${
                  outcomeName.toLowerCase() === "yes"
                    ? "bg-success/15 text-success"
                    : outcomeName.toLowerCase() === "no"
                    ? "bg-danger/15 text-danger"
                    : "bg-brand/15 text-brand"
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
          <span className={`text-[11px] font-semibold ${isBuy ? "text-success" : "text-danger"}`}>
            {isBuy ? "Buy" : "Sell"}
          </span>
        );
      },
    },
    {
      key: "px",
      header: "Price",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.px ?? 0,
      accessor: (row) => (
        <span className="mono text-[12px] text-text-primary">
          {row.px != null ? `${(row.px * 100).toFixed(2)}%` : "—"}
        </span>
      ),
    },
    {
      key: "notional",
      header: "Notional",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.notional ?? 0,
      accessor: (row) => (
        <span className="mono text-[12px] text-text-secondary">
          {row.notional != null ? compactUsd(row.notional) : "—"}
        </span>
      ),
    },
    {
      key: "fee",
      header: "Fee",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.fee ?? 0,
      accessor: (row) => (
        <span className="mono text-[12px] text-gold">
          {row.fee != null ? compactUsd(row.fee) : "—"}
        </span>
      ),
    },
    {
      key: "user",
      header: "User",
      accessor: (row) => (
        <span className="mono text-[11px] text-text-tertiary">{shortAddress(row.user)}</span>
      ),
    },
    {
      key: "time",
      header: "Time",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => new Date(row.time).getTime(),
      accessor: (row) => (
        <span className="mono text-[10.5px] text-text-tertiary">
          {new Date(row.time).toLocaleTimeString()}
        </span>
      ),
    },
  ];

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Activity size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Recent Fills</h3>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/25 inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Feed
        </span>
        <span className="ml-auto mono text-[11px] text-text-tertiary">{fills.length}</span>
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
    </Card>
  );
}
