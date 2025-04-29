// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Privy Configuration
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
export const PRIVY_AUDIENCE = process.env.NEXT_PUBLIC_PRIVY_AUDIENCE;

// Cache Configuration
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Wallet Configuration
export const DEFAULT_WALLET_NAME = 'My Wallet'; 