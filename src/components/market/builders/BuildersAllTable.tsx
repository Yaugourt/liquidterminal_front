"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TypedDataTable, type Column, SearchBar } from "@/components/common";
import { builderBrand } from "@/lib/builderBrands";
import type { BuilderListRow } from "@/services/indexer/builders/types";
import { BuilderIdentity, resolveBuilderLabel } from "./BuilderIdentity";

interface BuildersAllTableProps {
  builders: BuilderListRow[];
  isLoading: boolean;
  error: Error | null;
  /** Refetch handler surfaced as a Retry button in the error state. */
  onRetry?: () => void;
}

const PAGE_SIZE = 25;

const COLUMNS: Column<BuilderListRow>[] = [
  {
    key: "name",
    header: "Builder",
    sortable: true,
    getSortValue: (row) => resolveBuilderLabel(row.address, row.name).label.toLowerCase(),
    accessor: (row) => <BuilderIdentity address={row.address} name={row.name} />,
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

export function BuildersAllTable({ builders, isLoading, error, onRetry }: BuildersAllTableProps) {
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
        (b.referredBy ?? "").toLowerCase().includes(s) ||
        // Searching "phantom" must find the builder registered as PURPS.
        (builderBrand(b.address)?.name.toLowerCase().includes(s) ?? false)
    );
  }, [builders, q]);

  return (
    <TypedDataTable<BuilderListRow>
      data={filtered}
      columns={COLUMNS}
      getRowKey={(row) => row.address}
      isLoading={isLoading && builders.length === 0}
      error={error}
      onErrorRetry={onRetry}
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
