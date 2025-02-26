"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { useRouter } from "next/navigation";
import { PerpToken } from "@/api/markets/types";

type SortConfig = {
    key: keyof PerpToken | null;
    direction: "asc" | "desc";
};

interface PerpTokenTableProps {
    tokens: PerpToken[];
    loading: boolean;
}

export function PerpTokenTable({ tokens, loading }: PerpTokenTableProps) {
    const router = useRouter();
    const [sortedTokens, setSortedTokens] = useState<PerpToken[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: "volume",
        direction: "desc",
    });

    useEffect(() => {
        // Tri initial par volume décroissant
        const initialSortedTokens = [...tokens].sort((a, b) => b.volume - a.volume);
        setSortedTokens(initialSortedTokens);
    }, [tokens]);

    const sortData = (key: keyof PerpToken) => {
        let direction: "asc" | "desc" = "asc";

        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }

        const newSortedTokens = [...sortedTokens].sort((a, b) => {
            // Vérification des valeurs nulles ou undefined
            const valueA = a[key];
            const valueB = b[key];

            if (valueA == null && valueB == null) return 0;
            if (valueA == null) return direction === "asc" ? -1 : 1;
            if (valueB == null) return direction === "asc" ? 1 : -1;

            // Comparaison sûre des valeurs non nulles
            if (valueA < valueB) return direction === "asc" ? -1 : 1;
            if (valueA > valueB) return direction === "asc" ? 1 : -1;
            return 0;
        });

        setSortedTokens(newSortedTokens);
        setSortConfig({ key, direction });
    };

    const handleTokenClick = (tokenName: string) => {
        console.log(`Navigation vers le token: "${tokenName}"`);
        router.push(`/market/perp/${encodeURIComponent(tokenName)}`);
    };

    if (loading) {
        return <div className="text-white p-4">Chargement...</div>;
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-none">
                        <TableHead className="text-[#FFFFFF99] font-normal py-2 bg-transparent pl-4 w-[120px]">
                            <Button
                                variant="ghost"
                                onClick={() => sortData("name")}
                                className="text-[#FFFFFF99] font-normal hover:text-white p-0 flex items-center"
                            >
                                Name
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-[#FFFFFF99] font-normal py-2 bg-transparent w-[100px]">
                            <Button
                                variant="ghost"
                                onClick={() => sortData("price")}
                                className="text-[#FFFFFF99] font-normal hover:text-white p-0 ml-auto flex items-center justify-end w-full"
                            >
                                Price
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-right text-[#FFFFFF99] font-normal py-2 bg-transparent hidden md:table-cell">
                            <Button
                                variant="ghost"
                                onClick={() => sortData("volume")}
                                className="text-[#FFFFFF99] font-normal hover:text-white p-0 ml-auto"
                            >
                                Volume
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-right text-[#FFFFFF99] font-normal py-2 bg-transparent hidden lg:table-cell">
                            <Button
                                variant="ghost"
                                onClick={() => sortData("openInterest")}
                                className="text-[#FFFFFF99] font-normal hover:text-white p-0 ml-auto"
                            >
                                Open Interest
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-right text-[#FFFFFF99] font-normal py-2 bg-transparent hidden lg:table-cell">
                            <Button
                                variant="ghost"
                                onClick={() => sortData("funding")}
                                className="text-[#FFFFFF99] font-normal hover:text-white p-0 ml-auto"
                            >
                                Funding
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-right text-[#FFFFFF99] font-normal py-2 bg-transparent pr-4">
                            <Button
                                variant="ghost"
                                onClick={() => sortData("change24h")}
                                className="text-[#FFFFFF99] font-normal hover:text-white p-0 ml-auto"
                            >
                                Change
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedTokens.map((token) => (
                        <TableRow
                            key={token.name}
                            className="border-b border-[#FFFFFF1A] hover:bg-[#051728] cursor-pointer transition-colors"
                            onClick={() => handleTokenClick(token.name)}
                        >
                            <TableCell className="py-4 pl-4">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={`https://app.hyperliquid.xyz/coins/${token.name.toUpperCase()}_USDC.svg`}
                                        alt={token.name}
                                        className="w-6 h-6"
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                    <span className="text-white text-sm md:text-base">{token.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right text-white text-sm md:text-base">
                                ${formatNumber(token.price, "price")}
                            </TableCell>
                            <TableCell className="text-right text-white text-sm md:text-base hidden md:table-cell">
                                ${formatNumber(token.volume, "volume")}
                            </TableCell>
                            <TableCell className="text-right text-white text-sm md:text-base hidden lg:table-cell">
                                {formatNumber(token.openInterest)}
                            </TableCell>
                            <TableCell className="text-right text-white text-sm md:text-base hidden lg:table-cell">
                                {(token.funding * 100).toFixed(6)}%
                            </TableCell>
                            <TableCell
                                className={`text-right pr-4 text-sm md:text-base ${token.change24h >= 0 ? "text-green-500" : "text-red-500"
                                    }`}
                            >
                                {token.change24h >= 0 ? "+" : ""}
                                {formatNumber(token.change24h, "change")}%
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}