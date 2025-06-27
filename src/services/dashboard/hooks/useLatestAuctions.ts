// Import depuis le nouveau module auction
import { useLatestAuctions as useMarketLatestAuctions } from '../../market/auction';
import { AuctionInfo } from '../../market/auction/types';

// Hook de compatibilité qui utilise la nouvelle logique
export const useLatestAuctions = (
  limit: number = 5,
  currency: "HYPE" | "USDC",
  initialData?: AuctionInfo[]
) => {
  // Utiliser le nouveau hook avec la même interface
  const result = useMarketLatestAuctions(limit, currency, initialData);
  
  return {
    auctions: result.auctions.slice(0, limit), // Assurer la limitation
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
    splitTimestamp: result.splitTimestamp
  };
}; 