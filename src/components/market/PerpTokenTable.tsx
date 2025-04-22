"use client";

import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { PerpToken } from "@/services/markets/types";
import { useTableSort } from "@/hooks/use-table-sort";
import { formatNumberWithoutDecimals } from "./stats/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Loader2 } from "lucide-react";
import Image from "next/image";

interface PerpTokenTableProps {
    tokens: PerpToken[];
    loading: boolean;
}

// Composant d'image avec gestion d'erreur
function TokenImage({ src, alt }: { src: string; alt: string }) {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return null;
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={24}
            height={24}
            className="w-6 h-6"
            onError={() => setHasError(true)}
            unoptimized // Pour les images externes
        />
    );
}

export const PerpTokenTable = memo(function PerpTokenTable({ tokens, loading }: PerpTokenTableProps) {
    const router = useRouter();
    
    // Utiliser le hook de tri
    const { sortedData, sortData } = useTableSort(tokens, "volume", "desc");
    
    // Gérer le clic sur un token
    const handleTokenClick = (tokenName: string) => {
        router.push(`/market/perp/${tokenName}`);
    };
    
    // Fonction pour obtenir la classe de couleur en fonction du changement de prix
    const getChangeColorClass = (change: number) => {
        if (change > 0) return "text-green-500";
        if (change < 0) return "text-red-500";
        return "text-white";
    };
    
    // Fonction pour formater le taux de funding
    const formatFunding = (funding: number) => {
        const percentage = funding * 100;
        return `${percentage > 0 ? '+' : ''}${percentage.toFixed(4)}%`;
    };
    
    // Fonction pour obtenir la classe de couleur en fonction du funding
    const getFundingColorClass = (funding: number) => {
        if (funding > 0) return "text-green-500";
        if (funding < 0) return "text-red-500";
        return "text-white";
    };
    
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <Loader2 className="w-10 h-10 mb-4 text-[#83E9FF4D] animate-spin" />
                <p className="text-white text-lg">Loading...</p>
            </div>
        );
    }

    if (!tokens || tokens.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <p className="text-white text-lg">No data available</p>
                <p className="text-[#FFFFFF80] text-sm mt-2">Check back later for updated market information</p>
            </div>
        );
    }
    
    return (
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728] scrollbar-thumb-rounded-full">
            <Table className="min-w-[750px]">
                <TableHeader>
                    <TableRow className="border-none bg-[#051728]">
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
                        <TableHead className="text-right text-[#FFFFFF99] font-normal py-2 bg-transparent">
                            <Button
                                variant="ghost"
                                onClick={() => sortData("change24h")}
                                className="text-[#FFFFFF99] font-normal hover:text-white p-0 ml-auto"
                            >
                                Change
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-right text-[#FFFFFF99] font-normal py-2 bg-transparent">
                            <Button
                                variant="ghost"
                                onClick={() => sortData("volume")}
                                className="text-[#FFFFFF99] font-normal hover:text-white p-0 ml-auto"
                            >
                                Volume
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-right text-[#FFFFFF99] font-normal py-2 bg-transparent">
                            <Button
                                variant="ghost"
                                onClick={() => sortData("openInterest")}
                                className="text-[#FFFFFF99] font-normal hover:text-white p-0 ml-auto"
                            >
                                Open Interest
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-right text-[#FFFFFF99] font-normal py-2 bg-transparent">
                            <Button
                                variant="ghost"
                                onClick={() => sortData("funding")}
                                className="text-[#FFFFFF99] font-normal hover:text-white p-0 ml-auto"
                            >
                                Funding Rate
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-right text-[#FFFFFF99] font-normal py-2 bg-transparent pr-4">
                            <Button
                                variant="ghost"
                                onClick={() => sortData("maxLeverage")}
                                className="text-[#FFFFFF99] font-normal hover:text-white p-0 ml-auto"
                            >
                                Max Lev
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="bg-[#051728CC]">
                    {sortedData.map((token) => (
                        <TableRow
                            key={token.name} 
                            className="border-b border-[#FFFFFF1A] hover:bg-[#051728] cursor-pointer transition-colors"
                            onClick={() => handleTokenClick(token.name)}
                        >
                            <TableCell className="py-4 pl-4">
                                <div className="flex items-center gap-2">
                                    <TokenImage
                                        src={`https://app.hyperliquid.xyz/coins/${token.name.toUpperCase()}_USDC.svg`}
                                        alt={token.name}
                                    />
                                    <span className="text-white text-sm md:text-base">{token.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right text-white text-sm md:text-base">
                                ${formatNumberWithoutDecimals(token.price)}
                            </TableCell>
                            <TableCell className={`text-right text-sm md:text-base ${getChangeColorClass(token.change24h)}`}>
                                {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                            </TableCell>
                            <TableCell className="text-right text-white text-sm md:text-base">
                                ${formatNumberWithoutDecimals(token.volume)}
                            </TableCell>
                            <TableCell className="text-right text-white text-sm md:text-base">
                                ${formatNumberWithoutDecimals(token.openInterest)}
                            </TableCell>
                            <TableCell className={`text-right text-sm md:text-base ${getFundingColorClass(token.funding)}`}>
                                {formatFunding(token.funding)}
                            </TableCell>
                            <TableCell className="text-right text-white text-sm md:text-base pr-4">
                                {token.maxLeverage}x
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
});