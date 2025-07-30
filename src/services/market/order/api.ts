import { getExternal } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { API_URLS } from '../../api/constants';
import { TwapOrder, TwapOrderParams, TwapOrderPaginatedResponse, EnrichedTwapOrder } from './types';
import { fetchSpotTokens } from '../spot/api';
import { SpotToken } from '../spot/types';

/**
 * Récupère tous les ordres TWAP depuis l'API
 */
export const fetchAllTwapOrders = async (): Promise<TwapOrder[]> => {
  return withErrorHandling(async () => {
    // L'API retourne directement un array d'ordres TWAP
    const url = `${API_URLS.HYPURRSCAN_API}/twap/*`;
    return await getExternal<TwapOrder[]>(url);
  }, 'fetching all TWAP orders');
};

/**
 * Enrichit les ordres TWAP avec les données de marché
 */
export const enrichTwapOrders = async (twapOrders: TwapOrder[]): Promise<EnrichedTwapOrder[]> => {
  return withErrorHandling(async () => {
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
        
        // Transformer le nom du token si nécessaire
        let tokenSymbol = token?.name || `Token ${marketIndex}`;
        if (tokenSymbol === 'USDT_USDC') {
          tokenSymbol = 'USDT0';
        }

        return {
          ...order,
          tokenSymbol,
          tokenPrice,
          totalValueUSD,
          progressionPercent,
          estimatedEndTime: startTime + durationMs,
          subOrdersSent,
          totalSubOrders,
          formattedTime: new Date(order.time).toLocaleString(),
          formattedDuration: `${order.action.twap.m}m`,
          formattedSize: size.toFixed(2),
          formattedPrice: 'Market', // TWAP orders don't have a fixed price
          isBuy: order.action.twap.b,
          marketIndex
        };
      });
  }, 'enriching TWAP orders');
};

/**
 * Récupère les ordres TWAP avec pagination et filtres
 */
export const fetchTwapOrders = async (params: TwapOrderParams = {}): Promise<TwapOrderPaginatedResponse> => {
  return withErrorHandling(async () => {
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

    // Calculate metadata statistics
    const activeOrders = filteredOrders.filter(order => !order.ended && !order.error).length;
    const canceledOrders = filteredOrders.filter(order => order.ended === "canceled").length;
    const errorOrders = filteredOrders.filter(order => order.error !== null || order.ended === "error").length;

    return {
      data: paginatedData,
      pagination: {
        total: filteredOrders.length,
        page,
        limit,
        totalPages: Math.ceil(filteredOrders.length / limit),
        totalVolume: filteredOrders.reduce((sum, order) => sum + order.totalValueUSD, 0)
      },
      metadata: {
        lastUpdate: Date.now(),
        activeOrders,
        canceledOrders,
        errorOrders
      }
    };
  }, 'fetching TWAP orders');
};

/**
 * Récupère les derniers ordres TWAP
 */
export const fetchLatestTwapOrders = async (
  limit: number = 50,
  status: "all" | "active" | "completed" | "canceled" | "error" = "all"
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
 * Récupère les ordres TWAP d'un utilisateur spécifique
 */
export const fetchUserTwapOrders = async (
  user: string,
  limit: number = 50
): Promise<TwapOrderPaginatedResponse> => {
  return fetchTwapOrders({
    user,
    limit,
    sortBy: 'time',
    sortOrder: 'desc',
    page: 1
  });
}; 