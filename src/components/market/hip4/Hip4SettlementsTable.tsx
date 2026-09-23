"use client";

import { TypedDataTable, ModuleAsset, type Column } from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Hip4SettlementRow } from "@/services/indexer/hip4";

interface Hip4SettlementsTableProps {
  settlements: Hip4SettlementRow[];
  isLoading: boolean;
  /** Fallback `outcome_id` → readable title (from markets-enriched), used when
   * the settlement row's own `question_name`/`coin` come back null. */
  titleIndex?: Record<number, string>;
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

export function Hip4SettlementsTable({ settlements, isLoading, titleIndex }: Hip4SettlementsTableProps) {
  const columns: Column<Hip4SettlementRow>[] = [
    {
      key: "market",
      header: "Market",
      accessor: (row) => (
        <ModuleAsset
          name={row.question_name ?? row.coin ?? titleIndex?.[row.outcome_id] ?? `#${row.outcome_id}`}
        />
      ),
    },
    {
      key: "settledPrice",
      header: "Settled Price",
      type: "numeric",
      tone: () => "brand",
      accessor: (row) => formatSettledPrice(row.settled_px),
    },
    {
      key: "winner",
      header: "Winner",
      accessor: (row) => {
        const winner = row.winner_name ?? (row.winner_side === 0 ? "Yes" : row.winner_side === 1 ? "No" : "—");
        const isYes = row.winner_name === "Yes" || (row.winner_name == null && row.winner_side === 0);
        const isNo = row.winner_name === "No" || (row.winner_name == null && row.winner_side === 1);
        const variant = isYes ? "success" : isNo ? "error" : row.winner_name ? "info" : "inactive";
        return <StatusBadge variant={variant}>{winner}</StatusBadge>;
      },
    },
    {
      key: "yesFraction",
      header: "YES %",
      type: "numeric",
      tone: () => "muted",
      accessor: (row) =>
        row.settle_fraction != null ? `${(row.settle_fraction * 100).toFixed(0)}%` : "—",
    },
    {
      key: "settledAt",
      header: "Settled At",
      type: "time",
      accessor: (row) => formatSettledAt(row.settled_at),
    },
    {
      key: "tx",
      header: "Tx",
      align: "right",
      accessor: (row) =>
        row.tx_hash ? (
          <AddressDisplay
            address={row.tx_hash}
            href={`/explorer/transaction/${row.tx_hash}`}
            copyMessage="Hash copied to clipboard"
          />
        ) : (
          "—"
        ),
    },
  ];

  return (
    <TypedDataTable<Hip4SettlementRow>
      title="Settled Markets"
      tag={settlements.length}
      data={settlements}
      columns={columns}
      getRowKey={(row, i) => `${row.outcome_id}-${i}`}
      isLoading={isLoading && settlements.length === 0}
      density="compact"
      emptyMessage="No settlements yet"
      emptyDescription="Market resolutions will appear here."
      paginate
      paginationVariant="full"
      itemsPerPage={10}
      rowsPerPageOptions={[5, 10, 25, 40, 50]}
    />
  );
}
