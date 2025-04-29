/**
 * Service pour les appels à l'API Hyperliquid
 */

import axios from 'axios';
import { 
  HyperliquidBalancesRequest, 
  HyperliquidBalancesResponse,
  HyperliquidPerpRequest,
  HyperliquidPerpResponse
} from "./types";

const HYPERLIQUID_API_URL = "https://api.hyperliquid.xyz/info";

/**
 * Configuration de base pour les requêtes à l'API Hyperliquid
 */
const api = axios.create({
  baseURL: HYPERLIQUID_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Récupère les balances de tokens d'un utilisateur depuis l'API Hyperliquid
 * @param request Paramètres de la requête
 * @returns Les balances de tokens de l'utilisateur
 */
export async function fetchHyperliquidBalances(
  request: HyperliquidBalancesRequest
): Promise<HyperliquidBalancesResponse> {
  try {
    console.log("HyperliquidService: Envoi de la requête de balances:", request);
    const response = await api.post('', {
      type: "spotClearinghouseState",
      user: request.user
    });
    console.log("HyperliquidService: Réponse de balances reçue:", response.data);
    
    // Vérifier si la réponse contient les balances
    if (response.data && response.data.balances) {
      return response.data.balances;
    }
    
    console.error("HyperliquidService: Format de réponse invalide pour les balances:", response.data);
    return [];
  } catch (error) {
    console.error("HyperliquidService: Erreur lors de la récupération des balances:", error);
    throw error;
  }
}

/**
 * Récupère les positions perp d'un utilisateur depuis l'API Hyperliquid
 * @param request Paramètres de la requête
 * @returns Les positions perp de l'utilisateur
 */
export async function fetchHyperliquidPerpPositions(
  request: HyperliquidPerpRequest
): Promise<HyperliquidPerpResponse> {
  try {
    console.log("HyperliquidService: Envoi de la requête de positions perp:", request);
    const response = await api.post('', {
      type: "clearinghouseState",
      user: request.user
    });
    console.log("HyperliquidService: Réponse de positions perp reçue:", response.data);
    
    // Vérifier si la réponse contient les données attendues
    if (response.data && response.data.assetPositions) {
      console.log("HyperliquidService: Nombre de positions perp:", response.data.assetPositions.length);
      return response.data;
    } else {
      console.error("HyperliquidService: Format de réponse invalide pour les positions perp:", response.data);
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
    }
  } catch (error) {
    console.error("HyperliquidService: Erreur lors de la récupération des positions perp:", error);
    throw error;
  }
} 