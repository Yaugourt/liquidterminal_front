"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePageTitle } from "@/store/use-page-title";
import { useParams, useRouter } from "next/navigation";
import { SpotToken } from "@/services/market/spot/types";
import { getToken } from "@/services/market/spot/api";
import { isBridged } from "@/services/market/spot/bridged";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { PillTabs } from "@/components/ui/pill-tabs";
import { TokenCard, TokenData, OrderBook, TokenDetailsBand } from "@/components/market/token";
import { TokenTwapSection } from "@/components/market/token/TokenTwapSection";
import { HoldersTable } from "@/components/market/token/HoldersTable";
import { useTokenHolders } from "@/services/market/spot/hooks/useTokenHolders";
import { useTokenDetails } from "@/services/market/token";
import { TradingLayout } from "@/layouts/TradingLayout";
import { ChartSkeleton } from "@/components/common";

// Lazy load TradingViewChart - it uses lightweight-charts which requires DOM
const TradingViewChart = dynamic(
    () => import("@/components/market/token/TradingViewChart").then(mod => ({ default: mod.TradingViewChart })),
    { ssr: false, loading: () => <ChartSkeleton /> }
);

type BottomTab = "twap" | "holders";

export default function TokenPage() {
    const { setTitle } = usePageTitle();
    const router = useRouter();
    const params = useParams();
    const token_param = params.token as string;
    const tokenName = decodeURIComponent(token_param);
    const [token, setToken] = useState<SpotToken | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<BottomTab>('twap');
    // Remember which tabs have been opened so we mount them once and toggle
    // visibility from then on (no refetch on every tab switch).
    const [visitedTabs, setVisitedTabs] = useState<Set<BottomTab>>(
        () => new Set<BottomTab>(["twap"])
    );

    // Shared data — one fetch each, feeding TokenDetailsBand and HoldersTable.
    const { data: tokenDetails, isLoading: detailsLoading } = useTokenDetails(token?.tokenId || null);
    const holdersData = useTokenHolders(tokenName);

    const selectTab = (tab: BottomTab) => {
        setActiveTab(tab);
        setVisitedTabs((prev) => {
            if (prev.has(tab)) return prev;
            const next = new Set(prev);
            next.add(tab);
            return next;
        });
    };

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
            <div className="flex justify-center items-center min-h-[50vh]">
                <LoadingState size="md" withCard={false} />
            </div>
        );
    }

    if (error || !token) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Card className="p-6 flex flex-col items-center justify-center">
                    <div className="text-xl font-bold text-text-primary mb-4">Token not found</div>
                    <div className="text-text-secondary mb-6 text-center">{error}</div>
                    <Button
                        onClick={handleBackToList}
                        className="bg-brand hover:bg-brand/90 text-brand-text-on font-bold"
                    >
                        Back to tokens list
                    </Button>
                </Card>
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
                        // Bridged tokens report the full underlying supply, so the
                        // backend "market cap" is the underlying FDV — hide it.
                        marketCap: isBridged(token.name) ? undefined : token.marketCap,
                        marketIndex: token.marketIndex,
                        contract: token.tokenId,
                    } as TokenData}
                    className="mb-6"
                />
            }
            chartSlot={
                <TradingViewChart
                    symbol={`${token.name}/USDC`}
                    marketIndex={token.marketIndex}
                    tokenName={token.name}
                    className="flex-1 min-h-[450px]"
                />
            }
            orderBookSlot={
                <OrderBook
                    symbol={`${token.name}/USDC`}
                    marketIndex={token.marketIndex}
                    tokenNameProp={token.name}
                />
            }
            bottomSectionSlot={
                <div className="mt-4 space-y-4">
                    <TokenDetailsBand
                        token={token}
                        details={tokenDetails}
                        detailsLoading={detailsLoading}
                        holdersCount={holdersData.holdersCount}
                        holdersLoading={holdersData.isLoading}
                    />

                    <div className="space-y-2.5">
                        <PillTabs
                            variant="text"
                            tabs={[
                                { value: "twap", label: "TWAP" },
                                { value: "holders", label: "Holders" },
                            ]}
                            activeTab={activeTab}
                            onTabChange={(v) => selectTab(v as BottomTab)}
                        />
                        {/* Both tabs stay mounted once visited, then just toggled
                            with `hidden` so switching no longer refetches. */}
                        {visitedTabs.has('twap') && (
                            <div className={activeTab === 'twap' ? '' : 'hidden'}>
                                <TokenTwapSection tokenName={token.name} />
                            </div>
                        )}
                        {visitedTabs.has('holders') && (
                            <div className={activeTab === 'holders' ? '' : 'hidden'}>
                                <HoldersTable
                                    holders={holdersData.holders}
                                    isLoading={holdersData.isLoading}
                                    error={holdersData.error}
                                    tokenName={tokenName}
                                    tokenPrice={token.price}
                                    totalSupply={tokenDetails?.totalSupply ? parseFloat(tokenDetails.totalSupply) : undefined}
                                    stakedHolders={holdersData.stakedHolders}
                                />
                            </div>
                        )}
                    </div>
                </div>
            }
        />
    );
}
