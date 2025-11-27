import { useEffect, useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchPerpDexs, fetchAllPerpMetas, ParsedPerpMetas, PerpMetaAssetWithCollateral } from '../api';
import { usePerpDexMarketDataStore } from '../websocket.service';
import { 
  PerpDex, 
  PerpDexWithMarketData,
  PerpDexAssetWithMarketData,
  PerpDexEnhancedGlobalStats
} from '../types';

/**
 * Extract asset ticker from full name (e.g., "xyz:AAPL" -> "AAPL")
 */
const extractTicker = (assetName: string): string => {
  const parts = assetName.split(':');
  return parts.length > 1 ? parts[1] : assetName;
};

/**
 * Hook that combines all PerpDex data sources:
 * - Basic info from perpDexs API
 * - Metadata from allPerpMetas API
 * - Real-time market data from WebSocket
 */
export function usePerpDexMarketData() {
  // Fetch basic DEX info
  const { 
    data: dexs, 
    isLoading: dexsLoading, 
    error: dexsError 
  } = useDataFetching<PerpDex[]>({
    fetchFn: fetchPerpDexs,
    refreshInterval: 60000, // Refresh every minute
    maxRetries: 3
  });

  // Fetch metadata
  const { 
    data: metas, 
    isLoading: metasLoading, 
    error: metasError 
  } = useDataFetching<ParsedPerpMetas>({
    fetchFn: fetchAllPerpMetas,
    refreshInterval: 60000,
    maxRetries: 3
  });

  // WebSocket market data
  const { 
    marketData, 
    isConnected: wsConnected, 
    connect: wsConnect, 
    disconnect: wsDisconnect,
    lastUpdate 
  } = usePerpDexMarketDataStore();

  // Connect to WebSocket on mount
  useEffect(() => {
    wsConnect();
    return () => wsDisconnect();
  }, [wsConnect, wsDisconnect]);

  // Combine all data sources
  // allPerpMetas is the source of truth for asset list (more complete)
  // perpDexs provides OI cap data
  // WebSocket provides real-time market data
  const enhancedDexs = useMemo((): PerpDexWithMarketData[] => {
    if (!dexs) return [];

    return dexs.map((dex): PerpDexWithMarketData => {
      // Get all assets from allPerpMetas (source of truth for asset list)
      const dexMetas = metas?.dexMetas.get(dex.name.toLowerCase()) || [];
      
      // Get market data for this DEX from WebSocket
      const dexMarketData = marketData.get(dex.name.toLowerCase());
      
      // Create OI cap lookup from perpDexs API
      const oiCapByTicker = new Map<string, number>();
      dex.assets.forEach(asset => {
        const ticker = extractTicker(asset.name);
        oiCapByTicker.set(ticker.toUpperCase(), asset.streamingOiCap);
      });

      // Use allPerpMetas as primary source, enrich with OI cap and market data
      const assetsWithMarketData: PerpDexAssetWithMarketData[] = dexMetas.map((meta: PerpMetaAssetWithCollateral, index) => {
        const ticker = extractTicker(meta.name);
        const streamingOiCap = oiCapByTicker.get(ticker.toUpperCase()) || 0;
        const marketAsset = dexMarketData?.assets[index];

        // Calculate price change
        let priceChange24h = 0;
        if (marketAsset) {
          const markPx = marketAsset.markPx;
          const prevPx = marketAsset.prevDayPx;
          if (prevPx > 0) {
            priceChange24h = ((markPx - prevPx) / prevPx) * 100;
          }
        }

        return {
          // Basic asset info
          name: meta.name,
          streamingOiCap,
          // Metadata from allPerpMetas
          szDecimals: meta.szDecimals,
          maxLeverage: meta.maxLeverage,
          marginTableId: meta.marginTableId,
          onlyIsolated: meta.onlyIsolated ?? true,
          marginMode: meta.marginMode,
          isDelisted: meta.isDelisted ?? false,
          growthMode: meta.growthMode,
          lastGrowthModeChangeTime: meta.lastGrowthModeChangeTime,
          collateralToken: meta.collateralToken, // USDC or USDH
          // Market data from WebSocket
          markPx: marketAsset?.markPx,
          midPx: marketAsset?.midPx ?? undefined,
          oraclePx: marketAsset?.oraclePx,
          funding: marketAsset?.funding,
          openInterest: marketAsset?.openInterest,
          prevDayPx: marketAsset?.prevDayPx,
          dayNtlVlm: marketAsset?.dayNtlVlm,
          dayBaseVlm: marketAsset?.dayBaseVlm,
          premium: marketAsset?.premium ?? undefined,
          priceChange24h
        };
      });

      // Calculate aggregated stats
      const totalVolume24h = assetsWithMarketData.reduce(
        (sum, a) => sum + (a.dayNtlVlm || 0), 0
      );
      const totalOpenInterest = assetsWithMarketData.reduce(
        (sum, a) => sum + (a.openInterest || 0), 0
      );
      const fundingRates = assetsWithMarketData
        .map(a => a.funding)
        .filter((f): f is number => f !== undefined);
      const avgFunding = fundingRates.length > 0
        ? fundingRates.reduce((a, b) => a + b, 0) / fundingRates.length
        : 0;
      const activeAssets = assetsWithMarketData.filter(a => !a.isDelisted).length;
      
      // Recalculate totalAssets based on allPerpMetas count
      const totalAssetsFromMetas = dexMetas.length;

      return {
        ...dex,
        totalAssets: totalAssetsFromMetas, // Override with allPerpMetas count
        assetsWithMarketData,
        totalVolume24h,
        totalOpenInterest,
        avgFunding,
        activeAssets
      };
    });
  }, [dexs, metas, marketData]);

  // Calculate enhanced global stats
  const globalStats = useMemo((): PerpDexEnhancedGlobalStats | null => {
    if (!enhancedDexs.length) return null;

    const totalDexs = enhancedDexs.length;
    const totalAssets = enhancedDexs.reduce((sum, d) => sum + d.totalAssets, 0);
    const totalOiCap = enhancedDexs.reduce((sum, d) => sum + d.totalOiCap, 0);
    const totalVolume24h = enhancedDexs.reduce((sum, d) => sum + d.totalVolume24h, 0);
    const totalOpenInterest = enhancedDexs.reduce((sum, d) => sum + d.totalOpenInterest, 0);
    
    // Calculate average funding across all assets
    const allFundings = enhancedDexs.flatMap(d => 
      d.assetsWithMarketData
        .map(a => a.funding)
        .filter((f): f is number => f !== undefined)
    );
    const avgFunding = allFundings.length > 0
      ? allFundings.reduce((a, b) => a + b, 0) / allFundings.length
      : 0;
    
    const activeMarkets = enhancedDexs.reduce((sum, d) => sum + d.activeAssets, 0);

    return {
      totalDexs,
      totalAssets,
      totalOiCap,
      avgAssetsPerDex: totalAssets / totalDexs,
      totalVolume24h,
      totalOpenInterest,
      avgFunding,
      activeMarkets
    };
  }, [enhancedDexs]);

  return {
    dexs: enhancedDexs,
    globalStats,
    isLoading: dexsLoading || metasLoading,
    error: dexsError || metasError,
    wsConnected,
    lastUpdate
  };
}

/**
 * Hook for a single DEX with market data
 */
export function usePerpDexWithMarketData(dexName: string) {
  const { dexs, isLoading, error, wsConnected, lastUpdate } = usePerpDexMarketData();

  const dex = useMemo(() => {
    return dexs.find(d => d.name.toLowerCase() === dexName.toLowerCase()) || null;
  }, [dexs, dexName]);

  return {
    dex,
    isLoading,
    error,
    wsConnected,
    lastUpdate
  };
}

