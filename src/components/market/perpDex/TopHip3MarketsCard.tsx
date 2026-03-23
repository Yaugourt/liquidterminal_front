"use client";

import { memo, useMemo } from "react";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { LineChart, ChevronRight } from "lucide-react";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { TableEmptyState } from "@/components/ui/table-states";
import { extractPerpDexAssetTicker } from "@/services/market/perpDex/utils";
import type { PerpDexWithMarketData } from "@/services/market/perpDex/types";

const HIP3_DOCS_URL =
  "https://hyperliquid.gitbook.io/hyperliquid-docs/technical-docs/hips/hip-3";

/** Matches TopPerpDexsCard column layout */
const headFirst = "pl-3 py-1.5 w-[40%]";
const headMid = "pl-3 py-1.5 w-[30%]";
const headLast = "pl-3 py-1.5 pr-3 w-[30%]";
const cellFirst = "py-1 pl-3";
const cellMid = "py-1 pl-3";
const cellLast = "py-1 pl-3 pr-3";

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

/**
 * Top HIP-3 markets by aggregated 24h volume across all builder DEXs.
 */
export const TopHip3MarketsCard = memo(function TopHip3MarketsCard() {
  const router = useRouter();
  const { dexs, isLoading, error } = usePerpDexMarketData();

  const topMarkets = useMemo(() => {
    return aggregateMarketsAcrossDexs(dexs).slice(0, 5);
  }, [dexs]);

  if (isLoading && !topMarkets.length) {
    return (
      <div className="w-full h-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden flex flex-col">
        <LoadingState message="Loading..." size="md" withCard={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden flex flex-col">
        <ErrorState title="Failed to load data" withCard={false} />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-border-subtle shrink-0">
        <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center shrink-0">
          <LineChart size={12} className="text-brand-accent" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">
            Top markets
          </h3>
          <p className="text-[10px] text-text-muted truncate">
            Aggregated across all builder DEXs
          </p>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-1 min-h-0">
        <Table className="h-full">
          <TableHeader>
            <TableRow className="border-b border-border-subtle hover:bg-transparent">
              <TableHead className={headFirst}>Ticker</TableHead>
              <TableHead className={headMid}>24h Vol</TableHead>
              <TableHead className={headLast}>Open Interest</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topMarkets.length > 0 ? (
              topMarkets.map((row) => (
                <TableRow
                  key={row.ticker}
                  className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  onClick={() =>
                    router.push(`/market/perpdex/${row.primaryDexName}`)
                  }
                >
                  <TableCell className={cellFirst}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-label text-brand-accent shrink-0">
                        {row.ticker.charAt(0)}
                      </div>
                      <span className="text-white text-[11px] font-medium truncate">
                        {row.ticker}
                      </span>
                      <ChevronRight className="h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  </TableCell>
                  <TableCell
                    className={`${cellMid} text-left text-white text-[11px] font-medium`}
                  >
                    {row.totalVolume24h > 0
                      ? formatLargeNumber(row.totalVolume24h, {
                          prefix: "$",
                          decimals: 1,
                          forceDecimals: false,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell
                    className={`${cellLast} text-left text-white text-[11px] font-medium`}
                  >
                    {row.totalOpenInterest > 0
                      ? formatLargeNumber(row.totalOpenInterest, {
                          prefix: "$",
                          decimals: 1,
                          forceDecimals: false,
                        })
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmptyState
                colSpan={3}
                title="No markets"
                description="Check back later"
              />
            )}
          </TableBody>
        </Table>
      </div>

      <div className="shrink-0 px-3 py-2 border-t border-border-subtle">
        <a
          href={HIP3_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-accent text-[11px] hover:text-white transition-colors inline-flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          HIP-3 documentation →
        </a>
      </div>
    </div>
  );
});
