// Types pour les PerpDex (HIP-3)

/**
 * Asset avec son cap de streaming OI
 */
export interface PerpDexAsset {
  name: string; // e.g., "xyz:AAPL"
  streamingOiCap: number; // Parsed from string like "25000000.0"
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

