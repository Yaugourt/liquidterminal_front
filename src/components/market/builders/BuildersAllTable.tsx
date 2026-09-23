"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { TypedDataTable, TableSearch, type Column } from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";
import { builderBrand } from "@/lib/builderBrands";
import type { BuilderListRow } from "@/services/indexer/builders/types";
import { BuilderIdentity, resolveBuilderLabel } from "./BuilderIdentity";

interface BuildersAllTableProps {
  builders: BuilderListRow[];
  isLoading: boolean;
  error: Error | null;
  /** Refetch handler surfaced as a Retry button in the error state. */
  onRetry?: () => void;
  /** View switcher owned by the page, rendered left of the search in the toolbar. */
  tabs?: ReactNode;
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
    accessor: "address",
  },
  {
    key: "referrerStage",
    header: "Stage",
    align: "right",
    sortable: true,
    getSortValue: (row) => (row.referrerStage ?? "").toLowerCase(),
    accessor: (row) =>
      row.referrerStage ? <StatusBadge variant="neutral">{row.referrerStage}</StatusBadge> : "—",
  },
];

export function BuildersAllTable({ builders, isLoading, error, onRetry, tabs }: BuildersAllTableProps) {
  const router = useRouter();
  const [q, setQ] = useState("");


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
        <>
          {tabs}
          <TableSearch value={q} onChange={setQ} placeholder="Search by name or address…" className="ml-auto" />
        </>
      }
    />
  );
}
