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
import { Loader2, ArrowUpDown, TrendingUp, Coins } from "lucide-react";
import { TrendingTokensProps } from "@/components/types/dashboard.types";
import { useState } from "react";
import { PerpMarketData } from "@/services/market/perp/types";
import { Button } from "@/components/ui/button";

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
    <div className="w-full md:w-[48%] lg:w-[49%]">
      <div className="flex justify-between items-center mb-3 w-full">
        <div className="flex items-center gap-2">
       
          <h3 className="text-white font-medium text-lg">{tableTitle}</h3>
        </div>
        <div className="flex gap-4 sm:gap-6">
          <div className="text-white">
            <span className="text-[#FFFFFFCC] text-xs sm:text-sm font-normal">Volume:</span>
            <span className="ml-2 text-[#83E9FF] text-base sm:text-[20px] font-medium text-right">
              ${formatLargeNumber(totalVolume || 0, { decimals: 2 })}
            </span>
          </div>
          <div className="text-white">
            <span className="text-[#FFFFFFCC] text-xs sm:text-sm font-normal">Tokens:</span>
            <span className="ml-2 text-[#83E9FF] text-base sm:text-[20px] font-medium text-right">
              {tokens?.length || 0}
            </span>
          </div>
        </div>
      </div>
      <Card className="w-full p-0 bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-xl">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728] scrollbar-thumb-rounded-full">
          <Table className="border-separate border-spacing-0 rounded-lg min-w-[400px]">
            <TableHeader>
              <TableRow className="bg-[#051728] hover:bg-[#0B2437]">
                <TableHead className="border-b-[1px] border-[#83E9FF4D] text-left p-2 sm:p-3 text-xs sm:text-sm">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className={getSortableHeaderClass("name")}
                  >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="border-b-[1px] border-[#83E9FF4D] text-right p-2 sm:p-3">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("price")}
                    className={getSortableHeaderClass("price")}
                  >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="border-b-[1px] border-[#83E9FF4D] text-right p-2 sm:p-3">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("change24h")}
                    className={getSortableHeaderClass("change24h")}
                  >
                    24h
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="border-b-[1px] border-[#83E9FF4D] text-right p-2 sm:p-3">
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
                    <TableCell className="p-2.5 sm:p-3.5 text-xs sm:text-sm font-medium">{token.name}</TableCell>
                    <TableCell className="text-right p-2.5 sm:p-3.5 text-xs sm:text-sm">
                      ${formatLargeNumber(token.price, { decimals: 2 })}
                    </TableCell>
                    <TableCell className={`text-right p-2.5 sm:p-3.5 text-xs sm:text-sm ${getChangeColorClass(token.change24h)}`}>
                      <span className="px-2 py-0.5 rounded-md bg-opacity-10" style={{ 
                        backgroundColor: token.change24h > 0 ? 'rgba(131, 233, 255, 0.1)' : token.change24h < 0 ? 'rgba(255, 87, 87, 0.1)' : 'transparent' 
                      }}>
                        {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right p-2.5 sm:p-3.5 text-xs sm:text-sm">
                      ${formatLargeNumber(type === "perp" ? (token as PerpMarketData).openInterest : token.volume, { decimals: 2 })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center p-5 text-[#FFFFFF80]">
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