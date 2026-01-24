// Types pour les PerpDex (HIP-3)

// ============================================
// Basic Types
// ============================================

/**
 * Asset avec son cap de streaming OI
 */
export interface PerpDexAsset {
  name: string; // e.g., "xyz:AAPL"
  streamingOiCap: number; // Parsed from string like "25000000.0"
}

/**
 * Collateral token mapping
 * 0 = USDC, 360 = USDH
 */
export type CollateralToken = 'USDC' | 'USDH';

export const COLLATERAL_TOKEN_MAP: Record<number, CollateralToken> = {
  0: 'USDC',
  360: 'USDH',
};

/**
 * Asset avec données de marché enrichies
 */
export interface PerpDexAssetWithMarketData extends PerpDexAsset {
  // Metadata from allPerpMetas
  szDecimals: number;
  maxLeverage: number;
  marginTableId: number;
  onlyIsolated: boolean;
  marginMode?: string;
  isDelisted?: boolean;
  growthMode?: string;
  lastGrowthModeChangeTime?: string;
  collateralToken: CollateralToken; // USDC or USDH
  
  // Market data from WebSocket
  markPx?: number;
  midPx?: number;
  oraclePx?: number;
  funding?: number;
  openInterest?: number;
  prevDayPx?: number;
  dayNtlVlm?: number; // Daily notional volume
  dayBaseVlm?: number;
  premium?: number;
  priceChange24h?: number; // Calculated from prevDayPx
}

/**
 * Sub-deployer avec ses permissions
 */
export interface SubDeployer {
  permission: string; // e.g., "setOracle", "registerAsset"
  addresses: string[];
}

/**
 * Données brutes d'un PerpDex depuis l'API
 */
export interface PerpDexRaw {
  name: string;
  fullName: string;
  deployer: string;
  oracleUpdater: string | null;
  feeRecipient: string;
  assetToStreamingOiCap: [string, string][]; // [["xyz:AAPL", "25000000.0"], ...]
  subDeployers: [string, string[]][]; // [["setOracle", ["0x..."]], ...]
  deployerFeeScale: string;
  lastDeployerFeeScaleChangeTime: string;
}

/**
 * Données transformées d'un PerpDex
 */
export interface PerpDex {
  name: string;
  fullName: string;
  deployer: string;
  oracleUpdater: string | null;
  feeRecipient: string;
  assets: PerpDexAsset[];
  subDeployers: SubDeployer[];
  deployerFeeScale: number;
  lastDeployerFeeScaleChangeTime: Date | null;
  // Computed stats
  totalAssets: number;
  totalOiCap: number;
}

/**
 * Stats globales des PerpDexs
 */
export interface PerpDexGlobalStats {
  totalDexs: number;
  totalAssets: number;
  totalOiCap: number;
  avgAssetsPerDex: number;
}

/**
 * Réponse brute de l'API
 */
export type PerpDexApiResponse = (PerpDexRaw | null)[];

/**
 * Paramètres pour les requêtes
 */
export interface PerpDexParams {
  sortBy?: 'name' | 'totalAssets' | 'totalOiCap';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Options pour le hook usePerpDexs
 */
export interface UsePerpDexsOptions {
  defaultParams?: Partial<PerpDexParams>;
  refreshInterval?: number;
}

// ============================================
// allPerpMetas API Types
// ============================================

/**
 * Asset metadata from allPerpMetas
 */
export interface PerpMetaAsset {
  name: string; // e.g., "xyz:XYZ100"
  szDecimals: number;
  maxLeverage: number;
  marginTableId: number;
  onlyIsolated?: boolean;
  marginMode?: string;
  isDelisted?: boolean;
  growthMode?: string;
  lastGrowthModeChangeTime?: string;
}

/**
 * Margin tier definition
 */
export interface MarginTier {
  lowerBound: string;
  maxLeverage: number;
}

/**
 * Margin table definition
 */
export interface MarginTable {
  description: string;
  marginTiers: MarginTier[];
}

/**
 * DEX entry from allPerpMetas response
 */
export interface PerpMetaDex {
  universe: PerpMetaAsset[];
  collateralToken?: number;
  marginTables?: [number, MarginTable][];
}

/**
 * Full allPerpMetas API response
 */
export type AllPerpMetasResponse = (PerpMetaDex | null)[];

// ============================================
// WebSocket Market Data Types
// ============================================

/**
 * Single asset market context from WebSocket
 */
export interface AssetMarketCtx {
  funding: string;
  openInterest: string;
  prevDayPx: string;
  dayNtlVlm: string;
  dayBaseVlm: string;
  markPx: string;
  midPx: string | null;
  oraclePx: string;
  premium: string | null;
  impactPxs: [string, string] | null;
}

/**
 * DEX context from WebSocket - tuple of [dexName, assets[]]
 */
export type DexAssetCtx = [string, AssetMarketCtx[]];

/**
 * WebSocket message for allDexsAssetCtxs
 */
export interface AllDexsAssetCtxsMessage {
  channel: 'allDexsAssetCtxs';
  data: {
    ctxs: DexAssetCtx[];
  };
}

/**
 * Parsed market data for a DEX
 */
export interface DexMarketData {
  dexName: string;
  assets: AssetMarketData[];
  totalVolume24h: number;
  totalOpenInterest: number;
}

/**
 * Parsed market data for an asset
 */
export interface AssetMarketData {
  assetName: string;
  markPx: number;
  midPx: number | null;
  oraclePx: number;
  funding: number;
  openInterest: number;
  prevDayPx: number;
  dayNtlVlm: number;
  dayBaseVlm: number;
  premium: number | null;
  priceChange24h: number;
}

// ============================================
// Combined/Enhanced Types
// ============================================

/**
 * PerpDex with full market data
 */
export interface PerpDexWithMarketData extends PerpDex {
  // Enhanced assets with market data
  assetsWithMarketData: PerpDexAssetWithMarketData[];
  
