import { getExternal } from "../../api/axios-config";
import { withErrorHandling } from "../../api/error-handler";
import type { DefiLlamaFeeOverview, DefiLlamaFeeProtocol, FeeRankData } from "./types";

/** DefiLlama's public fee overview across every protocol it tracks. */
const FEES_OVERVIEW_URL = "https://api.llama.fi/overview/fees";

/** Substring that identifies the Hyperliquid rows in the field. */
const HYPERLIQUID_MATCH = "Hyperliquid";

/** Numeric 24h fees, or null when the protocol reports none. */
const fees24h = (p: DefiLlamaFeeProtocol): number | null =>
  typeof p.total24h === "number" && Number.isFinite(p.total24h) ? p.total24h : null;

/**
 * Where Hyperliquid ranks among every protocol on DefiLlama by 24h fees.
 *
 * The aggregate lists several "Hyperliquid" rows (perps and the HLP vault line
 * among them). The one that carries the venue is the largest by 24h fees, so we
 * match on the name and keep the maximum — that also drops the tiny HLP line
 * without hard-coding its label.
 *
 * Rank is that value's 1-based position in the full field: one plus the count of
 * protocols whose 24h fees are strictly greater. Ties share the lower rank,
 * which is the conservative reading for an ordinal the card states as a fact.
 *
 * Returns null when no Hyperliquid row carries a usable 24h figure, so the card
 * can gate itself rather than print a fabricated position.
 */
export const getFeeRank = async (): Promise<FeeRankData | null> => {
  return withErrorHandling(async () => {
    const overview = await getExternal<DefiLlamaFeeOverview>(FEES_OVERVIEW_URL);
    const protocols = Array.isArray(overview?.protocols) ? overview.protocols : [];

    // The Hyperliquid row that actually carries the venue: the largest 24h fees
    // among every name-matched entry.
    let hl: DefiLlamaFeeProtocol | null = null;
    let hlFees = -Infinity;
    for (const p of protocols) {
      if (!p.name.includes(HYPERLIQUID_MATCH)) continue;
      const value = fees24h(p);
      if (value === null) continue;
      if (value > hlFees) {
        hlFees = value;
        hl = p;
      }
    }

    if (hl === null || !Number.isFinite(hlFees)) return null;

    // 1-based position: how many protocols out-earn Hyperliquid, plus one.
    let greater = 0;
    for (const p of protocols) {
      const value = fees24h(p);
      if (value !== null && value > hlFees) greater += 1;
    }

    return {
      rank: greater + 1,
      protocolCount: protocols.length,
      hlFees24h: hlFees,
      name: hl.name,
    };
  }, "fetching fee rank");
};
