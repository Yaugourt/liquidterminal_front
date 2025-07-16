import { get } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { AuctionsResponse, AuctionParams, AuctionPaginatedResponse, AuctionTiming } from './types';

/**
 * Récupère les informations de timing de l'auction en cours
 */
export const fetchAuctionTiming = async (): Promise<AuctionTiming> => {
  return withErrorHandling(async () => {
    return await get<AuctionTiming>('/market/auction/timing');
  }, 'fetching auction timing');
};

/**
 * Récupère toutes les auctions sans limitation
 */
export const fetchAllAuctions = async (): Promise<AuctionsResponse> => {
  return withErrorHandling(async () => {
    return await get<AuctionsResponse>('/market/auction');
  }, 'fetching all auctions');
};

/**
 * Récupère les auctions avec pagination et filtres
 */
export const fetchAuctions = async (params: AuctionParams = {}): Promise<AuctionPaginatedResponse> => {
  return withErrorHandling(async () => {
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
  }, 'fetching auctions');
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