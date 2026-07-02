import { fetchValidatorVotes } from '../../votes';
import { UseValidatorVotesResult, ValidatorVote, ValidatorVotesStats } from '../../types/votes';
import { useDataFetching } from '@/hooks/useDataFetching';

const EMPTY_STATS: ValidatorVotesStats = {
  totalValidators: 0,
  totalStake: 0,
  foundationStake: 0,
  communityStake: 0,
  pendingCount: 0,
  lastUpdate: 0
};

/**
 * Pending L1 governance votes (validatorL1Votes joined to validators).
 * Mirrors useValidators; additionally surfaces `dataUpdatedAt` so the V4 header
 * can render "updated Xs ago" via DataFreshness. Empty snapshot → empty list.
 */
export const useValidatorVotes = (): UseValidatorVotesResult => {
  const { data, isLoading, error, refetch, dataUpdatedAt } = useDataFetching<{
    votes: ValidatorVote[];
    stats: ValidatorVotesStats;
  }>({
    fetchFn: fetchValidatorVotes,
    refreshInterval: 30000 // 30 seconds
  });

  return {
    votes: data?.votes || [],
    stats: data?.stats || EMPTY_STATS,
    isLoading,
    error,
    refetch,
    dataUpdatedAt
  };
};
