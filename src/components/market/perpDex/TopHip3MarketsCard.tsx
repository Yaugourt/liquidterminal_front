"use client";

import { memo, useMemo } from "react";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { LineChart, ChevronRight } from "lucide-react";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { TypedDataTable, type Column } from "@/components/common";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
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
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand/20 to-gold/20 flex items-center justify-center text-label text-brand shrink-0">
          {row.ticker.charAt(0)}
        </div>
        <span className="text-text-primary text-[11px] font-medium truncate">
          {row.ticker}
        </span>
        <ChevronRight className="h-3 w-3 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>
    ),
  },
  {
    key: "totalVolume24h",
    header: "24h Vol",
    type: "fees",
    accessor: (row) =>
      row.totalVolume24h > 0
        ? formatLargeNumber(row.totalVolume24h, { prefix: "$", decimals: 1, forceDecimals: false })
        : "-",
  },
  {
    key: "totalOpenInterest",
    header: "Open Interest",
    type: "numeric",
    accessor: (row) =>
      row.totalOpenInterest > 0
        ? formatLargeNumber(row.totalOpenInterest, { prefix: "$", decimals: 1, forceDecimals: false })
        : "-",
  },
];

/**
 * Top HIP-3 markets by aggregated 24h volume across all builder DEXs.
 */
export const TopHip3MarketsCard = memo(function TopHip3MarketsCard() {
  const router = useRouter();
  const { dexs, isLoading, error } = usePerpDexMarketData();

  const topMarkets = useMemo(() => {
    return aggregateMarketsAcrossDexs(dexs).slice(0, 5);
  }, [dexs]);

  return (
    <Card className="w-full h-full overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-border-subtle shrink-0">
        <div className="w-6 h-6 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
          <LineChart size={12} className="text-brand" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[10px] font-normal uppercase tracking-wide text-text-secondary">
            Top markets
          </h3>
          <p className="text-[9px] text-text-tertiary truncate font-normal normal-case tracking-normal">
            Aggregated across all builder DEXs
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <TypedDataTable<AggregatedHip3MarketRow>
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
          rowClassName="group"
        />
      </div>

      <div className="shrink-0 px-3 py-2 border-t border-border-subtle">
        <a
          href={HIP3_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand text-[11px] hover:text-text-primary transition-colors inline-flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          HIP-3 documentation →
        </a>
      </div>
    </Card>
  );
});
