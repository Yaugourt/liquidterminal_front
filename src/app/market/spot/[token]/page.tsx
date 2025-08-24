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
            <div className="min-h-screen">
                {/* Mobile menu button */}
                <div className="fixed top-4 left-4 z-50 lg:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-[#051728] hover:bg-[#112941]"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="h-6 w-6 text-white" />
                    </Button>
                </div>

                {/* Sidebar */}
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                <div className="">
                    <Header customTitle={`${tokenName} - Market`} showFees={true} />
                    <div className="p-2 lg:hidden">
                        <SearchBar placeholder="Search tokens..." />
                    </div>
                    <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">
                        <div className="text-white">Chargement...</div>
                    </main>
                </div>
            </div>
        );
    }

    if (error || !token) {
        return (
            <div className="min-h-screen">
                {/* Mobile menu button */}
                <div className="fixed top-4 left-4 z-50 lg:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-[#051728] hover:bg-[#112941]"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="h-6 w-6 text-white" />
                    </Button>
                </div>

                {/* Sidebar */}
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                <div className="">
                    <Header customTitle="Token Not Found" showFees={true} />
                    <div className="p-2 lg:hidden">
                        <SearchBar placeholder="Search tokens..." />
                    </div>
                    <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">
                        <div className="text-white flex flex-col items-center justify-center min-h-[50vh]">
                            <div className="text-xl mb-4">Token not found</div>
                            <div className="text-white mb-6">{error}</div>
                            <Button
                                onClick={handleBackToList}
                                className="bg-[#83E9FF4D] hover:bg-[#83E9FF80] text-white"
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
        <div className="min-h-screen">
            {/* Mobile menu button */}
            <div className="fixed top-4 left-4 z-50 lg:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="bg-[#051728] hover:bg-[#112941]"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <Menu className="h-6 w-6 text-white" />
                </Button>
            </div>

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="">
                <Header customTitle={`${tokenName} - Market`} showFees={true} />
                <div className="p-2 lg:hidden">
                    <SearchBar placeholder="Search tokens..." />
                </div>

                <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">
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
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        {/* Chart - Fixed height */}
                        <div className="lg:col-span-7">
                            <TradingViewChart 
                                symbol={`${token.name}/USDC`}
                                marketIndex={token.marketIndex} // Pass marketIndex for API
                                tokenName={token.name} // Pass token name for special cases like PURR
                                className="h-[450px]"
                            />
                        </div>
                        
                        {/* Order Book - Fixed height */}
                        <div className="lg:col-span-3">
                            <OrderBook 
                                symbol={`${token.name}/USDC`}
                                marketIndex={token.marketIndex} // Pass marketIndex for WebSocket
                                tokenNameProp={token.name} // Pass token name for special cases like PURR
                                className="h-[510px]"
                            />
                        </div>
                        
                        {/* Token Info Sidebar - Adapts to available space */}
                        <div className="lg:col-span-2">
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
                                className="min-h-[500px]"
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
