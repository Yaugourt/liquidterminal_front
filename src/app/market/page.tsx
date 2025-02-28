"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { MarketHeader } from "@/components/market/header/MarketHeader";
import { MarketStatsSection } from "@/components/market/stats/MarketStatsSection";
import { TokensSection } from "@/components/market/tokens/TokensSection";
import { formatNumber } from "@/lib/format";
import { getSpotTokens, calculateSpotMarketStats } from "@/api/markets/queries";
import { Token } from "@/api/markets/types";

// Données mockées pour le développement
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
    const [marketStats, setMarketStats] = useState({
        trendingTokens: [] as Token[],
        totalMarketCap: 0,
        totalVolume: 0,
        totalSpotVolume: 0,
        totalTokenCount: 0
    });

    useEffect(() => {
        setTitle("Market Spot");
    }, [setTitle]);

    useEffect(() => {
        const fetchTokens = async () => {
            try {
                // En développement, on peut utiliser les données mockées ou l'API
                const data = await getSpotTokens();
                setTokens(data);

                // Calculer les statistiques du marché
                const stats = calculateSpotMarketStats(data);
                setMarketStats(stats);
            } catch (error) {
                console.error("Erreur lors du chargement des tokens:", error);
                // En cas d'erreur, utiliser les données mockées
                setTokens(mockTokens);

                // Calculer les statistiques avec les données mockées
                const stats = calculateSpotMarketStats(mockTokens);
                setMarketStats(stats);
            } finally {
                setLoading(false);
            }
        };

        fetchTokens();
    }, []);

    return (
        <div className="min-h-screen">
            <div className="p-4">
                <MarketHeader />
                <MarketStatsSection
                    totalMarketCap={marketStats.totalMarketCap}
                    totalVolume={marketStats.totalVolume}
                    totalSpotVolume={marketStats.totalSpotVolume}
                    trendingTokens={marketStats.trendingTokens}
                    totalTokenCount={marketStats.totalTokenCount}
                />
                <TokensSection tokens={tokens} loading={loading} />
            </div>
        </div>
    );
}
