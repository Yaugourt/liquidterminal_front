"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { MarketHeader } from "@/components/market/header/MarketHeader";
import { MarketStatsSection } from "@/components/market/stats/MarketStatsSection";
import { TokensSection } from "@/components/market/tokens/TokensSection";

interface Token {
  name: string;
  logo: string | null;
  price: number;
  marketCap: number;
  volume: number;
  change24h: number;
  liquidity: number;
  supply: number;
}

const mockTokens: Token[] = [
  {
    name: "HYPE",
    logo: null,
    price: 19.138,
    marketCap: 8391582485,
    volume: 256258456,
    change24h: -10,
    liquidity: 1000000,
    supply: 32654987,
  },
  {
    name: "VAPOR",
    logo: null,
    price: 22.7,
    marketCap: 5391582485,
    volume: 156258456,
    change24h: -12.58,
    liquidity: 800000,
    supply: 25654987,
  },
  {
    name: "FLY",
    logo: null,
    price: 22.7,
    marketCap: 4391582485,
    volume: 126258456,
    change24h: 15.85,
    liquidity: 600000,
    supply: 18654987,
  },
];

export default function Market() {
  const { setTitle } = usePageTitle();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTitle("Market Spot");
  }, [setTitle]);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        // En développement, utiliser les données mockées
        if (process.env.NODE_ENV === "development") {
          setTokens(mockTokens);
          return;
        }

        const response = await fetch("http://localhost:3001/api/markets");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setTokens(data);
      } catch (error) {
        console.error("Erreur lors du chargement des tokens:", error);
        // En cas d'erreur, utiliser les données mockées
        setTokens(mockTokens);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  const trendingTokens = tokens.slice(0, 4);
  const totalMarketCap = tokens.reduce(
    (sum, token) => sum + token.marketCap,
    0
  );
  const totalVolume = tokens.reduce((sum, token) => sum + token.volume, 0);
  const totalSpotVolume = tokens.reduce(
    (sum, token) => sum + (token.volume || 0),
    0
  );

  return (
    <div className="min-h-screen">
      <div className="p-4">
        <MarketHeader />
        <MarketStatsSection
          totalMarketCap={totalMarketCap}
          totalVolume={totalVolume}
          totalSpotVolume={totalSpotVolume}
          trendingTokens={trendingTokens}
        />
        <TokensSection tokens={tokens} loading={loading} />
      </div>
    </div>
  );
}
