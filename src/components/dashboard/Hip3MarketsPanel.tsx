"use client";

import { memo, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LineChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TypedDataTable, type Column } from "@/components/common";
import { usePerpDexMarketData, usePastAuctionsPerp } from "@/services/market/perpDex/hooks";
import { usePerpAuctionTiming } from "@/services/market/auction";
import { extractPerpDexAssetTicker } from "@/services/market/perpDex/utils";
import type { PerpDexWithMarketData } from "@/services/market/perpDex/types";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/**
 * Hip3MarketsPanel — carte Dashboard de l'écosystème HIP-3 :
 *  - Top marchés agrégés par volume 24h — même table (`TypedDataTable`) que
 *    les cartes Trending ;
 *  - bloc compact de l'auction Perp (2 lignes) ;
 *  - Top Perp DEXs builder (volume / OI).
 */

const TOP_MARKETS = 5;
const TOP_DEXS = 4;

interface Hip3MarketRow {
  ticker: string;
  price: number;
  totalVolume24h: number;
  totalOpenInterest: number;
  /** DEX au plus gros volume pour ce ticker — cible du lien. */
  primaryDexName: string;
}

/** Agrège les marchés de tous les DEXs par ticker, triés par volume 24h. */
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

/** Prix d'asset lisible — décimales adaptées à l'ordre de grandeur. */
function fmtAssetPrice(p: number): string {
  if (!Number.isFinite(p) || p <= 0) return "—";
  if (p >= 1000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  return `$${p.toPrecision(3)}`;
}

/** Montant de gas compact : "12.4K" / "1.20M" / "9". */
function compactGas(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n >= 1 ? n.toFixed(0) : n.toFixed(2);
}

/** Âge compact relatif : "12s" / "4m" / "2h" / "1d". */
function timeAgo(ms: number): string {
  const diff = Math.max(0, Date.now() - ms);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

/** Cellule "Ticker" — pastille initiale + nom, comme la cellule Token des tables Trending. */
function TickerCell({ ticker }: { ticker: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="w-6 h-6 rounded-md bg-brand/10 text-brand grid place-items-center text-[10px] font-bold shrink-0">
        {ticker.charAt(0)}
      </span>
      <span className="font-medium text-text-primary truncate">{ticker}</span>
    </div>
  );
}

/** Bloc compact de l'auction de déploiement Perp HIP-3. */
function PerpAuctionMini() {
  const { auctionState } = usePerpAuctionTiming();
  const { auctions: perpDeploys } = usePastAuctionsPerp();
  const { format } = useNumberFormat();
  const pct = Math.min(100, Math.max(0, Math.round(auctionState.progressPercentage)));

  /** Les 2 derniers déploiements perp. */
  const deploys = useMemo(
    () =>
      [...perpDeploys]
        .sort((a, b) => b.time.getTime() - a.time.getTime())
        .slice(0, 2),
    [perpDeploys]
  );

  return (
    <div className="border-t border-border-subtle px-3.5 py-2.5 bg-gradient-to-b from-brand/[0.04] to-transparent">
      {/* ligne 1 — label + statut */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-brand/10 text-brand">
          Perp Auction
        </span>
        <span className="text-[10px] text-text-tertiary">HIP-3 deployment</span>
        <span className="ml-auto text-right">
          <span
            className={`mono text-[11px] font-semibold ${
              auctionState.isActive ? "text-gold" : "text-text-secondary"
            }`}
          >
            {auctionState.isActive
              ? auctionState.timeRemaining
              : auctionState.nextAuctionStart}
          </span>
          <span className="text-[8px] uppercase tracking-[0.06em] text-text-tertiary ml-1.5">
            {auctionState.isActive ? "left" : "to open"}
          </span>
        </span>
      </div>

      {/* ligne 2 — prix courant + équivalent USD */}
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <span className="mono text-[16px] font-semibold tracking-[-0.02em] leading-none text-text-primary">
          {formatNumber(auctionState.currentPrice, format, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          <span className="text-[10px] text-text-tertiary font-normal">USDC</span>
        </span>
        <span className="mono text-[10px] text-text-tertiary">
          ≈ {compactUsd(auctionState.currentPriceUSD)}
        </span>
      </div>

      {/* ligne 3 — barre de progression */}
      <div className="flex items-center gap-2">
        <span className="flex-1 h-1.5 rounded bg-base border border-border-default overflow-hidden">
          <i
            className="block h-full rounded bg-gradient-to-r from-brand-deep to-brand"
            style={{ width: `${pct}%` }}
          />
        </span>
        <span className="mono text-[9px] text-text-tertiary shrink-0">{pct}%</span>
      </div>

      {/* Last deploys — 2 derniers déploiements perp, sous la barre */}
      <div className="mt-2 pt-2 border-t border-border-subtle">
        <div className="text-[9px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-1">
          Last deploys
        </div>
        {deploys.length === 0 ? (
          <div className="text-[10px] text-text-tertiary py-0.5">No recent deploys</div>
        ) : (
          deploys.map((d) => (
            <div key={d.hash} className="flex items-center gap-2 py-1 text-[11px]">
              <span className="w-5 h-5 rounded bg-surface-2 grid place-items-center text-[8px] font-bold text-text-secondary shrink-0">
                {d.symbol.slice(0, 2).toUpperCase()}
              </span>
              <span className="font-medium text-text-primary truncate">
                {d.symbol}
              </span>
              <span className="mono text-text-secondary ml-auto whitespace-nowrap">
                {d.maxGas != null ? `${compactGas(d.maxGas)} HYPE` : "—"}
              </span>
              <span className="mono text-[9px] text-text-tertiary whitespace-nowrap">
                {timeAgo(d.time.getTime())}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export const Hip3MarketsPanel = memo(function Hip3MarketsPanel() {
  const router = useRouter();
  const { dexs, isLoading, error } = usePerpDexMarketData();

  const topMarkets = useMemo(
    () => aggregateMarkets(dexs).slice(0, TOP_MARKETS),
    [dexs]
  );

  const topDexs = useMemo(
    () =>
      [...dexs]
        .sort((a, b) => b.totalVolume24h - a.totalVolume24h)
        .slice(0, TOP_DEXS),
    [dexs]
  );

  const columns: Column<Hip3MarketRow>[] = useMemo(
    () => [
      {
        key: "ticker",
        header: "Ticker",
        accessor: (m) => <TickerCell ticker={m.ticker} />,
      },
      {
        key: "price",
        header: "Price",
        type: "numeric",
        accessor: (m) => fmtAssetPrice(m.price),
      },
      {
        key: "volume",
        header: "24h Vol",
        type: "numeric",
        accessor: (m) =>
          m.totalVolume24h > 0 ? compactUsd(m.totalVolume24h) : "—",
      },
      {
        key: "openInterest",
        header: "Open Interest",
        type: "numeric",
        accessor: (m) =>
          m.totalOpenInterest > 0 ? compactUsd(m.totalOpenInterest) : "—",
      },
    ],
    []
  );

  const handleRowClick = useCallback(
    (m: Hip3MarketRow) => router.push(`/market/perpdex/${m.primaryDexName}`),
    [router]
  );

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* card-head V4 */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <LineChart size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">
          Top HIP-3 Markets
        </h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          by 24h vol
        </span>
      </div>

      {/* Table marchés — même composant que les tables Trending */}
      <TypedDataTable<Hip3MarketRow>
        columns={columns}
        data={topMarkets}
        getRowKey={(m) => m.ticker}
        isLoading={isLoading}
        error={error}
        emptyMessage="No HIP-3 markets"
        emptyDescription=""
        density="compact"
        onRowClick={handleRowClick}
        rowMotion
      />

      {/* Bas de carte : auction Perp (2 lignes) + Top Perp DEXs */}
      <div className="mt-auto">
        <PerpAuctionMini />

        <div className="border-t border-border-subtle">
          <div className="px-3.5 pt-2.5 pb-1.5 text-[10px] uppercase tracking-[0.08em] text-text-tertiary font-semibold">
            Top Perp DEXs
          </div>
          {topDexs.length === 0 ? (
            <div className="px-3.5 pb-2.5 text-[11px] text-text-tertiary">
              {isLoading ? "Loading…" : "No perp DEXs"}
            </div>
          ) : (
            topDexs.map((dex, i) => (
              <button
                key={dex.name}
                onClick={() => router.push(`/market/perpdex/${dex.name}`)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 border-b border-border-subtle last:border-b-0 hover:bg-surface-2 transition-colors text-left"
              >
                <span className="mono w-5 shrink-0 text-[11px] font-semibold text-text-tertiary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="w-6 h-6 shrink-0 rounded-md bg-brand/10 text-brand grid place-items-center text-[9px] font-bold">
                  {dex.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-text-primary truncate">
                    {dex.fullName}
                  </div>
                  <div className="text-[10px] text-text-tertiary">
                    {dex.totalAssets} markets
                  </div>
                </div>
                <div className="ml-auto flex shrink-0 gap-4">
                  <div className="text-right">
                    <div className="mono text-[12px] font-semibold text-text-primary">
                      {compactUsd(dex.totalVolume24h)}
                    </div>
                    <div className="text-[9px] uppercase tracking-wide text-text-tertiary">
                      Vol
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mono text-[12px] font-semibold text-text-primary">
                      {compactUsd(dex.totalOpenInterest)}
                    </div>
                    <div className="text-[9px] uppercase tracking-wide text-text-tertiary">
                      OI
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </Card>
  );
});
