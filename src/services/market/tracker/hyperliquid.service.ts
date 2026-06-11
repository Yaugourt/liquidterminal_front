/**
 * Service pour les appels à l'API Hyperliquid
 */

import { postExternal } from '@/services/api/axios-config';
import { withErrorHandling } from '@/services/api/error-handler';
import { API_URLS } from '@/services/api/constants';
import {
  HyperliquidBalancesRequest,
  HyperliquidBalancesResponse,
  HyperliquidPerpRequest,
  HyperliquidPerpResponse
} from "./types";

const HYPERLIQUID_INFO_URL = `${API_URLS.HYPERLIQUID_API}/info`;

/**
 * Récupère les balances de tokens d'un utilisateur depuis l'API Hyperliquid
 * @param request Paramètres de la requête
 * @returns Les balances de tokens de l'utilisateur
 */
export async function fetchHyperliquidBalances(
  request: HyperliquidBalancesRequest
): Promise<HyperliquidBalancesResponse> {
  return withErrorHandling(async () => {
    const data = await postExternal<{ balances?: HyperliquidBalancesResponse }>(
      HYPERLIQUID_INFO_URL,
      {
        type: "spotClearinghouseState",
        user: request.user
      }
    );

    // Vérifier si la réponse contient les balances
    if (data && data.balances) {
      return data.balances;
    }

    return [];
  }, 'fetching Hyperliquid spot balances');
}

/**
 * Récupère les positions perp d'un utilisateur depuis l'API Hyperliquid
 * @param request Paramètres de la requête
 * @returns Les positions perp de l'utilisateur
 */
export async function fetchHyperliquidPerpPositions(
  request: HyperliquidPerpRequest
): Promise<HyperliquidPerpResponse> {
  return withErrorHandling(async () => {
    const data = await postExternal<HyperliquidPerpResponse>(
      HYPERLIQUID_INFO_URL,
      {
        type: "clearinghouseState",
        user: request.user
      }
    );

    // Vérifier si la réponse contient les données attendues
    if (data && data.assetPositions) {
      return data;
    }

    return {
      assetPositions: [],
      crossMaintenanceMarginUsed: "0.0",
      crossMarginSummary: {
        accountValue: "0.0",
        totalMarginUsed: "0.0",
        totalNtlPos: "0.0",
        totalRawUsd: "0.0"
      },
      marginSummary: {
        accountValue: "0.0",
        totalMarginUsed: "0.0",
        totalNtlPos: "0.0",
        totalRawUsd: "0.0"
      },
      time: Date.now(),
      withdrawable: "0.0"
    };
  }, 'fetching Hyperliquid perp positions');
}
