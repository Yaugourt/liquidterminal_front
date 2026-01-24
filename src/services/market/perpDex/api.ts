import { postExternal, getExternal } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { API_URLS } from '../../api/constants';
import {
  PerpDexApiResponse,
  PerpDex,
  PerpDexRaw,
  PerpDexGlobalStats,
  AllPerpMetasResponse,
  PerpMetaAsset,
  CollateralToken,
  COLLATERAL_TOKEN_MAP,
  PastAuctionsPerpApiResponse,
  PastAuctionPerp
} from './types';

/**
 * Transforme les données brutes d'un PerpDex en format utilisable
 */
const transformPerpDex = (raw: PerpDexRaw): PerpDex => {
  const assets = raw.assetToStreamingOiCap.map(([name, cap]) => ({
    name,
    streamingOiCap: parseFloat(cap)
  }));

  const subDeployers = raw.subDeployers.map(([permission, addresses]) => ({
    permission,
    addresses
  }));

  const totalOiCap = assets.reduce((sum, asset) => sum + asset.streamingOiCap, 0);

  // Parse date - handle special "1970-01-01T00:00:00" as null
  let lastChangeTime: Date | null = null;
  if (raw.lastDeployerFeeScaleChangeTime && raw.lastDeployerFeeScaleChangeTime !== '1970-01-01T00:00:00') {
    lastChangeTime = new Date(raw.lastDeployerFeeScaleChangeTime);
  }

  return {
    name: raw.name,
    fullName: raw.fullName,
    deployer: raw.deployer,
    oracleUpdater: raw.oracleUpdater,
    feeRecipient: raw.feeRecipient,
    assets,
    subDeployers,
    deployerFeeScale: parseFloat(raw.deployerFeeScale),
    lastDeployerFeeScaleChangeTime: lastChangeTime,
    totalAssets: assets.length,
    totalOiCap
  };
};

/**
 * Récupère la liste des PerpDexs depuis l'API Hyperliquid
 */
export const fetchPerpDexs = async (): Promise<PerpDex[]> => {
  return withErrorHandling(async () => {
    const url = `${API_URLS.HYPERLIQUID_API}/info`;
    const response = await postExternal<PerpDexApiResponse>(url, { type: 'perpDexs' });
    
    // Filter out null values and transform
    const validDexs = response.filter((dex): dex is PerpDexRaw => dex !== null);
    return validDexs.map(transformPerpDex);
  }, 'fetching perp dexs');
};

/**
 * Calcule les stats globales depuis la liste des PerpDexs
 */
export const calculateGlobalStats = (dexs: PerpDex[]): PerpDexGlobalStats => {
  const totalDexs = dexs.length;
  const totalAssets = dexs.reduce((sum, dex) => sum + dex.totalAssets, 0);
  const totalOiCap = dexs.reduce((sum, dex) => sum + dex.totalOiCap, 0);
  const avgAssetsPerDex = totalDexs > 0 ? totalAssets / totalDexs : 0;

  return {
    totalDexs,
    totalAssets,
    totalOiCap,
    avgAssetsPerDex
  };
};

/**
 * Récupère un PerpDex spécifique par son nom
 */
export const fetchPerpDexByName = async (name: string): Promise<PerpDex | null> => {
  const dexs = await fetchPerpDexs();
  return dexs.find(dex => dex.name.toLowerCase() === name.toLowerCase()) || null;
};

// ============================================
// allPerpMetas API
// ============================================

/**
 * Asset with collateral token info
 */
export interface PerpMetaAssetWithCollateral extends PerpMetaAsset {
  collateralToken: CollateralToken;
}

/**
 * Parsed metadata for all DEXs
 */
export interface ParsedPerpMetas {
  dexMetas: Map<string, PerpMetaAssetWithCollateral[]>;
  dexCollateral: Map<string, CollateralToken>; // Map of dexName -> collateral token
  allAssets: PerpMetaAssetWithCollateral[];
}

