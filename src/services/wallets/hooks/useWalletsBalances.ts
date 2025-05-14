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
 * @param overrideAddress Adresse optionnelle pour récupérer les balances d'une adresse spécifique
 * @returns Les balances de tous les wallets, l'état de chargement, les erreurs et une fonction de rafraîchissement
 */
export const useWalletsBalances = (overrideAddress?: string) => {
  const { wallets, activeWalletId } = useWallets();
  const activeWallet = wallets.find(w => w.id === activeWalletId);
  
  const [spotBalances, setSpotBalances] = useState<HyperliquidBalance[]>([]);
  const [perpPositions, setPerpPositions] = useState<HyperliquidPerpResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    // Utiliser l'adresse override si fournie, sinon utiliser l'adresse du wallet actif
    const addressToUse = overrideAddress || activeWallet?.address;
    
    if (!addressToUse) {
      console.warn('No address found');
      setSpotBalances([]);
      setPerpPositions(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching balances for address:', addressToUse);

      // Fetch spot balances
      const spotRequest = {
        type: 'spotClearinghouseState',
        user: addressToUse
      };
      console.log('Sending spot request:', spotRequest);
      const spotResponse = await fetchHyperliquidBalances(spotRequest);
      console.log('Received spot balances:', spotResponse);
      setSpotBalances(spotResponse);

      // Fetch perpetual positions
      const perpRequest = {
        type: 'clearinghouse',
        user: addressToUse
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
  }, [activeWallet?.address, overrideAddress]);

  return {
    spotBalances,
    perpPositions,
    isLoading,
    error,
    refresh: fetchBalances
  };
}; 