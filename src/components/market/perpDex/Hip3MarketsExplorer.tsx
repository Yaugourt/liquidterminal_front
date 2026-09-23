"use client";

import { memo, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { extractPerpDexAssetTicker } from "@/services/market/perpDex/utils";
import type { PerpDexWithMarketData } from "@/services/market/perpDex/types";
import {
  TypedDataTable,
  ModuleAsset,
  TableSearch,
  formatPriceChange,
  type Column,
} from "@/components/common";
import { compactUsd, formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/** One HIP-3 market flattened across every builder DEX. */
interface Hip3MarketRow {
  /** Full asset name, e.g. "xyz:AAPL" (unique across DEXs). */
  coin: string;
  ticker: string;
  dexName: string;
  markPx: number;
  oraclePx: number | null;
  priceChange24h: number;
  volume24h: number;
  /** Open interest in USD (the WS service already multiplies size by mark). */
  openInterestUsd: number;
  /** Mark-vs-oracle premium in basis points, or null when no oracle price. */
  basisBps: number | null;
}

function flattenMarkets(dexs: PerpDexWithMarketData[]): Hip3MarketRow[] {
  const rows: Hip3MarketRow[] = [];
  for (const dex of dexs) {
    for (const asset of dex.assetsWithMarketData) {
      if (asset.isDelisted) continue;
      const markPx = asset.markPx ?? 0;
      const oraclePx = asset.oraclePx && asset.oraclePx > 0 ? asset.oraclePx : null;
      rows.push({
        coin: asset.name,
        ticker: extractPerpDexAssetTicker(asset.name),
        dexName: dex.name,
        markPx,
        oraclePx,
        priceChange24h: asset.priceChange24h ?? 0,
        volume24h: asset.dayNtlVlm ?? 0,
        openInterestUsd: asset.openInterest ?? 0,
        basisBps: oraclePx ? ((markPx - oraclePx) / oraclePx) * 10_000 : null,
      });
    }
  }
  return rows;
}

const usd = (v: number) => (v > 0 ? compactUsd(v) : "-");

/**
 * Ecosystem-wide HIP-3 markets explorer: every builder-deployed market across
 * all DEXs in one sortable table. Beyond price/volume/OI it surfaces the
 * mark-vs-oracle basis, the HIP-3-specific signal of how rich or cheap a
 * builder market trades against its own oracle. Live via the shared perp-DEX
 * WebSocket store (no extra fetch).
 */
export const Hip3MarketsExplorer = memo(function Hip3MarketsExplorer() {
  const router = useRouter();
  const { dexs, isLoading, error } = usePerpDexMarketData();
  const { format } = useNumberFormat();
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const all = flattenMarkets(dexs);
    const q = query.trim().toUpperCase();
    if (!q) return all;
    return all.filter(
      (r) => r.ticker.toUpperCase().includes(q) || r.dexName.toUpperCase().includes(q)
    );
  }, [dexs, query]);

  const columns: Column<Hip3MarketRow>[] = [
    {
      key: "market",
      header: "Market",
      accessor: (r) => <ModuleAsset assetName={r.coin} name={r.ticker} sub={r.dexName} />,
    },
    {
      key: "markPx",
      header: "Price",
      type: "numeric",
      accessor: (r) => formatPrice(r.markPx, format),
    },
    {
      key: "priceChange24h",
      header: "24h",
      type: "change",
      sortable: true,
      getSortValue: (r) => r.priceChange24h,
      accessor: (r) => formatPriceChange(r.priceChange24h),
    },
    {
      key: "volume24h",
      header: "Volume",
      type: "numeric",
      sortable: true,
      getSortValue: (r) => r.volume24h,
      accessor: (r) => usd(r.volume24h),
    },
    {
      key: "openInterestUsd",
      header: "OI",
      type: "numeric",
      sortable: true,
      getSortValue: (r) => r.openInterestUsd,
      accessor: (r) => usd(r.openInterestUsd),
    },
    {
      // Mark-vs-oracle premium; sub-1bp noise reads as flat.
      key: "basisBps",
      header: "Basis",
      type: "change",
      sortable: true,
      getSortValue: (r) => (r.basisBps == null ? 0 : r.basisBps),
      tone: (r) => (r.basisBps == null || Math.abs(r.basisBps) < 1 ? "muted" : undefined),
      accessor: (r) =>
        r.basisBps == null ? "-" : `${r.basisBps >= 0 ? "+" : ""}${r.basisBps.toFixed(1)} bps`,
    },
  ];

  return (
    <TypedDataTable
      title="All HIP-3 markets"
      subtitle="Every builder-deployed market, with mark-vs-oracle basis"
      columns={columns}
      data={rows}
      getRowKey={(r) => r.coin}
      initialSort={{ field: "volume24h", direction: "desc" }}
      paginate
      isLoading={isLoading && rows.length === 0}
      error={error}
      errorTitle="Failed to load markets"
      emptyMessage="No markets"
      onRowClick={(r) => router.push(`/market/perpdex/${r.dexName}`)}
      toolbar={
        <TableSearch value={query} onChange={setQuery} placeholder="Filter market / DEX" />
      }
    />
  );
});
