import { memo } from "react";
import { Card } from "@/components/ui/card";
import { useTrendingSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { Loader2 } from "lucide-react";
import { formatNumberWithoutDecimals } from "../../../lib/formatting";
import { cn } from "@/lib/utils";

/**
 * Carte affichant les tokens les plus populaires sans titre
 */
export const TrendingTokensCard = memo(function TrendingTokensCard() {
  const { data: trendingTokens, isLoading, error } = useTrendingSpotTokens();

  return (
    <Card 
      className={cn(
        "p-4 bg-[#051728E5] border-2 border-[#83E9FF4D]", 
        "shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]", 
        "transition-all duration-200 hover:border-[#83E9FF80]"
      )}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-24">
          <p className="text-red-500">Une erreur est survenue lors du chargement des données</p>
        </div>
      ) : trendingTokens && trendingTokens.length > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-12 items-center gap-1 sm:gap-2 mb-2 border-b border-[#83E9FF33] pb-2">
            <span className="text-[#83E9FF99] col-span-3 text-xs font-medium">Name</span>
            <span className="text-[#83E9FF99] col-span-3 text-right text-xs font-medium">Price</span>
            <span className="text-[#83E9FF99] col-span-3 text-right text-xs font-medium">Volume</span>
            <span className="text-[#83E9FF99] col-span-3 text-right text-xs font-medium">24h</span>
          </div>
          
          {trendingTokens.map((token, index) => (
            <div key={token.name} className="grid grid-cols-12 items-center gap-1 sm:gap-2 hover:bg-[#83E9FF0A] rounded py-1 transition-colors">
              <span className="text-white col-span-3 truncate text-xs sm:text-sm font-medium">{token.name}</span>
              <span className="text-white col-span-3 text-right text-xs sm:text-sm">
                ${formatNumberWithoutDecimals(token.price)}
              </span>
              <span className="text-white col-span-3 text-right text-xs sm:text-sm">
                ${formatNumberWithoutDecimals(token.volume)}
              </span>
              <span className={`col-span-3 text-right text-xs sm:text-sm ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-12 items-center gap-1 sm:gap-2 mb-2 border-b border-[#83E9FF33] pb-2">
            <span className="text-[#83E9FF99] col-span-3 text-xs font-medium">Name</span>
            <span className="text-[#83E9FF99] col-span-3 text-right text-xs font-medium">Price</span>
            <span className="text-[#83E9FF99] col-span-3 text-right text-xs font-medium">Volume</span>
            <span className="text-[#83E9FF99] col-span-3 text-right text-xs font-medium">24h</span>
          </div>
          
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="grid grid-cols-12 items-center gap-1 sm:gap-2 hover:bg-[#83E9FF0A] rounded py-1 transition-colors">
              <span className="text-white col-span-3 truncate text-xs sm:text-sm">Token {index + 1}</span>
              <span className="text-white col-span-3 text-right text-xs sm:text-sm">--</span>
              <span className="text-white col-span-3 text-right text-xs sm:text-sm">--</span>
              <span className="col-span-3 text-right text-xs sm:text-sm text-gray-400">--%</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}); 