  // Aggregated market stats
  totalVolume24h: number;
  totalOpenInterest: number;
  avgFunding: number;
  activeAssets: number; // Non-delisted assets
}

/**
 * Enhanced global stats
 */
export interface PerpDexEnhancedGlobalStats extends PerpDexGlobalStats {
  totalVolume24h: number;
  totalOpenInterest: number;
  avgFunding: number;
  activeMarkets: number;
}

/**
 * WebSocket store state
 */
export interface PerpDexMarketDataStore {
  marketData: Map<string, DexMarketData>;
  isConnected: boolean;
  error: string | null;
  lastUpdate: Date | null;
  connect: () => void;
  disconnect: () => void;
}

// ============================================
// Past Auctions Perp API Types (Hypurrscan)
// ============================================

/**
 * Asset request in the auction action
 */
export interface PastAuctionAssetRequest {
  coin: string; // e.g., "cash:TSLA", "xyz:SMSN"
  szDecimals: number;
  oraclePx: string;
  marginTableId: number;
  onlyIsolated: boolean;
}

/**
 * Schema info for the DEX
 */
export interface PastAuctionSchema {
  fullName: string;
  collateralToken: number;
  oracleUpdater: string | null;
}

/**
 * Register asset action in the auction
 */
export interface PastAuctionRegisterAsset {
  maxGas: number | null;
  assetRequest: PastAuctionAssetRequest;
  dex: string; // e.g., "cash", "xyz"
  schema: PastAuctionSchema | null;
}

/**
 * Action in the auction entry
 */
export interface PastAuctionAction {
  type: 'perpDeploy';
  registerAsset: PastAuctionRegisterAsset;
}

/**
 * Raw entry from the pastAuctionsPerp API (new format with action)
 */
export interface PastAuctionPerpRawNew {
  time: number; // Unix timestamp in ms
  user: string; // Deployer address
  action: PastAuctionAction;
  block: number;
  hash: string;
  error: string | null;
  gasUsed?: number;
}

/**
 * Raw entry from the pastAuctionsPerp API (legacy format without action)
 */
export interface PastAuctionPerpRawLegacy {
  time: number;
  deployer: string;
  name: string;
  deployGas: string;
}

/**
 * Union type for API response entries
 */
export type PastAuctionPerpRaw = PastAuctionPerpRawNew | PastAuctionPerpRawLegacy;

/**
 * Type guard to check if entry is new format
 */
export function isPastAuctionPerpNew(entry: PastAuctionPerpRaw): entry is PastAuctionPerpRawNew {
  return 'action' in entry && entry.action?.type === 'perpDeploy';
}

/**
 * Transformed/parsed auction entry
 */
export interface PastAuctionPerp {
  time: Date;
  user: string;
  coin: string; // Full name e.g., "cash:TSLA"
  symbol: string; // Just the symbol e.g., "TSLA"
  dex: string; // e.g., "cash", "xyz"
  dexFullName: string | null;
  oraclePx: number;
  szDecimals: number;
  marginTableId: number;
  onlyIsolated: boolean;
  block: number;
  hash: string;
  error: string | null;
  maxGas: number | null; // Auction gas bid (HYPE)
}

/**
 * API response type
 */
export type PastAuctionsPerpApiResponse = PastAuctionPerpRaw[];

