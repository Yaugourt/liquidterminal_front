"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Gavel } from "lucide-react";

/**
 * Carte affichant les informations d'enchères pour perp
 */
export const AuctionCard = memo(function AuctionCard() {
  return (
    <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D] shadow-sm backdrop-blur-sm hover:border-[#83E9FF66] transition-all rounded-md h-full flex flex-col">
      {/* Header avec titre */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Gavel size={18} className="text-[#f9e370]" />
          <h3 className="text-sm text-[#FFFFFF] font-medium tracking-wide">AUCTION</h3>
        </div>
      </div>

      {/* Contenu Coming Soon - flex-1 pour occuper l'espace */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <span className="text-white text-lg font-medium mb-2">Coming Soon</span>
        <span className="text-[#FFFFFF80] text-sm">Perp auctions will be available soon</span>
      </div>
    </Card>
  );
}); 