import { memo, useState } from "react";
import { useTrendingSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { useTrendingPerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { Loader2, Database, ArrowUpDown } from "lucide-react";
import { formatNumber, formatLargeNumber } from "@/lib/formatters/numberFormatting";
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

import { PerpMarketData } from "@/services/market/perp/types";

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
  
  // Toujours appeler les hooks, mais ignorer les résultats non pertinents
  const spotResult = useTrendingSpotTokens(
    5, 
    sortField as SpotSortableFields, 
    sortOrder
  );
  
  const perpResult = useTrendingPerpMarkets(
    5, 
    sortField as 'change24h' | 'openInterest', 
    sortOrder
  );

  // Sélectionner les bonnes données selon le marché
  const { data: trendingTokens, isLoading, error } = market === 'spot' ? spotResult : perpResult;

  const handleSort = (field: SpotSortableFields | 'change24h' | 'openInterest') => {
    if (sortField === field) {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
      if (market === 'perp' && perpResult.updateParams) {
        perpResult.updateParams({ sortBy: field as 'change24h' | 'openInterest', sortOrder: newOrder });
      }
    } else {
      setSortField(field);
      setSortOrder("desc");
      if (market === 'perp' && perpResult.updateParams) {
        perpResult.updateParams({ sortBy: field as 'change24h' | 'openInterest', sortOrder: "desc" });
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
      <div className="w-full bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 overflow-hidden h-full">
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 overflow-hidden h-full">
        <div className="flex justify-center items-center h-full">
          <p className="text-rose-400 text-sm">Une erreur est survenue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 overflow-hidden h-full flex flex-col">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-1">
        <Table className="h-full">
          <TableHeader>
            <TableRow className="border-b border-white/5 hover:bg-transparent">
              <TableHead className="py-3 px-3 w-[35%]">
                <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Name</span>
              </TableHead>
              <TableHead className="py-3 px-3 w-[20%]">
                <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Price</span>
              </TableHead>
              
              {/* Colonne conditionnelle : Volume pour spot, 24h pour perp */}
              {market === 'spot' ? (
                <TableHead className="py-3 px-3 w-[20%]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("volume")}
                    className={`${sortField === "volume" ? "text-[#83E9FF]" : "text-zinc-400"} p-0 flex items-center justify-start gap-1 hover:text-white text-[10px] font-semibold uppercase tracking-wider`}
                  >
                    Volume
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
              ) : (
                <TableHead className="py-3 px-3 w-[20%]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("change24h")}
                    className={`${sortField === "change24h" ? "text-[#83E9FF]" : "text-zinc-400"} p-0 flex items-center justify-start gap-1 hover:text-white text-[10px] font-semibold uppercase tracking-wider`}
                  >
                    24h
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
              )}
              
              {/* Dernière colonne : 24h pour spot, Open Interest pour perp */}
              {market === 'spot' ? (
                <TableHead className="py-3 px-3 w-[20%]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("change24h")}
                    className={`${sortField === "change24h" ? "text-[#83E9FF]" : "text-zinc-400"} p-0 flex items-center justify-start gap-1 hover:text-white text-[10px] font-semibold uppercase tracking-wider`}
                  >
                    24h
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
              ) : (
                <TableHead className="py-3 px-3 w-[20%]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("openInterest")}
                    className={`${sortField === "openInterest" ? "text-[#83E9FF]" : "text-zinc-400"} p-0 flex items-center justify-start gap-1 hover:text-white text-[10px] font-semibold uppercase tracking-wider`}
                  >
                    Open Interest
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {trendingTokens && trendingTokens.length > 0 ? (
              trendingTokens.map((token) => (
                <TableRow
                  key={token.name}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  style={{ height: `${100 / trendingTokens.length}%` }}
                >
                  <TableCell className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <TokenIcon src={token.logo} name={token.name} size="sm" />
                      <span className="text-white text-sm font-medium">{token.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-left text-white text-sm py-2 px-3">
                    {formatValue(token.price)}
                  </TableCell>
                  
                  {/* Colonne conditionnelle */}
                  {market === 'spot' ? (
                    <TableCell className="text-left text-white text-sm py-2 px-3">
                      {formatVolume(token.volume)}
                    </TableCell>
                  ) : (
                    <TableCell className="text-left text-sm py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${token.change24h < 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {formatPriceChange(token.change24h)}
                      </span>
                    </TableCell>
                  )}
                  
                  {/* Dernière colonne */}
                  {market === 'spot' ? (
                    <TableCell className="text-left text-sm py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${token.change24h < 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {formatPriceChange(token.change24h)}
                      </span>
                    </TableCell>
                  ) : (
                    <TableCell className="text-left text-white text-sm py-2 px-3">
                      {'$' + formatNumber((token as PerpMarketData).openInterest, format, { showCurrency: false, minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <Database className="w-10 h-10 mb-3 text-zinc-600" />
                    <p className="text-zinc-400 text-sm mb-1">Aucun token disponible</p>
                    <p className="text-zinc-600 text-xs">Vérifiez plus tard</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}); 