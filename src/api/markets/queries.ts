import { Token, PerpToken, Auction } from './types'
import { MARKETS_API } from './endpoints'

// Données de test pour les tokens
const mockTokens: Token[] = [
    {
        name: "BTC",
        logo: null,
        price: 63500,
        marketCap: 1250000000000,
        volume: 25000000000,
        change24h: 2.5,
        liquidity: 5000000000,
        supply: 19000000
    },
    {
        name: "ETH",
        logo: null,
        price: 3400,
        marketCap: 410000000000,
        volume: 15000000000,
        change24h: 1.8,
        liquidity: 3000000000,
        supply: 120000000
    },
    {
        name: "SOL",
        logo: null,
        price: 105,
        marketCap: 45000000000,
        volume: 3000000000,
        change24h: 4.2,
        liquidity: 1000000000,
        supply: 430000000
    }
];

// Données de test pour les tokens Perp
const mockPerpTokens: PerpToken[] = [
    {
        name: "BTC",
        logo: null,
        price: 63500,
        change24h: 2.5,
        volume: 25000000000,
        openInterest: 1500000000,
        funding: 0.0001,
        maxLeverage: 100,
        onlyIsolated: false
    },
    {
        name: "ETH",
        logo: null,
        price: 3400,
        change24h: 1.8,
        volume: 15000000000,
        openInterest: 800000000,
        funding: 0.0002,
        maxLeverage: 100,
        onlyIsolated: false
    },
    {
        name: "SOL",
        logo: null,
        price: 105,
        change24h: 4.2,
        volume: 3000000000,
        openInterest: 200000000,
        funding: 0.0003,
        maxLeverage: 50,
        onlyIsolated: true
    }
];

export async function getTokens(): Promise<Token[]> {
    try {
        const response = await fetch(`${MARKETS_API.BASE_URL}${MARKETS_API.ENDPOINTS.GET_TOKENS}`)
        if (!response.ok) {
            console.warn('API non disponible, utilisation des données de test')
            return mockTokens
        }
        return response.json()
    } catch (error) {
        console.error('Erreur lors du chargement des tokens:', error)
        console.warn('Utilisation des données de test suite à une erreur')
        return mockTokens
    }
}

export async function getToken(tokenName: string): Promise<Token | null> {
    try {
        const tokens = await getSpotTokens()
        return tokens.find(token => token.name.toLowerCase() === tokenName.toLowerCase()) || null
    } catch (error) {
        console.error(`Erreur lors du chargement du token ${tokenName}:`, error)
        return null
    }
}

export async function getAuctions(): Promise<Auction[]> {
    try {
        const response = await fetch(`${MARKETS_API.BASE_URL}${MARKETS_API.ENDPOINTS.GET_AUCTIONS}`)
        if (!response.ok) {
            console.warn('API non disponible, utilisation des données de test pour les enchères')
            return []
        }
        return response.json()
    } catch (error) {
        console.error('Erreur lors du chargement des enchères:', error)
        return []
    }
}

export async function getSpotTokens(): Promise<Token[]> {
    try {
        const response = await fetch(`${MARKETS_API.BASE_URL}${MARKETS_API.ENDPOINTS.GET_SPOT}`)
        if (!response.ok) {
            console.warn('API non disponible, utilisation des données de test pour les tokens spot')
            return mockTokens
        }
        return response.json()
    } catch (error) {
        console.error('Erreur lors du chargement des tokens spot:', error)
        console.warn('Utilisation des données de test suite à une erreur')
        return mockTokens
    }
}

export async function getPerpTokens(): Promise<PerpToken[]> {
    try {
        const response = await fetch(`${MARKETS_API.BASE_URL}${MARKETS_API.ENDPOINTS.GET_PERP}`)
        if (!response.ok) {
            console.warn('API non disponible, utilisation des données de test pour les tokens perp')
            return mockPerpTokens
        }
        return response.json()
    } catch (error) {
        console.error('Erreur lors du chargement des tokens perp:', error)
        console.warn('Utilisation des données de test suite à une erreur')
        return mockPerpTokens
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