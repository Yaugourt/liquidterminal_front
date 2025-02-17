"use client"

import { useEffect, useState } from "react"
import { usePageTitle } from "@/store/use-page-title"
import { SearchBar } from "@/components/SearchBar"
import { Card } from "@/components/ui/card"
import { TokenTable } from "@/components/market/TokenTable"
import { TokenFilters } from "@/components/market/TokenFilters"
import { formatNumber } from "@/lib/format"

interface Token {
    name: string
    logo: string | null
    price: number
    marketCap: number
    volume: number
    change24h: number
    liquidity: number
    supply: number
}

export default function Market() {
    const { setTitle } = usePageTitle()
    const [tokens, setTokens] = useState<Token[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setTitle("Market Spot")
    }, [setTitle])

    useEffect(() => {
        const fetchTokens = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/markets')
                const data = await response.json()
                setTokens(data)
            } catch (error) {
                console.error('Erreur lors du chargement des tokens:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTokens()
    }, [])

    // Calcul des totaux pour les cards
    const totalMarketCap = tokens.reduce((sum, token) => sum + token.marketCap, 0)
    const totalVolume = tokens.reduce((sum, token) => sum + token.volume, 0)
    const totalSpotVolume = tokens.reduce((sum, token) => sum + (token.volume || 0), 0)

    // Tri des tokens par volume pour obtenir les trending
    const trendingTokens = [...tokens]
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 4)

    return (
        <div className="min-h-screen">
            {/* Titre et Search */}
            <div className="p-4 space-y-4">
                <h2 className="text-xl font-bold text-white">Market Spot</h2>
                <SearchBar placeholder="Search..." />
            </div>

            {/* 3 Cards larges - en colonne sur mobile, en ligne sur desktop */}
            <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Market Cap Card */}
                    <Card className="p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-white text-lg">Market Cap</h3>
                                <span className="text-[#83E9FF]">${formatNumber(totalMarketCap)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[#FFFFFF99] text-sm">Total volume:</p>
                                    <p className="text-white">${formatNumber(totalVolume)}</p>
                                </div>
                                <div>
                                    <p className="text-[#FFFFFF99] text-sm">24h spot volume:</p>
                                    <p className="text-white">${formatNumber(totalSpotVolume)}</p>
                                </div>
                                <div>
                                    <p className="text-[#FFFFFF99] text-sm">Total spot token:</p>
                                    <p className="text-white">${formatNumber(tokens.length)}</p>
                                </div>
                                <div>
                                    <p className="text-[#FFFFFF99] text-sm">24h perp volume:</p>
                                    <p className="text-white">$0.00</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Trending Tokens Card */}
                    <Card className="p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
                        <h3 className="text-white text-lg mb-4">Trending Tokens</h3>
                        <div className="space-y-3">
                            {trendingTokens.map((token) => (
                                <div key={token.name} className="flex justify-between items-center">
                                    <span className="text-white">{token.name}</span>
                                    <div className="flex gap-4">
                                        <span className="text-white">${formatNumber(token.price)}</span>
                                        <span className={token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                                            {token.change24h >= 0 ? '+' : ''}{formatNumber(token.change24h)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Auction Card */}
                    <Card className="p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
                        <h3 className="text-white text-lg mb-4">Auction</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[#FFFFFF99] text-sm">Current price:</p>
                                <p className="text-white">351,343.24$</p>
                            </div>
                            <div>
                                <p className="text-[#FFFFFF99] text-sm">Last auctions:</p>
                                <p className="text-white">NEURAL for 205,149.38$</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Token Table Section - pleine largeur */}
            <div className="p-4">
                <TokenFilters />
                <Card className="border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] rounded-xl overflow-hidden">
                    <TokenTable tokens={tokens} loading={loading} />
                </Card>
            </div>
        </div>
    )
}
