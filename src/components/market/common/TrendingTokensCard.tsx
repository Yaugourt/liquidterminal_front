import { memo, useState } from "react";
import { Card } from "@/components/ui/card";
import { useTrendingSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { useTrendingPerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { Loader2, Database, ArrowUpDown } from "lucide-react";
import { formatNumber, formatLargeNumber } from "@/lib/formatting";
import { formatPriceChange, TokenIcon } from "@/components/common";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,  
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SpotSortableFields } from "@/components/market";
import { useNumberFormat } from "@/store/number-format.store";

interface TrendingTokensCardProps {
  market: 'spot' | 'perp';
}

/**
 * Carte affichant les tokens les plus populaires (spot ou perp)
 */
export const TrendingTokensCard = memo(function TrendingTokensCard({ market }: TrendingTokensCardProps) {
  // Types de tri différents selon le marché
  const [sortField, setSortField] = useState<SpotSortableFields | 'change24h' | 'openInterest'>(
    market === 'spot' ? "change24h" : "change24h"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { format } = useNumberFormat();
  
  // Hooks différents selon le marché
  const spotResult = market === 'spot' ? useTrendingSpotTokens(
    5, 
    sortField as SpotSortableFields, 
    sortOrder
  ) : { data: [], isLoading: false, error: null };
  
  const perpResult = market === 'perp' ? useTrendingPerpMarkets(
    5, 
    sortField as 'change24h' | 'openInterest', 
    sortOrder
  ) : { data: [], isLoading: false, error: null, updateParams: undefined };

  // Sélectionner les bonnes données selon le marché
  const { data: trendingTokens, isLoading, error } = market === 'spot' ? spotResult : perpResult;

  const handleSort = (field: SpotSortableFields | 'change24h' | 'openInterest') => {
    if (sortField === field) {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
      if (market === 'perp' && perpResult.updateParams) {
        perpResult.updateParams({ sortBy: field as any, sortOrder: newOrder });
      }
    } else {
      setSortField(field);
      setSortOrder("desc");
      if (market === 'perp' && perpResult.updateParams) {
        perpResult.updateParams({ sortBy: field as any, sortOrder: "desc" });
      }
    }
  };

  const formatValue = (value: number) => {
    return formatNumber(value, format, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      currency: '$',
      showCurrency: true
    });
  };

  const formatVolume = (value: number) => {
    // $ + espace + lettre (ex: $1.2 M)
    return formatLargeNumber(value, { prefix: '$', decimals: 2, suffix: '' }).replace(/([0-9])([KMB])$/, '$1 $2');
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg h-full">
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
      </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg h-full">
        <div className="flex justify-center items-center h-full">
          <p className="text-red-500 text-sm">Une erreur est survenue</p>
      </div>
      </Card>
    );
  }

  return (
    <Card className="w-full p-0 bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg h-full flex flex-col">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent flex-1">
        <Table className="h-full">
          <TableHeader>
            <TableRow className="border-none bg-[#051728]">
              <TableHead className="text-white text-sm py-1.5 bg-[#051728] pl-4 w-[35%]">
                <Button
                  variant="ghost"
                  className="text-white hover:text-white p-0 flex items-center justify-start w-full"
                  style={{fontWeight: 400, fontSize: '0.875rem'}}
                >
                  Name
                </Button>
              </TableHead>
              <TableHead className="text-white text-sm py-1.5 bg-[#051728] pl-4 w-[20%]">
                <Button
                  variant="ghost"
                  className="text-white hover:text-white p-0 flex items-center justify-start w-full"
                  style={{fontWeight: 400, fontSize: '0.875rem'}}
                >
                  Price
                </Button>
              </TableHead>
              
              {/* Colonne conditionnelle : Volume pour spot, 24h pour perp */}
              {market === 'spot' ? (
                <TableHead className="text-white text-sm py-1.5 bg-[#051728] pl-4 w-[20%]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("volume")}
                    className={`${sortField === "volume" ? "text-[#f9e370] hover:text-[#f9e370]" : "text-white hover:text-white"} p-0 flex items-center justify-start w-full`}
                    style={{fontWeight: 400, fontSize: '0.875rem'}}
                  >
                    Volume
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              ) : (
                <TableHead className="text-white text-sm py-1.5 bg-[#051728] pl-4 w-[20%]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("change24h")}
                    className={`${sortField === "change24h" ? "text-[#f9e370] hover:text-[#f9e370]" : "text-white hover:text-white"} p-0 flex items-center justify-start w-full`}
                    style={{fontWeight: 400, fontSize: '0.875rem'}}
                  >
                    24h
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              
              {/* Dernière colonne : 24h pour spot, Open Interest pour perp */}
              {market === 'spot' ? (
                <TableHead className="text-white text-sm py-1.5 bg-[#051728] pl-4 w-[20%]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("change24h")}
                    className={`${sortField === "change24h" ? "text-[#f9e370] hover:text-[#f9e370]" : "text-white hover:text-white"} p-0 flex items-center justify-start w-full`}
                    style={{fontWeight: 400, fontSize: '0.875rem'}}
                  >
                    24h
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              ) : (
                <TableHead className="text-white text-sm py-1.5 bg-[#051728] pl-4 pr-4 w-[20%]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("openInterest")}
                    className={`${sortField === "openInterest" ? "text-[#f9e370] hover:text-[#f9e370]" : "text-white hover:text-white"} p-0 flex items-center justify-start w-full`}
                    style={{fontWeight: 400, fontSize: '0.875rem'}}
                  >
                    Open Interest
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#051728]">
            {trendingTokens && trendingTokens.length > 0 ? (
              trendingTokens.map((token, index) => (
                <TableRow
                  key={token.name}
                  className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors h-[1fr]"
                  style={{ height: `${100 / trendingTokens.length}%` }}
                >
                  <TableCell className="py-1.5 pl-4">
                    <div className="flex items-center gap-1.5">
                      <TokenIcon src={token.logo} name={token.name} size="sm" />
                      <span className="text-white text-xs">{token.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-left text-white text-xs py-1.5 pl-4">
                    {formatValue(token.price)}
                  </TableCell>
                  
                  {/* Colonne conditionnelle */}
                  {market === 'spot' ? (
                    <TableCell className="text-left text-white text-xs py-1.5 pl-4">
                      {formatVolume(token.volume)}
                    </TableCell>
                  ) : (
                    <TableCell className="text-left text-xs py-1.5 pl-4">
                      <span style={{color: token.change24h < 0 ? '#FF4D4F' : '#52C41A'}}>
                        {formatPriceChange(token.change24h)}
                      </span>
                    </TableCell>
                  )}
                  
                  {/* Dernière colonne */}
                  {market === 'spot' ? (
                    <TableCell className="text-left text-xs py-1.5 pl-4">
                      <span style={{color: token.change24h < 0 ? '#FF4D4F' : '#52C41A'}}>
                        {formatPriceChange(token.change24h)}
                      </span>
                    </TableCell>
                  ) : (
                    <TableCell className="text-left text-white text-xs py-1.5 pl-4 pr-4">
                      {'$' + formatNumber((token as any).openInterest, format, { showCurrency: false, minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
                    <p className="text-white text-lg">Aucun token disponible</p>
                    <p className="text-[#FFFFFF80] text-sm mt-2">Vérifiez plus tard</p>
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