import { Token, PerpToken, Auction } from './types'
import { MARKETS_API } from './endpoints'
import { MARKETS_ENDPOINTS } from "./endpoints";
import { AuctionHistory, AuctionState, AuctionInfo } from "./types";

export async function getTokens(): Promise<Token[]> {
    try {
        const response = await fetch(`${MARKETS_API.BASE_URL}${MARKETS_API.ENDPOINTS.GET_TOKENS}`)
        if (!response.ok) {
            console.warn('API unavailable')
            return []
        }
        return response.json()
    } catch (error) {
        console.error('Error loading tokens:', error)
        return []
    }
}

export async function getToken(tokenName: string): Promise<Token | null> {
    try {
        const tokens = await getSpotTokens()
        return tokens.find(token => token.name.toLowerCase() === tokenName.toLowerCase()) || null
    } catch (error) {
        console.error(`Error loading token ${tokenName}:`, error)
        return null
    }
}

export async function getAuctions(): Promise<Auction[]> {
    try {
        const response = await fetch(`${MARKETS_API.BASE_URL}${MARKETS_API.ENDPOINTS.GET_AUCTIONS}`)
        if (!response.ok) {
            console.warn('API unavailable for auctions')
            return []
        }
        return response.json()
    } catch (error) {
        console.error('Error loading auctions:', error)
        return []
    }
}

export async function getSpotTokens(): Promise<Token[]> {
    try {
        const response = await fetch(`${MARKETS_API.BASE_URL}${MARKETS_API.ENDPOINTS.GET_SPOT}`)
        if (!response.ok) {
            console.warn('API unavailable for spot tokens')
            return []
        }
        return response.json()
    } catch (error) {
        console.error('Error loading spot tokens:', error)
        return []
    }
}

export async function getPerpTokens(): Promise<PerpToken[]> {
    try {
        const response = await fetch(`${MARKETS_API.BASE_URL}${MARKETS_API.ENDPOINTS.GET_PERP}`)
        if (!response.ok) {
            console.warn('API unavailable for perp tokens')
            return []
        }
        return response.json()
    } catch (error) {
        console.error('Error loading perp tokens:', error)
        return []
    }
}

export async function getPerpToken(tokenName: string): Promise<PerpToken | null> {
    try {
        const tokens = await getPerpTokens();
        return tokens.find(token => token.name.toLowerCase() === tokenName.toLowerCase()) || null;
    } catch (error) {
        console.error(`Erreur lors du chargement du token perp ${tokenName}:`, error);
        return null;
    }
}

export async function fetchSpotMarkets(): Promise<Token[]> {
    try {
        const response = await fetch(MARKETS_ENDPOINTS.SPOT_MARKETS);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching spot markets:", error);
        return [];
    }
}

export async function fetchPerpMarkets(): Promise<PerpToken[]> {
    try {
        const response = await fetch(MARKETS_ENDPOINTS.PERP_MARKETS);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching perp markets:", error);
        return [];
    }
}

export async function fetchAuctionState(): Promise<AuctionState | null> {
    try {
        const response = await fetch(MARKETS_ENDPOINTS.AUCTION_STATE);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching auction state:", error);
        return null;
    }
}

export async function fetchAuctionHistory(): Promise<AuctionHistory[]> {
    try {
        const response = await fetch(MARKETS_ENDPOINTS.AUCTION_HISTORY);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching auction history:", error);
        return [];
    }
}

export async function fetchCurrentAuction(): Promise<AuctionInfo | null> {
    try {
        const response = await fetch(MARKETS_ENDPOINTS.CURRENT_AUCTION);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching current auction:", error);
        return null;
    }
}

/**
 * Calcule les statistiques globales du marché spot
 * @param tokens Liste des tokens spot
 * @returns Objet contenant les statistiques calculées
 */
export function calculateSpotMarketStats(tokens: Token[]) {
    // Trier les tokens par volume (du plus grand au plus petit) et prendre les 4 premiers
    const trendingTokens = [...tokens]
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 4);

    const totalMarketCap = tokens.reduce(
        (sum, token) => sum + token.marketCap,
        0
    );
    const totalVolume = tokens.reduce((sum, token) => sum + token.volume, 0);
    const totalSpotVolume = tokens.reduce(
        (sum, token) => sum + (token.volume || 0),
        0
    );
    const totalTokenCount = tokens.length;

    return {
        trendingTokens,
        totalMarketCap,
        totalVolume,
        totalSpotVolume,
        totalTokenCount
    };
}

/**
 * Calcule les statistiques globales du marché perp
 * @param tokens Liste des tokens perp
 * @returns Objet contenant les statistiques calculées
 */
export function calculatePerpMarketStats(tokens: PerpToken[]) {
    // Trier les tokens par volume (du plus grand au plus petit) et prendre les 4 premiers
    const trendingTokens = [...tokens]
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 4);

    const totalMarketCap = tokens.reduce(
        (sum, token) => sum + (token.marketCap || 0),
        0
    );
    const totalVolume = tokens.reduce((sum, token) => sum + token.volume, 0);
    const totalPerpVolume = tokens.reduce(
        (sum, token) => sum + (token.volume || 0),
        0
    );
    const totalTokenCount = tokens.length;

    return {
        trendingTokens,
        totalMarketCap,
        totalVolume,
        totalPerpVolume,
        totalTokenCount
    };
}

/**
 * Formate le temps restant en jours, heures, minutes et secondes
 * @param seconds Nombre de secondes restantes
 * @returns Chaîne formatée (ex: "2j 5h", "3h 45m", "2m 30s", "15s")
 */
export function formatTimeRemaining(seconds: number): string {
    if (seconds <= 0) return "Commence bientôt";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) {
        return `${days}j ${hours}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

/**
 * Calcule le prix actuel de l'enchère en fonction du temps écoulé
 * @param initialGas Prix initial
 * @param endGas Prix final
 * @param startTime Timestamp de début
 * @param endTime Timestamp de fin
 * @param currentTime Timestamp actuel
 * @returns Prix actuel calculé
 */
export function calculateAuctionPrice(
    initialGas: number,
    endGas: number,
    startTime: number,
    endTime: number,
    currentTime: number
): number {
    // Si l'enchère n'a pas commencé
    if (currentTime < startTime) {
        return initialGas;
    }

    // Si l'enchère est terminée
    if (currentTime >= endTime) {
        return endGas;
    }

    // Calculer le taux de diminution du prix par milliseconde
    const totalDuration = endTime - startTime;
    const totalGasChange = initialGas - endGas;
    const rateOfChange = totalGasChange / totalDuration;

    // Calculer le temps écoulé depuis le début
    const elapsed = currentTime - startTime;

    // Calculer le nouveau prix en fonction du temps écoulé
    const gasReduction = rateOfChange * elapsed;
    return Math.max(endGas, initialGas - gasReduction);
}

/**
 * Calcule la progression de l'enchère en pourcentage
 * @param initialGas Prix initial
 * @param currentGas Prix actuel
 * @param endGas Prix final
 * @returns Pourcentage de progression (0-100)
 */
export function calculateAuctionProgress(
    initialGas: number,
    currentGas: number,
    endGas: number
): number {
    const totalGasChange = initialGas - endGas;
    const currentGasChange = initialGas - currentGas;
    return Math.min(100, (currentGasChange / totalGasChange) * 100);
} 