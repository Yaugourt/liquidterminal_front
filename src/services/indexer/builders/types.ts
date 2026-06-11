/** Timeframes accepted by `/indexer/builders/*` (aligned with backend Zod). */
export type BuildersTimeframe = "1h" | "24h" | "7d" | "30d";

export interface BuilderListRow {
  address: string;
  name: string;
  referredBy: string | null;
  referrerStage: string;
}

interface BuilderStatsMetrics {
  fillCount: number;
  totalVolume: number;
  totalFees: number;
  totalBuilderFees: number;
  uniqueBuilders?: number;
  uniqueUsers: number;
  uniqueCoins: number;
}

interface BuilderStatsVariations {
  fillCountPct?: number | null;
  totalVolumePct?: number | null;
  totalFeesPct?: number | null;
  totalBuilderFeesPct?: number | null;
  uniqueBuildersPct?: number | null;
  uniqueUsersPct?: number | null;
}

/** `/indexer/builders/stats` leaf payload. */
export interface BuildersGlobalStatsPayload {
  timeframe: BuildersTimeframe;
  current: BuilderStatsMetrics;
  previous: BuilderStatsMetrics;
  variations: BuilderStatsVariations;
}

export type BuildersAllTimeframesPayload = Record<
  BuildersTimeframe,
  {
    current: BuilderStatsMetrics;
    previous: BuilderStatsMetrics;
    variations: BuilderStatsVariations;
  }
>;

export interface BuilderTopRow {
  builder: string;
  builderName: string | null | Record<string, unknown>;
  fillCount: number;
  totalVolume: number;
  totalFees: number;
  totalBuilderFees: number;
  uniqueUsers: number;
  uniqueCoins: number;
}

/** `/indexer/builders/top` leaf payload. */
export interface BuildersTopPayload {
  timeframe: BuildersTimeframe;
  sort: string;
  builders: BuilderTopRow[];
}

export interface BuilderCoinBreakdownRow {
  coin?: string;
  fillCount?: number;
  totalVolume?: number;
  totalFees?: number;
  totalBuilderFees?: number;
  uniqueUsers?: number;
  [key: string]: unknown;
}

/** `/indexer/builders/:address/stats` leaf payload. */
export interface BuilderDetailStatsPayload {
  builder: string;
  builderName: string | null;
  timeframe: BuildersTimeframe;
  current: Omit<BuilderStatsMetrics, "uniqueBuilders">;
  previous: Omit<BuilderStatsMetrics, "uniqueBuilders">;
  variations: BuilderStatsVariations;
  coinBreakdown: BuilderCoinBreakdownRow[];
}

/** Single user row from `/indexer/builders/:address/users` — upstream shape may evolve. */
export interface BuilderUserRow {
  user?: string;
  address?: string;
  totalBuilderFees?: number;
  builderFees?: number;
  volume?: number;
  [key: string]: unknown;
}

/** `/indexer/builders/:address/users` leaf payload. */
export interface BuilderUsersPayload {
  timeframe: BuildersTimeframe;
  builder: string;
  users: BuilderUserRow[];
}

export interface UseBuildersListResult {
  builders: BuilderListRow[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseBuildersGlobalStatsResult {
  stats: BuildersGlobalStatsPayload | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseBuildersStatsAllTimeframesResult {
  stats: BuildersAllTimeframesPayload | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseBuildersTopResult {
  data: BuildersTopPayload | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseBuilderStatsResult {
  stats: BuilderDetailStatsPayload | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseBuilderUsersResult {
  data: BuilderUsersPayload | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
