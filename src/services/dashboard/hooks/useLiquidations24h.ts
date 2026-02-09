import { useDataFetching } from '@/hooks/useDataFetching';
import { get } from '@/services/api/axios-config';
import { ENDPOINTS } from '@/services/api/constants';
import { withErrorHandling } from '@/services/api/error-handler';

/**
 * Réponse de l'API /api/liquidations/analytics/stats
 */
export interface LiquidationsAnalyticsData {
  number_liquidation: number;
  number_long_liquidated: number;
  number_short_liquidated: number;
  amount_liquidated_usd: number;
  total_fees: number;
  top_token_liquidated: string;
  time_range: {
    start: string;
    end: string;
  };
}

export interface LiquidationsAnalyticsResponse {
  success: boolean;
  message: string;
  data: LiquidationsAnalyticsData;
  total_count: number | null;
  execution_time_ms: number;
  next_cursor: string | null;
  has_more: boolean | null;
}

/**
 * Fetch les stats de liquidation analytics
 */
const fetchLiquidationsAnalytics = async (): Promise<LiquidationsAnalyticsResponse> => {
  return withErrorHandling(async () => {
    const response = await get<LiquidationsAnalyticsResponse>(
      ENDPOINTS.LIQUIDATIONS_ANALYTICS_STATS
    );
    return response;
  }, 'fetching liquidations analytics');
};

/**
 * Stats normalisées pour l'affichage
 */
export interface Liquidations24hStats {
  totalVolume: number;
  liquidationsCount: number;
  longCount: number;
  shortCount: number;
  topToken: string;
  totalFees: number;
}

const defaultStats: Liquidations24hStats = {
  totalVolume: 0,
  liquidationsCount: 0,
  longCount: 0,
  shortCount: 0,
  topToken: '-',
  totalFees: 0,
};

/**
 * Hook pour récupérer les statistiques de liquidation des dernières 24h
 * Utilise l'endpoint /api/liquidations/analytics/stats
 */
export function useLiquidations24h(refreshInterval = 30000) {
  const { data, isLoading, error, refetch } = useDataFetching<LiquidationsAnalyticsResponse>({
    fetchFn: fetchLiquidationsAnalytics,
    dependencies: [],
    refreshInterval
  });

  // Transformer les données en format normalisé
  const stats: Liquidations24hStats = data?.data ? {
    totalVolume: data.data.amount_liquidated_usd,
    liquidationsCount: data.data.number_liquidation,
    longCount: data.data.number_long_liquidated,
    shortCount: data.data.number_short_liquidated,
    topToken: data.data.top_token_liquidated,
    totalFees: data.data.total_fees,
  } : defaultStats;

  return {
    stats,
    isLoading,
    error,
    refetch
  };
}
