export const MARKETS_API = {
    BASE_URL: 'http://localhost:3001',
    ENDPOINTS: {
        GET_TOKENS: '/pages/market/spot',
        GET_AUCTIONS: '/api/auctions',
        GET_SPOT: '/pages/market/spot',
        GET_PERP: '/pages/market/perp'
    }
} as const

export const MARKETS_ENDPOINTS = {
    SPOT_MARKETS: "http://localhost:3001/pages/market/spot",
    PERP_MARKETS: "http://localhost:3001/pages/market/perp",
    AUCTION_STATE: "http://localhost:3001/hyperliquid/spot/deploy-state",
    AUCTION_HISTORY: "http://localhost:3001/pages/market/auction",
    CURRENT_AUCTION: "http://localhost:3001/pages/market/auction/timing"
}; 