import { postExternal } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { API_URLS } from '../../api/constants';
import { 
  PerpDexApiResponse, 
  PerpDex, 
  PerpDexRaw,
  PerpDexGlobalStats 
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

