import { get } from '@/services/api/axios-config';
import { withErrorHandling } from '@/services/api/error-handler';
import type { WalletPerformance, WalletCoinStat, WalletOverview } from './types';

interface IndexerEnvelope<T> {
  success: boolean;
  data: T;
}

/**
 * Backend-computed trading scorecard for a wallet. The indexer proxy does the
 * aggregation server-side, so this is a plain fetch — no client-side maths.
 */
export const fetchWalletPerformance = async (address: string): Promise<WalletPerformance> => {
  return withErrorHandling(async () => {
    const res = await get<IndexerEnvelope<WalletPerformance>>(
      `/indexer/users/${encodeURIComponent(address)}/performance`
    );
    return res.data;
  }, 'fetching wallet performance');
};

/**
 * Lifetime summary for a wallet (volume, fees, markets traded, last active).
 */
export const fetchWalletOverview = async (address: string): Promise<WalletOverview> => {
  return withErrorHandling(async () => {
    const res = await get<IndexerEnvelope<WalletOverview>>(
      `/indexer/users/${encodeURIComponent(address)}/overview`
    );
    return res.data;
  }, 'fetching wallet overview');
};

/**
 * Per-coin volume / fees / realized PnL for a wallet, ranked by the backend.
 */
export const fetchWalletCoins = async (
  address: string,
  limit = 8
): Promise<WalletCoinStat[]> => {
  return withErrorHandling(async () => {
    const res = await get<IndexerEnvelope<WalletCoinStat[]>>(
      `/indexer/users/${encodeURIComponent(address)}/coins`,
      { limit }
    );
    return res.data ?? [];
  }, 'fetching wallet coin breakdown');
};
