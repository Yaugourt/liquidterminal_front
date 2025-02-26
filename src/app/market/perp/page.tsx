"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { MarketHeader } from "@/components/market/header/MarketHeader";
import { MarketStatsSectionPerp } from "@/components/market/stats/MarketStatsSectionPerp";
import { PerpTokensSection } from "@/components/market/tokens/PerpTokensSection";
import { formatNumber } from "@/lib/format";
import { getPerpTokens } from "@/api/markets/queries";
import { PerpToken } from "@/api/markets/types";

// Données mockées pour le développement
const mockTokens: PerpToken[] = [
    {
        name: "BTC",
        logo: null,
        price: 86110,
        change24h: -2.19,
        volume: 3770030537.6961107,
        openInterest: 12422.28566,
        funding: 0.0000125,
        maxLeverage: 50,
        onlyIsolated: false
    },
    {
        name: "ETH",
        price: 2389.2,
        change24h: 0.03,
        volume: 1615596636.0813375,
        openInterest: 313568.7631999999,
        funding: -0.0000051831,
        maxLeverage: 50,
        onlyIsolated: false
    },
    {
        name: "ATOM",
        price: 4.4583,
        change24h: 6.69,
        volume: 991127.513539,
        openInterest: 365774.28,
        funding: 0.0000084066,
        maxLeverage: 10,
        onlyIsolated: false
    },
];

export default function MarketPerp() {
    const { setTitle } = usePageTitle();
    const [tokens, setTokens] = useState<PerpToken[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTitle("Market Perp");
    }, [setTitle]);

    useEffect(() => {
        const fetchTokens = async () => {
            try {
                // En développement, on peut utiliser les données mockées ou l'API
                const data = await getPerpTokens();
                setTokens(data);
            } catch (error) {
                console.error("Erreur lors du chargement des tokens perp:", error);
                // En cas d'erreur, utiliser les données mockées
                setTokens(mockTokens);
            } finally {
                setLoading(false);
            }
        };

        fetchTokens();
    }, []);

    const trendingTokens = tokens.slice(0, 4);
    const totalVolume = tokens.reduce((sum, token) => sum + token.volume, 0);
    const totalPerpVolume = tokens.reduce(
        (sum, token) => sum + (token.volume || 0),
        0
    );

    return (
        <div className="min-h-screen">
            <div className="p-4">
                <MarketHeader />
                <MarketStatsSectionPerp
                    totalMarketCap={0}
                    totalVolume={totalVolume}
                    totalPerpVolume={totalPerpVolume}
                    trendingTokens={trendingTokens}
                />
                <PerpTokensSection tokens={tokens} loading={loading} />
            </div>
        </div>
    );
} 