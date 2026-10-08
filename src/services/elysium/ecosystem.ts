import { useDataFetching } from "@/hooks/useDataFetching";
import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";

/**
 * Elysium ecosystem directory and launchpad token market. Both are computed by
 * our backend from the Elysium chain (indexed by HypeDexer): project activity
 * from the txs sent to each project's contracts, tokens from the launchpads'
 * own launch and trade events.
 */

export type EcoProjectStatus = "powers" | "live" | "testnet" | "verifying" | "announced" | "exploring";

export interface EcoProject {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  status: EcoProjectStatus;
  statusLabel: string;
  /** Path under /public. */
  logo: string | null;
  url: string | null;
  urlLabel: string | null;
  x: string | null;
  /** Launchpad name for the three launchpads whose tokens we decode. */
  launchpad?: string;
  /** Number of listed contracts. */
  contracts: number;
  /** Null when the project has no contract on chain yet. */
  wallets7d: number | null;
  txs7d: number | null;
  /** Launchpads only. */
  volume7d: number | null;
  launches7d: number | null;
}

export interface EcoToken {
  address: string;
  symbol: string;
  name: string;
  launchpad: string;
  creator: string | null;
  priceUsd: number | null;
  change24h: number | null;
  volume24h: number | null;
  txns24h: number;
  traders24h: number;
  holders: number | null;
  marketCap: number | null;
  top10Pct: number | null;
  devPct: number | null;
  /** Bonding-curve progress in percent; null when the token trades in a pool. */
  curvePct: number | null;
  /** Unix seconds. */
  bornAt: number;
  graduated: boolean;
}

export interface EcoProjectsSnapshot {
  projects: EcoProject[];
  computedAt: string;
}

export interface EcoTokensSnapshot {
  tokens: EcoToken[];
  hypeUsd: number | null;
  computedAt: string;
}

const OPTS = { useCache: false, retryOnError: false } as const;

export const fetchElysiumProjects = () =>
  withErrorHandling(async () => {
    const res = await get<{ data: EcoProjectsSnapshot }>("/elysium/analytics/ecosystem", undefined, OPTS);
    return res.data;
  }, "fetching elysium ecosystem");

export const fetchElysiumLaunchpads = () =>
  withErrorHandling(async () => {
    const res = await get<{ data: EcoTokensSnapshot }>("/elysium/analytics/launchpads", undefined, OPTS);
    return res.data;
  }, "fetching elysium launchpads");

export function useElysiumProjects() {
  return useDataFetching<EcoProjectsSnapshot>({ fetchFn: fetchElysiumProjects, refreshInterval: 120_000, maxRetries: 2 });
}

export function useElysiumLaunchpads() {
  return useDataFetching<EcoTokensSnapshot>({ fetchFn: fetchElysiumLaunchpads, refreshInterval: 60_000, maxRetries: 2 });
}
