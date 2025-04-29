import { memo } from "react";
import { MarketStatsCard } from "../MarketStatsCard";

/**
 * Carte affichant les informations d'enchères (placeholder)
 */
export const AuctionCard = memo(function AuctionCard() {
  return (
    <MarketStatsCard title="Auction">
      <div className="text-white text-sm">
        Auction details coming soon...
      </div>
    </MarketStatsCard>
  );
}); 