/**
 * Validator L1 governance votes — mirrors backend GET /staking/validators/votes.
 *
 * The backend joins the pending `validatorL1Votes` snapshot to validator
 * summaries and single-sources the Foundation flag, so the front consumes the
 * enriched shape as-is (no rule re-derivation client-side).
 */

/** One voter, joined to its validator summary. */
export interface VoteParticipant {
  validator: string; // 0x address
  name: string;
  stake: number; // HYPE
  isFoundation: boolean;
}

/** A pending proposal with participation, stake weight and Foundation split. */
export interface ValidatorVote {
  id: number;
  actionType: string;
  summary: string | null;
  expireTime: number; // epoch ms
  quorumReached: boolean;
  voterCount: number;
  totalValidators: number;
  participationPct: number;
  votingStake: number; // HYPE
  stakeWeightPct: number; // incl. Foundation
  stakeWeightExFoundationPct: number; // community-only
  foundationVoterCount: number;
  voters: VoteParticipant[];
}

/** Overall snapshot context (Foundation split single-sourced server-side). */
export interface ValidatorVotesStats {
  totalValidators: number;
  totalStake: number; // HYPE
  foundationStake: number; // HYPE
  communityStake: number; // HYPE
  pendingCount: number;
  lastUpdate: number; // epoch ms
}

/** Result of the useValidatorVotes hook. */
export interface UseValidatorVotesResult {
  votes: ValidatorVote[];
  stats: ValidatorVotesStats;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  dataUpdatedAt: number | null; // drives "updated Xs ago" (DataFreshness)
}
