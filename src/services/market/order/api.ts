import { get } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { TwapOrder, TwapOrderParams, TwapOrderPaginatedResponse, EnrichedTwapOrder, TwapMarketType } from './types';

/** A `/market/twap` row: the Hypurrscan order with its market resolved by the backend. */
interface TwapOrderWithMarket extends TwapOrder {
  tokenSymbol: string;
  tokenPrice: number;
  marketIndex: number;
  marketType: TwapMarketType;
}

/**
 * TWAP orders of the last ~24 h with their market (name, price, family)
 * resolved by the backend, which downloads Hypurrscan's dump once for every
 * visitor. Every consumer used to fetch that dump, `allPerpMetas` and the spot
 * and perp lists itself on each 30 s cycle.
 */
const fetchTwapOrdersWithMarket = async (
  status: 'active' | 'all',
  signal?: AbortSignal
): Promise<TwapOrderWithMarket[]> => {
  return withErrorHandling(async () => {
    const response = await get<{ success: boolean; data: TwapOrderWithMarket[] }>(
      '/market/twap',
      { status },
      { signal }
    );
    return response.data;
  }, 'fetching TWAP orders');
};

/** Adds the time-based fields, computed at fetch time from the order's start and duration. */
const enrichTwapOrders = (twapOrders: TwapOrderWithMarket[]): EnrichedTwapOrder[] => {
  return twapOrders.map(order => {
    const size = parseFloat(order.action.twap.s);
    const totalValueUSD = size * order.tokenPrice;

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

    return {
      ...order,
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
    };
  });
};

/**
 * Récupère les ordres TWAP avec pagination et filtres
 */
export const fetchTwapOrders = async (
  params: TwapOrderParams = {},
  signal?: AbortSignal
): Promise<TwapOrderPaginatedResponse> => {
  return withErrorHandling(async () => {
    // Every consumer asks for active orders: only those cross the wire then.
    const allOrders = await fetchTwapOrdersWithMarket(
      params.status === 'active' ? 'active' : 'all',
      signal
    );

    const enrichedOrders = enrichTwapOrders(allOrders);
    
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