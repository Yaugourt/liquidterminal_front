import { memo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { MarketStatsCardProps } from "@/components/types/market.types";

/**
 * Composant de carte pour afficher les statistiques du marché
 * Utilise le composant Card de base avec un style spécifique pour les statistiques du marché
 */
export const MarketStatsCard = memo(function MarketStatsCard({ 
  title, 
  children, 
  className,
  headerRight,
  isLoading = false
}: MarketStatsCardProps) {
  return (
    <Card 
      className={cn(
        "p-5 bg-[#051728]/60 backdrop-blur-md border border-[#83E9FF20]", 
        "shadow-lg rounded-xl", 
        "transition-all duration-200 hover:border-[#83E9FF30] hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)]",
        className
      )}
    >
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-white text-lg font-inter">{title}</h3>
        {headerRight}
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-7 h-7 text-[#83E9FF4D] animate-spin" />
        </div>
      ) : (
        children
      )}
    </Card>
  );
});
