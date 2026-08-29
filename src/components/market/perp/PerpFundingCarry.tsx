"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { TypedDataTable, TokenAvatar, DataStatus } from "@/components/common";
import type { Column } from "@/components/common";
import { cn } from "@/lib/utils";
import { usePredictedFundings } from "@/services/market/funding";
import type { FundingCarryRow } from "@/services/market/funding";

const tokenHref = (name: string) => `/market/perp/${encodeURIComponent(name)}`;

// Annualized funding APR, signed and colored. "—" when a venue doesn't quote.
function AprCell({ apr }: { apr: number | null }) {
  if (apr == null) return <span className="text-text-tertiary">—</span>;
  return (
    <span className={cn("mono", apr >= 0 ? "text-success" : "text-danger")}>
      {apr > 0 ? "+" : ""}
      {apr.toFixed(1)}%
    </span>
  );
}

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
      sortable: true,
      getSortValue: (r) => r.coin,
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <TokenAvatar assetName={r.coin} kind="auto" size="sm" />
          <span className="text-text-primary font-medium">{r.coin}</span>
        </div>
      ),
    },
    {
      key: "hlApr",
      header: "HL APR",
      align: "right",
      width: 110,
      sortable: true,
      getSortValue: (r) => sortNum(r.hlApr),
      accessor: (r) => <AprCell apr={r.hlApr} />,
    },
    {
      key: "binanceApr",
      header: "Binance APR",
      align: "right",
      width: 120,
      sortable: true,
      getSortValue: (r) => sortNum(r.binanceApr),
      accessor: (r) => <AprCell apr={r.binanceApr} />,
    },
    {
      key: "bybitApr",
      header: "Bybit APR",
      align: "right",
      width: 120,
      sortable: true,
      getSortValue: (r) => sortNum(r.bybitApr),
      accessor: (r) => <AprCell apr={r.bybitApr} />,
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
          <span className="text-text-tertiary">—</span>
        ) : (
          <div className="flex flex-col items-end">
            <span className="mono font-medium text-text-primary">{r.spread.toFixed(1)}%</span>
            {r.shortVenue && r.longVenue && (
              <span className="text-text-tertiary text-xs">
                short {r.shortVenue} / long {r.longVenue}
              </span>
            )}
          </div>
        ),
    },
  ];

  return (
    <TypedDataTable
      title="Funding / Carry"
      subtitle="Predicted next funding, annualized across venues — ranked by cross-venue spread"
      icon={<ArrowLeftRight size={15} className="text-brand" />}
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
