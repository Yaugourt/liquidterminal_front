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
  /** Launchpad name, for the launchpads whose tokens we decode. */
  launchpad?: string;
  /** Number of listed contracts. */
  contracts: number;
  /** Null when the project has no contract on chain yet. */
  wallets7d: number | null;
  txs7d: number | null;
  /** Active users (distinct wallets sending a tx to the project) over the last 24h and the 24h before. */
  users24h: number | null;
  usersPrev24h: number | null;
  /** Active users over the 7 days before the last 7 (the current 7 days is `wallets7d`). */
  usersPrev7d: number | null;
  /** Active users per rolling 24h bucket over 14 days, oldest first; empty without contracts. */
  usersDaily: number[];
  /** Launchpads only. */
  volume7d: number | null;
  launches7d: number | null;
  /** Since the first block: non-spam txs and distinct wallets sent to the project's contracts; null without contracts. */
  txsAll?: number | null;
  walletsAll?: number | null;
  /** First non-spam tx to one of its contracts (ISO). */
  firstTxAt?: string | null;
  /** Listed contracts with verified source on the explorer; null until checked. */
  verifiedContracts?: number | null;
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

/**
 * Activity the indexer has not reached: from its last indexed tx to where the live RPC fallback
 * picks up (null while it has not). Calls in between are missing from every activity figure.
 */
export interface EcoActivityGap {
  from: string;
  to: string | null;
}

export interface EcoProjectsSnapshot {
  projects: EcoProject[];
  /** Optional: older backends do not send it. */
  activityGap?: EcoActivityGap | null;
  computedAt: string;
}

export type EcoTokenSort = "hot" | "new" | "gainers" | "mcap";

/** Rows the token list shows: a multiple of the step, up to the backend's ceiling. */
export const ECO_TOKENS_STEP = 50;
export const ECO_TOKENS_MAX = 5_000;
/** Rows one request returns at most: a longer list is fetched page by page. */
export const ECO_TOKENS_PAGE = 200;
/** The backend searches from this many characters (a single one matches almost every token). */
export const ECO_SEARCH_MIN_CHARS = 2;

/** What the launchpad token list asks the backend for. */
export interface EcoTokensQuery {
  /** One launchpad; every launchpad when absent. */
  pad?: string;
  sort: EcoTokenSort;
  /** Matches symbol, name or address. */
  q?: string;
  /** The first `limit` tokens of the order (a multiple of ECO_TOKENS_STEP), fetched ECO_TOKENS_PAGE at a time. */
  limit: number;
}

/** Totals over every launchpad token, computed by the backend. */
export interface EcoTokensSummary {
  tokens: number;
  /** Launched over the 24h before `computedAt`. */
  launched24h: number;
  /** USD traded and trades over the same 24h. */
  volume24h: number;
  trades24h: number;
  graduated: number;
  /** Tokens per launchpad, largest first. */
  pads: { launchpad: string; tokens: number }[];
}

export interface EcoTokensSnapshot {
  /** Tokens of the asked order, filters applied: one page from the backend, the first `limit` once the pages are joined. */
  tokens: EcoToken[];
  /** Tokens the filters match in all. */
  total: number;
  /** True when a search matched more than the backend sorts: `total` is then a floor. */
  totalCapped: boolean;
  summary: EcoTokensSummary;
  /** The three short lists above the table. */
  top: { hot: EcoToken[]; gainers: EcoToken[]; fresh: EcoToken[] };
  hypeUsd: number | null;
  computedAt: string;
}

const OPTS = { useCache: false, retryOnError: false } as const;

export const fetchElysiumProjects = () =>
  withErrorHandling(async () => {
    const res = await get<{ data: EcoProjectsSnapshot }>("/elysium/analytics/ecosystem", undefined, OPTS);
    return res.data;
  }, "fetching elysium ecosystem");

/**
 * The first `query.limit` tokens of an order. The backend returns at most
 * ECO_TOKENS_PAGE rows per request, so a longer list is read page by page, one
 * after the other, and joined here. The totals and the short lists are those
 * of the first page.
 */
export const fetchElysiumLaunchpads = (query: EcoTokensQuery, signal?: AbortSignal) =>
  withErrorHandling(async () => {
    let first: EcoTokensSnapshot | null = null;
    const tokens: EcoToken[] = [];
    // A token can move between two pages when the backend's snapshot changes mid-way: shown once.
    const seen = new Set<string>();
    for (let offset = 0; offset < query.limit; offset += ECO_TOKENS_PAGE) {
      const limit = Math.min(ECO_TOKENS_PAGE, query.limit - offset);
      const params: Record<string, unknown> = { sort: query.sort, limit };
      if (offset > 0) params.offset = offset;
      if (query.pad) params.pad = query.pad;
      if (query.q) params.q = query.q;
      const res = await get<{ data: EcoTokensSnapshot }>("/elysium/analytics/launchpads", params, { ...OPTS, signal });
      const page = res.data;
      first ??= page;
      for (const token of page.tokens ?? []) {
        if (seen.has(token.address)) continue;
        seen.add(token.address);
        tokens.push(token);
      }
      // A short page is the end of the list.
      if ((page.tokens?.length ?? 0) < limit) break;
    }
    // `limit` is at least one step, so there is a first page.
    return { ...(first as EcoTokensSnapshot), tokens };
  }, "fetching elysium launchpads");

export function useElysiumProjects() {
  return useDataFetching<EcoProjectsSnapshot>({ fetchFn: fetchElysiumProjects, refreshInterval: 120_000, maxRetries: 2 });
}

/**
 * The rows the launchpad token list shows, sorted and filtered by the backend
 * (it holds several hundred thousand tokens: the browser only ever gets the
 * rows it shows, 200 per request). While new parameters load, the previous
 * rows stay on screen.
 */
export function useElysiumLaunchpads(query: EcoTokensQuery) {
  const { pad, sort, q, limit } = query;
  return useDataFetching<EcoTokensSnapshot>({
    fetchFn: (signal) => fetchElysiumLaunchpads({ pad, sort, q, limit }, signal),
    refreshInterval: 60_000,
    maxRetries: 2,
    dependencies: [pad, sort, q, limit],
  });
}
