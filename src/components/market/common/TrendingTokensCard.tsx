import { memo } from "react";
import { UniversalTokenTable } from "./UniversalTokenTable";

interface TrendingTokensCardProps {
  market: 'spot' | 'perp';
}

/**
 * Carte affichant les tokens les plus populaires (spot ou perp)
 * Wrapper autour de UniversalTokenTable en mode compact
 */
export const TrendingTokensCard = memo(function TrendingTokensCard({ market }: TrendingTokensCardProps) {
  return (
    <div className="h-full">
      <UniversalTokenTable
        market={market}
        mode="compact"
      />
    </div>
  );
}); 