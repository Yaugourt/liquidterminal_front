"use client"

import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { formatNumber } from "@/lib/format"
import { useRouter } from "next/navigation"
import { Token } from "@/api/markets/types"

type SortConfig = {
    key: keyof Token | null
    direction: 'asc' | 'desc'
}

interface TokenTableProps {
    tokens: Token[]
    loading: boolean
}

export function TokenTable({ tokens, loading }: TokenTableProps) {
    const router = useRouter()
    const [sortedTokens, setSortedTokens] = useState<Token[]>([])
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: 'volume',
        direction: 'desc'
    })

    useEffect(() => {
        // Tri initial par volume décroissant
        const initialSortedTokens = [...tokens].sort((a, b) => b.volume - a.volume)
        setSortedTokens(initialSortedTokens)
    }, [tokens])

    const sortData = (key: keyof Token) => {
        let direction: 'asc' | 'desc' = 'asc'

        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        const newSortedTokens = [...sortedTokens].sort((a, b) => {
            if (a[key] === null || b[key] === null) return 0
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
            return 0
        })

        setSortedTokens(newSortedTokens)
        setSortConfig({ key, direction })
    }

    const handleTokenClick = (tokenName: string) => {
        router.push(`/market/${encodeURIComponent(tokenName)}`)
    }

    if (loading) {
        return <div className="text-white p-4">Chargement...</div>
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-[#FFFFFF1A] bg-[#051728]">
                        <TableHead className="text-[#FFFFFF99] font-normal first:pl-4 last:pr-4 whitespace-nowrap">
                            <Button
                                variant="ghost"
                                onClick={() => sortData('name')}
                                className="text-[#FFFFFF99] font-normal hover:text-white p-0"
                            >
                                Name
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-[#FFFFFF99] font-normal first:pl-4 last:pr-4 whitespace-nowrap">
                            <Button
                                variant="ghost"
                                onClick={() => sortData('price')}
                                className="text-[#FFFFFF99] font-normal hover:text-white p-0"
                            >
                                Price
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-[#FFFFFF99] font-normal first:pl-4 last:pr-4 whitespace-nowrap hidden sm:table-cell">
                            <Button
                                variant="ghost"
                                onClick={() => sortData('change24h')}
                                className="text-[#FFFFFF99] font-normal hover:text-white p-0"
                            >
                                24h Change
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-[#FFFFFF99] font-normal first:pl-4 last:pr-4 whitespace-nowrap hidden md:table-cell">
                            <Button
                                variant="ghost"
                                onClick={() => sortData('volume')}
                                className="text-[#FFFFFF99] font-normal hover:text-white p-0"
                            >
                                Volume
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-[#FFFFFF99] font-normal first:pl-4 last:pr-4 whitespace-nowrap hidden lg:table-cell">
                            <Button
                                variant="ghost"
                                onClick={() => sortData('marketCap')}
                                className="text-[#FFFFFF99] font-normal hover:text-white p-0"
                            >
                                Market Cap
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedTokens.map((token) => (
                        <TableRow
                            key={token.name}
                            className="border-b border-[#FFFFFF1A] bg-[#051728CC] hover:bg-[#051728] cursor-pointer transition-colors"
                            onClick={() => handleTokenClick(token.name)}
                        >
                            <TableCell className="py-4 first:pl-4 last:pr-4">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={`https://app.hyperliquid.xyz/coins/${token.name.toUpperCase()}_USDC.svg`}
                                        alt={token.name}
                                        className="w-6 h-6"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const parent = e.currentTarget.parentElement;
                                            if (parent) {
                                                parent.innerText = token.name;
                                            }
                                        }}
                                    />
                                    <span className="text-white whitespace-nowrap">{token.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-white first:pl-4 last:pr-4 whitespace-nowrap">
                                ${formatNumber(token.price, 'price')}
                            </TableCell>
                            <TableCell className={`first:pl-4 last:pr-4 hidden sm:table-cell whitespace-nowrap ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {token.change24h >= 0 ? '+' : ''}{formatNumber(token.change24h, 'change')}%
                            </TableCell>
                            <TableCell className="text-white first:pl-4 last:pr-4 hidden md:table-cell whitespace-nowrap">
                                ${formatNumber(token.volume, 'volume')}
                            </TableCell>
                            <TableCell className="text-white first:pl-4 last:pr-4 hidden lg:table-cell whitespace-nowrap">
                                ${formatNumber(token.marketCap, 'marketCap')}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
} 