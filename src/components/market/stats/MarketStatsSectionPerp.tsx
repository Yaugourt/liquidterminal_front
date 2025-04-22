import { useState, useEffect } from "react";
import { MarketStatsCard } from "../MarketStatsCard";
import { formatNumber } from "@/lib/format";
import { fetchPerpGlobalStats, PerpGlobalStats } from "@/services/markets/api";

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
}

interface MarketStatsSectionPerpProps {
  trendingTokens: PerpToken[];
  totalMarketCap?: number;
  totalVolume?: number;
  totalPerpVolume?: number;
  totalTokenCount?: number;
}

export function MarketStatsSectionPerp({
  trendingTokens,
}: MarketStatsSectionPerpProps) {
  const [globalStats, setGlobalStats] = useState<PerpGlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGlobalStats = async () => {
      try {
        const stats = await fetchPerpGlobalStats();
        setGlobalStats(stats);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques globales:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGlobalStats();
  }, []);

  // Fonction pour formater les nombres sans décimales
  const formatWholeNumber = (value: number): string => {
    return Math.round(value).toLocaleString('en-US');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 md:my-8">
      <MarketStatsCard title="Market Cap" isLoading={loading}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          <div>
            <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total Open Interest:</p>
            <p className="text-white text-sm sm:text-base">
              ${globalStats ? formatWholeNumber(globalStats.totalOpenInterest) : '-'}
            </p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-xs sm:text-sm">24h Volume:</p>
            <p className="text-white text-sm sm:text-base">
              ${globalStats ? formatWholeNumber(globalStats.totalVolume24h) : '-'}
            </p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total Pairs:</p>
            <p className="text-white text-sm sm:text-base">
              {globalStats ? globalStats.totalPairs : '-'}
            </p>
          </div>
        </div>
      </MarketStatsCard>

      <MarketStatsCard title="Top Volume Tokens">
        <div className="space-y-2 sm:space-y-3">
          {trendingTokens.map((token) => (
            <div key={token.name} className="grid grid-cols-12 items-center gap-1 sm:gap-2">
              <span className="text-white col-span-5 truncate text-xs sm:text-sm">{token.name}</span>
              <span className="text-white col-span-4 text-right text-xs sm:text-sm">${formatNumber(token.price)}</span>
              <span className={`col-span-3 text-right text-xs sm:text-sm ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {token.change24h >= 0 ? '+' : ''}{token.change24h}%
              </span>
            </div>
          ))}
        </div>
      </MarketStatsCard>
    </div>
  );
} 