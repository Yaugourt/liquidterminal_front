import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchUserLiquidations } from '../api';
import { mergeLiquidationRows } from '../merge';
import type { Liquidation, LiquidationResponse } from '../types';

interface UseUserLiquidationsResult {
  /** One row per liquidation event (priced + liquidators rows folded), newest first. */
  liquidations: Liquidation[];
  /** Total liquidated notional across the fetched events, USD. */
  totalNotional: number;
  /** True when the DB holds more events than the fetched page. */
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Liquidation history of a wallet from the local liquidations DB. Static-ish
 * data (a wallet is rarely liquidated twice a minute), so it polls slowly.
 */
export const useUserLiquidations = (address: string, limit = 100): UseUserLiquidationsResult => {
  const { data, isLoading, error } = useDataFetching<LiquidationResponse>({
    fetchFn: () => fetchUserLiquidations(address, limit),
    dependencies: [address, limit],
    refreshInterval: 60000,
    maxRetries: 1,
  });

  const liquidations = useMemo(
    () => (data?.data ? mergeLiquidationRows(data.data) : []),
    [data]
  );
  const totalNotional = useMemo(
    () => liquidations.reduce((sum, l) => sum + (l.notional_total || 0), 0),
    [liquidations]
  );

  return {
    liquidations,
    totalNotional,
    hasMore: data?.has_more ?? false,
    isLoading,
    error,
  };
};
