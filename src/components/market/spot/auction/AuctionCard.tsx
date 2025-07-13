import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Gavel, Clock, ExternalLink, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useAuctionTiming } from "@/services/market/auction";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatting";

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
    <Card className="p-4 bg-[#051728E5] border border-[#83E9FF4D] shadow-sm backdrop-blur-sm hover:border-[#83E9FF66] transition-all rounded-md h-full flex flex-col">
      {/* Header avec titre et bouton See All */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5">
          <Gavel size={18} className="text-[#f9e370]" />
          <h3 className="text-sm text-[#FFFFFF] font-medium tracking-wide">
            AUCTION {auctionState.isActive ? (
              <span className="text-[#4ade80]">(● Active)</span>
            ) : (
              "(INACTIVE)"
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
      <div className="flex-1 flex flex-col justify-center space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#83E9FF]"></div>
          </div>
        ) : (
          <>
            {/* Prix et temps restant */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-base text-white font-medium">
                  {formatNumber(auctionState.currentPrice, format, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} HYPE 
                </span>
                <span className="text-sm text-white ml-1">
                  ({formatNumber(auctionState.currentPriceUSD, format, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    currency: '$',
                    showCurrency: true
                  })})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-[#f9e370]" />
                <span className="text-sm text-white">
                  {auctionState.isActive ? auctionState.timeRemaining : auctionState.nextAuctionStart}
                </span>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="space-y-2">
              <Progress 
                value={auctionState.progressPercentage} 
                className="h-2 bg-[#FFFFFF1A] [&>div]:bg-[#83E9FF]"
              />
              <div className="flex justify-between text-xs text-[#FFFFFF80]">
                <span>Start</span>
                <span>{auctionState.progressPercentage.toFixed(1)}%</span>
                <span>End</span>
              </div>
            </div>

            {/* Statut et dernière enchère */}
            <div className="text-sm space-y-2">
              {auctionState.isActive ? (
                <div className="h-5"></div>
              ) : (
                <div>
                  <span className="text-[#f97316]">● Next auction in {auctionState.nextAuctionStart}</span>
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