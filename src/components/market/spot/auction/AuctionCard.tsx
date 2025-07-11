import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Gavel, Clock, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

/**
 * Carte affichant les informations d'enchères
 */
export const AuctionCard = memo(function AuctionCard() {
  // Données d'exemple (à remplacer par l'API)
  const currentPrice = 500;
  const currentPriceUSD = 1250;
  const timeRemaining = "2h 15m";
  const lastAuctionPrice = 550;
  const progressPercentage = 65; // Exemple de progression

  return (
    <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D] shadow-sm backdrop-blur-sm hover:border-[#83E9FF66] transition-all rounded-md h-full flex flex-col">
      {/* Header avec titre et bouton See All */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Gavel size={18} className="text-[#f9e370]" />
          <h3 className="text-sm text-[#FFFFFF] font-medium tracking-wide">AUCTION</h3>
        </div>
        
        <Link
          href="/auction"
          className="flex items-center gap-1 px-2 py-1 text-xs text-[#83E9FF] hover:text-white transition-colors"
        >
          See All
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Contenu principal - flex-1 pour occuper l'espace */}
      <div className="flex-1 flex flex-col justify-center space-y-4">
        {/* Prix et temps restant */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-base text-white font-medium">
              {currentPrice} HYPE 
            </span>
            <span className="text-sm text-white ml-1">
              (${currentPriceUSD.toLocaleString()})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-[#f9e370]" />
            <span className="text-sm text-white">
              {timeRemaining}
            </span>
          </div>
        </div>

        {/* Barre de progression */}
        <div>
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-[#FFFFFF1A]"
          />
        </div>

        {/* Dernière enchère */}
        <div className="text-sm">
          <span className="text-white">Last auction </span>
          <span className="text-[#f9e370] font-medium">MONEY</span>
          <span className="text-white font-medium"> {lastAuctionPrice} HYPE</span>
        </div>
      </div>
    </Card>
  );
}); 