import {  fetchExternal, buildHypurrscanUrl } from '../../api/base';
import { TwapOrder, TwapOrderParams, TwapOrderPaginatedResponse, EnrichedTwapOrder } from './types';
import { fetchSpotTokens } from '../spot/api';
import { SpotToken } from '../spot/types';

/**
 * Récupère tous les ordres TWAP depuis l'API
 */
export const fetchAllTwapOrders = async (): Promise<TwapOrder[]> => {
  // L'API retourne directement un array d'ordres TWAP
  const url = buildHypurrscanUrl('HYPURRSCAN_TWAP');
  return await fetchExternal<TwapOrder[]>(url);
};

/**
 * Enrichit les ordres TWAP avec les données de marché
 */
export const enrichTwapOrders = async (twapOrders: TwapOrder[]): Promise<EnrichedTwapOrder[]> => {
  try {
    // Récupérer tous les tokens du spot market
    const spotResponse = await fetchSpotTokens({ limit: 1000 });
    const spotTokens = spotResponse.data;
    
    // Créer un map pour accès rapide par marketIndex
    const tokenMap = new Map<number, SpotToken>();
    spotTokens.forEach(token => {
      tokenMap.set(token.marketIndex, token);
    });
    
    return twapOrders
      .filter(order => {
        const assetIndex = order.action.twap.a;
        // Ne garder que les ordres TWAP avec le format 10000 + index
        return assetIndex >= 10000;
      })
      .map(order => {
        const assetIndex = order.action.twap.a;
        
        // Pour l'index de marché TWAP, enlever le préfixe "10000"
        // Ex: index 85 → 10085, index 107 → 10107 (10000 + index)
        const marketIndex = assetIndex - 10000;
      
      const token = tokenMap.get(marketIndex);
      const size = parseFloat(order.action.twap.s);
      const tokenPrice = token?.price || 0;
      const totalValueUSD = size * tokenPrice;
      
      // Calculer la progression basée sur le temps écoulé vs durée totale
      const startTime = order.time;
      const durationMs = order.action.twap.m * 60 * 1000; // minutes to ms
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      
      // TWAP envoie un sous-ordre toutes les 30 secondes
      const subOrderIntervalMs = 30 * 1000; // 30 secondes
      const totalSubOrders = Math.ceil(durationMs / subOrderIntervalMs);
      const subOrdersSent = Math.min(totalSubOrders, Math.floor(elapsedTime / subOrderIntervalMs));
      
      // Progression basée sur les sous-ordres envoyés (plus précis que le temps)
      const progressionPercent = Math.min(100, Math.max(0, (subOrdersSent / totalSubOrders) * 100));
      
      // Calculer la quantité et valeur restantes
      const remainingPercent = Math.max(0, 100 - progressionPercent);
      const remainingSize = size * (remainingPercent / 100);
      const remainingValueUSD = remainingSize * tokenPrice;
      
      return {
        ...order,
        tokenSymbol: token?.name || `Asset-${assetIndex}`,
        tokenPrice,
        totalValueUSD: remainingValueUSD, // Valeur restante à trader
        progressionPercent,
        estimatedEndTime: startTime + durationMs
      };
    });
  } catch (error) {
    console.error('Error enriching TWAP orders:', error);
    // En cas d'erreur, retourner les ordres avec des valeurs par défaut
    // Mais seulement ceux qui ont le format 10000 + index
    return twapOrders
      .filter(order => {
        const assetIndex = order.action.twap.a;
        return assetIndex >= 10000;
      })
      .map(order => {
        const startTime = order.time;
        const durationMs = order.action.twap.m * 60 * 1000;
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        
        // Même logique de sous-ordres pour les erreurs
        const subOrderIntervalMs = 30 * 1000;
        const totalSubOrders = Math.ceil(durationMs / subOrderIntervalMs);
        const subOrdersSent = Math.min(totalSubOrders, Math.floor(elapsedTime / subOrderIntervalMs));
        const progressionPercent = Math.min(100, Math.max(0, (subOrdersSent / totalSubOrders) * 100));
        
        return {
          ...order,
          tokenSymbol: `Asset-${order.action.twap.a}`,
          tokenPrice: 0,
          totalValueUSD: 0, // Valeur restante = 0 en cas d'erreur
          progressionPercent,
          estimatedEndTime: startTime + durationMs
        };
      });
  }
};

