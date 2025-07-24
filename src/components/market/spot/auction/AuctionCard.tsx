import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Gavel, Clock, ExternalLink, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuctionTiming } from "@/services/market/auction";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/numberFormatting";

/**
 * Carte affichant les informations d'enchères en temps réel
 */
export const AuctionCard = memo(function AuctionCard() {
  const { auctionState, isLoading, error } = useAuctionTiming();
  const { format } = useNumberFormat();

  if (error) {
    return (
      <Card className="p-3 bg-[#051728E5] border border-red-500/50 shadow-sm backdrop-blur-sm rounded-md h-full flex flex-col">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle size={18} />
          <span className="text-sm">Failed to load auction data</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D] shadow-sm backdrop-blur-sm hover:border-[#83E9FF66] transition-all rounded-md h-full flex flex-col">
      {/* Header avec titre et bouton See All */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Gavel size={16} className="text-[#f9e370]" />
          <h3 className="text-sm text-[#FFFFFF] font-medium tracking-wide">
            AUCTION {auctionState.isActive ? (
              <span className="text-[#4ade80]">(● Active)</span>
            ) : (
              <span className="text-[#ff5757]">(● INACTIVE)</span>
            )}
          </h3>
        </div>
        
        <Link
          href="https://app.hyperliquid.xyz/deploySpot"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 text-xs text-[#83E9FF] hover:text-white transition-colors"
        >
          Buy Auction
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Contenu principal - flex-1 pour occuper l'espace */}
      <div className="flex-1 flex flex-col justify-center space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#83E9FF]"></div>
          </div>
        ) : (
          <>
            {/* Groupe centré: Prix, temps et barre de progression */}
            <div className="flex-1 flex items-center justify-center">
              <div className="space-y-3 w-full">
                {/* Prix et temps restant */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white font-medium">
                      {formatNumber(auctionState.currentPrice, format, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })} HYPE 
                    </span>
                    <span className="text-xs text-white ml-1">
                      ({formatNumber(auctionState.currentPriceUSD, format, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                        currency: '$',
                        showCurrency: true
                      })})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[#f9e370]" />
                    <span className="text-xs text-white">
                      {auctionState.isActive ? auctionState.timeRemaining : auctionState.nextAuctionStart}
                    </span>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="space-y-2 w-full">
                  <div className="w-full bg-[#FFFFFF1A] rounded-full h-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        auctionState.progressPercentage < 30 ? 'bg-red-500' :
                        auctionState.progressPercentage < 70 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${auctionState.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[#FFFFFF80]">
                    <span>Start</span>
                    <span>{auctionState.progressPercentage.toFixed(1)}%</span>
                    <span>End</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statut et informations */}
            <div className="text-xs space-y-1">
              {auctionState.isActive ? (
                <div className="h-3"></div>
              ) : (
                <div className="space-y-1">
                  <div>
                    <span className="text-[#f97316]">● Next auction starts in {auctionState.nextAuctionStart}</span>
                  </div>
                  <div>
                    <span className="text-white">Starting price </span>
                    <span className="text-[#4ade80] font-medium">{formatNumber(auctionState.currentPrice, format)} HYPE</span>
                  </div>
                </div>
              )}
              <div>
                <span className="text-white">Last auction </span>
                <span className="text-[#f9e370] font-medium">{auctionState.lastAuctionName}</span>
                <span className="text-white font-medium"> {formatNumber(auctionState.lastAuctionPrice, format)} HYPE</span>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}); 