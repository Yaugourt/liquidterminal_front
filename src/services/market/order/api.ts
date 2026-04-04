import { getExternal, postExternal } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { API_URLS } from '../../api/constants';
import { TwapOrder, TwapOrderParams, TwapOrderPaginatedResponse, EnrichedTwapOrder } from './types';
import { fetchSpotTokens } from '../spot/api';
import { SpotToken } from '../spot/types';
import { fetchPerpMarkets } from '../perp/api';
import { PerpMarketData } from '../perp/types';
import { AllPerpMetasResponse } from '../perpDex/types';

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
    // Récupérer spot + perp natifs + raw allPerpMetas en parallèle
    const [spotResponse, perpResponse, allPerpMetasRaw] = await Promise.all([
      fetchSpotTokens({ limit: 1000 }),
      fetchPerpMarkets({ limit: 1000, sortBy: 'volume', sortOrder: 'desc' }).catch(() => ({ data: [] as PerpMarketData[] })),
      postExternal<AllPerpMetasResponse>(
        `${API_URLS.HYPERLIQUID_UI_API}/info`,
        { type: 'allPerpMetas' }
      ).catch(() => [] as AllPerpMetasResponse),
    ]);
    const spotTokens = spotResponse.data;

    // Map spot par marketIndex
    const tokenMap = new Map<number, SpotToken>();
    spotTokens.forEach(token => {
      tokenMap.set(token.marketIndex, token);
    });

    // Map perp natifs par index
    const perpMap = new Map<number, PerpMarketData>();
    perpResponse.data.forEach((perp: PerpMarketData) => {
      perpMap.set(perp.index, perp);
    });

    // Build HIP-3 name lookup from raw allPerpMetas response
    // TWAP index formula: assetIndex = 10000 + (slot * 100000) + localIndex
    // So after subtracting 10000: slot = floor(value / 100000), localIndex = value % 100000
    // Slot 0 = native perps, slot 1+ = HIP-3 dexs
    const hip3Universes = new Map<number, string[]>();
    allPerpMetasRaw.forEach((dex, slot) => {
      if (!dex || slot === 0) return; // Skip native perps (handled by perpMap)
      const names = (dex.universe || []).map(a => {
        const parts = a.name.split(':');
        return parts.length > 1 ? parts[1] : a.name;
      });
      hip3Universes.set(slot, names);
    });

    return twapOrders
      .filter(order => {
        const assetIndex = order.action.twap.a;
        // Keep spot TWAPs (>= 10000) and perp TWAPs (< 10000)
        return assetIndex >= 0;
      })
      .map(order => {
        const assetIndex = order.action.twap.a;
        const isSpot = assetIndex >= 10000;
        const marketIndex = isSpot ? assetIndex - 10000 : assetIndex;

        // Resolve token: spot map > perp native map > HIP-3 metas > fallback
        const spotToken = isSpot ? tokenMap.get(marketIndex) : null;
        const perpToken = !isSpot && marketIndex < 100000 ? perpMap.get(marketIndex) : null;
        // HIP-3: marketIndex >= 100000 → slot = floor(marketIndex / 100000), localIndex = marketIndex % 100000
        const hip3Slot = Math.floor(marketIndex / 100000);
        const hip3LocalIndex = marketIndex % 100000;
        const hip3Name = !spotToken && !perpToken && hip3Slot > 0
          ? (hip3Universes.get(hip3Slot)?.[hip3LocalIndex] ?? null)
          : null;

        const size = parseFloat(order.action.twap.s);
        const tokenPrice = spotToken?.price || perpToken?.price || 0;
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

        // Résoudre le nom : spot > perp natif > HIP-3 > fallback
        let tokenSymbol = spotToken?.name || perpToken?.name || hip3Name || `Token ${marketIndex}`;
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