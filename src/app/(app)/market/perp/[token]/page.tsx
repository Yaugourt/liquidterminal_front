"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { TradingLayout } from "@/layouts/TradingLayout";
import { TokenCard, TokenData, OrderBook, TokenInfoSidebar, RecentTrades } from "@/components/market/token";
import { ChartSkeleton } from "@/components/common/charts/ChartSkeleton";
import { getPerpCoinId } from "@/services/market/token/utils";

// Lazy load TradingViewChart - it uses lightweight-charts which requires DOM
const TradingViewChart = dynamic(
  () => import("@/components/market/token/TradingViewChart").then(mod => ({ default: mod.TradingViewChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

// Type pour les tokens perp
interface PerpToken {
  name: string;
  coin: string; // Coin for WebSocket (e.g., "BTC")
  logo: string | null;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  openInterest: number;
  funding: number;
  maxLeverage: number;
  onlyIsolated: boolean;
}

export default function PerpTokenPage() {
  const router = useRouter();
  const params = useParams();
  const tokenParam = params?.token as string;

  const [token, setToken] = useState<PerpToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenParam) return;

    const loadData = () => {
      setLoading(true);

      // Parse token from URL (e.g., "BTC" or "BTC-PERP")
      const coinId = getPerpCoinId(tokenParam.toUpperCase());

      // For now, create token data from URL param
      // TODO: Replace with real API call to get perpetual metadata
      const perpToken: PerpToken = {
        name: `${coinId}-PERP`,
        coin: coinId,
        logo: null,
        price: 0, // Will be filled by WebSocket
        change24h: 0,
        volume: 0,
        marketCap: 0,
        openInterest: 0,
        funding: 0,
        maxLeverage: 100,
        onlyIsolated: false,
      };

      setToken(perpToken);
      setLoading(false);
    };

    loadData();
  }, [tokenParam]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand-accent mb-2" />
          <span className="text-zinc-500 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-xl shadow-black/20 flex flex-col items-center justify-center">
          <div className="text-xl font-bold text-white mb-4">Token not found</div>
          <Button onClick={() => router.back()} className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-bold">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Build TokenData for shared components
  const tokenData: TokenData = {
    symbol: token.name,
    name: token.name,
    type: 'perpetual',
    price: token.price,
    change24h: token.change24h,
    volume24h: token.volume,
    marketCap: token.marketCap,
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
      infoSidebarSlot={
        <TokenInfoSidebar
          token={tokenData}
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