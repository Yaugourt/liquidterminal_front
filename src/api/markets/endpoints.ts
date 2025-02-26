export const MARKETS_API = {
    BASE_URL: 'http://localhost:3001',
    ENDPOINTS: {
        GET_TOKENS: '/pages/market/spot',
        GET_AUCTIONS: '/api/auctions',
        GET_SPOT: '/pages/market/spot',
        GET_PERP: '/pages/market/perp'
    }
} as const 