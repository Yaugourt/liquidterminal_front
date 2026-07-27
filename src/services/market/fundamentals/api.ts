import { get } from "../../api/axios-config";
import { withErrorHandling } from "../../api/error-handler";
import { mergeFeeRevenue } from "./derive";
import type { FeeRevenueDay, ProtocolFundamentals } from "./types";

interface FundamentalsResponse {
  data: ProtocolFundamentals;
}

/** The two daily series the aggregate publishes under the same endpoint. */
type FeesDataType = "dailyFees" | "dailyRevenue";

/** `[unix seconds, usd]` pairs, ascending, one entry per UTC day. */
type DailyChart = [number, number][];

interface FeesSummaryResponse {
  data: {
    totalDataChart?: DailyChart;
  };
}

/** DefiLlama's identifier for Hyperliquid, fixed for this page. */
export const HYPERLIQUID_SLUG = "hyperliquid";

/**
 * Volume, gross fees and protocol revenue for a protocol, from the backend
 * DefiLlama aggregate. One round trip for the three lines the income statement
 * needs; the same endpoint already feeds the project detail pages.
 */
export const getProtocolFundamentals = async (
  slug: string = HYPERLIQUID_SLUG
): Promise<ProtocolFundamentals> => {
  return withErrorHandling(async () => {
    const response = await get<FundamentalsResponse>(
      `/defillama/overview/${encodeURIComponent(slug)}`
    );
    return response.data;
  }, "fetching protocol fundamentals");
};

const getDailyChart = async (slug: string, dataType: FeesDataType): Promise<DailyChart> => {
  const response = await get<FeesSummaryResponse>(
    `/defillama/fees/${encodeURIComponent(slug)}?dataType=${dataType}`
  );
  return response.data?.totalDataChart ?? [];
};

/**
 * The daily fee and revenue series, joined into one reconciled history.
 *
 * Two round trips because the aggregate serves the split under one route with a
 * dataType switch rather than one payload. They run in parallel and both are
 * cached upstream, so the cost is a single latency rather than two.
 *
 * The chart carries roughly six hundred days, which is deeper than any window
 * the page offers. Slicing happens at the component so the timeframe selector
 * costs nothing after the first load.
 */
export const getFeeRevenueHistory = async (
  slug: string = HYPERLIQUID_SLUG
): Promise<FeeRevenueDay[]> => {
  return withErrorHandling(async () => {
    const [fees, revenue] = await Promise.all([
      getDailyChart(slug, "dailyFees"),
      getDailyChart(slug, "dailyRevenue"),
    ]);
    return mergeFeeRevenue(fees, revenue);
  }, "fetching fee and revenue history");
};
