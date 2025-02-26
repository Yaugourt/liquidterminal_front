export const MARKETS_API = {
    BASE_URL: 'http://localhost:3001',
    ENDPOINTS: {
        GET_TOKENS: '/api/markets',
        GET_AUCTIONS: '/api/auctions',
        GET_SPOT: '/pages/market/spot'
    }
} as const 