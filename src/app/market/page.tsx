"use client";

import { useEffect, useState, useCallback } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { MarketHeader } from "@/components/market/header/MarketHeader";
import { MarketStatsSection } from "@/components/market/stats/MarketStatsSection";
import { TokensSection } from "@/components/market/tokens/TokensSection";
import { getSpotTokens, calculateSpotMarketStats } from "@/services/markets/queries";
import { Token } from "@/services/markets/types";

// Type pour les statistiques du marché
interface MarketStats {
    trendingTokens: Token[];
    totalMarketCap: number;
    totalVolume: number;
    totalSpotVolume: number;
    totalTokenCount: number;
}

// État initial des statistiques du marché
const initialMarketStats: MarketStats = {
    trendingTokens: [],
    totalMarketCap: 0,
    totalVolume: 0,
    totalSpotVolume: 0,
    totalTokenCount: 0
};

export default function Market() {
    const { setTitle } = usePageTitle();
    const [tokens, setTokens] = useState<Token[]>([]);
    const [loading, setLoading] = useState(true);
    const [marketStats, setMarketStats] = useState<MarketStats>(initialMarketStats);

    // Définir le titre de la page
    useEffect(() => {
        setTitle("Market Spot");
    }, [setTitle]);

    // Fonction pour récupérer les données des tokens
    const fetchTokens = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getSpotTokens();
            setTokens(data);

            // Calculer les statistiques du marché
            const stats = calculateSpotMarketStats(data);
            setMarketStats(stats);
        } catch (error) {
            console.error("Error loading spot tokens:", error);
            setTokens([]);
            setMarketStats(initialMarketStats);
        } finally {
            setLoading(false);
        }
    }, []);

    // Récupérer les données au chargement de la page
    useEffect(() => {
        fetchTokens();
        
        // Optionnel : Rafraîchir les données toutes les X minutes
        // const refreshInterval = setInterval(fetchTokens, 5 * 60 * 1000); // 5 minutes
        // return () => clearInterval(refreshInterval);
    }, [fetchTokens]);

    return (
        <div className="min-h-screen">
            <div className="p-4">
                <MarketHeader />
                <MarketStatsSection
                    totalMarketCap={marketStats.totalMarketCap}
                    totalSpotVolume={marketStats.totalSpotVolume}
                    trendingTokens={marketStats.trendingTokens}
                    totalTokenCount={marketStats.totalTokenCount}
                />
                <TokensSection tokens={tokens} loading={loading} />
            </div>
        </div>
    );
}
