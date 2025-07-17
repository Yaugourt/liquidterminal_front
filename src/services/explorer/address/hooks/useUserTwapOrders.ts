import { useMemo } from 'react';
import { useTwapOrders } from '@/services/market/order';
import { EnrichedTwapOrder } from '@/services/market/order/types';
import { TwapTableData, UseUserTwapOrdersResult } from '../types';

// Transformer les données enrichies en format tableau (même logique que dashboard)
const transformTwapData = (enrichedOrders: EnrichedTwapOrder[]): TwapTableData[] => {
  return enrichedOrders.map(order => ({
    id: order.hash,
    type: order.action.twap.b ? 'Buy' : 'Sell',
    value: order.totalValueUSD,
    token: order.tokenSymbol,
    amount: order.action.twap.s,
    progression: Math.round(order.progressionPercent),
    time: order.time,
    hash: order.hash,
    duration: order.action.twap.m,
    reduceOnly: order.action.twap.r,
    ended: order.ended || null,
    error: order.error
  }));
};

/**
 * Hook pour récupérer les ordres TWAP d'un utilisateur spécifique
 * Utilise la même logique que le dashboard avec filtrage côté client
 */
export function useUserTwapOrders(userAddress: string): UseUserTwapOrdersResult {
  // Utiliser le hook dashboard pour récupérer tous les ordres actifs
  const { orders: allOrders, isLoading, error, refetch } = useTwapOrders({
    limit: 1000,
    status: "active" // Seulement les ordres actifs
  });

  // Filtrer pour l'utilisateur spécifique et transformer les données
  const userTwapOrders = useMemo(() => {
    if (!allOrders || !userAddress) return [];
    
    const userOrders = allOrders.filter(order => 
      order.user.toLowerCase() === userAddress.toLowerCase()
    );
    
    return transformTwapData(userOrders);
  }, [allOrders, userAddress]);

  return {
    orders: userTwapOrders,
    isLoading,
    error,
    refetch
  };
} 