/**
 * Extract DEX name from asset name (e.g., "xyz:AAPL" -> "xyz")
 */
const extractDexName = (assetName: string): string => {
  const parts = assetName.split(':');
  return parts.length > 1 ? parts[0] : '';
};

/**
 * Récupère les métadonnées de tous les perps (allPerpMetas)
 * Note: Index 0 is native perps, indices 1+ are HIP-3 DEXs
 */
export const fetchAllPerpMetas = async (): Promise<ParsedPerpMetas> => {
  return withErrorHandling(async () => {
    const url = `${API_URLS.HYPERLIQUID_UI_API}/info`;
    const response = await postExternal<AllPerpMetasResponse>(url, { type: 'allPerpMetas' });
    
    const dexMetas = new Map<string, PerpMetaAssetWithCollateral[]>();
    const dexCollateral = new Map<string, CollateralToken>();
    const allAssets: PerpMetaAssetWithCollateral[] = [];
    
    // Process each DEX entry (skip index 0 which is native perps)
    response.forEach((dex, index) => {
      if (!dex || index === 0) return; // Skip native perps
      
      const dexAssets = dex.universe || [];
      // Get collateral token (0 = USDC, 360 = USDH)
      const collateralToken = COLLATERAL_TOKEN_MAP[dex.collateralToken ?? 0] || 'USDC';
      
      // Group assets by DEX name
      dexAssets.forEach((asset: PerpMetaAsset) => {
        const dexName = extractDexName(asset.name);
        if (!dexName) return;
        
        // Store collateral for this DEX
        if (!dexCollateral.has(dexName)) {
          dexCollateral.set(dexName, collateralToken);
        }
        
        const assetWithCollateral: PerpMetaAssetWithCollateral = {
          ...asset,
          collateralToken
        };
        
        if (!dexMetas.has(dexName)) {
          dexMetas.set(dexName, []);
        }
        dexMetas.get(dexName)!.push(assetWithCollateral);
        allAssets.push(assetWithCollateral);
      });
    });
    
    return { dexMetas, dexCollateral, allAssets };
  }, 'fetching all perp metas');
};

/**
 * Get metadata for a specific DEX
 */
export const fetchPerpMetasByDex = async (dexName: string): Promise<PerpMetaAsset[]> => {
  const { dexMetas } = await fetchAllPerpMetas();
  return dexMetas.get(dexName.toLowerCase()) || [];
};

// ============================================
// Past Auctions Perp API (Hypurrscan)
// ============================================

/**
 * Extract symbol from coin name (e.g., "cash:TSLA" -> "TSLA")
 */
const extractSymbol = (coin: string): string => {
  const parts = coin.split(':');
  return parts.length > 1 ? parts[1] : coin;
};

/**
 * Transform raw auction data to parsed format
 */
const transformPastAuction = (raw: PastAuctionsPerpApiResponse[number]): PastAuctionPerp => {
  const { action } = raw;
  const { assetRequest, dex } = action.registerAsset;

  return {
    time: new Date(raw.time),
    user: raw.user,
    coin: assetRequest.coin,
    symbol: extractSymbol(assetRequest.coin),
    dex,
    oraclePx: parseFloat(assetRequest.oraclePx),
    szDecimals: assetRequest.szDecimals,
    marginTableId: assetRequest.marginTableId,
    onlyIsolated: assetRequest.onlyIsolated,
    block: raw.block,
    hash: raw.hash,
    error: raw.error,
    gasUsed: raw.gasUsed ?? null
  };
};

/**
 * Fetches past perp auctions from Hypurrscan API
 */
export const fetchPastAuctionsPerp = async (): Promise<PastAuctionPerp[]> => {
  return withErrorHandling(async () => {
    const url = `${API_URLS.HYPURRSCAN_API}/pastAuctionsPerp`;
    const response = await getExternal<PastAuctionsPerpApiResponse>(url);
    return response.map(transformPastAuction);
  }, 'fetching past perp auctions');
};

