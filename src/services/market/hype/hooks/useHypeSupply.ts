import { useMemo } from 'react';
import { useTokenDetails } from '../../token';
import { HYPE_TOKEN_ID } from '../constants';

/** Parsed, numeric HYPE supply snapshot from the on-chain `tokenDetails` API. */
export interface HypeSupply {
  maxSupply: number;
  totalSupply: number;
  circulatingSupply: number;
  /** Reserve earmarked for future emissions, not yet issued. */
  futureEmissions: number;
  /** maxSupply − totalSupply — permanently burned (gas + spot/priority fees). */
  burned: number;
  /** Latest mark price reported by the info API. */
  markPx: number;
  /** Price 24h ago (for the change calc when the live socket is cold). */
  prevDayPx: number;
  /** ISO deploy time (genesis). */
  deployTime: string | null;
  /** circulating / total × 100. */
  pctCirculating: number;
}

export interface UseHypeSupplyResult {
  supply: HypeSupply | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * HYPE supply hook — reads the canonical on-chain `tokenDetails` for HYPE and
 * parses the string fields into numbers plus a couple of derived values
 * (burned, % circulating). Single source of truth for HYPE supply in the app.
 */
export function useHypeSupply(): UseHypeSupplyResult {
  const { data, isLoading, error, refetch } = useTokenDetails(HYPE_TOKEN_ID);

  const supply = useMemo<HypeSupply | null>(() => {
    if (!data) return null;
    const maxSupply = parseFloat(data.maxSupply);
    const totalSupply = parseFloat(data.totalSupply);
    const circulatingSupply = parseFloat(data.circulatingSupply);
    const futureEmissions = parseFloat(data.futureEmissions);
    const burned = Math.max(0, maxSupply - totalSupply);
    return {
      maxSupply,
      totalSupply,
      circulatingSupply,
      futureEmissions,
      burned,
      markPx: parseFloat(data.markPx),
      prevDayPx: parseFloat(data.prevDayPx),
      deployTime: data.deployTime ?? null,
      pctCirculating: totalSupply > 0 ? (circulatingSupply / totalSupply) * 100 : 0,
    };
  }, [data]);

  return { supply, isLoading, error, refetch };
}
