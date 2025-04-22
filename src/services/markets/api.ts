import { Token, PerpToken } from "./types";

// Interface pour les statistiques globales du marché
export interface GlobalStats {
  totalVolume24h: number;
  totalPairs: number;
  totalMarketCap: number;
  totalSpotUSDC: number;
  totalHIP2: number;
}

export interface PerpGlobalStats {
  totalOpenInterest: number;
  totalVolume24h: number;
  totalPairs: number;
}

/**
 * Récupère les données des tokens spot depuis l'API
 * @returns Les données des tokens spot
 */
export async function fetchSpotTokens(): Promise<Token[]> {
  try {
    const response = await fetch("http://localhost:3002/market/spot");
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`Erreur API: ${result.message}`);
    }
    
    return result.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des tokens spot:", error);
    return [];
  }
}

/**
 * Récupère les statistiques globales du marché spot depuis l'API
 * @returns Les statistiques globales du marché
 */
export async function fetchGlobalStats(): Promise<GlobalStats> {
  const response = await fetch('http://localhost:3002/market/spot/globalstats');
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des statistiques globales');
  }
  return response.json();
}

/**
 * Récupère les données des tokens perp depuis l'API
 * @returns Les données des tokens perp
 */
export async function fetchPerpTokens(): Promise<PerpToken[]> {
  try {
    const response = await fetch("http://localhost:3002/market/perp");
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error("Les données des tokens perp ne sont pas un tableau valide:", data);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des tokens perp:", error);
    return [];
  }
}

export async function fetchPerpGlobalStats(): Promise<PerpGlobalStats> {
  try {
    const response = await fetch("http://localhost:3002/market/perp/globalstats");
    if (!response.ok) {
      throw new Error("Failed to fetch perp global stats");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching perp global stats:", error);
    throw error;
  }
} 