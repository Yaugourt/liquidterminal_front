import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchLiquidationsData } from '../api';
import {
  LiquidationsDataResponse,
  LiquidationStats,
  ChartDataBucket,
  ChartPeriod,
} from '../types';

/**
 * Stats vides — utilisées tant que la donnée n'est pas chargée.
 */
const EMPTY_STATS: LiquidationStats = {
  totalVolume: 0,
  liquidationsCount: 0,
  longCount: 0,
  shortCount: 0,
  topCoin: '-',
  topCoinVolume: 0,
  avgSize: 0,
  maxLiq: 0,
  longVolume: 0,
  shortVolume: 0,
};

/**
 * Hook pour les données de liquidation d'une période (stats + buckets chart).
 *
 * Branché sur l'endpoint unifié `/liquidations/data` — le seul endpoint de
 * liquidations opérationnel (les endpoints `recent` et `analytics/stats` sont
 * respectivement coupés par circuit breaker et en 402). Un seul appel renvoie
 * stats + chart pour 2h / 4h / 8h / 12h / 24h ; on sélectionne la période.
 */
export function useLiquidationsData(
  period: ChartPeriod = '24h',
  refreshInterval = 30000
) {
  const { data, isLoading, error, refetch } =
    useDataFetching<LiquidationsDataResponse>({
      fetchFn: fetchLiquidationsData,
      dependencies: [],
      refreshInterval,
    });

  const periodData = data?.periods?.[period];
  const stats: LiquidationStats = periodData?.stats ?? EMPTY_STATS;
  const buckets: ChartDataBucket[] = periodData?.chart?.buckets ?? [];

  return { stats, buckets, isLoading, error, refetch };
}
