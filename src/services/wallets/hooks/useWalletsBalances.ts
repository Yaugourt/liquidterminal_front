/**
 * Hook pour récupérer les balances de tous les wallets suivis
 */

import { useState, useEffect } from 'react';
import { useWallets } from '../../../store/use-wallets';
import { 
  fetchHyperliquidBalances, 
  fetchHyperliquidPerpPositions 
} from '../hyperliquid.service';
import { HyperliquidBalance, HyperliquidPerpResponse } from '../types';

/**
 * Hook pour récupérer les balances de tous les wallets suivis
 * @returns Les balances de tous les wallets, l'état de chargement, les erreurs et une fonction de rafraîchissement
 */
export const useWalletsBalances = () => {
  const { wallets, activeWalletId } = useWallets();
  const activeWallet = wallets.find(w => w.id === activeWalletId);
  
  const [spotBalances, setSpotBalances] = useState<HyperliquidBalance[]>([]);
  const [perpPositions, setPerpPositions] = useState<HyperliquidPerpResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    if (!activeWallet?.address) {
      console.warn('No active wallet address found');
      setSpotBalances([]);
      setPerpPositions(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching balances for wallet:', activeWallet.address);

      // Fetch spot balances
      const spotRequest = {
        type: 'spotClearinghouseState',
        user: activeWallet.address
      };
      console.log('Sending spot request:', spotRequest);
      const spotResponse = await fetchHyperliquidBalances(spotRequest);
      console.log('Received spot balances:', spotResponse);
      setSpotBalances(spotResponse);

      // Fetch perpetual positions
      const perpRequest = {
        type: 'clearinghouse',
        user: activeWallet.address
      };
      console.log('Sending perp request:', perpRequest);
      const perpResponse = await fetchHyperliquidPerpPositions(perpRequest);
      console.log('Received perp positions:', perpResponse);
      setPerpPositions(perpResponse);

    } catch (err: any) {
      console.error('Error fetching balances:', err);
      setError(err.message || 'Failed to fetch balances');
      setSpotBalances([]);
      setPerpPositions(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [activeWallet?.address]);

  return {
    spotBalances,
    perpPositions,
    isLoading,
    error,
    refresh: fetchBalances
  };
}; 