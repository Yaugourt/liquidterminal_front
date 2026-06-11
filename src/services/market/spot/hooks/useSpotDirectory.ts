import { useMemo, useState } from 'react';
import { useSpotTokens } from './useSpotMarket';
import { SpotToken } from '../types';
import strictList from '@/../public/strict.json';

export type SpotDirectoryTab = 'all' | 'strict';

/** Movers below this 24h volume are dust — they distort the gainers/losers boards. */
const MOVER_VOLUME_FLOOR = 10_000;

interface SpotConcentration {
  /** Highest-volume token (HYPE in practice) — shown as a summary line. */
  top: SpotToken | null;
  /** `top`'s share of the total 24h volume (%). */
  topShare: number;
  /** Next 5 tokens by volume, for the ranked bars. */
  next: SpotToken[];
  nextMax: number;
  /** Total 24h volume excluding `top`. */
  nonTopVolume: number;
  /** Share of total volume captured by top + next (top 6), %. */
  top6Share: number;
}

export interface UseSpotDirectoryResult {
  /** Rows after tab + search filters (volume desc). */
  rows: SpotToken[];
  /** All tokens, volume desc, unfiltered. */
  allRows: SpotToken[];
  totalCount: number;
  strictCount: number;
  /** Σ 24h volume across all tokens (server metadata). */
  totalVolume: number;
  gainers: SpotToken[];
  losers: SpotToken[];
  hype: SpotToken | null;
  concentration: SpotConcentration;
  search: string;
  setSearch: (q: string) => void;
  tab: SpotDirectoryTab;
  setTab: (t: SpotDirectoryTab) => void;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Directory hook for /market/spot — single fetch of the full token list
 * (303 tokens, one page), all filtering/derivations client-side. Mirrors the
 * `useVaultsDirectory` pattern: the page composes one hook, components receive
 * it as a prop.
 */
export function useSpotDirectory(): UseSpotDirectoryResult {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<SpotDirectoryTab>('all');

  const { data, isLoading, error, refetch, totalVolume } = useSpotTokens({
    limit: 1000,
    page: 1,
    sortBy: 'volume',
    sortOrder: 'desc',
    strict: false,
  });

  // Defensive re-sort — every derivation below assumes volume desc.
  const allRows = useMemo(
    () => [...data].sort((a, b) => b.volume - a.volume),
    [data]
  );

  const strictSet = useMemo(
    () => new Set((strictList as string[]).map((n) => n.trim())),
    []
  );
  const strictCount = useMemo(
    () => allRows.filter((t) => strictSet.has(t.name.trim())).length,
    [allRows, strictSet]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter(
      (t) =>
        (tab === 'all' || strictSet.has(t.name.trim())) &&
        (!q || t.name.toLowerCase().includes(q))
    );
  }, [allRows, tab, search, strictSet]);

  const movers = useMemo(
    () => allRows.filter((t) => t.volume >= MOVER_VOLUME_FLOOR),
    [allRows]
  );
  const gainers = useMemo(
    () =>
      movers
        .filter((t) => t.change24h > 0)
        .sort((a, b) => b.change24h - a.change24h)
        .slice(0, 5),
    [movers]
  );
  const losers = useMemo(
    () =>
      movers
        .filter((t) => t.change24h < 0)
        .sort((a, b) => a.change24h - b.change24h)
        .slice(0, 5),
    [movers]
  );

  const hype = useMemo(
    () => allRows.find((t) => t.name === 'HYPE') ?? null,
    [allRows]
  );

  const concentration = useMemo<SpotConcentration>(() => {
    const total = totalVolume || allRows.reduce((a, t) => a + t.volume, 0);
    const [top, ...rest] = allRows;
    const next = rest.slice(0, 5);
    const top6 = (top?.volume ?? 0) + next.reduce((a, t) => a + t.volume, 0);
    return {
      top: top ?? null,
      topShare: top && total ? (top.volume / total) * 100 : 0,
      next,
      nextMax: next.length ? next[0].volume : 1,
      nonTopVolume: top ? Math.max(0, total - top.volume) : total,
      top6Share: total ? (top6 / total) * 100 : 0,
    };
  }, [allRows, totalVolume]);

  return {
    rows,
    allRows,
    totalCount: allRows.length,
    strictCount,
    totalVolume,
    gainers,
    losers,
    hype,
    concentration,
    search,
    setSearch,
    tab,
    setTab,
    isLoading,
    error,
    refetch,
  };
}
