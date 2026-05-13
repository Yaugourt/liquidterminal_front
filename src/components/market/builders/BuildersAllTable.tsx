"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchBar, TypedDataTable, type Column } from "@/components/common";
import type { BuilderListRow } from "@/services/indexer/builders/types";
import { formatBuilderDisplayName } from "./formatBuilderDisplayName";

interface BuildersAllTableProps {
  builders: BuilderListRow[];
  isLoading: boolean;
  error: Error | null;
}

const PAGE_SIZE = 25;

export function BuildersAllTable({ builders, isLoading, error }: BuildersAllTableProps) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const handleSearch = useCallback((query: string) => {
    setQ(query);
    setPage(0);
  }, []);

  // Search filter (sort + pagination are owned by TypedDataTable).
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

  const columns = useMemo<Column<BuilderListRow>[]>(() => [
    {
      key: "name",
      header: "Name",
      sortable: true,
      getSortValue: (b) => (b.name ?? "").toLowerCase(),
      accessor: (b) => {
        const name = formatBuilderDisplayName(b.name);
        const initial = name !== "—" ? name.charAt(0).toUpperCase() : "?";
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-[10px] font-bold text-brand-accent shrink-0">
              {initial}
            </div>
            <span className="text-white text-sm font-medium">{name}</span>
          </div>
        );
      },
    },
    {
      key: "address",
      header: "Address",
      sortable: true,
      getSortValue: (b) => (b.address ?? "").toLowerCase(),
      className: "hidden md:table-cell",
      accessor: (b) => (
        <span className="text-xs text-text-secondary font-mono">{b.address}</span>
      ),
    },
    {
      key: "referrerStage",
      header: "Stage",
      sortable: true,
      getSortValue: (b) => (b.referrerStage ?? "").toLowerCase(),
      accessor: (b) => (
        <span className="text-xs text-text-muted px-2 py-0.5 rounded-full bg-white/5 border border-border-subtle">
          {b.referrerStage ?? "—"}
        </span>
      ),
    },
  ], []);

  return (
    <div className="space-y-3">
      <SearchBar
        onSearch={handleSearch}
        placeholder="Search by name or address…"
        className="max-w-md"
      />

      <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
        <TypedDataTable<BuilderListRow>
          data={filtered}
          columns={columns}
          getRowKey={(b) => b.address}
          onRowClick={(b) => router.push(`/market/builders/${encodeURIComponent(b.address)}`)}
          isLoading={isLoading && builders.length === 0}
          error={error}
          errorTitle="Failed to load builders"
          emptyMessage="No builders found"
          emptyDescription={q ? `No results for "${q}"` : "No builders available."}
          // Controlled pagination (page state lives here for search reset interactions).
          total={filtered.length}
          page={page}
          rowsPerPage={PAGE_SIZE}
          onPageChange={setPage}
          onRowsPerPageChange={() => {}}
          paginationVariant="full"
          hidePageNavigation={false}
          initialSort={{ field: "name", direction: "asc" }}
        />
      </div>

      <p className="text-text-muted text-xs px-1">
        {filtered.length} of {builders.length} builders
      </p>
    </div>
  );
}