/**
 * Récupère les ordres TWAP avec pagination et filtres
 */
export const fetchTwapOrders = async (params: TwapOrderParams = {}): Promise<TwapOrderPaginatedResponse> => {
  // Récupérer toutes les données d'abord
  const allOrders = await fetchAllTwapOrders();
  
  // Enrichir avec les données de marché
  const enrichedOrders = await enrichTwapOrders(allOrders);
  
  // Filtrer selon les paramètres
  let filteredOrders = enrichedOrders;
  
  // Filtrer par utilisateur
  if (params.user) {
    filteredOrders = filteredOrders.filter(order => 
      order.user.toLowerCase() === params.user!.toLowerCase()
    );
  }
  
  // Filtrer par statut
  if (params.status && params.status !== "all") {
    switch (params.status) {
      case "active":
        filteredOrders = filteredOrders.filter(order => !order.ended && !order.error);
        break;
      case "canceled":
        filteredOrders = filteredOrders.filter(order => order.ended === "canceled");
        break;
      case "error":
        filteredOrders = filteredOrders.filter(order => order.error !== null || order.ended === "error");
        break;
      case "completed":
        filteredOrders = filteredOrders.filter(order => order.ended && order.ended !== "canceled" && order.ended !== "error");
        break;
    }
  }
  
  // Filtrer par période de temps
  if (params.timeFrom) {
    filteredOrders = filteredOrders.filter(order => order.time >= params.timeFrom!);
  }
  
  if (params.timeTo) {
    filteredOrders = filteredOrders.filter(order => order.time <= params.timeTo!);
  }
  
  // Trier les données
  const sortBy = params.sortBy || 'time';
  const sortOrder = params.sortOrder || 'desc';
  
  filteredOrders.sort((a, b) => {
    let aValue, bValue;
    
    if (sortBy === 'block') {
      aValue = a.block;
      bValue = b.block;
    } else {
      aValue = a.time;
      bValue = b.time;
    }
    
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  // Pagination
  const page = params.page || 1;
  const limit = params.limit || 50;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredOrders.slice(startIndex, endIndex);

  // Calculer les métadonnées
  const activeOrders = enrichedOrders.filter(order => !order.ended && !order.error).length;
  const canceledOrders = enrichedOrders.filter(order => order.ended === "canceled").length;
  const errorOrders = enrichedOrders.filter(order => order.error !== null || order.ended === "error").length;
  
  // Calculer le volume total en USD
  const totalVolume = filteredOrders.reduce((sum, order) => {
    return sum + order.totalValueUSD;
  }, 0);

  return {
    data: paginatedData,
    pagination: {
      total: filteredOrders.length,
      page,
      limit,
      totalPages: Math.ceil(filteredOrders.length / limit),
      totalVolume
    },
    metadata: {
      lastUpdate: Date.now(),
      activeOrders,
      canceledOrders,
      errorOrders
    }
  };
};

/**
 * Récupère les derniers ordres TWAP
 */
export const fetchLatestTwapOrders = async (
  limit: number = 50,
  status: "active" | "canceled" | "error" | "completed" | "all" = "all"
): Promise<TwapOrderPaginatedResponse> => {
  return fetchTwapOrders({
    limit,
    status,
    sortBy: 'time',
    sortOrder: 'desc',
    page: 1
  });
};

/**
 * Récupère les ordres TWAP pour un utilisateur spécifique
 */
export const fetchUserTwapOrders = async (
  userAddress: string,
  limit: number = 50
): Promise<TwapOrderPaginatedResponse> => {
  return fetchTwapOrders({
    user: userAddress,
    limit,
    sortBy: 'time',
    sortOrder: 'desc',
    page: 1
  });
}; 