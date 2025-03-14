import { WalletInfo, WalletStats } from "./types";

const API_BASE_URL = "http://localhost:3001";

// Cache pour les réponses API
interface CacheEntry {
  data: WalletInfo;
  timestamp: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_DURATION = 60 * 1000; // 1 minute en millisecondes

// Fonction utilitaire pour ajouter un délai
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Récupère les informations d'un wallet depuis l'API ou le cache
 * @param address Adresse du wallet
 * @param forceRefresh Forcer le rafraîchissement des données (ignorer le cache)
 * @returns Informations du wallet
 */
export async function getWalletInfo(address: string, forceRefresh = false): Promise<WalletInfo> {
  // Vérifier si les données sont en cache et toujours valides
  const cacheKey = `wallet_${address}`;
  const now = Date.now();
  const cachedData = cache[cacheKey];
  
  if (!forceRefresh && cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
    console.log(`Using cached data for wallet ${address}`);
    return cachedData.data;
  }
  
  try {
    // Ajouter un délai artificiel pour simuler une requête réseau
    await delay(800);
    
    const response = await fetch(`${API_BASE_URL}/pages/wallet/${address}/info`, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch wallet info: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Mettre en cache les données
    cache[cacheKey] = {
      data,
      timestamp: now
    };
    
    return data;
  } catch (error) {
    console.error("Error fetching wallet info:", error);
    
    // Si nous avons des données en cache, même expirées, les utiliser en cas d'erreur
    if (cachedData) {
      console.warn(`Using expired cached data for wallet ${address} due to fetch error`);
      return cachedData.data;
    }
    
    throw error;
  }
}

/**
 * Calcule les statistiques d'un wallet à partir de ses holdings
 * @param walletInfo Informations du wallet
 * @returns Statistiques du wallet
 */
export function calculateWalletStats(walletInfo: WalletInfo): WalletStats {
  let totalBalance = 0;
  let usdcBalance = 0;
  let otherTokens = 0;

  if (!walletInfo.holdings || !Array.isArray(walletInfo.holdings)) {
    return { totalBalance, usdcBalance, otherTokens };
  }

  walletInfo.holdings.forEach(holding => {
    try {
      const entryValue = parseFloat(holding.entryNtl);
      
      if (isNaN(entryValue)) {
        console.warn(`Invalid entryNtl value for ${holding.coin}: ${holding.entryNtl}`);
        return;
      }
      
      if (holding.coin === "USDC") {
        usdcBalance += entryValue;
      } else {
        otherTokens += entryValue;
      }
      
      totalBalance += entryValue;
    } catch (error) {
      console.error(`Error processing holding ${holding.coin}:`, error);
    }
  });

  return {
    totalBalance,
    usdcBalance,
    otherTokens
  };
}

/**
 * Efface le cache pour une adresse spécifique ou tout le cache
 * @param address Adresse du wallet (optionnel)
 */
export function clearCache(address?: string): void {
  if (address) {
    const cacheKey = `wallet_${address}`;
    delete cache[cacheKey];
    console.log(`Cache cleared for wallet ${address}`);
  } else {
    Object.keys(cache).forEach(key => delete cache[key]);
    console.log('All cache cleared');
  }
} 