"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { MarketHeader } from "@/components/market/header/MarketHeader";
import { MarketStatsSection } from "@/components/market/stats/MarketStatsSection";
import { TokensSection } from "@/components/market/tokens/TokensSection";
import { getSpotTokens, calculateSpotMarketStats } from "@/services/markets/queries";
import { Token } from "@/services/markets/types";

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
                const data = await getSpotTokens();
                setTokens(data);

                // Calculate market statistics
                const stats = calculateSpotMarketStats(data);
                setMarketStats(stats);
            } catch (error) {
                console.error("Error loading spot tokens:", error);
                setTokens([]);
                setMarketStats({
                    trendingTokens: [],
                    totalMarketCap: 0,
                    totalVolume: 0,
                    totalSpotVolume: 0,
                    totalTokenCount: 0
                });
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
                    totalSpotVolume={marketStats.totalSpotVolume}
                    trendingTokens={marketStats.trendingTokens}
                    totalTokenCount={marketStats.totalTokenCount}
                />
                <TokensSection tokens={tokens} loading={loading} />
            </div>
        </div>
    );
}
