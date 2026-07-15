import { UseValidatorVotesResult, ValidatorVotesStats } from '../../types/votes';

const EMPTY_STATS: ValidatorVotesStats = {
  totalValidators: 0,
  totalStake: 0,
  foundationStake: 0,
  communityStake: 0,
  pendingCount: 0,
  lastUpdate: 0
};

// Stable identity so consumers' useMemo dependencies do not churn.
const UNAVAILABLE_RESULT: UseValidatorVotesResult = {
  votes: [],
  stats: EMPTY_STATS,
  isLoading: false,
  error: null,
  refetch: async () => {},
  dataUpdatedAt: null
};

/**
 * Pending L1 governance votes.
 *
 * DISABLED: the backend does not expose GET /staking/validators/votes, so
 * fetching it only produced 404 noise. The hook keeps its public shape and
 * serves a static empty snapshot; restore the useDataFetching call on
 * `fetchValidatorVotes` (see ../../votes.ts) once the endpoint ships.
 */
export const useValidatorVotes = (): UseValidatorVotesResult => UNAVAILABLE_RESULT;
