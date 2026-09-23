"use client";

import {
  TypedDataTable,
  ModuleAsset,
  SideBadge,
  toTradeSide,
  type Column,
} from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import type { Hip4FillRow } from "@/services/indexer/hip4";

/** Per-coin metadata used to label fills. `sideName` is only set when the
 * market is provably binary (parsed_sides length === 2). Multi-outcome markets
 * leave it null so we don't fabricate a Yes/No chip. */
interface Hip4FillMarketMeta {
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

function outcomeVariant(outcomeName: string): "success" | "error" | "info" {
  const v = outcomeName.toLowerCase();
  if (v === "yes") return "success";
  if (v === "no") return "error";
  return "info";
}

export function Hip4RecentFills({ fills, isLoading, marketIndex }: Hip4RecentFillsProps) {
  const columns: Column<Hip4FillRow>[] = [
    {
      key: "market",
      header: "Market",
      accessor: (row) => {
        const meta = marketIndex?.[row.coin];
        const outcomeName = meta?.isBinary ? meta.sideName ?? null : null;
        return (
          <span className="flex items-center gap-1.5 min-w-0">
            {/* Cap the name, not the cell: a long outcome chip then widens the
                column instead of spilling over the Side cell. */}
            <span className="min-w-0 max-w-[9rem]">
              <ModuleAsset name={meta?.name || row.coin} />
            </span>
            {outcomeName && (
              <StatusBadge variant={outcomeVariant(outcomeName)}>{outcomeName}</StatusBadge>
            )}
          </span>
        );
      },
    },
    {
      key: "side",
      header: "Side",
      accessor: (row) => {
        const side = toTradeSide(row.side);
        return side ? <SideBadge side={side} /> : "—";
      },
    },
    {
      key: "px",
      header: "Price",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.px ?? 0,
      accessor: (row) => (row.px != null ? `${(row.px * 100).toFixed(2)}%` : "—"),
    },
    {
      key: "sz",
      header: "Size",
      type: "numeric",
      tone: () => "muted",
      sortable: true,
      getSortValue: (row) => row.sz ?? 0,
      accessor: (row) => (row.sz != null ? compactCount(row.sz) : "—"),
    },
    {
      key: "notional",
      header: "Notional",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.notional ?? 0,
      accessor: (row) => (row.notional != null ? compactUsd(row.notional) : "—"),
    },
    {
      key: "fee",
      header: "Fee",
      type: "fees",
      sortable: true,
      getSortValue: (row) => row.fee ?? 0,
      accessor: (row) => (row.fee != null ? compactUsd(row.fee) : "—"),
    },
    {
      key: "user",
      header: "User",
      accessor: (row) => <AddressDisplay address={row.user} showCopy={false} />,
    },
    {
      key: "time",
      header: "Time",
      type: "time",
      align: "right",
      sortable: true,
      getSortValue: (row) => new Date(row.time).getTime(),
      accessor: (row) => new Date(row.time).toLocaleTimeString(),
    },
  ];

  return (
    <TypedDataTable<Hip4FillRow>
      title="Recent Fills"
      tag={fills.length}
      headerAction={
        <StatusBadge variant="success" dot>
          Feed
        </StatusBadge>
      }
      data={fills}
      columns={columns}
      getRowKey={(row, i) => `${row.hash}-${i}`}
      isLoading={isLoading && fills.length === 0}
      density="compact"
      emptyMessage="No fills yet"
      emptyDescription="Prediction market fills will appear here."
      paginate
      paginationVariant="full"
      itemsPerPage={10}
      rowsPerPageOptions={[5, 10, 25, 40, 50]}
      initialSort={{ field: "time", direction: "desc" }}
    />
  );
}
