import { get } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { TwapOrder, TwapOrderParams, TwapOrderPaginatedResponse, EnrichedTwapOrder, TwapMarketType } from './types';
import { fetchTwapBase, enrichTwaps, type TwapBase } from './twap-source';

/** A `/market/twap` row: the Hypurrscan order with its market resolved by the backend. */
interface TwapOrderWithMarket extends TwapOrder {
  tokenSymbol: string;
  tokenPrice: number;
  marketIndex: number;
  marketType: TwapMarketType;
}

/**
 * Fallback source: Hypurrscan's TWAP orders of the last ~24 h with their
 * market (name, price, family) resolved by the backend, which downloads the
 * dump once for every visitor instead of each browser on every 30 s cycle.
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
 * Filters, sorts and paginates a list of orders, with the totals of the
 * filtered list. Pure: shared by the fetch below and by the hook that
 * re-selects when the live feed moves.
 */
export const selectTwapOrders = (
  enrichedOrders: EnrichedTwapOrder[],
  params: TwapOrderParams = {},
  lastUpdate: number = Date.now()
): TwapOrderPaginatedResponse => {
  // Filtrer selon les paramètres
  // Copy: the list may be shared (a memo), sorting must not reorder it.
  let filteredOrders = [...enrichedOrders];

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
      lastUpdate,
      activeOrders,
      canceledOrders,
      errorOrders
    }
  };
};

/**
 * The polled TWAP list: the indexer's base when it answers (the live feed is
 * merged over it by the caller, see `enrichTwaps`), the backend's Hypurrscan
 * list, already enriched, when it does not.
 */
export type TwapSource =
  | { kind: 'indexer'; base: TwapBase }
  | { kind: 'fallback'; orders: EnrichedTwapOrder[]; fetchedAt: number };

/**
 * Indexer first (wider and more accurate, see twap-source.ts); the backend's
 * Hypurrscan list stays as the fallback when the indexer is down.
 */
export const fetchTwapSource = async (
  status: TwapOrderParams['status'],
  signal?: AbortSignal
): Promise<TwapSource> => {
  return withErrorHandling(async () => {
    try {
      return { kind: 'indexer', base: await fetchTwapBase() };
    } catch {
      // Every consumer asks for active orders: only those cross the wire then.
      const orders = enrichTwapOrders(await fetchTwapOrdersWithMarket(status === 'active' ? 'active' : 'all', signal));
      return { kind: 'fallback', orders, fetchedAt: Date.now() };
    }
  }, 'fetching TWAP orders');
};

/**
 * Récupère les ordres TWAP avec pagination et filtres
 */
export const fetchTwapOrders = async (
  params: TwapOrderParams = {},
  signal?: AbortSignal
): Promise<TwapOrderPaginatedResponse> => {
  const source = await fetchTwapSource(params.status, signal);
  const orders = source.kind === 'indexer' ? enrichTwaps(source.base, null, Date.now()) : source.orders;
  return selectTwapOrders(orders, params);
};
