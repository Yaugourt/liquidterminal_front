import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,  
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { formatLargeNumber } from "@/lib/formatting";
import { useTopTokens } from "@/services/dashboard/hooks/useTopSpotTokens";
import { useTopPerpTokens } from "@/services/dashboard/hooks/useTopPerpTokens";
import { Loader2, ArrowUpDown,ArrowRight } from "lucide-react";
import { TrendingTokensProps } from "@/components/types/dashboard.types";
import { useState } from "react";
import { PerpMarketData } from "@/services/market/perp/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type SpotSortType = "marketcap" | "volume" | "change24h" | "price" | "name";
type PerpSortType = "openInterest" | "volume" | "change24h" | "price" | "name";
type SortType = SpotSortType | PerpSortType;
type SortOrder = "asc" | "desc";

export function TrendingTokens({ type, title }: TrendingTokensProps) {
  const defaultSort = type === "spot" ? "volume" : "volume";
  const [sortBy, setSortBy] = useState<SortType>(defaultSort);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  const {
    tokens: spotTokens,
    isLoading: isLoadingSpot,
    error: errorSpot,
    updateParams: updateSpotParams,
    totalVolume: spotTotalVolume
  } = useTopTokens();

  const {
    tokens: perpTokens,
    isLoading: isLoadingPerp,
    error: errorPerp,
    updateParams: updatePerpParams,
    totalVolume: perpTotalVolume
  } = useTopPerpTokens();

  const tokens = type === "spot" ? spotTokens : perpTokens;
  const isLoading = type === "spot" ? isLoadingSpot : isLoadingPerp;
  const error = type === "spot" ? errorSpot : errorPerp;
  const totalVolume = type === "spot" ? spotTotalVolume : perpTotalVolume;
  const updateParams = type === "spot" ? updateSpotParams : updatePerpParams;
  
  // Page destination based on type
  const destinationPage = type === "spot" ? "/market/spot" : "/market/perp";

  // Obtenir la classe de couleur en fonction du changement de prix
  const getChangeColorClass = (change: number) => {
    if (change > 0) return "text-[#83E9FF]";
    if (change < 0) return "text-red-500";
    return "text-white";
  };

  // Gérer le tri des colonnes
  const handleSort = (field: SortType) => {
    const newOrder = sortBy === field && sortOrder === "desc" ? "asc" : "desc";
    setSortBy(field);
    setSortOrder(newOrder);
    updateParams({ 
      sortBy: field, 
      sortOrder: newOrder 
    });
  };

  // Obtenir la classe pour l'en-tête de colonne triable
  const getSortableHeaderClass = (field: SortType) => {
    const isActive = sortBy === field;
    return `text-[#FFFFFF99] font-normal hover:text-white cursor-pointer transition-colors ${isActive ? 'text-white' : ''}`;
  };

  if (isLoading) {
    return (
      <div className="w-full md:w-[48%] lg:w-[49%] flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full md:w-[48%] lg:w-[49%] flex justify-center items-center">
        <p className="text-red-500">Une erreur est survenue lors du chargement des données</p>
      </div>
    );
  }

  // Table title to display outside the table
  const tableTitle = title || (type === "perp" ? "Top Perp Tokens" : "Top Spot Tokens");

  return (
    <div className="w-full md:w-[49%] lg:w-[49.5%]">
      <div className="flex items-center justify-between mb-3 w-full">
        <div className="flex-shrink-0">
          <h3 className="text-white font-medium text-lg font-serif">{tableTitle}</h3>
        </div>
        
        <div className="flex-grow flex justify-center items-center text-white whitespace-nowrap">
          <span className="text-[#FFFFFFCC] text-xs">Volume:</span>
          <span className="ml-2 text-[#83E9FF] text-base font-medium">
            ${formatLargeNumber(totalVolume || 0, { prefix: '$', decimals: 2 })}
          </span>
        </div>
        
        <div className="flex-grow-0">
          <Link href={destinationPage} passHref>
            <Button 
              variant="ghost" 
              className="text-[#83E9FF] hover:text-white hover:bg-transparent transition-colors py-1 px-2 h-auto"
              size="sm"
            >
              <span className="text-xs mr-1">See All</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
      
      <Card className="w-full p-0 bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-xl">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728] scrollbar-thumb-rounded-full">
          <Table className="border-separate border-spacing-0 rounded-lg w-full table-fixed">
            <TableHeader>
              <TableRow className="bg-[#051728] hover:bg-[#0B2437]">
                <TableHead className="border-b-[1px] border-[#83E9FF4D] text-left px-1.5 sm:px-2 py-2.5 sm:py-3.5 text-xs sm:text-sm w-[30%]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className={getSortableHeaderClass("name")}
                  >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="border-b-[1px] border-[#83E9FF4D] text-right px-1.5 sm:px-2 py-2.5 sm:py-3.5 text-xs sm:text-sm w-[20%]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("price")}
                    className={getSortableHeaderClass("price")}
                  >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="border-b-[1px] border-[#83E9FF4D] text-right px-1.5 sm:px-2 py-2.5 sm:py-3.5 text-xs sm:text-sm w-[20%]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("change24h")}
                    className={getSortableHeaderClass("change24h")}
                  >
                    24h
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="border-b-[1px] border-[#83E9FF4D] text-right px-1.5 sm:px-2 py-2.5 sm:py-3.5 text-xs sm:text-sm w-[30%]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(type === "perp" ? "openInterest" : "volume")}
                    className={getSortableHeaderClass(type === "perp" ? "openInterest" : "volume")}
                  >
                    {type === "perp" ? "Open Interest" : "Volume"}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-white">
              {tokens && tokens.length > 0 ? (
                tokens.map((token, index) => (
                  <TableRow 
                    key={token.name} 
                    className={`hover:bg-[#FFFFFF0A] cursor-pointer transition-all ${index !== tokens.length - 1 ? 'border-b border-[#FFFFFF1A]' : ''}`}
                  >
                    <TableCell className="px-1.5 sm:px-2 py-2.5 sm:py-3.5 text-xs sm:text-sm font-medium truncate">{token.name}</TableCell>
                    <TableCell className="text-right px-1.5 sm:px-2 py-2.5 sm:py-3.5 text-xs sm:text-sm whitespace-nowrap">
                      ${formatLargeNumber(token.price, { decimals: 2 })}
                    </TableCell>
                    <TableCell className={`text-right px-1.5 sm:px-2 py-2.5 sm:py-3.5 text-xs sm:text-sm whitespace-nowrap ${getChangeColorClass(token.change24h)}`}>
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-opacity-10" style={{ 
                        backgroundColor: token.change24h > 0 ? 'rgba(131, 233, 255, 0.1)' : token.change24h < 0 ? 'rgba(255, 87, 87, 0.1)' : 'transparent' 
                      }}>
                        {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-1.5 sm:px-2 py-2.5 sm:py-3.5 text-xs sm:text-sm whitespace-nowrap">
                      ${formatLargeNumber(type === "perp" ? (token as PerpMarketData).openInterest : token.volume, { decimals: 2 })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center px-3 py-5 text-[#FFFFFF80]">
                    Aucun token disponible
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}