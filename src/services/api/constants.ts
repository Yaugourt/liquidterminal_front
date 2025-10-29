import { env } from "@/lib/env";

// API Base URLs
export const API_URLS = {
  // Notre backend
  LOCAL_BACKEND: env.NEXT_PUBLIC_API,
  
  // APIs externes Hyperliquid
  HYPERLIQUID_RPC: 'https://rpc.hyperliquid.xyz',
  HYPERLIQUID_API: 'https://api.hyperliquid.xyz',
  HYPERLIQUID_UI_API: 'https://api-ui.hyperliquid.xyz',
  
  // APIs tierces
  HYPURRSCAN_API: 'https://api.hypurrscan.io',
  LLAMA_FI_API: 'https://api.llama.fi',
} as const;

// Endpoints spécifiques
export const ENDPOINTS = {
  // Explorer endpoints (Hyperliquid RPC)
  EXPLORER_BLOCK_DETAILS: '/explorer',
  EXPLORER_TX_DETAILS: '/explorer',
  EXPLORER_USER_DETAILS: '/explorer',
  
  // Hyperliquid API endpoints
  HYPERLIQUID_INFO: '/info',
  
  // Hyperliquid UI API endpoints
  HYPERLIQUID_UI_INFO: '/info',
  
  // Hypurrscan endpoints
  HYPURRSCAN_TRANSFERS: '/transfers',
  HYPURRSCAN_DEPLOYS: '/deploys',
  HYPURRSCAN_TWAP: '/twap/*',
  HYPURRSCAN_HOLDERS: '/holders',
  HYPURRSCAN_STAKED_HOLDERS: '/holders/stakedHYPE',
  
  // LlamaFi endpoints
  LLAMA_FI_HYPERLIQUID_BRIDGE: '/protocol/hyperliquid-bridge',
  
  // Notre backend endpoints
  STAKING_VALIDATIONS: '/staking/validations',
  STAKING_UNSTAKING_QUEUE: '/staking/unstaking-queue',
  STAKING_VALIDATORS: '/staking/validators',
  STAKING_VALIDATORS_TRENDING: '/staking/validators/trending',
  STAKING_HOLDERS: '/staking/holders',
  STAKING_HOLDERS_TOP: '/staking/holders/top',
  STAKING_HOLDERS_STATS: '/staking/holders/stats',
  MARKET_VAULTS: '/market/vaults',
} as const;

// Helper functions pour construire les URLs complètes
export const buildUrl = (baseUrl: keyof typeof API_URLS, endpoint: string): string => {
  return `${API_URLS[baseUrl]}${endpoint}`;
};

export const buildLocalUrl = (endpoint: keyof typeof ENDPOINTS): string => {
  return buildUrl('LOCAL_BACKEND', ENDPOINTS[endpoint]);
};

export const buildHyperliquidUrl = (endpoint: keyof typeof ENDPOINTS): string => {
  return buildUrl('HYPERLIQUID_API', ENDPOINTS[endpoint]);
};

export const buildHyperliquidRpcUrl = (endpoint: keyof typeof ENDPOINTS): string => {
  return buildUrl('HYPERLIQUID_RPC', ENDPOINTS[endpoint]);
};

export const buildHyperliquidUiUrl = (endpoint: keyof typeof ENDPOINTS): string => {
  return buildUrl('HYPERLIQUID_UI_API', ENDPOINTS[endpoint]);
};

export const buildHypurrscanUrl = (endpoint: keyof typeof ENDPOINTS): string => {
  return buildUrl('HYPURRSCAN_API', ENDPOINTS[endpoint]);
};

export const buildLlamaFiUrl = (endpoint: keyof typeof ENDPOINTS): string => {
  return buildUrl('LLAMA_FI_API', ENDPOINTS[endpoint]);
}; 