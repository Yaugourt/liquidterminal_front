import { useCallback } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import {
  fetchFollowersGainedLeaderboard,
  fetchOutflowsLeaderboard,
} from '../api';
import {
  FollowersGainedItem,
  OutflowItem,
  UseVaultsLeaderboardsResult,
  VaultLeaderboardMeta,
  VaultLeaderboardResponse,
  VaultLeaderboardWindow,
} from '../types';

interface UseVaultsLeaderboardsOptions {
  window?: VaultLeaderboardWindow;
  followersLimit?: number;
  outflowsLimit?: number;
}

interface CombinedPayload {
  followers: VaultLeaderboardResponse<FollowersGainedItem>;
  outflows: VaultLeaderboardResponse<OutflowItem>;
}

/**
 * Fetches both vault leaderboards in parallel. The back precomputes them from
 * a single shared cache slot so two requests hit the same Redis key — no
 * additional fan-out cost vs a single request.
 */
export const useVaultsLeaderboards = (
  options: UseVaultsLeaderboardsOptions = {}
): UseVaultsLeaderboardsResult => {
  const { window = '24h', followersLimit = 5, outflowsLimit = 3 } = options;

  const fetchBoth = useCallback(async (): Promise<CombinedPayload> => {
    const [followers, outflows] = await Promise.all([
      fetchFollowersGainedLeaderboard({ window, limit: followersLimit }),
      fetchOutflowsLeaderboard({ window, limit: outflowsLimit }),
    ]);
    return { followers, outflows };
  }, [window, followersLimit, outflowsLimit]);

  const { data, isLoading, error, refetch } = useDataFetching<CombinedPayload>({
    fetchFn: fetchBoth,
    dependencies: [window, followersLimit, outflowsLimit],
    refreshInterval: 60000,
    maxRetries: 3,
  });

  const meta: VaultLeaderboardMeta | null = data?.followers.meta ?? null;

  return {
    followersGained: data?.followers.data ?? [],
    outflows: data?.outflows.data ?? [],
    meta,
    isLoading,
    error,
    refetch,
  };
};
