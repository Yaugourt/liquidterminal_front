import { DashboardStats } from "@/services/dashboard/types";
import { PerpToken, Token } from "@/services/markets/types";

const API_BASE_URL = "http://localhost:3002";

/**
 * Récupère les statistiques globales du dashboard
 * @returns Les statistiques globales du dashboard
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Essayer d'abord la route principale
    const response = await fetch(`${API_BASE_URL}/dashboard/globalstats`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors'
    });
    
    if (!response.ok) {
      // Si la première route échoue, essayer une route alternative
      console.warn(`Route principale échouée (${response.status}), essai de la route alternative...`);
      
      const altResponse = await fetch(`${API_BASE_URL}/pages/dashboard/globalstats`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors'
      });
      
      if (!altResponse.ok) {
        throw new Error(`Erreur lors de la récupération des statistiques: ${altResponse.status}`);
      }
      
      return await altResponse.json();
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    // Retourner des données factices en cas d'erreur
    return {
      numberOfUsers: 1250,
      dailyVolume: 4500000,
      bridgedUsdc: 25.5,
      totalHypeStake: 1800000
    };
  }
}

/**
 * Récupère les tokens perp tendance (top 5)
 * @returns Liste des tokens perp les plus tendance
 */
export async function getTrendingPerpTokens(): Promise<PerpToken[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/market/perp/trending`);
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des tokens perp tendance: ${response.status}`);
    }
    
    const data = await response.json();
    return data.tokens.slice(0, 5); // Récupère seulement les 5 premiers tokens
  } catch (error) {
    console.error('Erreur lors de la récupération des tokens perp tendance:', error);
    return [];
  }
}

/**
 * Récupère les tokens spot tendance (top 5)
 * @returns Liste des tokens spot les plus tendance
 */
export async function getTrendingSpotTokens(): Promise<Token[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/market/spot/trending`);
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des tokens spot tendance: ${response.status}`);
    }
    
    const data = await response.json();
    return data.tokens.slice(0, 5); // Récupère seulement les 5 premiers tokens
  } catch (error) {
    console.error('Erreur lors de la récupération des tokens spot tendance:', error);
    return [];
  }
}
