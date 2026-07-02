import { useMemo } from 'react';
import { useHypePrice } from './useHypePrice';
import { useHypeSupply } from './useHypeSupply';
import { useAssistanceFund } from '../../assistanceFund';
import type { AssistanceFundData } from '../../assistanceFund';

/** Supply composition split (HYPE units) — sums to maxSupply by construction. */
export interface SupplyComposition {
  circulating: number;
  /** Locked / vesting and other non-circulating, excluding the Assistance Fund. */
  lockedExAf: number;
  assistanceFund: number;
  futureEmissions: number;
  burned: number;
}

export interface HypeOverview {
  /** Live price (socket), falling back to the info API mark. */
  price: number;
  change24hPct: number | null;
  marketCap: number;
  fdv: number;
  // supply
  maxSupply: number;
  totalSupply: number;
  circulatingSupply: number;
  futureEmissions: number;
  burned: number;
  burnedUsd: number;
  pctCirculating: number;
  deployTime: string | null;
  // assistance fund
  af: AssistanceFundData | null;
  afPctOfCirculating: number | null;
  afPctOfMax: number | null;
  // composition + scarcity
  composition: SupplyComposition;
  /** (Assistance Fund + burned) / maxSupply × 100 — effectively out of float. */
  removedFromFloatPct: number;
}

export interface UseHypeOverviewResult {
  overview: HypeOverview | null;
  isLoading: boolean;
}

/**
 * Composes the live HYPE price, on-chain supply and Assistance-Fund position
 * into a single derived snapshot (market cap, FDV, supply composition, AF share
 * and the share of supply effectively removed from float). All inputs come from
 * the authoritative Hyperliquid info API, so the page stays internally
 * consistent with the rest of the app.
 */
export function useHypeOverview(): UseHypeOverviewResult {
  const { price: livePrice } = useHypePrice();
  const { supply } = useHypeSupply();
  const { data: af } = useAssistanceFund();

  const overview = useMemo<HypeOverview | null>(() => {
    if (!supply) return null;

    const price = livePrice && livePrice > 0 ? livePrice : supply.markPx;
    if (!price || price <= 0) return null;

    const change24hPct =
      supply.prevDayPx > 0 ? ((price - supply.prevDayPx) / supply.prevDayPx) * 100 : null;

    const marketCap = supply.circulatingSupply * price;
    const fdv = supply.maxSupply * price;
    const burnedUsd = supply.burned * price;

    const afHype = af?.hypeBalance ?? 0;
    const afPctOfCirculating =
      af && supply.circulatingSupply > 0 ? (afHype / supply.circulatingSupply) * 100 : null;
    const afPctOfMax = af && supply.maxSupply > 0 ? (afHype / supply.maxSupply) * 100 : null;

    // Residual locked bucket absorbs the remainder so the five segments always
    // sum to maxSupply, regardless of how the API classifies AF vs circulating.
    const lockedExAf = Math.max(
      0,
      supply.maxSupply -
        supply.circulatingSupply -
        supply.futureEmissions -
        supply.burned -
        afHype,
    );

    const composition: SupplyComposition = {
      circulating: supply.circulatingSupply,
      lockedExAf,
      assistanceFund: afHype,
      futureEmissions: supply.futureEmissions,
      burned: supply.burned,
    };

    const removedFromFloatPct =
      supply.maxSupply > 0 ? ((afHype + supply.burned) / supply.maxSupply) * 100 : 0;

    return {
      price,
      change24hPct,
      marketCap,
      fdv,
      maxSupply: supply.maxSupply,
      totalSupply: supply.totalSupply,
      circulatingSupply: supply.circulatingSupply,
      futureEmissions: supply.futureEmissions,
      burned: supply.burned,
      burnedUsd,
      pctCirculating: supply.pctCirculating,
      deployTime: supply.deployTime,
      af,
      afPctOfCirculating,
      afPctOfMax,
      composition,
      removedFromFloatPct,
    };
  }, [livePrice, supply, af]);

  return { overview, isLoading: !supply };
}
