import { memo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface MarketStatsCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
  isLoading?: boolean;
}

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
        "p-4 bg-[#051728E5] border-2 border-[#83E9FF4D]", 
        "shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]", 
        "transition-all duration-200 hover:border-[#83E9FF80]",
        className
      )}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-lg font-semibold">{title}</h3>
        {headerRight}
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 text-[#83E9FF4D] animate-spin" />
        </div>
      ) : (
        children
      )}
    </Card>
  );
});
