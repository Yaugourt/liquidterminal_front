import { memo } from "react";
import { Gavel, Clock, ExternalLink, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuctionTiming, usePerpAuctionTiming } from "@/services/market/auction";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";

interface AuctionCardProps {
  marketType: "spot" | "perp";
}

/**
 * Carte affichant les informations d'enchères en temps réel
 */
export const AuctionCard = memo(function AuctionCard({ marketType }: AuctionCardProps) {
  const spotAuction = useAuctionTiming();
  const perpAuction = usePerpAuctionTiming();
  
  const { auctionState, isLoading, error } = marketType === "spot" ? spotAuction : perpAuction;
  const { format } = useNumberFormat();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 border border-red-500/20 rounded-xl bg-red-500/5">
        <div className="flex items-center gap-2 text-red-400 mb-2">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">Failed to load data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden shadow-xl shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-4 pt-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${auctionState.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            <Gavel size={16} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white tracking-tight">Auction Status</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${auctionState.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className={`text-[10px] font-medium ${auctionState.isActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                {auctionState.isActive ? "LIVE NOW" : "UPCOMING"}
              </span>
            </div>
          </div>
        </div>
        
        <Link
          href={marketType === "spot" 
            ? "https://app.hyperliquid.xyz/deploySpot" 
            : "https://app.hyperliquid.xyz/deployPerp"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#83E9FF] bg-[#83E9FF]/5 hover:bg-[#83E9FF]/10 rounded-lg border border-[#83E9FF]/10 transition-colors"
        >
          Participate
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-4 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#83E9FF]/50"></div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Price & Timer */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500 font-medium mb-1">Current Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white tracking-tight">
                    {formatNumber(auctionState.currentPrice, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                    <span className="text-sm font-medium text-zinc-400 ml-1">HYPE</span>
                  </span>
                </div>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  ≈ {formatNumber(auctionState.currentPriceUSD, format, { minimumFractionDigits: 2, currency: '$', showCurrency: true })}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-zinc-500 font-medium mb-1">
                  {auctionState.isActive ? "Time Remaining" : "Starts In"}
                </p>
                <div className="flex items-center justify-end gap-2 text-white">
                  <Clock className="w-4 h-4 text-[#f9e370]" />
                  <span className="text-xl font-mono font-medium tracking-tight">
                    {auctionState.isActive ? auctionState.timeRemaining : auctionState.nextAuctionStart}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                <span>Start</span>
                <span>{auctionState.progressPercentage.toFixed(0)}% Complete</span>
                <span>End</span>
              </div>
              <div className="h-2 bg-black/20 rounded-full overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    auctionState.progressPercentage < 30 ? 'bg-gradient-to-r from-red-500 to-red-400' :
                    auctionState.progressPercentage < 70 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                    'bg-gradient-to-r from-emerald-500 to-green-400'
                  }`}
                  style={{ width: `${auctionState.progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Footer Info */}
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Last Auction</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#f9e370] font-medium">{auctionState.lastAuctionName}</span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-white font-medium">{formatNumber(auctionState.lastAuctionPrice, format)} HYPE</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
});
