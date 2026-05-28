"use client";

import { useState, useMemo } from "react";
import { useVaults } from "./useVaults";
import { useVaultSummaries } from "./useVaultSummaries";
import type { VaultSummary, IndexerVaultSummaryItem } from "../types";

export type StatusFilter = "all" | "open" | "closed";

export interface VaultRow extends VaultSummary {
  followerCount: number | null;
  leaderCommission: number | null;
}

export interface UseVaultsDirectoryResult {
  /** All joined rows (vaults × summaries metadata) — pre-filter. */
  rows: VaultRow[];
  /** Rows after search + status filter — what the table renders / what export targets. */
  filtered: VaultRow[];
  /** Aggregate counts from the unfiltered set. */
  totalCount: number;
  totalTvl: number;
  openCount: number;
  closedCount: number;
  totalFollowers: number;
  isLoading: boolean;
  error: Error | null;
  /** Epoch ms of the most recent successful vaults fetch (drives "updated Xs ago"). */
  dataUpdatedAt: number | null;
  search: string;
  setSearch: (q: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (s: StatusFilter) => void;
}

/**
 * Owns the directory state for /explorer/vaults: data fetch, join,
 * filter, search. Call ONCE per page (it owns local state); pass the
 * result down to the header + table.
 */
export function useVaultsDirectory(): UseVaultsDirectoryResult {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const {
    vaults,
    totalTvl,
    totalCount,
    isLoading: vaultsLoading,
    error,
    dataUpdatedAt,
  } = useVaults({ limit: 1000, sortBy: "tvl" });

  const { summaries } = useVaultSummaries({ includeClosed: true, limit: 5000 });

  const summariesByAddress = useMemo(() => {
    const map = new Map<string, IndexerVaultSummaryItem>();
    for (const s of summaries) map.set(s.vaultAddress.toLowerCase(), s);
    return map;
  }, [summaries]);

  const rows = useMemo<VaultRow[]>(
    () =>
      vaults.map((v) => {
        const meta = summariesByAddress.get(v.summary.vaultAddress.toLowerCase()) ?? null;
        return {
          ...v,
          followerCount: meta?.followerCount ?? null,
          leaderCommission: meta?.leaderCommission ?? null,
        };
      }),
    [vaults, summariesByAddress]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((v) => {
      if (statusFilter === "open" && v.summary.isClosed) return false;
      if (statusFilter === "closed" && !v.summary.isClosed) return false;
      if (!q) return true;
      return (
        v.summary.name.toLowerCase().includes(q) ||
        v.summary.vaultAddress.toLowerCase().includes(q) ||
        v.summary.leader.toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const openCount = useMemo(() => vaults.filter((v) => !v.summary.isClosed).length, [vaults]);
  const closedCount = useMemo(() => vaults.filter((v) => v.summary.isClosed).length, [vaults]);
  const totalFollowers = useMemo(
    () => summaries.reduce((acc, s) => acc + (s.followerCount ?? 0), 0),
    [summaries]
  );

  return {
    rows,
    filtered,
    totalCount,
    totalTvl,
    openCount,
    closedCount,
    totalFollowers,
    isLoading: vaultsLoading,
    error,
    dataUpdatedAt,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
  };
}
