import { useMemo, useState } from 'react';
import { usePerpMarkets } from './usePerpMarket';
import { PerpMarketData } from '../types';

/** Markets below this 24h volume are illiquid — their % moves and funding are noise. */
const MOVER_VOLUME_FLOOR = 1_000_000;

/** Flagship perp used for the headline price KPI + chart sparkline. */
export const FLAGSHIP_PERP = 'BTC';

interface PerpConcentration {
  /** Highest-ranked market by the metric (volume or OI). */
  top: PerpMarketData | null;
  /** `top`'s share of the metric total (%). */
  topShare: number;
  /** Next 5 markets by the metric, for the ranked bars. */
  next: PerpMarketData[];
  nextMax: number;
  /** Metric total excluding `top`. */
  nonTop: number;
  /** Share captured by top + next (top 6), %. */
  top6Share: number;
}

export interface UsePerpDirectoryResult {
  /** Rows after the search filter (volume desc). */
  rows: PerpMarketData[];
  /** All markets, volume desc, unfiltered. */
  allRows: PerpMarketData[];
  totalCount: number;
  /** Σ 24h volume across all markets (server metadata, USD). */
  totalVolume: number;
  /** Σ open interest across all markets (USD). */
  totalOpenInterest: number;
  gainers: PerpMarketData[];
  losers: PerpMarketData[];
  /** Markets paying the most positive / most negative funding (volume-floored). */
  fundingPositive: PerpMarketData[];
  fundingNegative: PerpMarketData[];
  flagship: PerpMarketData | null;
  /** Concentration of 24h volume across markets. */
  volumeConcentration: PerpConcentration;
  /** Concentration of open interest across markets. */
  oiConcentration: PerpConcentration;
  search: string;
  setSearch: (q: string) => void;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

function buildConcentration(
  rows: PerpMarketData[],
  metric: (m: PerpMarketData) => number,
  total: number
): PerpConcentration {
  const [top, ...rest] = rows;
  const next = rest.slice(0, 5);
  const top6 = (top ? metric(top) : 0) + next.reduce((a, m) => a + metric(m), 0);
  return {
    top: top ?? null,
    topShare: top && total ? (metric(top) / total) * 100 : 0,
    next,
    nextMax: next.length ? metric(next[0]) : 1,
    nonTop: top ? Math.max(0, total - metric(top)) : total,
    top6Share: total ? (top6 / total) * 100 : 0,
  };
}

/**
 * Directory hook for /market/perp — single fetch of the full perp universe
 * (one page), all filtering/derivations client-side. Mirrors `useSpotDirectory`:
 * the page composes one hook and passes it to the cards as a prop, so the list
 * is never fetched twice.
 *
 * Notes on the upstream data:
 *  - `openInterest` and `volume` are already USD (the backend multiplies OI by
 *    mark price), so concentration sums and rankings are in dollars.
 *  - `funding` is the raw hourly HL funding rate (a fraction) — components must
 *    render it as a percentage (×100).
 *  - Server-side `sortBy: openInterest` is buggy upstream (double-multiplies by
 *    price), so every ranking here is recomputed client-side from one fetch.
 */
export function usePerpDirectory(): UsePerpDirectoryResult {
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch, totalVolume } = usePerpMarkets({
    limit: 1000,
    defaultParams: { sortBy: 'volume', sortOrder: 'desc' },
  });

  // Defensive re-sort — every derivation below assumes volume desc.
  const allRows = useMemo(
    () => [...data].sort((a, b) => b.volume - a.volume),
    [data]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? allRows.filter((m) => m.name.toLowerCase().includes(q)) : allRows;
  }, [allRows, search]);

  const movers = useMemo(
    () => allRows.filter((m) => m.volume >= MOVER_VOLUME_FLOOR),
    [allRows]
  );
  const gainers = useMemo(
    () =>
      movers
        .filter((m) => m.change24h > 0)
        .sort((a, b) => b.change24h - a.change24h)
        .slice(0, 5),
    [movers]
  );
  const losers = useMemo(
    () =>
      movers
        .filter((m) => m.change24h < 0)
        .sort((a, b) => a.change24h - b.change24h)
        .slice(0, 5),
    [movers]
  );

  const fundingPositive = useMemo(
    () =>
      movers
        .filter((m) => m.funding > 0)
        .sort((a, b) => b.funding - a.funding)
        .slice(0, 5),
    [movers]
  );
  const fundingNegative = useMemo(
    () =>
      movers
        .filter((m) => m.funding < 0)
        .sort((a, b) => a.funding - b.funding)
        .slice(0, 5),
    [movers]
  );

  const flagship = useMemo(
    () => allRows.find((m) => m.name.toUpperCase() === FLAGSHIP_PERP) ?? null,
    [allRows]
  );

  const totalOpenInterest = useMemo(
    () => allRows.reduce((a, m) => a + m.openInterest, 0),
    [allRows]
  );

  const volumeConcentration = useMemo(() => {
    const total = totalVolume || allRows.reduce((a, m) => a + m.volume, 0);
    return buildConcentration(allRows, (m) => m.volume, total);
  }, [allRows, totalVolume]);

  const oiConcentration = useMemo(() => {
    const byOi = [...allRows].sort((a, b) => b.openInterest - a.openInterest);
    return buildConcentration(byOi, (m) => m.openInterest, totalOpenInterest);
  }, [allRows, totalOpenInterest]);

  return {
    rows,
    allRows,
    totalCount: allRows.length,
    totalVolume,
    totalOpenInterest,
    gainers,
    losers,
    fundingPositive,
    fundingNegative,
    flagship,
    volumeConcentration,
    oiConcentration,
    search,
    setSearch,
    isLoading,
    error,
    refetch,
  };
}
