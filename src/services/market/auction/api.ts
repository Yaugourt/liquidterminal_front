import { fetchWithConfig } from '../../api/base';
import { AuctionsResponse, AuctionParams, AuctionPaginatedResponse, AuctionTiming } from './types';

/**
 * Récupère les informations de timing de l'auction en cours
 */
export const fetchAuctionTiming = async (): Promise<AuctionTiming> => {
  const response = await fetchWithConfig<AuctionTiming>('/market/auction/timing');
  return response;
};

/**
 * Récupère toutes les auctions sans limitation
 */
export const fetchAllAuctions = async (): Promise<AuctionsResponse> => {
  const response = await fetchWithConfig<AuctionsResponse>('/market/auction');
  
  // Ne pas limiter les données ici - laisser le hook gérer la pagination
  return response;
};

/**
 * Récupère les auctions avec pagination et filtres
 */
export const fetchAuctions = async (params: AuctionParams = {}): Promise<AuctionPaginatedResponse> => {
  // Récupérer toutes les données d'abord
  const allAuctionsResponse = await fetchAllAuctions();
  
  if (!allAuctionsResponse.success) {
    throw new Error('Failed to fetch auctions');
  }

  const { usdcAuctions, hypeAuctions, splitTimestamp } = allAuctionsResponse.data;
  
  // Combiner les auctions selon le filtre currency
  let combinedAuctions = [];
  
  switch (params.currency) {
    case "USDC":
      combinedAuctions = usdcAuctions;
      break;
    case "HYPE":
      combinedAuctions = hypeAuctions;
      break;
    case "ALL":
    default:
      combinedAuctions = [...usdcAuctions, ...hypeAuctions];
      break;
  }

  // Filtrer les auctions valides
  const validAuctions = combinedAuctions.filter(auction => 
    auction && 
    auction.time && 
    auction.deployGas && 
    !isNaN(parseFloat(auction.deployGas))
  );

  // Trier les données
  const sortBy = params.sortBy || 'time';
  const sortOrder = params.sortOrder || 'desc';
  
  validAuctions.sort((a, b) => {
    let aValue, bValue;
    
    if (sortBy === 'deployGas') {
      aValue = parseFloat(a.deployGas);
      bValue = parseFloat(b.deployGas);
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
  const paginatedData = validAuctions.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      total: validAuctions.length,
      page,
      limit,
      totalPages: Math.ceil(validAuctions.length / limit),
      totalVolume: validAuctions.reduce((sum, auction) => sum + parseFloat(auction.deployGas || '0'), 0)
    },
    metadata: {
      lastUpdate: Date.now(),
      splitTimestamp
    }
  };
};

/**
 * Récupère les dernières auctions pour une currency spécifique
 */
export const fetchLatestAuctions = async (
  limit: number = 50, 
  currency: "HYPE" | "USDC" | "ALL" = "ALL"
): Promise<AuctionPaginatedResponse> => {
  return fetchAuctions({
    limit,
    currency,
    sortBy: 'time',
    sortOrder: 'desc',
    page: 1
  });
}; 