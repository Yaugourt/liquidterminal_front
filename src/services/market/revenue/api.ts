import { get } from "../../api/axios-config";
import { withErrorHandling } from "../../api/error-handler";
import type { RevenueBreakdown, RevenueWindow } from "./types";

interface RevenueResponse {
  data: RevenueBreakdown;
}

/**
 * Fetch the daily revenue breakdown (5 sources stacked) for a given window.
 * Backed by Hypurrscan (perp/spot/HIP-1) + HypeDexer (HIP-3) + HL info (HYPE price).
 */
export const getRevenueBreakdown = async (
  window: RevenueWindow,
): Promise<RevenueBreakdown> => {
  return withErrorHandling(async () => {
    const response = await get<RevenueResponse>(
      `/market/revenue/history?window=${encodeURIComponent(window)}`,
    );
    return response.data;
  }, "fetching revenue breakdown");
};
