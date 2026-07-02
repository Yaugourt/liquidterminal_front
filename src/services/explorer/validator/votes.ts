import { get } from '@/services/api/axios-config';
import { withErrorHandling } from '@/services/api/error-handler';
import { ENDPOINTS } from '@/services/api/constants';
import { ValidatorVote, ValidatorVotesStats } from './types/votes';

/**
 * Fetches pending L1 governance votes joined to validator stake + Foundation
 * flag. Mirrors fetchAllValidators: withErrorHandling wraps the centralized
 * `get` helper, then the backend `{ data, stats }` envelope is reshaped.
 */
export const fetchValidatorVotes = async (): Promise<{ votes: ValidatorVote[]; stats: ValidatorVotesStats }> => {
  return withErrorHandling(async () => {
    const response = await get<{ data: ValidatorVote[]; stats: ValidatorVotesStats }>(
      ENDPOINTS.STAKING_VALIDATOR_VOTES
    );
    return { votes: response.data, stats: response.stats };
  }, 'fetching validator votes');
};
