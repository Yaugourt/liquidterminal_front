/**
 * Hook pour récupérer les balances de tous les wallets suivis
 */

import { useDataFetching } from '@/hooks/useDataFetching';
import { 
  fetchHyperliquidBalances, 
  fetchHyperliquidPerpPositions 
} from '../hyperliquid.service';
import { HyperliquidBalance, HyperliquidPerpResponse } from '../types';

interface WalletBalancesData {
  spotBalances: HyperliquidBalance[];
  perpPositions: HyperliquidPerpResponse | null;
}

/**
 * Hook pour récupérer les balances de tous les wallets suivis
 * @param address Adresse du wallet pour lequel récupérer les balances
 * @returns Les balances de tous les wallets, l'état de chargement, les erreurs et une fonction de rafraîchissement
 */
export const useWalletsBalances = (address?: string) => {
  const { 
    data,
    isLoading,
    error,
    refetch
  } = useDataFetching<WalletBalancesData>({
    fetchFn: async () => {
      // Utiliser l'adresse fournie
      if (!address) {
        console.warn('No address provided for wallet balances');
        return {
          spotBalances: [],
          perpPositions: null
        };
      }



      try {
        // Fetch both balances in parallel
        const [spotResponse, perpResponse] = await Promise.all([
          // Fetch spot balances
          fetchHyperliquidBalances({
            type: 'spotClearinghouseState',
            user: address
          }).then(response => {
    
            return response;
          }),

          // Fetch perpetual positions
          fetchHyperliquidPerpPositions({
            type: 'clearinghouse',
            user: address
          }).then(response => {
    
            return response;
          })
        ]);

        return {
          spotBalances: spotResponse,
          perpPositions: perpResponse
        };
      } catch (err: any) {
        console.error('Error fetching balances:', err);
        throw new Error(err.message || 'Failed to fetch balances');
      }
    },
    refreshInterval: 30000, // Rafraîchir toutes les 20 secondes
    maxRetries: 3,
    dependencies: [address]
  });

  return {
    spotBalances: data?.spotBalances || [],
    perpPositions: data?.perpPositions || null,
    isLoading,
    error,
    refresh: refetch
  };
}; 