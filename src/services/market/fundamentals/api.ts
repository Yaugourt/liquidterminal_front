import { get } from "../../api/axios-config";
import { withErrorHandling } from "../../api/error-handler";
import type { ProtocolFundamentals } from "./types";

interface FundamentalsResponse {
  data: ProtocolFundamentals;
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
