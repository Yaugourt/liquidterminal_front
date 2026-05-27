"use client";

import { memo, useMemo } from "react";
import { LineChart } from "lucide-react";
import {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
} from "@/components/common";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import type { PerpDexWithMarketData } from "@/services/market/perpDex/types";
import { extractPerpDexAssetTicker } from "@/services/market/perpDex/utils";
import { compactUsd } from "@/lib/formatters/numberFormatting";

/**
 * Hip3MarketsPanel — Dashboard card for the HIP-3 ecosystem.
 *
 * Top HIP-3 markets aggregated by 24h volume (`ModuleTable`). The live Perp
 * auction block and the Top Perp DEXs list previously appended here moved
 * to dedicated sibling cards on the row below (`AuctionsPanel market="perp"`
 * + `Hip3TopDeployersCard`) so we don't display the same info twice.
 */

const TOP_MARKETS = 5;

interface Hip3MarketRow {
  ticker: string;
  price: number;
  totalVolume24h: number;
  totalOpenInterest: number;
  /** DEX with the largest volume for this ticker — link target. */
  primaryDexName: string;
}

/** Aggregate markets from all DEXs by ticker, sorted by 24h volume. */
function aggregateMarkets(dexs: PerpDexWithMarketData[]): Hip3MarketRow[] {
  const map = new Map<
    string,
    {
      vol: number;
      oi: number;
      price: number;
      primaryDexName: string;
      primaryDexVol: number;
    }
  >();

  for (const dex of dexs) {
    for (const asset of dex.assetsWithMarketData) {
      if (asset.isDelisted) continue;
      const key = extractPerpDexAssetTicker(asset.name).toUpperCase();
      const v = asset.dayNtlVlm ?? 0;
      const oi = asset.openInterest ?? 0;
      const px = asset.oraclePx ?? 0;

      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          vol: v,
          oi,
          price: px,
          primaryDexName: dex.name,
          primaryDexVol: v,
        });
      } else {
        existing.vol += v;
        existing.oi += oi;
        if (v > existing.primaryDexVol) {
          existing.primaryDexVol = v;
          existing.primaryDexName = dex.name;
          existing.price = px;
        }
      }
    }
  }

  return [...map.entries()]
    .map(([ticker, agg]) => ({
      ticker,
      price: agg.price,
      totalVolume24h: agg.vol,
      totalOpenInterest: agg.oi,
      primaryDexName: agg.primaryDexName,
    }))
    .sort((a, b) => b.totalVolume24h - a.totalVolume24h);
}

/** Readable asset price — decimals adapt to the order of magnitude. */
function fmtAssetPrice(p: number): string {
  if (!Number.isFinite(p) || p <= 0) return "—";
  if (p >= 1000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  return `$${p.toPrecision(3)}`;
}

export const Hip3MarketsPanel = memo(function Hip3MarketsPanel() {
  const { dexs, isLoading } = usePerpDexMarketData();

  const topMarkets = useMemo(
    () => aggregateMarkets(dexs).slice(0, TOP_MARKETS),
    [dexs]
  );

  return (
    <OverviewModule
      title="Top HIP-3 Markets"
      icon={<LineChart size={13} className="text-brand" />}
      tag="by 24h vol"
      viewAllLabel="All perp DEXs"
      href="/market/perpdex"
    >
      {/* Top markets — strict ModuleTable (each row links to its primary DEX) */}
      <ModuleTable
        columns={[
          { header: "Ticker" },
          { header: "Price" },
          { header: "24h Vol" },
          { header: "Open Interest" },
        ]}
      >
        {isLoading && topMarkets.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-4 py-6 text-center text-[11px] text-text-tertiary">
              Loading…
            </td>
          </tr>
        ) : topMarkets.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-4 py-6 text-center text-[11px] text-text-tertiary">
              No HIP-3 markets
            </td>
          </tr>
        ) : (
          topMarkets.map((m) => (
            <ModuleTableRow
              key={m.ticker}
              href={`/market/perpdex/${m.primaryDexName}`}
              cells={[
                <ModuleAsset
                  key="ticker"
                  assetName={`xyz:${m.ticker}`}
                  name={m.ticker}
                />,
                <span key="price" className="mono text-text-primary">
                  {fmtAssetPrice(m.price)}
                </span>,
                <span key="vol" className="mono text-text-primary">
                  {m.totalVolume24h > 0 ? compactUsd(m.totalVolume24h) : "—"}
                </span>,
                <span key="oi" className="mono text-text-primary">
                  {m.totalOpenInterest > 0 ? compactUsd(m.totalOpenInterest) : "—"}
                </span>,
              ]}
            />
          ))
        )}
      </ModuleTable>

    </OverviewModule>
  );
});
