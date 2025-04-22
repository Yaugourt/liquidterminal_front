"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { MarketHeader } from "@/components/market/header/MarketHeader";
import { MarketStatsSectionPerp } from "@/components/market/stats/MarketStatsSectionPerp";
import { PerpTokensSection } from "@/components/market/tokens/PerpTokensSection";
import { fetchPerpTokens } from "@/services/markets/api";
import { PerpToken } from "@/services/markets/types";

// Fonction pour calculer les statistiques du marché perp
function calculatePerpMarketStats(tokens: PerpToken[]) {
  // Trier les tokens par volume (du plus grand au plus petit) et prendre les 4 premiers
  const trendingTokens = [...tokens]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 4);

  const totalMarketCap = tokens.reduce(
    (sum, token) => sum + (token.price * token.openInterest),
    0
  );
  const totalVolume = tokens.reduce(
    (sum, token) => sum + token.volume,
    0
  );
  const totalPerpVolume = tokens.reduce(
    (sum, token) => sum + token.volume,
    0
  );
  const totalTokenCount = tokens.length;

  return {
    trendingTokens,
    totalMarketCap,
    totalVolume,
    totalPerpVolume,
    totalTokenCount
  };
}

export default function MarketPerp() {
  const { setTitle } = usePageTitle();
  const [tokens, setTokens] = useState<PerpToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketStats, setMarketStats] = useState({
    trendingTokens: [] as PerpToken[],
    totalMarketCap: 0,
    totalVolume: 0,
    totalPerpVolume: 0,
    totalTokenCount: 0
  });

  useEffect(() => {
    setTitle("Market Perp");
  }, [setTitle]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        const data = await fetchPerpTokens();
        setTokens(data);
        
        // Calculer les statistiques du marché
        const stats = calculatePerpMarketStats(data);
        setMarketStats(stats);
      } catch (error) {
        console.error("Erreur lors du chargement des données perp:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="p-4">
        <MarketHeader />
        <MarketStatsSectionPerp
          trendingTokens={marketStats.trendingTokens}
        />
        <PerpTokensSection tokens={tokens} loading={loading} />
      </div>
    </div>
  );
} 