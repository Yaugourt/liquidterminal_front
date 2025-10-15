import { get, postExternal } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { API_URLS } from '../../api/constants';
import { 
  AuctionsResponse, 
  AuctionParams, 
  AuctionPaginatedResponse, 
  AuctionTiming, 
  AuctionInfo,
  PerpDeployAuctionStatus,
  PerpAuctionTiming,
  PerpDex
} from './types';

/**
 * Récupère les informations de timing de l'auction en cours
 */
export const fetchAuctionTiming = async (): Promise<AuctionTiming> => {
  return withErrorHandling(async () => {
    const response = await get<{ success: boolean; data: AuctionTiming }>('/market/auction/timing');
    return response.data;
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

/**
 * Récupère les informations d'auction d'un token spécifique par son nom
 */
export const fetchTokenAuction = async (tokenName: string): Promise<AuctionInfo | null> => {
  return withErrorHandling(async () => {
    const allAuctionsResponse = await fetchAllAuctions();
    
    if (!allAuctionsResponse.success) {
      return null;
    }

    const { usdcAuctions, hypeAuctions } = allAuctionsResponse.data;
    const allAuctions = [...usdcAuctions, ...hypeAuctions];
    
    // Chercher le token par son nom
    const tokenAuction = allAuctions.find(auction => 
      auction.name && auction.name.toLowerCase() === tokenName.toLowerCase()
    );
    
    return tokenAuction || null;
  }, 'fetching token auction info');
};

// ==================== PERP AUCTION API ====================

/**
 * Récupère le statut de l'auction perp directement depuis Hyperliquid
 */
export const fetchPerpAuctionStatus = async (): Promise<PerpDeployAuctionStatus> => {
  return withErrorHandling(async () => {
    const response = await postExternal<PerpDeployAuctionStatus>(
      `${API_URLS.HYPERLIQUID_API}/info`,
      { type: "perpDeployAuctionStatus" }
    );
    return response;
  }, 'fetching perp auction status');
};

/**
 * Transforme le statut brut Hyperliquid en format PerpAuctionTiming
 */
export const fetchPerpAuctionTiming = async (): Promise<PerpAuctionTiming> => {
  return withErrorHandling(async () => {
    const status = await fetchPerpAuctionStatus();
    
    // Convertir secondes en millisecondes
    const startTime = status.startTimeSeconds * 1000;
    const endTime = startTime + (status.durationSeconds * 1000);
    const now = Date.now();
    
    // Calculer la prochaine auction (31h après la fin de la current)
    const AUCTION_DURATION_MS = 31 * 60 * 60 * 1000; // 31 heures
    const nextStartTime = endTime + AUCTION_DURATION_MS;
    
    // Déterminer le prix de départ de la prochaine auction
    // Si l'auction actuelle a échoué (currentGas = null à la fin), startGas reste 500
    // Sinon, c'est 2x le dernier prix
    let nextStartGas = "500";
    if (now > endTime && status.currentGas === null) {
      nextStartGas = "500"; // Auction échouée
    } else if (now > endTime && status.currentGas !== null) {
      const lastPrice = parseFloat(status.currentGas);
      nextStartGas = (lastPrice * 2).toString();
    } else {
      // Auction en cours, on suppose 2x startGas actuel pour la prochaine
      nextStartGas = (parseFloat(status.startGas) * 2).toString();
    }
    
    return {
      currentAuction: {
        startTime,
        endTime,
        startGas: status.startGas,
        currentGas: status.currentGas,
        endGas: status.endGas
      },
      nextAuction: {
        startTime: nextStartTime,
        startGas: nextStartGas
      }
    };
  }, 'fetching perp auction timing');
};

/**
 * Récupère la liste des perp dexs déployés
 */
export const fetchPerpDexs = async (): Promise<PerpDex[]> => {
  return withErrorHandling(async () => {
    const response = await postExternal<PerpDex[]>(
      `${API_URLS.HYPERLIQUID_API}/info`,
      { type: "perpDexs" }
    );
    return response;
  }, 'fetching perp dexs');
}; 