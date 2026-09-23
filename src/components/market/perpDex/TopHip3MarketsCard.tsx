"use client";

import { memo, useMemo } from "react";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { TypedDataTable, ModuleAsset, type Column } from "@/components/common";
import { useRouter } from "next/navigation";
import { extractPerpDexAssetTicker } from "@/services/market/perpDex/utils";
import type { PerpDexWithMarketData } from "@/services/market/perpDex/types";

const HIP3_DOCS_URL =
  "https://hyperliquid.gitbook.io/hyperliquid-docs/technical-docs/hips/hip-3";

interface AggregatedHip3MarketRow {
  ticker: string;
  totalVolume24h: number;
  totalOpenInterest: number;
  /** DEX with highest 24h volume for this ticker (for deep link) */
  primaryDexName: string;
}

function aggregateMarketsAcrossDexs(
  dexs: PerpDexWithMarketData[]
): AggregatedHip3MarketRow[] {
  const map = new Map<
    string,
    {
      vol: number;
      oi: number;
      primaryDexName: string;
      primaryDexVol: number;
    }
  >();

  for (const dex of dexs) {
    for (const asset of dex.assetsWithMarketData) {
      if (asset.isDelisted) continue;
      const rawTicker = extractPerpDexAssetTicker(asset.name);
      const key = rawTicker.toUpperCase();
      const v = asset.dayNtlVlm ?? 0;
      const oi = asset.openInterest ?? 0;

      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          vol: v,
          oi,
          primaryDexName: dex.name,
          primaryDexVol: v,
        });
      } else {
        existing.vol += v;
        existing.oi += oi;
        if (v > existing.primaryDexVol) {
          existing.primaryDexVol = v;
          existing.primaryDexName = dex.name;
        }
      }
    }
  }

  return [...map.entries()]
    .map(([ticker, agg]) => ({
      ticker,
      totalVolume24h: agg.vol,
      totalOpenInterest: agg.oi,
      primaryDexName: agg.primaryDexName,
    }))
    .sort((a, b) => b.totalVolume24h - a.totalVolume24h);
}

const COLUMNS: Column<AggregatedHip3MarketRow>[] = [
  {
    key: "ticker",
    header: "Ticker",
    accessor: (row) => <ModuleAsset assetName={`xyz:${row.ticker}`} name={row.ticker} />,
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
 * Top HIP-3 markets by aggregated 24h volume across all builder DEXs.
 */
export const TopHip3MarketsCard = memo(function TopHip3MarketsCard() {
  const router = useRouter();
  const { dexs, isLoading, error } = usePerpDexMarketData();

  const allMarkets = useMemo(() => aggregateMarketsAcrossDexs(dexs), [dexs]);
  const topMarkets = useMemo(() => allMarkets.slice(0, 5), [allMarkets]);

  return (
    <TypedDataTable<AggregatedHip3MarketRow>
      title="Top HIP-3 markets"
      subtitle="Aggregated across all builder DEXs"
      tag={allMarkets.length > 0 ? `${allMarkets.length} markets` : undefined}
      viewAllHref={HIP3_DOCS_URL}
      viewAllLabel="HIP-3 docs"
      data={topMarkets}
      columns={COLUMNS}
      getRowKey={(row) => row.ticker}
      isLoading={isLoading && topMarkets.length === 0}
      error={error}
      errorTitle="Failed to load data"
      emptyMessage="No markets"
      emptyDescription="Check back later"
      density="compact"
      onRowClick={(row) => router.push(`/market/perpdex/${row.primaryDexName}`)}
      className="h-full"
    />
  );
});
