import { get } from "../../api/axios-config";
import { withErrorHandling } from "../../api/error-handler";
import type { FeeRankData } from "./types";

/**
 * Where Hyperliquid ranks among every protocol on DefiLlama by 24h fees.
 *
 * The backend reads DefiLlama's fee overview once per 10 minutes for every
 * visitor and returns the ranking alone: the browser used to download the
 * whole overview for it (7.1 MB on the wire, 28.6 MB of JSON).
 *
 * Null when no Hyperliquid row carries a usable 24h figure, so the card can
 * gate itself rather than print a fabricated position.
 */
export const getFeeRank = async (): Promise<FeeRankData | null> => {
  return withErrorHandling(async () => {
    const response = await get<{ success: boolean; data: FeeRankData | null }>("/defillama/fee-rank");
    return response.data ?? null;
  }, "fetching fee rank");
};
