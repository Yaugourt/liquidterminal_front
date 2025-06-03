import { memo } from "react";
import { Card } from "@/components/ui/card";
import { useTrendingSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { Loader2, Database, ArrowUpDown } from "lucide-react";
import { formatNumber } from "@/lib/format";
import Image from "next/image";
import { getPriceChangeColor, formatPriceChange } from "@/components/ui/PriceChange";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,  
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SpotSortableFields } from "@/components/market/common/types";

/**
 * Carte affichant les tokens les plus populaires sans titre
 */
export const TrendingTokensCard = memo(function TrendingTokensCard() {
  const [sortField, setSortField] = useState<SpotSortableFields>("change24h");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const { data: trendingTokens, isLoading, error, updateParams } = useTrendingSpotTokens(5, sortField, sortOrder);

  const handleSort = (field: SpotSortableFields) => {
    if (sortField === field) {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
      updateParams({ sortBy: field, sortOrder: newOrder });
    } else {
      setSortField(field);
      setSortOrder("desc");
      updateParams({ sortBy: field, sortOrder: "desc" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-16">
        <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-16">
        <p className="text-red-500 text-sm">Une erreur est survenue lors du chargement des données</p>
      </div>
    );
  }

  return (
    <Card className="w-full p-0 bg-[#051728E5] border border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-xl">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#051728]">
              <TableHead className="text-[#FFFFFF99] font-normal py-1 pl-3 bg-[#051728]">
                <Button
                  variant="ghost"
                  className="text-[#FFFFFF99] text-xs font-normal hover:text-white p-0 flex items-center"
                >
                  Name
                </Button>
              </TableHead>
              <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
                <Button
                  variant="ghost"
                  className="text-[#FFFFFF99] text-xs font-normal hover:text-white p-0 flex items-center ml-auto justify-end w-full"
                >
                  Price
                </Button>
              </TableHead>
              <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("volume")}
                  className={`${sortField === "volume" ? "text-[#83E9FF]" : "text-[#FFFFFF99]"} text-xs font-normal hover:text-white p-0 flex items-center ml-auto justify-end w-full`}
                >
                  Volume
                  <ArrowUpDown className="ml-1.5 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-[#FFFFFF99] font-normal py-1 pr-3 bg-[#051728]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("change24h")}
                  className={`${sortField === "change24h" ? "text-[#83E9FF]" : "text-[#FFFFFF99]"} text-xs font-normal hover:text-white p-0 flex items-center ml-auto justify-end w-full`}
                >
                  24h
                  <ArrowUpDown className="ml-1.5 h-3 w-3" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#051728]">
            {trendingTokens && trendingTokens.length > 0 ? (
              [...trendingTokens]
                .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
                .map((token) => (
                <TableRow
                  key={token.name}
                  className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors"
                >
                  <TableCell className="py-1.5 pl-3">
                    <div className="flex items-center gap-1.5">
                      {token.logo ? (
                        <Image
                          src={token.logo}
                          alt={token.name}
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full border border-[#83E9FF33] shadow-[0_0_8px_rgba(131,233,255,0.15)] backdrop-blur-sm"
                          unoptimized
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#051728] border border-[#83E9FF33] flex items-center justify-center shadow-[0_0_8px_rgba(131,233,255,0.08)]">
                          <span className="text-[#83E9FF] text-xs">{token.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="text-white text-xs">{token.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-white text-xs py-1.5">
                    ${formatNumber(token.price, 'price')}
                  </TableCell>
                  <TableCell className="text-right text-white text-xs py-1.5">
                    ${formatNumber(token.volume, 'volume')}
                  </TableCell>
                  <TableCell className="text-right text-xs py-1.5 pr-3">
                    <span style={{color: token.change24h < 0 ? '#FF4D4F' : '#52C41A'}}>
                      {formatPriceChange(token.change24h)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  <div className="flex flex-col items-center justify-center">
                    <Database className="w-8 h-8 mb-3 text-[#83E9FF4D]" />
                    <p className="text-white text-sm">Aucun token disponible</p>
                    <p className="text-[#FFFFFF80] text-xs mt-1">Vérifiez plus tard</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}); 