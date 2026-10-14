import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { useDataFetching } from "@/hooks/useDataFetching";

/** Shapes served by the back (`/market/portfolio-margin`), see PortfolioMarginService there. */
export interface PmReserve {
  token: number;
  name: string;
  oraclePx: number;
  ltv: number;
  liquidationThreshold: number | null;
  totalSupplied: number;
  totalBorrowed: number;
  suppliedUsd: number;
  borrowedUsd: number;
  utilization: number;
  borrowApy: number;
  supplyApy: number;
}

export interface PmTokenAmount {
  token: number;
  name: string;
  amount: number;
  usd: number;
}

export interface PmAccount {
  address: string;
  /** Hyperliquid's own label, e.g. "healthy" or "atRisk". */
  health: string;
  /** Hyperliquid's own value, passed through untouched. */
  healthFactor: number | null;
  debtUsd: number;
  collateralUsd: number;
  borrows: PmTokenAmount[];
  supplies: PmTokenAmount[];
  perpAccountValue: number;
  perpMaintenanceMargin: number;
  perps: { coin: string; size: number; notionalUsd: number; unrealizedPnl: number }[];
  updatedAt: number;
}

export interface PmSnapshot {
  reserves: PmReserve[];
  accounts: PmAccount[];
  scan: { candidates: number; checked: number; found: number };
  updatedAt: number;
}

export interface PmHistoryRow {
  time: number;
  token: number;
  tokenName: string;
  utilization: string;
  oraclePx: string;
  totalSupplied: string;
  totalBorrowed: string;
  borrowYearlyRate: string;
  supplyYearlyRate: string;
}

interface Envelope<T> {
  success: boolean;
  data: T;
}

/** Reserves, the portfolio margin accounts found so far, and the scan progress. */
export const fetchPortfolioMargin = async (): Promise<PmSnapshot> =>
  withErrorHandling(async () => (await get<Envelope<PmSnapshot>>("/market/portfolio-margin")).data, "fetching portfolio margin");

/** One reserve's history since 2026-09-23 (sampled every minute by HypeDexer, resampled). */
export const fetchPortfolioMarginHistory = async (token: number, interval: "1h" | "4h" | "1d"): Promise<PmHistoryRow[]> =>
  withErrorHandling(
    async () =>
      (await get<Envelope<{ history: PmHistoryRow[] }>>("/market/portfolio-margin/history", { token, interval })).data.history,
    "fetching portfolio margin history"
  );

export function usePortfolioMargin() {
  return useDataFetching<PmSnapshot>({ fetchFn: fetchPortfolioMargin, refreshInterval: 60_000, maxRetries: 2 });
}

export function usePortfolioMarginHistory(token: number, interval: "1h" | "4h" | "1d" = "4h") {
  return useDataFetching<PmHistoryRow[]>({
    fetchFn: () => fetchPortfolioMarginHistory(token, interval),
    refreshInterval: 300_000,
    dependencies: [token, interval],
    maxRetries: 2,
  });
}
