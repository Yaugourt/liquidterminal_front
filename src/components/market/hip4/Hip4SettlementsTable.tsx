"use client";

import { CheckCircle2 } from "lucide-react";
import { TypedDataTable, type Column } from "@/components/common";
import { LoadingState } from "@/components/ui/loading-state";
import { Card } from "@/components/ui/card";
import type { Hip4SettlementRow } from "@/services/indexer/hip4";

interface Hip4SettlementsTableProps {
  settlements: Hip4SettlementRow[];
  isLoading: boolean;
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

export function Hip4SettlementsTable({ settlements, isLoading }: Hip4SettlementsTableProps) {
  if (isLoading && settlements.length === 0) return <LoadingState message="Loading settlements..." withCard />;

  const columns: Column<Hip4SettlementRow>[] = [
    {
      key: "market",
      header: "Market",
      accessor: (row) => (
        <span className="text-[12px] font-semibold text-text-primary line-clamp-1">
          {row.question_name ?? row.coin ?? `#${row.outcome_id}`}
        </span>
      ),
    },
    {
      key: "settledPrice",
      header: "Settled Price",
      type: "numeric",
      accessor: (row) => (
        <span className="mono text-[12px] text-brand">
          {formatSettledPrice(row.settled_px)}
        </span>
      ),
    },
    {
      key: "winner",
      header: "Winner",
      accessor: (row) => {
        const winner = row.winner_name ?? (row.winner_side === 0 ? "Yes" : row.winner_side === 1 ? "No" : "—");
        const isYes = row.winner_name === "Yes" || (row.winner_name == null && row.winner_side === 0);
        const isNo = row.winner_name === "No" || (row.winner_name == null && row.winner_side === 1);
        const winColor = isYes
          ? "text-success bg-success/10"
          : isNo
          ? "text-danger bg-danger/10"
          : row.winner_name
          ? "text-brand bg-brand/10"
          : "text-text-tertiary bg-surface-2";
        return (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${winColor}`}>
            {winner}
          </span>
        );
      },
    },
    {
      key: "settledAt",
      header: "Settled At",
      type: "numeric",
      accessor: (row) => (
        <span className="mono text-[10.5px] text-text-tertiary">
          {formatSettledAt(row.settled_at)}
        </span>
      ),
    },
  ];

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <CheckCircle2 size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Settled Markets</h3>
        <span className="ml-auto mono text-[11px] text-text-tertiary">{settlements.length}</span>
      </div>

      <TypedDataTable<Hip4SettlementRow>
        data={settlements}
        columns={columns}
        getRowKey={(row, i) => `${row.outcome_id}-${i}`}
        density="compact"
        emptyMessage="No settlements yet"
        emptyDescription="Market resolutions will appear here."
        paginate
        paginationVariant="full"
        itemsPerPage={10}
        rowsPerPageOptions={[5, 10, 25, 40, 50]}
      />
    </Card>
  );
}
