"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Database } from "lucide-react";
import { TradingLayout } from "@/components/market/layout/TradingLayout";
import { GlassPanel } from "@/components/ui/glass-panel";
import { TokenCard, TokenData, TradingViewChart, OrderBook, TokenInfoSidebar } from "@/components/market/token";

// Type pour les tokens perp
interface PerpToken {
  name: string;
  logo: string | null;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  openInterest: number;
  funding: number;
  maxLeverage: number;
  onlyIsolated: boolean;
  marketIndex?: number; // Added for compatibility
}

// Données mockées pour le token perp
// Note: On utilise un marketIndex arbitraire pour la démo, à remplacer par l'API réelle
const mockPerpToken: PerpToken = {
  name: "BTC-PERP",
  logo: null,
  price: 65000,
  change24h: 2.5,
  volume: 25000000000,
  marketCap: 1250000000000,
  openInterest: 15000000000,
  funding: 0.01,
  maxLeverage: 100,
  onlyIsolated: false,
  marketIndex: 0 // BTC usually
};

export default function PerpTokenPage() {
  const router = useRouter();
  const [token, setToken] = useState<PerpToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données
    const loadData = () => {
      setLoading(true);

      // Simuler un délai de chargement
      setTimeout(() => {
        setToken(mockPerpToken);
        setLoading(false);
      }, 1000);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0E14] text-zinc-100">
        <div className="flex flex-col items-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF] mb-2" />
          <span className="text-zinc-500 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter flex items-center justify-center">
        <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-xl shadow-black/20 flex flex-col items-center justify-center">
          <div className="text-xl font-bold text-white mb-4">Token not found</div>
          <Button onClick={() => router.back()} className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-bold">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Pour le moment on utilise le composant TokenData commun, en adaptant les champs manquants
  const tokenData: TokenData = {
    symbol: token.name,
    name: token.name,
    type: 'perpetual',
    price: token.price,
    change24h: token.change24h,
    volume24h: token.volume,
    marketCap: token.marketCap,
    marketIndex: token.marketIndex,
    logo: token.logo,
    // Champs spécifiques Perp mappés ou ignorés par TokenInfoSidebar pour l'instant
  };

  return (
    <TradingLayout
      marketType="perp"
      tokenName={token.name}
      tokenInfoSlot={
        <TokenCard
          token={tokenData}
          className="mb-6"
        />
      }
      chartSlot={
        <TradingViewChart
          symbol={token.name}
          marketIndex={token.marketIndex}
          tokenName={token.name}
          className="flex-1 min-h-[450px]"
        />
      }
      orderBookSlot={
        <OrderBook
          symbol={token.name}
          marketIndex={token.marketIndex}
          tokenNameProp={token.name}
        />
      }
      infoSidebarSlot={
        <TokenInfoSidebar
          token={tokenData}
        />
      }
      bottomSectionSlot={
        <GlassPanel className="p-8 flex flex-col items-center justify-center min-h-[200px] text-zinc-500">
          <Database className="w-12 h-12 mb-4 text-[#83E9FF]/20" />
          <p>Recent Trades & Funding History coming soon for Perp</p>
        </GlassPanel>
      }
    />
  );
}