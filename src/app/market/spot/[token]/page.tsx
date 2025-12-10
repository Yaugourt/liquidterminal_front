"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { useParams, useRouter } from "next/navigation";
import { SpotToken } from "@/services/market/spot/types";
import { getToken } from "@/services/market/spot/api";
import { Button } from "@/components/ui/button";
import { TokenCard, TokenData, TradingViewChart, OrderBook, TokenInfoSidebar } from "@/components/market/token";
import { TokenTwapSection } from "@/components/market/token/TokenTwapSection";
import { HoldersTable } from "@/components/market/token/HoldersTable";
import { useTokenHolders } from "@/services/market/spot/hooks/useTokenHolders";
import { useTokenDetails } from "@/services/market/token";
import { TradingLayout } from "@/components/market/layout/TradingLayout";

// Composant HoldersSection
function HoldersSection({ tokenName, tokenPrice, token }: { tokenName: string; tokenPrice: number; token: SpotToken }) {
    const { holders, isLoading, error, stakedHolders } = useTokenHolders(tokenName);
    const { data: tokenDetails } = useTokenDetails(token.tokenId || null);

    return (
        <div className="w-full">
            <HoldersTable
                holders={holders}
                isLoading={isLoading}
                error={error}
                tokenName={tokenName}
                tokenPrice={tokenPrice}
                totalSupply={tokenDetails?.totalSupply ? parseFloat(tokenDetails.totalSupply) : undefined}
                stakedHolders={stakedHolders}
            />
        </div>
    );
}

export default function TokenPage() {
    const { setTitle } = usePageTitle();
    const router = useRouter();
    const params = useParams();
    const token_param = params.token as string;
    const tokenName = decodeURIComponent(token_param);
    const [token, setToken] = useState<SpotToken | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'twap' | 'holders'>('twap');

    useEffect(() => {
        setTitle(`${tokenName} - Market`);
    }, [setTitle, tokenName]);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const data = await getToken(tokenName);
                setToken(data);
                if (!data) {
                    setError(`Le token "${tokenName}" n'a pas été trouvé dans la liste des tokens Spot.`);
                }
            } catch {
                setError("Une erreur est survenue lors du chargement des données du token.");
            } finally {
                setLoading(false);
            }
        };

        fetchToken();
    }, [tokenName]);

    const handleBackToList = () => {
        router.push('/market');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-brand-main text-zinc-100">
                <div className="flex flex-col items-center">
                    <div className="h-6 w-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mb-2" />
                    <span className="text-zinc-500 text-sm">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || !token) {
        return (
            <div className="min-h-screen bg-brand-main text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-brand-main to-[#050505] flex items-center justify-center">
                <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-xl shadow-black/20 flex flex-col items-center justify-center">
                    <div className="text-xl font-bold text-white mb-4">Token not found</div>
                    <div className="text-zinc-400 mb-6 text-center">{error}</div>
                    <Button
                        onClick={handleBackToList}
                        className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-bold"
                    >
                        Back to tokens list
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <TradingLayout
            marketType="spot"
            tokenName={tokenName}
            tokenInfoSlot={
                <TokenCard
                    token={{
                        symbol: `${token.name}/USDC`,
                        name: token.name,
                        type: 'spot',
                        logo: token.logo,
                        price: token.price,
                        change24h: token.change24h,
                        volume24h: token.volume,
                        marketCap: token.marketCap,
                        marketIndex: token.marketIndex
                    } as TokenData}
                    className="mb-6"
                />
            }
            chartSlot={
                <>
                    <TradingViewChart
                        symbol={`${token.name}/USDC`}
                        marketIndex={token.marketIndex}
                        tokenName={token.name}
                        className="flex-1 min-h-[450px]"
                    />
                    {/* Tabs dans l'espace vide sous le chart */}
                    <div className="mt-4">
                        <div className="flex justify-start items-center">
                            <div className="flex bg-brand-dark rounded-lg p-1 border border-white/5">
                                <button
                                    onClick={() => setActiveTab('twap')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'twap'
                                        ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                                        }`}
                                >
                                    TWAP
                                </button>
                                <button
                                    onClick={() => setActiveTab('holders')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'holders'
                                        ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                                        }`}
                                >
                                    Holders
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            }
            orderBookSlot={
                <OrderBook
                    symbol={`${token.name}/USDC`}
                    marketIndex={token.marketIndex}
                    tokenNameProp={token.name}
                />
            }
            infoSidebarSlot={
                <TokenInfoSidebar
                    token={{
                        symbol: `${token.name}/USDC`,
                        name: token.name,
                        type: 'spot',
                        price: token.price,
                        change24h: token.change24h,
                        volume24h: token.volume,
                        marketCap: token.marketCap,
                        marketIndex: token.marketIndex,
                        contract: token.tokenId
                    } as TokenData}
                />
            }
            bottomSectionSlot={
                activeTab === 'twap' ? (
                    <TokenTwapSection tokenName={token.name} />
                ) : (
                    <HoldersSection tokenName={tokenName} tokenPrice={token.price} token={token} />
                )
            }
        />
    );
}
