"use client";

import { memo, useMemo } from "react";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { TypedDataTable, ModuleAsset, type Column } from "@/components/common";
import { useRouter } from "next/navigation";
import type { PerpDexWithMarketData } from "@/services/market/perpDex/types";

const COLUMNS: Column<PerpDexWithMarketData>[] = [
  {
    key: "name",
    header: "Name",
    accessor: (row) => (
      <ModuleAsset logo={row.name.charAt(0).toUpperCase()} name={row.fullName} sub={row.name} />
    ),
  },
  {
    key: "totalVolume24h",
    header: "24h Vol",
    type: "numeric",
    accessor: (row) =>
      row.totalVolume24h > 0
        ? compactUsd(row.totalVolume24h)
        : "-",
  },
  {
    key: "totalOpenInterest",
    header: "Open Interest",
    type: "numeric",
    accessor: (row) =>
      row.totalOpenInterest > 0
        ? compactUsd(row.totalOpenInterest)
        : "-",
  },
];

/**
 * Card showing top PerpDexs by 24h Volume (live data)
 */
export const TopPerpDexsCard = memo(function TopPerpDexsCard() {
  const router = useRouter();
  const { dexs, isLoading, error } = usePerpDexMarketData();

  const topDexs = useMemo(() => {
    return [...dexs]
      .sort((a, b) => b.totalVolume24h - a.totalVolume24h)
      .slice(0, 5);
  }, [dexs]);

  return (
    <TypedDataTable<PerpDexWithMarketData>
      title="Top perp DEXs"
      subtitle="By 24h volume"
      tag={dexs.length > 0 ? `${dexs.length} DEXs` : undefined}
      data={topDexs}
      columns={COLUMNS}
      getRowKey={(row) => row.name}
      isLoading={isLoading && topDexs.length === 0}
      error={error}
      errorTitle="Failed to load data"
      emptyMessage="No DEXs available"
      emptyDescription="Check back later"
      density="compact"
      onRowClick={(row) => router.push(`/market/perpdex/${row.name}`)}
      className="h-full"
    />
  );
});
