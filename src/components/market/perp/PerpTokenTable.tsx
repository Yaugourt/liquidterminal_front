"use client";

import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { PerpSortableFields } from "@/services/market/perp/types";
import { formatNumber } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Database, Loader2, TrendingUp, BarChart2, Scale } from "lucide-react";
import Image from "next/image";
import { usePerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";

// Composant d'image avec gestion d'erreur
function TokenImage({ src, alt }: { src: string; alt: string }) {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div className="w-8 h-8 rounded-full bg-[#051728] border border-[#83E9FF33] flex items-center justify-center shadow-[0_0_8px_rgba(131,233,255,0.08)]">
                <span className="text-[#83E9FF] text-xs font-medium">{alt.charAt(0)}</span>
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full border border-[#83E9FF33] shadow-[0_0_8px_rgba(131,233,255,0.15)] backdrop-blur-sm"
            onError={() => setHasError(true)}
            unoptimized // Pour les images externes
        />
    );
}

export const PerpTokenTable = memo(function PerpTokenTable() {
    const router = useRouter();
    const [sortField, setSortField] = useState<PerpSortableFields>("volume");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    
    const { 
        data: tokens, 
        isLoading, 
        error,
        page,
        totalPages,
        updateParams
    } = usePerpMarkets({
        defaultParams: {
            sortBy: sortField,
            sortOrder: sortOrder,
        }
    });
    
    // Gérer le clic sur un token
    const handleTokenClick = (tokenName: string) => {
        router.push(`/market/perp/${tokenName}`);
    };

    const handleSort = (field: string) => {
        if (!["volume", "openInterest", "change24h"].includes(field)) {
            return;
        }

        const newField = field as PerpSortableFields;
        if (sortField === newField) {
            const newOrder = sortOrder === "asc" ? "desc" : "asc";
            setSortOrder(newOrder);
            updateParams({ 
                sortBy: newField, 
                sortOrder: newOrder,
                page: 1
            });
        } else {
            setSortField(newField);
            setSortOrder("desc");
            updateParams({ 
                sortBy: newField, 
                sortOrder: "desc",
                page: 1
            });
        }
    };
    
    // Fonction pour obtenir la classe de couleur en fonction du changement de prix
    const getChangeColorClass = (change: number) => {
        if (change > 0) return "text-[#4ADE80]";
        if (change < 0) return "text-[#F87171]";
        return "text-white";
    };
    
    // Fonction pour formater le taux de funding
    const formatFunding = (funding: number) => {
        const percentage = funding * 100;
        return `${percentage > 0 ? '+' : ''}${percentage.toFixed(4)}%`;
    };
    
    // Fonction pour obtenir la classe de couleur en fonction du funding
    const getFundingColorClass = (funding: number) => {
        if (funding > 0) return "text-[#4ADE80]";
        if (funding < 0) return "text-[#F87171]";
        return "text-white";
    };

    // Fonction pour vérifier si un champ est triable
    const isSortable = (field: string): boolean => {
        return ["volume", "openInterest", "change24h"].includes(field);
    };

    // Fonction pour obtenir la classe du bouton de tri
    const getSortButtonClass = (field: string): string => {
        const isActive = sortField === field;
        return `font-normal hover:text-white p-0 ml-auto transition-colors duration-200 ${
            !isSortable(field) ? 'cursor-default opacity-50' : ''
        } ${isActive ? 'text-[#83E9FF]' : 'text-[#FFFFFF99]'}`;
    };
    
    // Fonction pour obtenir l'icône appropriée pour chaque colonne
    const getColumnIcon = (field: string) => {
        switch (field) {
            case "change24h":
                return <TrendingUp className="mr-1.5 h-3.5 w-3.5 opacity-70" />;
            case "volume":
                return <BarChart2 className="mr-1.5 h-3.5 w-3.5 opacity-70" />;
            case "openInterest":
                return <Scale className="mr-1.5 h-3.5 w-3.5 opacity-70" />;
            default:
                return null;
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <Loader2 className="w-10 h-10 mb-4 text-[#83E9FF4D] animate-spin" />
                <p className="text-white text-lg font-serif">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
                <p className="text-white text-lg font-serif">Error loading data</p>
                <p className="text-[#FFFFFF80] text-sm mt-2">{error.message}</p>
            </div>
        );
    }

    if (!tokens || tokens.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
                <p className="text-white text-lg font-serif">No data available</p>
                <p className="text-[#FFFFFF80] text-sm mt-2">Check back later for updated market information</p>
            </div>
        );
    }
    
    return (
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent rounded-xl">
            <Table className="min-w-[750px]">
                <TableHeader>
                    <TableRow className="border-none bg-transparent">
                        <TableHead className="text-xs uppercase tracking-wide font-medium py-4 bg-transparent pl-6 w-[140px]">
                            <Button
                                variant="ghost"
                                className={getSortButtonClass("name")}
                                disabled={!isSortable("name")}
                            >
                                Name
                                <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-60" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-xs uppercase tracking-wide font-medium py-4 bg-transparent w-[100px]">
                            <Button
                                variant="ghost"
                                className={getSortButtonClass("price")}
                                disabled={!isSortable("price")}
                            >
                                Price
                                <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-60" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-right text-xs uppercase tracking-wide font-medium py-4 bg-transparent">
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("change24h")}
                                className={getSortButtonClass("change24h")}
                            >
                                <div className="flex items-center">
                                    {getColumnIcon("change24h")}
                                    Change
                                </div>
                                <ArrowUpDown className={`ml-2 h-3.5 w-3.5 transition-opacity ${sortField === 'change24h' ? 'opacity-100' : 'opacity-60'}`} />
                            </Button>
                        </TableHead>
                        <TableHead className="text-right text-xs uppercase tracking-wide font-medium py-4 bg-transparent">
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("volume")}
                                className={getSortButtonClass("volume")}
                            >
                                <div className="flex items-center">
                                    {getColumnIcon("volume")}
                                    Volume
                                </div>
                                <ArrowUpDown className={`ml-2 h-3.5 w-3.5 transition-opacity ${sortField === 'volume' ? 'opacity-100' : 'opacity-60'}`} />
                            </Button>
                        </TableHead>
                        <TableHead className="text-right text-xs uppercase tracking-wide font-medium py-4 bg-transparent">
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("openInterest")}
                                className={getSortButtonClass("openInterest")}
                            >
                                <div className="flex items-center">
                                    {getColumnIcon("openInterest")}
                                    Open Interest
                                </div>
                                <ArrowUpDown className={`ml-2 h-3.5 w-3.5 transition-opacity ${sortField === 'openInterest' ? 'opacity-100' : 'opacity-60'}`} />
                            </Button>
                        </TableHead>
                        <TableHead className="text-right text-xs uppercase tracking-wide font-medium py-4 bg-transparent pr-6">
                            <Button
                                variant="ghost"
                                className={getSortButtonClass("funding")}
                                disabled={!isSortable("funding")}
                            >
                                Funding Rate
                                <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-60" />
                            </Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="bg-transparent">
                    {tokens.map((token) => (
                        <TableRow
                            key={token.name}
                            className="border-b border-[#FFFFFF0A] hover:bg-[#83E9FF0A] cursor-pointer transition-all"
                            onClick={() => handleTokenClick(token.name)}
                        >
                            <TableCell className="py-4 pl-6">
                                <div className="flex items-center gap-3">
                                    {token.logo ? (
                                        <TokenImage
                                            src={token.logo}
                                            alt={token.name}
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-[#051728] border border-[#83E9FF33] flex items-center justify-center shadow-[0_0_8px_rgba(131,233,255,0.08)]">
                                            <span className="text-[#83E9FF] text-xs font-medium">{token.name.charAt(0)}</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-white text-sm md:text-base font-medium">{token.name}</span>
                                        <span className="text-[#83E9FF] bg-[#83E9FF1A] px-1.5 py-0.5 rounded text-xs">{token.maxLeverage}x</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right text-white text-sm md:text-base font-medium">
                                ${formatNumber(token.price)}
                            </TableCell>
                            <TableCell className={`text-right text-sm md:text-base font-medium ${getChangeColorClass(token.change24h)}`}>
                                {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                            </TableCell>
                            <TableCell className="text-right text-white text-sm md:text-base">
                                ${formatNumber(token.volume, 'volume')}
                            </TableCell>
                            <TableCell className="text-right text-white text-sm md:text-base">
                                ${formatNumber(token.openInterest, 'volume')}
                            </TableCell>
                            <TableCell className={`text-right text-sm md:text-base font-medium pr-6 ${getFundingColorClass(token.funding)}`}>
                                {formatFunding(token.funding)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex justify-between items-center mt-5 px-6 pb-4 pt-4 border-t border-[#FFFFFF0A]">
                <div className="text-[#FFFFFF80] text-xs">
                    Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateParams({ page: page - 1 })}
                        disabled={page <= 1}
                        className="border-[#83E9FF33] text-white bg-[#FFFFFF08] hover:bg-[#83E9FF15] hover:border-[#83E9FF66] transition-all rounded-md px-4 py-1.5 h-auto text-xs"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateParams({ page: page + 1 })}
                        disabled={page >= totalPages}
                        className="border-[#83E9FF33] text-white bg-[#FFFFFF08] hover:bg-[#83E9FF15] hover:border-[#83E9FF66] transition-all rounded-md px-4 py-1.5 h-auto text-xs"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
});