"use client";

import { memo, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Search } from "lucide-react";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { extractPerpDexAssetTicker } from "@/services/market/perpDex/utils";
import type { PerpDexWithMarketData } from "@/services/market/perpDex/types";
import { TypedDataTable, TokenAvatar, type Column } from "@/components/common";
import { formatLargeNumber, formatPrice } from "@/lib/formatters/numberFormatting";
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

const usd = (v: number) =>
  v > 0 ? formatLargeNumber(v, { prefix: "$", decimals: 1, forceDecimals: false }) : "-";

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
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <TokenAvatar assetName={r.coin} size="lg" />
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-text-primary text-[11px] font-medium truncate">{r.ticker}</span>
            <span className="text-text-tertiary text-[10px] truncate">{r.dexName}</span>
          </div>
        </div>
      ),
    },
    {
      key: "markPx",
      header: "Price",
      align: "right",
      accessor: (r) => (
        <span className="mono text-text-secondary">{formatPrice(r.markPx, format)}</span>
      ),
    },
    {
      key: "priceChange24h",
      header: "24h",
      align: "right",
      sortable: true,
      getSortValue: (r) => r.priceChange24h,
      accessor: (r) => (
        <span className={`mono ${r.priceChange24h >= 0 ? "text-success" : "text-danger"}`}>
          {r.priceChange24h >= 0 ? "+" : ""}
          {r.priceChange24h.toFixed(2)}%
        </span>
      ),
    },
    {
      key: "volume24h",
      header: "Volume",
      align: "right",
      sortable: true,
      getSortValue: (r) => r.volume24h,
      accessor: (r) => <span className="mono text-text-secondary">{usd(r.volume24h)}</span>,
    },
    {
      key: "openInterestUsd",
      header: "OI",
      align: "right",
      sortable: true,
      getSortValue: (r) => r.openInterestUsd,
      accessor: (r) => <span className="mono text-text-secondary">{usd(r.openInterestUsd)}</span>,
    },
    {
      key: "basisBps",
      header: "Basis",
      align: "right",
      sortable: true,
      getSortValue: (r) => (r.basisBps == null ? 0 : r.basisBps),
      accessor: (r) =>
        r.basisBps == null ? (
          <span className="text-text-tertiary">-</span>
        ) : (
          <span
            className={`mono ${
              Math.abs(r.basisBps) < 1
                ? "text-text-tertiary"
                : r.basisBps >= 0
                  ? "text-success"
                  : "text-danger"
            }`}
            title="Mark vs oracle premium"
          >
            {r.basisBps >= 0 ? "+" : ""}
            {r.basisBps.toFixed(1)} bps
          </span>
        ),
    },
  ];

  return (
    <TypedDataTable
      title="All HIP-3 markets"
      icon={<Layers size={15} className="text-brand" />}
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
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter market / DEX"
            className="h-7 w-40 rounded-md bg-surface-2 border border-border-subtle pl-7 pr-2 text-[11px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand/50"
          />
        </div>
      }
    />
  );
});
