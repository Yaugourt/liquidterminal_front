"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { useParams, useRouter } from "next/navigation";
import { SpotToken } from "@/services/market/spot/types";
import { getToken } from "@/services/market/spot/api";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";
import { Menu } from "lucide-react";
import { TokenCard, TokenData, TradingViewChart, OrderBook, TokenInfoSidebar } from "@/components/market/token";
import { TokenTwapSection } from "@/components/market/token/TokenTwapSection";
import { HoldersTable } from "@/components/market/token/HoldersTable";
import { useTokenHolders } from "@/services/market/spot/hooks/useTokenHolders";
import { useTokenDetails } from "@/services/market/token";

export default function TokenPage() {
    const { setTitle } = usePageTitle();
    const router = useRouter();
    const params = useParams();
    const token_param = params.token as string;
    const tokenName = decodeURIComponent(token_param);
    const [token, setToken] = useState<SpotToken | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
                // Error handled silently
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
            <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
                {/* Mobile menu button */}
                <div className="fixed top-4 left-4 z-50 lg:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>

                {/* Sidebar */}
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                <div className="">
                    <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
                        <Header customTitle={`${tokenName} - Market`} showFees={true} />
                    </div>
                    <div className="p-2 lg:hidden">
                        <SearchBar placeholder="Search tokens..." />
                    </div>
                    <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
                        <div className="flex justify-center items-center h-[200px]">
                            <div className="flex flex-col items-center">
                                <div className="h-6 w-6 border-2 border-[#83E9FF] border-t-transparent rounded-full animate-spin mb-2" />
                                <span className="text-zinc-500 text-sm">Loading...</span>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (error || !token) {
        return (
            <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
                {/* Mobile menu button */}
                <div className="fixed top-4 left-4 z-50 lg:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>

                {/* Sidebar */}
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                <div className="">
                    <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
                        <Header customTitle="Token Not Found" showFees={true} />
                    </div>
                    <div className="p-2 lg:hidden">
                        <SearchBar placeholder="Search tokens..." />
                    </div>
                    <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
                        <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-xl shadow-black/20 flex flex-col items-center justify-center min-h-[50vh]">
                            <div className="text-xl font-bold text-white mb-4">Token not found</div>
                            <div className="text-zinc-400 mb-6 text-center">{error}</div>
                            <Button
                                onClick={handleBackToList}
                                className="bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-bold"
                            >
                                Back to tokens list
                            </Button>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
            {/* Mobile menu button */}
            <div className="fixed top-4 left-4 z-50 lg:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="">
                <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
                    <Header customTitle={`${tokenName} - Market`} showFees={true} />
                </div>
                <div className="p-2 lg:hidden">
                    <SearchBar placeholder="Search tokens..." />
                </div>

                <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
                    {/* Token Overview Card */}
                    <TokenCard
                        token={{
                            symbol: `${token.name}/USDC`,
                            name: token.name,
                            type: 'spot',
                            logo: token.logo, // Pass logo from API
                            price: token.price,
                            change24h: token.change24h,
                            volume24h: token.volume,
                            marketCap: token.marketCap,
                            marketIndex: token.marketIndex // Pass marketIndex for WebSocket
                        } as TokenData}
                        className="mb-6"
                    />

                    {/* Trading Interface Layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:items-stretch">
                        {/* Chart */}
                        <div className="xl:col-span-7 flex flex-col">
                            <TradingViewChart
                                symbol={`${token.name}/USDC`}
                                marketIndex={token.marketIndex} // Pass marketIndex for API
                                tokenName={token.name} // Pass token name for special cases like PURR
                                className="flex-1 min-h-[450px]"
                            />

                            {/* Tabs dans l'espace vide */}
                            <div className="mt-4">
                                <div className="flex justify-start items-center">
                                    <div className="flex bg-[#0A0D12] rounded-lg p-1 border border-white/5">
                                        <button
                                            onClick={() => setActiveTab('twap')}
                                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'twap'
                                                ? 'bg-[#83E9FF] text-[#051728] shadow-sm font-bold'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                                                }`}
                                        >
                                            TWAP
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('holders')}
                                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'holders'
                                                ? 'bg-[#83E9FF] text-[#051728] shadow-sm font-bold'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                                                }`}
                                        >
                                            Holders
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Book */}
                        <div className="xl:col-span-3">
                            <OrderBook
                                symbol={`${token.name}/USDC`}
                                marketIndex={token.marketIndex} // Pass marketIndex for WebSocket
                                tokenNameProp={token.name} // Pass token name for special cases like PURR
                            />
                        </div>

                        {/* Token Info Sidebar */}
                        <div className="xl:col-span-2">
                            <TokenInfoSidebar
                                token={{
                                    symbol: `${token.name}/USDC`,
                                    name: token.name,
                                    type: 'spot',
                                    price: token.price,
                                    change24h: token.change24h,
                                    volume24h: token.volume,
                                    marketCap: token.marketCap,
                                    marketIndex: token.marketIndex, // Pass marketIndex for consistency
                                    contract: token.tokenId // Pass tokenId for token details API
                                } as TokenData}
                            />
                        </div>
                    </div>

                    {/* TWAP or Holders Table */}
                    {activeTab === 'twap' ? (
                        <TokenTwapSection tokenName={token.name} />
                    ) : (
                        <HoldersSection tokenName={tokenName} tokenPrice={token.price} token={token} />
                    )}
                </main>
            </div>
        </div>
    );
}

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
