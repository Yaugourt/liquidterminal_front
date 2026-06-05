"use client";

import { Trophy } from "lucide-react";
import { TypedDataTable, type Column } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { Hip4TraderFlow } from "@/lib/hip4/trade-flow";

interface Hip4TopTradersProps {
  traders: Hip4TraderFlow[];
  /** Total flow volume across all traders — for the share column. */
  totalVolume: number;
  /** Selected outcome label, shown in the subtitle. */
  outcomeLabel?: string;
  isLoading?: boolean;
}

function shortAddress(addr: string): string {
  return addr.length > 14 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

/**
 * Top Traders — the honest substitute for the competitor's "Top Holders". With
 * no holdings endpoint, we rank by OBSERVED net trade flow / volume on the
 * selected outcome (settlement + protocol fills already excluded by
 * `buildTradeFlow`), and label it as trade flow, never holdings.
 */
export function Hip4TopTraders({
  traders,
  totalVolume,
  outcomeLabel,
  isLoading,
}: Hip4TopTradersProps) {
  const columns: Column<Hip4TraderFlow>[] = [
    {
      key: "rank",
      header: "#",
      width: 44,
      accessor: (_row, _i, abs) => (
        <span className="mono text-[11px] text-text-tertiary">{abs + 1}</span>
      ),
    },
    {
      key: "user",
      header: "Trader",
      accessor: (row) => (
        <span className="mono text-[11.5px] text-text-primary">{shortAddress(row.user)}</span>
      ),
    },
    {
      key: "net",
      header: "Net Flow",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.net,
      accessor: (row) => (
        <span
          className={`mono text-[11.5px] font-semibold ${
            row.net > 0 ? "text-success" : row.net < 0 ? "text-danger" : "text-text-secondary"
          }`}
        >
          {row.net > 0 ? "+" : row.net < 0 ? "−" : ""}
          {compactUsd(Math.abs(row.net))}
        </span>
      ),
    },
    {
      key: "buy",
      header: "Bought",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.buy,
      accessor: (row) => (
        <span className="mono text-[11.5px] text-text-secondary">{compactUsd(row.buy)}</span>
      ),
    },
    {
      key: "sell",
      header: "Sold",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.sell,
      accessor: (row) => (
        <span className="mono text-[11.5px] text-text-secondary">{compactUsd(row.sell)}</span>
      ),
    },
    {
      key: "volume",
      header: "Volume",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.volume,
      accessor: (row) => {
        const share = totalVolume > 0 ? row.volume / totalVolume : 0;
        return (
          <div className="flex items-center justify-end gap-2">
            <span className="mono text-[11.5px] text-text-primary">{compactUsd(row.volume)}</span>
            <div className="h-1 w-14 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-brand opacity-70"
                style={{ width: `${Math.max(0, Math.min(1, share)) * 100}%` }}
              />
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <TypedDataTable<Hip4TraderFlow>
      data={traders}
      columns={columns}
      getRowKey={(row) => row.user}
      isLoading={isLoading && traders.length === 0}
      density="compact"
      title="Top Traders"
      icon={<Trophy size={16} className="text-brand" />}
      subtitle={`By volume · observed fills${outcomeLabel ? ` · ${outcomeLabel}` : ""}`}
      emptyMessage="No traders yet"
      emptyDescription="Trades on this outcome will appear here."
      paginate
      paginationVariant="compact"
      itemsPerPage={10}
      initialSort={{ field: "volume", direction: "desc" }}
    />
  );
}
