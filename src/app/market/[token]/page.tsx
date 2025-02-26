"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { Card } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { getToken } from "@/api/markets/queries";
import { Token } from "@/api/markets/types";
import { formatNumber } from "@/lib/format";

export default function TokenPage() {
    const { setTitle } = usePageTitle();
    const params = useParams();
    const token_param = params.token as string;
    const tokenName = decodeURIComponent(token_param);
    const [token, setToken] = useState<Token | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTitle(`${tokenName} - Market`);
    }, [setTitle, tokenName]);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const data = await getToken(tokenName);
                setToken(data);
            } finally {
                setLoading(false);
            }
        };

        fetchToken();
    }, [tokenName]);

    if (loading) {
        return <div className="text-white p-4">Chargement...</div>;
    }

    if (!token) {
        return <div className="text-white p-4">Token non trouvé</div>;
    }

    return (
        <div className="min-h-screen">
            {/* En-tête avec le nom du token */}
            <div className="p-4 space-y-4">
                <h2 className="text-xl font-bold text-white">{tokenName}</h2>
            </div>

            {/* 2 Cards côte à côte en haut */}
            <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <Card className="p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-white font-bold">{token.name}/USDC</span>
                                <span className="bg-[#1E4620] text-[#4ADE80] px-2 py-1 rounded text-sm">Spot</span>
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <div className="text-[#FFFFFF99] text-sm">Price:</div>
                                    <div className="text-white text-lg">${formatNumber(token.price, 'price')}</div>
                                </div>

                                <div>
                                    <div className="text-[#FFFFFF99] text-sm">Change 24h:</div>
                                    <div className={`text-lg ${token.change24h >= 0 ? 'text-[#4ADE80]' : 'text-red-500'}`}>
                                        {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[#FFFFFF99] text-sm">Volume:</div>
                                    <div className="text-white text-lg">${formatNumber(token.volume, 'volume')}</div>
                                </div>

                                <div>
                                    <div className="text-[#FFFFFF99] text-sm">Market Cap:</div>
                                    <div className="text-white text-lg">${formatNumber(token.marketCap, 'marketCap')}</div>
                                </div>

                                <div>
                                    <div className="text-[#FFFFFF99] text-sm">Contract:</div>
                                    <div className="text-[#83E9FF] text-sm flex items-center gap-2">
                                        0x55db...d99a
                                        <svg className="w-4 h-4 cursor-pointer" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V7C18 5.89543 17.1046 5 16 5H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 bg-[#83E9FF4D] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
                        <div className="flex flex-col h-full text-center">
                            {/* Espace vide avec fond gris */}
                            <div className="h-14 -mx-4 -mt-4 mb-4 bg-[#83E9FF4D] rounded-t-xl"></div>

                            <div className="space-y-2 mb-auto">
                                <h3 className="text-white text-xl font-bold">Nom du projet</h3>
                                <p className="text-[#FFFFFF99]">Description</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-4 justify-center">
                                    {/* Discord Icon */}
                                    <svg className="w-6 h-6 text-white cursor-pointer hover:text-[#83E9FF]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                                    </svg>

                                    {/* Twitter/X Icon */}
                                    <svg className="w-6 h-6 text-white cursor-pointer hover:text-[#83E9FF]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>

                                    {/* GitHub Icon */}
                                    <svg className="w-6 h-6 text-white cursor-pointer hover:text-[#83E9FF]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                                    </svg>
                                </div>

                                <button className="w-full py-2 text-white hover:text-[#83E9FF] text-sm">
                                    Voir plus...
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 3 Cards en colonnes sur mobile, en ligne sur desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Chart Card */}
                    <Card className="p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
                        <h3 className="text-white text-lg mb-4">Chart</h3>
                        <div className="h-[400px] flex items-center justify-center text-white/60">
                            Chart à venir
                        </div>
                    </Card>

                    {/* Order Book Card */}
                    <Card className="p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
                        <h3 className="text-white text-lg mb-4">Order Book</h3>
                        <div className="h-[400px] flex items-center justify-center text-white/60">
                            Order Book à venir
                        </div>
                    </Card>

                    {/* Trades Card */}
                    <Card className="p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
                        <h3 className="text-white text-lg mb-4">Trades</h3>
                        <div className="h-[400px] flex items-center justify-center text-white/60">
                            Trades à venir
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
