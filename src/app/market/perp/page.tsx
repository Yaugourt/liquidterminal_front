"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { MarketHeader } from "@/components/market/header/MarketHeader";
import { MarketStatsSectionPerp } from "@/components/market/stats/MarketStatsSectionPerp";
import { PerpTokensSection } from "@/components/market/tokens/PerpTokensSection";
import { getPerpTokens, calculatePerpMarketStats } from "@/api/markets/queries";
import { PerpToken } from "@/api/markets/types";

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
        const fetchTokens = async () => {
            try {
                const data = await getPerpTokens();
                setTokens(data);

                // Calculate market statistics
                const stats = calculatePerpMarketStats(data);
                setMarketStats(stats);
            } catch (error) {
                console.error("Error loading perp tokens:", error);
                setTokens([]);
                setMarketStats({
                    trendingTokens: [],
                    totalMarketCap: 0,
                    totalVolume: 0,
                    totalPerpVolume: 0,
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
                <MarketStatsSectionPerp
                    totalMarketCap={marketStats.totalMarketCap}
                    totalVolume={marketStats.totalVolume}
                    totalPerpVolume={marketStats.totalPerpVolume}
                    trendingTokens={marketStats.trendingTokens}
                    totalTokenCount={marketStats.totalTokenCount}
                />
                <PerpTokensSection tokens={tokens} loading={loading} />
            </div>
        </div>
    );
} 