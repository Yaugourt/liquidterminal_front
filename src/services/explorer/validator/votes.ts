import { get } from '@/services/api/axios-config';
import { withErrorHandling } from '@/services/api/error-handler';
import { ENDPOINTS } from '@/services/api/constants';
import { ValidatorVote, ValidatorVotesStats } from './types/votes';

/**
 * Fetches pending L1 governance votes joined to validator stake + Foundation
 * flag. Mirrors fetchAllValidators: withErrorHandling wraps the centralized
 * `get` helper, then the backend `{ data, stats }` envelope is reshaped.
 *
 * PARKED: the backend does not serve this endpoint yet, so no hook calls this
 * function (useValidatorVotes returns a static empty snapshot). Re-wire it
 * there once GET /staking/validators/votes ships.
 */
export const fetchValidatorVotes = async (): Promise<{ votes: ValidatorVote[]; stats: ValidatorVotesStats }> => {
  return withErrorHandling(async () => {
    const response = await get<{ data: ValidatorVote[]; stats: ValidatorVotesStats }>(
      ENDPOINTS.STAKING_VALIDATOR_VOTES
    );
    return { votes: response.data, stats: response.stats };
  }, 'fetching validator votes');
};
