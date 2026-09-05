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
 * Tier definitions by HYPE balance. Order matters: buckets are matched
 * top-down, so the first threshold a balance clears wins.
 */
const TIER_DEFS: { label: string; min: number }[] = [
  { label: 'Whale', min: 100_000 },
  { label: 'Shark', min: 10_000 },
  { label: 'Dolphin', min: 1_000 },
  { label: 'Fish', min: 100 },
  { label: 'Shrimp', min: 0 },
];

/**
 * useHypeHolderCohorts — buckets HYPE holders into size tiers.
 *
 * Wraps `useTokenHolders("HYPE")` (Hypurrscan holders + staked, already merged
 * into one address → balance map) and folds the balances into whale → retail
 * cohorts, computing per-tier holder count, summed balance and share of the
 * total tracked supply.
 */
export function useHypeHolderCohorts(): HypeHolderCohorts {
  const { holders, isLoading, error } = useTokenHolders('HYPE');

  return useMemo(() => {
    const counts = TIER_DEFS.map(() => 0);
    const balances = TIER_DEFS.map(() => 0);
    let totalSupply = 0;
    let totalHolders = 0;

    for (const value of Object.values(holders ?? {})) {
      const balance = Number(value);
      if (!Number.isFinite(balance) || balance <= 0) continue;

      // First tier whose threshold the balance clears (top-down).
      const idx = TIER_DEFS.findIndex((tier) => balance >= tier.min);
      if (idx === -1) continue;

      counts[idx] += 1;
      balances[idx] += balance;
      totalSupply += balance;
      totalHolders += 1;
    }

    const tiers: HolderCohortTier[] = TIER_DEFS.map((tier, i) => ({
      label: tier.label,
      count: counts[i],
      balance: balances[i],
      supplyPct: totalSupply > 0 ? (balances[i] / totalSupply) * 100 : 0,
    }));

    return { tiers, totalHolders, totalSupply, isLoading, error };
  }, [holders, isLoading, error]);
}
