import { Token, Auction } from './types'
import { MARKETS_API } from './endpoints'

export async function getTokens(): Promise<Token[]> {
    try {
        const response = await fetch(`${MARKETS_API.BASE_URL}${MARKETS_API.ENDPOINTS.GET_TOKENS}`)
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des tokens')
        }
        return response.json()
    } catch (error) {
        console.error('Erreur lors du chargement des tokens:', error)
        return []
    }
}

export async function getToken(tokenName: string): Promise<Token | null> {
    try {
        const tokens = await getTokens()
        return tokens.find(token => token.name === tokenName) || null
    } catch (error) {
        console.error(`Erreur lors du chargement du token ${tokenName}:`, error)
        return null
    }
}

export async function getAuctions(): Promise<Auction[]> {
    try {
        const response = await fetch(`${MARKETS_API.BASE_URL}${MARKETS_API.ENDPOINTS.GET_AUCTIONS}`)
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des enchères')
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
            throw new Error('Erreur lors de la récupération des tokens spot')
        }
        return response.json()
    } catch (error) {
        console.error('Erreur lors du chargement des tokens spot:', error)
        return []
    }
} 