import { env } from "@/lib/env";

/**
 * Polling intervals for `useDataFetching` and its derivatives.
 * Calibrated against backend cache TTLs and the global rate limiter (20 req/s burst).
 * Prefer these to magic numbers so cadence stays consistent across the app.
 *
 *   REALTIME — 5s   : ultra-fresh data (EVM blocks). Use sparingly.
 *   FAST     — 10s  : real-time market widgets where 10s lag is acceptable.
 *   DEFAULT  — 30s  : safe default; matches most backend Redis TTLs.
 *   STATIC   — 60s  : slow-moving data (overview snapshots, leaderboards).
 *   DAILY    — 5min : daily aggregates.
 *   HOURLY   — 1h   : long-window stats.
 *   DISABLED — 0    : explicit no-poll (one-shot fetch). Keep as 0 so the hook short-circuits.
 */
export const REFRESH_INTERVALS = {
  REALTIME: 5_000,
  FAST: 10_000,
  DEFAULT: 30_000,
  STATIC: 60_000,
  DAILY: 300_000,
  HOURLY: 3_600_000,
  DISABLED: 0,
} as const;

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
  HYPURRSCAN_PAST_AUCTIONS_PERP: '/pastAuctionsPerp',
  HYPURRSCAN_HOLDERS: '/holders',
  HYPURRSCAN_STAKED_HOLDERS: '/holders/stakedHYPE',
  
  // LlamaFi endpoints
  LLAMA_FI_HYPERLIQUID_BRIDGE: '/protocol/hyperliquid-bridge',
  
  // Notre backend endpoints
  STAKING_VALIDATIONS: '/staking/validations',
  STAKING_UNSTAKING_QUEUE: '/staking/unstaking-queue',
  STAKING_VALIDATORS: '/staking/validators',
  STAKING_VALIDATORS_TRENDING: '/staking/validators/trending',
  STAKING_VALIDATOR_VOTES: '/staking/validators/votes',
  STAKING_HOLDERS: '/staking/holders',
  STAKING_HOLDERS_TOP: '/staking/holders/top',
  STAKING_HOLDERS_STATS: '/staking/holders/stats',
  MARKET_VAULTS: '/market/vaults',
  LIQUIDATIONS: '/liquidations',
  LIQUIDATIONS_RECENT: '/liquidations/recent',
  LIQUIDATIONS_STATS_ALL: '/liquidations/stats/all',
  LIQUIDATIONS_CHART_DATA: '/liquidations/chart-data',
  LIQUIDATIONS_DATA: '/liquidations/data',
  LIQUIDATIONS_HISTORICAL_CHART: '/liquidations/historical/chart',
  LIQUIDATIONS_ANALYTICS_STATS: '/liquidations/analytics/stats',

  // Indexer vault endpoints (HypeDexer proxy)
  INDEXER_VAULT_SUMMARIES: '/indexer/vaults/vaultSummaries',
  INDEXER_VAULT_DETAILS: '/indexer/vaults/vaultDetails',
  INDEXER_VAULT_DAILY_SNAPSHOTS: '/indexer/vaults/dailySnapshots',
  INDEXER_VAULT_EQUITY_SNAPSHOTS: '/indexer/vaults/equitySnapshots',
  INDEXER_USER_VAULT_EQUITIES: '/indexer/vaults/userVaultEquities',
  INDEXER_VAULT_LEDGER: '/indexer/vaults/vaultLedger',
  INDEXER_VAULT_LEADERBOARD_FOLLOWERS: '/indexer/vaults/leaderboards/followers-gained',
  INDEXER_VAULT_LEADERBOARD_OUTFLOWS: '/indexer/vaults/leaderboards/outflows',

  /** Analytics — priority gas stats (window + optional coin) */
  INDEXER_ANALYTICS_PRIORITY_FEES_STATS: '/indexer/analytics/priority-fees/stats',
  /** Users leaderboard (use query `by=priority_fees`) */
  INDEXER_USERS_LEADERBOARD: '/indexer/users/leaderboard',
  /** HIP-3 gossip priority-fee auction history */
  INDEXER_HIP3_PRIORITY_FEES_GOSSIP_HISTORY: '/indexer/hip3/priority-fees/gossip/history',
  /** Recent fills (supports `has_priority_gas`) */
  INDEXER_FILLS_RECENT: '/indexer/fills/recent',
} as const;

// Helper functions pour construire les URLs complètes
const buildUrl = (baseUrl: keyof typeof API_URLS, endpoint: string): string => {
  return `${API_URLS[baseUrl]}${endpoint}`;
};

export const buildHyperliquidUrl = (endpoint: keyof typeof ENDPOINTS): string => {
  return buildUrl('HYPERLIQUID_API', ENDPOINTS[endpoint]);
};

export const buildHypurrscanUrl = (endpoint: keyof typeof ENDPOINTS): string => {
  return buildUrl('HYPURRSCAN_API', ENDPOINTS[endpoint]);
}; 