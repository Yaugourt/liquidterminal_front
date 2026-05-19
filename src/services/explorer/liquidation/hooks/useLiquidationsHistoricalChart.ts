import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchLiquidationsHistoricalChart } from '../api';
import { LiquidationsHistoricalChartResponse } from '../types';

export interface HistoricalChartPoint {
  time: number;
  value: number;
}

/**
 * Hook pour la chart historique des liquidations.
 *
 * Branchée sur `/liquidations/historical/chart` — DB locale du backend
 * (`raw_liquidations`), profondeur jusqu'à 90 jours, granularité adaptative
 * (24h → 30 min, 90j → 12 h). Ne dépend d'aucun upstream externe.
 */
export function useLiquidationsHistoricalChart(
  period: string = '30d',
  coin?: string,
  refreshInterval = 60000
) {
  const { data, isLoading, error, refetch } =
    useDataFetching<LiquidationsHistoricalChartResponse>({
      fetchFn: () => fetchLiquidationsHistoricalChart(period, coin),
      dependencies: [period, coin],
      refreshInterval,
    });

  const chartData = useMemo<HistoricalChartPoint[]>(() => {
    const buckets = data?.data?.buckets ?? [];
    return buckets.map((b) => ({
      time: new Date(b.timestamp).getTime(),
      value: b.totalVolume_USD,
    }));
  }, [data]);

  return { data: chartData, isLoading, error, refetch };
}
