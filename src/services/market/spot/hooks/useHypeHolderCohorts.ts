import { useMemo } from 'react';
import { useTokenHolders } from './useTokenHolders';

/** A holder-size tier, ordered from largest to smallest. */
export interface HolderCohortTier {
  /** Display label, e.g. "Whale". */
  label: string;
  /** Number of holders whose balance falls in this tier. */
  count: number;
  /** Summed HYPE balance held by this tier. */
  balance: number;
  /** This tier's share of total supply, in percent (0–100). */
  supplyPct: number;
}

export interface HypeHolderCohorts {
  /** Tiers ordered whale → retail. */
  tiers: HolderCohortTier[];
  /** Total number of holders across all tiers. */
  totalHolders: number;
  /** Summed balance across all holders (proxy for tracked supply). */
  totalSupply: number;
  isLoading: boolean;
  error: unknown;
}

/**
 * useHypeHolderCohorts — HYPE holders bucketed into size tiers (Whale
 * ≥ 100K, Shark ≥ 10K, Dolphin ≥ 1K, Fish ≥ 100, Shrimp), spot + staked
 * balances summed per address.
 *
 * The backend folds the Hypurrscan lists into the tiers; this only asks for
 * the smallest page and derives each tier's share of the tracked supply.
 */
export function useHypeHolderCohorts(): HypeHolderCohorts {
  const { cohorts, holdersCount, totalBalance, isLoading, error } = useTokenHolders('HYPE', 0, 1);

  return useMemo(() => {
    const tiers: HolderCohortTier[] = cohorts.map((tier) => ({
      label: tier.label,
      count: tier.count,
      balance: tier.balance,
      supplyPct: totalBalance > 0 ? (tier.balance / totalBalance) * 100 : 0,
    }));

    return { tiers, totalHolders: holdersCount, totalSupply: totalBalance, isLoading, error };
  }, [cohorts, holdersCount, totalBalance, isLoading, error]);
}
