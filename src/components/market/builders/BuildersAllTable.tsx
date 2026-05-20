"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TypedDataTable, type Column, SearchBar } from "@/components/common";
import { avatarColor } from "@/lib/avatarColor";
import type { BuilderListRow } from "@/services/indexer/builders/types";
import { formatBuilderDisplayName } from "./formatBuilderDisplayName";

interface BuildersAllTableProps {
  builders: BuilderListRow[];
  isLoading: boolean;
  error: Error | null;
}

const PAGE_SIZE = 25;

const COLUMNS: Column<BuilderListRow>[] = [
  {
    key: "name",
    header: "Builder",
    sortable: true,
    getSortValue: (row) => formatBuilderDisplayName(row.name).toLowerCase(),
    accessor: (row) => {
      const label = formatBuilderDisplayName(row.name);
      const isAnonymous = label === "—";
      const displayName = isAnonymous
        ? `${row.address.slice(0, 6)}…${row.address.slice(-4)}`
        : label;
      const initial = isAnonymous ? "?" : label.charAt(0).toUpperCase();
      const color = isAnonymous ? null : avatarColor(row.address);
      return (
        <div className="flex items-center gap-2 min-w-0">
          {color ? (
            <div
              className="w-5 h-5 rounded shrink-0 flex items-center justify-center text-[10px] font-semibold"
              style={{ background: `${color}22`, color }}
            >
              {initial}
            </div>
          ) : (
            <div className="w-5 h-5 rounded shrink-0 flex items-center justify-center text-[10px] font-semibold bg-surface-3 text-text-secondary">
              {initial}
            </div>
          )}
          <span
            className={`text-xs truncate ${
              isAnonymous ? "mono text-text-secondary" : "text-text-primary font-medium"
            }`}
          >
            {displayName}
          </span>
        </div>
      );
    },
  },
  {
    key: "address",
    header: "Address",
    type: "address",
    sortable: true,
    className: "hidden md:table-cell",
    getSortValue: (row) => (row.address ?? "").toLowerCase(),
    accessor: (row) => <span className="text-text-secondary">{row.address}</span>,
  },
  {
    key: "referrerStage",
    header: "Stage",
    headerAlign: "right",
    sortable: true,
    getSortValue: (row) => (row.referrerStage ?? "").toLowerCase(),
    accessor: (row) => (
      <div className="text-right">
        <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-surface-3 text-text-tertiary">
          {row.referrerStage || "—"}
        </span>
      </div>
    ),
  },
];

export function BuildersAllTable({ builders, isLoading, error }: BuildersAllTableProps) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const handleSearch = useCallback((query: string) => setQ(query), []);

  // Search filter — sort + pagination are owned by TypedDataTable.
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return builders;
    return builders.filter(
      (b) =>
        (b.name ?? "").toLowerCase().includes(s) ||
        (b.address ?? "").toLowerCase().includes(s) ||
        (b.referredBy ?? "").toLowerCase().includes(s)
    );
  }, [builders, q]);

  return (
    <TypedDataTable<BuilderListRow>
      data={filtered}
      columns={COLUMNS}
      getRowKey={(row) => row.address}
      isLoading={isLoading && builders.length === 0}
      error={error}
      errorTitle="Failed to load builders"
      emptyMessage="No builders"
      emptyDescription={q ? `No results for "${q}"` : "No builder data available."}
      rowMotion
      onRowClick={(row) =>
        router.push(`/market/builders/${encodeURIComponent(row.address)}`)
      }
      paginate
      itemsPerPage={PAGE_SIZE}
      initialSort={{ field: "name", direction: "asc" }}
      paginationVariant={filtered.length > PAGE_SIZE ? "full" : "none"}
      rowsPerPageOptions={[25]}
      toolbar={
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search by name or address…"
          className="max-w-md"
        />
      }
    />
  );
}
