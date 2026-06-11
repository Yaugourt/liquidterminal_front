import { useMemo, useState } from "react";
import { useLatestAuctions } from "./useAuctions";
import type { AuctionInfo } from "../types";

export type AuctionEraTab = "all" | "hype" | "usdc";

const DAY_MS = 86_400_000;

interface AuctionHistoryStats {
  /** All auctions ever (both eras), zero-gas genesis deploys included. */
  totalCount: number;
  hypeCount: number;
  usdcCount: number;
  /** Σ winning bids per era — units differ (HYPE vs USDC), never summed. */
  hypeGasSum: number;
  usdcGasSum: number;
  /** Most expensive deploy of each era. */
  peakHype: AuctionInfo | null;
  peakUsdc: AuctionInfo | null;
  /** Timestamp (ms) of the first auction ever. */
  firstTime: number | null;
  /** HYPE-era deploys settled in the last 7d (gas > 0) + their average bid. */
  deploys7d: number;
  avg7d: number;
}

export interface UseAuctionHistoryResult {
  /** Every auction, time desc. */
  all: AuctionInfo[];
  /** Search + era-tab filtered view of `all`. */
  rows: AuctionInfo[];
  hypeAuctions: AuctionInfo[];
  usdcAuctions: AuctionInfo[];
  stats: AuctionHistoryStats;
  /** USDC→HYPE era boundary (ms) reported by the API. */
  splitTimestamp: number | undefined;
  search: string;
  setSearch: (v: string) => void;
  tab: AuctionEraTab;
  setTab: (v: AuctionEraTab) => void;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Full HIP-1 auction record for /market/spot/auction — one fetch (the backend
 * returns the entire history in a single response), everything else derived
 * client-side: era split, search, leaderboards, per-era aggregates.
 *
 * 7d stats are computed here with ms timestamps — `useAuctionTiming`'s
 * `avg7dPrice`/`deploys7d` mix seconds/ms and over-count, so they are
 * deliberately not reused.
 */
export function useAuctionHistory(): UseAuctionHistoryResult {
  const { auctions, isLoading, error, refetch, splitTimestamp } =
    useLatestAuctions(10_000, "ALL");

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<AuctionEraTab>("all");
  // Stable across renders — only used for the 7d cutoff.
  const [now] = useState(() => Date.now());

  const all = useMemo(
    () => [...auctions].sort((a, b) => b.time - a.time),
    [auctions]
  );
  const hypeAuctions = useMemo(
    () => all.filter((a) => a.currency === "HYPE"),
    [all]
  );
  const usdcAuctions = useMemo(
    () => all.filter((a) => a.currency === "USDC"),
    [all]
  );

  const rows = useMemo(() => {
    const base =
      tab === "hype" ? hypeAuctions : tab === "usdc" ? usdcAuctions : all;
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.deployer.toLowerCase().includes(q) ||
        a.tokenId.toLowerCase().includes(q)
    );
  }, [all, hypeAuctions, usdcAuctions, tab, search]);

  const stats = useMemo<AuctionHistoryStats>(() => {
    const peakOf = (list: AuctionInfo[]) =>
      list.reduce<AuctionInfo | null>(
        (m, a) =>
          !m || parseFloat(a.deployGas) > parseFloat(m.deployGas) ? a : m,
        null
      );
    const sumOf = (list: AuctionInfo[]) =>
      list.reduce((s, a) => s + parseFloat(a.deployGas), 0);

    const recent = hypeAuctions.filter(
      (a) => a.time >= now - 7 * DAY_MS && parseFloat(a.deployGas) > 0
    );

    return {
      totalCount: all.length,
      hypeCount: hypeAuctions.length,
      usdcCount: usdcAuctions.length,
      hypeGasSum: sumOf(hypeAuctions),
      usdcGasSum: sumOf(usdcAuctions),
      peakHype: peakOf(hypeAuctions),
      peakUsdc: peakOf(usdcAuctions),
      firstTime: all.length ? all[all.length - 1].time : null,
      deploys7d: recent.length,
      avg7d: recent.length ? sumOf(recent) / recent.length : 0,
    };
  }, [all, hypeAuctions, usdcAuctions, now]);

  return {
    all,
    rows,
    hypeAuctions,
    usdcAuctions,
    stats,
    splitTimestamp,
    search,
    setSearch,
    tab,
    setTab,
    isLoading,
    error,
    refetch,
  };
}
