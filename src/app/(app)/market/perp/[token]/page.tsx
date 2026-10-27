"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { TradingLayout } from "@/layouts/TradingLayout";
import { TokenCard, TokenData, OrderBook, RecentTrades } from "@/components/market/token";
import { ChartSkeleton } from "@/components/common";
import { getPerpCoinId } from "@/services/market/token/utils";
import { findPerpMarket, getPerpAssetCtx } from "@/services/market/perp/api";
import { hip3AssetHref, isHip3Coin } from "@/lib/hip3/coin";

// Lazy load TradingViewChart - it uses lightweight-charts which requires DOM
const TradingViewChart = dynamic(
  () => import("@/components/market/token/TradingViewChart").then(mod => ({ default: mod.TradingViewChart })),
  { ssr: false, loading: () => <ChartSkeleton minHeight="min-h-[450px]" /> }
);

// Perp token view model. Stats are optional: when the market is not found in
// the perp directory they stay undefined and the header shows "N/A" instead
// of fake zeros.
interface PerpToken {
  name: string;
  coin: string; // Coin for WebSocket (e.g., "BTC")
  logo: string | null;
  price?: number;
  mark?: number;
  oracle?: number;
  premium?: number;
  change24h?: number;
  volume?: number;
  openInterest?: number;
  funding?: number;
  onlyIsolated: boolean;
}

/** Why the page has no market to show. */
type Missing = "unknown" | "error";

const MISSING_COPY: Record<Missing, { title: string; body: (name: string) => string }> = {
  unknown: {
    title: "Token not found",
    body: (name) => `No perpetual market is named "${name}".`,
  },
  error: {
    title: "Couldn't load this market",
    body: () => "The perp market list didn't load. Try again in a moment.",
  },
};

export default function PerpTokenPage() {
  const router = useRouter();
  const params = useParams();
  const tokenParam = params?.token as string;
  // Parse token from URL (e.g., "BTC", "kPEPE" or "BTC-PERP"). The case is kept
  // for display only: the canonical Hyperliquid name comes from the market.
  const requested = useMemo(() => {
    try {
      return getPerpCoinId(decodeURIComponent(tokenParam ?? "").replace(/-perp$/i, "-PERP"));
    } catch {
      return "";
    }
  }, [tokenParam]);

  const [token, setToken] = useState<PerpToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState<Missing | null>(null);
  /** Bumped by "Retry" to run the lookup again. */
  const [lookupRun, setLookupRun] = useState(0);

  useEffect(() => {
    if (!tokenParam) return;
    // A prefixed HIP-3 coin (xyz:SKHX) has its own route.
    if (isHip3Coin(requested)) {
      router.replace(hip3AssetHref(requested));
      return;
    }
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setMissing(null);

      // Pull the real market stats (change/volume/OI/funding) from the perp
      // directory endpoint, plus mark/oracle/premium from HL asset ctx (keyless).
      // Both match case-insensitively; a failed directory load is told apart
      // from an unknown coin so a backend blip does not read as "not found".
      const [market, ctx] = await Promise.all([
        findPerpMarket(requested).then(
          (found) => ({ found, failed: false }),
          () => ({ found: null, failed: true })
        ),
        getPerpAssetCtx(requested),
      ]);
      if (cancelled) return;

      // Hyperliquid coin names are case-sensitive (kPEPE, not KPEPE): every
      // child (chart, book, trades, live price) must get the canonical one.
      const canonical = market.found?.name ?? (market.failed ? ctx?.name : undefined);
      if (!canonical) {
        setToken(null);
        setMissing(market.failed ? "error" : "unknown");
        setLoading(false);
        return;
      }

      const perpToken: PerpToken = {
        name: `${canonical}-PERP`,
        coin: canonical,
        logo: market.found?.logo ?? null,
        price: market.found?.price, // Refined in real time by the WebSocket
        mark: ctx?.markPx ?? undefined,
        oracle: ctx?.oraclePx ?? undefined,
        premium: ctx?.premium ?? undefined,
        change24h: market.found?.change24h,
        volume: market.found?.volume,
        openInterest: market.found?.openInterest,
        funding: market.found?.funding,
        onlyIsolated: market.found?.onlyIsolated ?? false,
      };

      setToken(perpToken);
      setLoading(false);
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [tokenParam, requested, router, lookupRun]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingState message="Loading..." size="sm" withCard={false} />
      </div>
    );
  }

  if (!token) {
    const reason = missing ?? "unknown";
    const copy = MISSING_COPY[reason];
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="p-6 flex flex-col items-center justify-center">
          <div className="text-xl font-bold text-text-primary mb-4">{copy.title}</div>
          <div className="text-text-secondary mb-6 text-center">{copy.body(requested)}</div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {reason === "error" && (
              <Button variant="outline" onClick={() => setLookupRun((run) => run + 1)}>
                Retry
              </Button>
            )}
            <Button
              onClick={() => router.push("/market/perp")}
              className="bg-brand hover:bg-brand/90 text-brand-text-on font-bold"
            >
              Back to perps list
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Build TokenData for shared components
  const tokenData: TokenData = {
    symbol: token.name,
    name: token.name,
    type: 'perpetual',
    price: token.price,
    mark: token.mark,
    oracle: token.oracle,
    premium: token.premium,
    change24h: token.change24h,
    volume24h: token.volume,
    openInterest: token.openInterest,
    fundingRate: token.funding,
    logo: token.logo,
  };

  // Get the coin ID for WebSocket connections
  const coinId = token.coin;

  return (
    <TradingLayout
      marketType="perp"
      tokenName={token.name}
      tokenInfoSlot={
        <TokenCard
          token={tokenData}
          className="mb-6"
          perpCoinId={coinId} // Pass coinId for real-time price updates
        />
      }
      chartSlot={
        <TradingViewChart
          symbol={token.name}
          coinId={coinId} // Use coinId directly for perpetuals
          tokenName={token.name}
          className="flex-1 min-h-[450px]"
        />
      }
      orderBookSlot={
        <OrderBook
          symbol={token.name}
          perpCoinId={coinId} // Use perpCoinId for WebSocket
          tokenNameProp={token.name}
        />
      }
      bottomSectionSlot={
        <RecentTrades
          coinId={coinId}
          tokenName={token.name}
          className="min-h-[300px]"
        />
      }
    />
  );
}