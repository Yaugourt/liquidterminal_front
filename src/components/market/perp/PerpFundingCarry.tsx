"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TypedDataTable, ModuleAsset, CellValue, DataStatus } from "@/components/common";
import type { Column } from "@/components/common";
import { usePredictedFundings } from "@/services/market/funding";
import type { FundingCarryRow } from "@/services/market/funding";

const tokenHref = (name: string) => `/market/perp/${encodeURIComponent(name)}`;

// Annualized funding APR, signed. "—" when a venue doesn't quote.
const formatApr = (apr: number | null) =>
  apr == null ? "—" : `${apr > 0 ? "+" : ""}${apr.toFixed(1)}%`;

// Sort accessor that pushes missing values to the bottom in both directions'
// natural reading (biggest carries first under the default desc sort).
const sortNum = (v: number | null) => (v == null ? Number.NEGATIVE_INFINITY : v);

/**
 * Cross-venue funding carry screen for /market/perp. Annualizes Hyperliquid's
 * keyless `predictedFundings` (HL vs Binance vs Bybit) and ranks by the spread
 * between the venue paying the most and the least — a basis/carry screen no
 * HL-only dashboard surfaces. Cross-venue rows only (needs ≥2 venues to quote).
 */
export function PerpFundingCarry() {
  const router = useRouter();
  const { rows, isLoading, isRefreshing, error, refetch, dataUpdatedAt } = usePredictedFundings();

  const carryRows = useMemo(() => rows.filter((r) => r.venueCount >= 2), [rows]);

  const columns: Column<FundingCarryRow>[] = [
    {
      key: "coin",
      header: "Market",
      // A width here too: with fixedLayout an unsized column gets squeezed to 0
      // on narrow screens (the sized ones already exceed a phone's width).
      width: 140,
      sortable: true,
      getSortValue: (r) => r.coin,
      accessor: (r) => <ModuleAsset assetName={r.coin} name={r.coin} />,
    },
    {
      key: "hlApr",
      header: "HL APR",
      type: "change",
      width: 110,
      sortable: true,
      getSortValue: (r) => sortNum(r.hlApr),
      tone: (r) => (r.hlApr == null ? "muted" : undefined),
      accessor: (r) => formatApr(r.hlApr),
    },
    {
      key: "binanceApr",
      header: "Binance APR",
      type: "change",
      width: 140,
      sortable: true,
      getSortValue: (r) => sortNum(r.binanceApr),
      tone: (r) => (r.binanceApr == null ? "muted" : undefined),
      accessor: (r) => formatApr(r.binanceApr),
    },
    {
      key: "bybitApr",
      header: "Bybit APR",
      type: "change",
      width: 130,
      sortable: true,
      getSortValue: (r) => sortNum(r.bybitApr),
      tone: (r) => (r.bybitApr == null ? "muted" : undefined),
      accessor: (r) => formatApr(r.bybitApr),
    },
    {
      key: "spread",
      header: "Carry (spread)",
      align: "right",
      width: 150,
      sortable: true,
      getSortValue: (r) => sortNum(r.spread),
      accessor: (r) =>
        r.spread == null ? (
          "—"
        ) : (
          <CellValue
            value={`${r.spread.toFixed(1)}%`}
            sub={r.shortVenue && r.longVenue ? `short ${r.shortVenue} / long ${r.longVenue}` : undefined}
          />
        ),
    },
  ];

  return (
    <TypedDataTable
      title="Funding / Carry"
      subtitle="Predicted next funding, annualized across venues — ranked by cross-venue spread"
      headerAction={
        <DataStatus
          variant="polled"
          updatedAt={dataUpdatedAt}
          isRefreshing={isRefreshing}
          onRefresh={refetch}
        />
      }
      data={carryRows}
      columns={columns}
      getRowKey={(r) => r.coin}
      isLoading={isLoading}
      error={error}
      onErrorRetry={refetch}
      onRowClick={(r) => router.push(tokenHref(r.coin))}
      rowClassName="cursor-pointer"
      fixedLayout
      paginate
      paginationVariant="compact"
      itemsPerPage={15}
      initialSort={{ field: "spread", direction: "desc" }}
      emptyMessage="No cross-venue funding data"
      emptyDescription="Only markets quoted on at least two venues appear here."
    />
  );
}
