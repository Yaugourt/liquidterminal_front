"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableHeadLabel,
} from "@/components/ui/table";
import {
  ScrollableTable,
  SortableTableHead,
  useSortablePagination,
  SearchBar,
  chartPalette,
} from "@/components/common";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import type { BuilderListRow } from "@/services/indexer/builders/types";
import { formatBuilderDisplayName } from "./formatBuilderDisplayName";

interface BuildersAllTableProps {
  builders: BuilderListRow[];
  isLoading: boolean;
  error: Error | null;
}

type SortField = "name" | "address" | "referrerStage";

const PAGE_SIZE = 25;
const AVATAR_PALETTE = chartPalette.multiSeries;

/** Stable color per builder address (hash mod palette length). */
function avatarColor(address: string): string {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash * 31 + address.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export function BuildersAllTable({ builders, isLoading, error }: BuildersAllTableProps) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const handleSearch = useCallback((query: string) => {
    setQ(query);
  }, []);

  // Search filter (sort + pagination owned by useSortablePagination).
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

  const {
    page,
    setPage,
    sortField,
    sortDirection,
    handleColumnSort,
    paginatedData: pageRows,
    sortedData,
  } = useSortablePagination<BuilderListRow, SortField>({
    data: filtered,
    itemsPerPage: PAGE_SIZE,
    getSortValue: (row, field) => {
      if (field === "name") return formatBuilderDisplayName(row.name).toLowerCase();
      return (row[field] as string | null ?? "").toLowerCase();
    },
    initialSort: { field: "name", direction: "asc" },
  });

  const body = () => {
    if (error) {
      return <ErrorState title="Failed to load builders" message={error.message} withCard={false} />;
    }
    if (isLoading && builders.length === 0) {
      return <LoadingState message="Loading builders…" size="md" withCard={false} />;
    }
    if (filtered.length === 0) {
      return (
        <EmptyState
          title="No builders"
          description={q ? `No results for "${q}"` : "No builder data available."}
          withCard={false}
          className="h-[200px]"
        />
      );
    }

    return (
      <ScrollableTable
        pagination={
          sortedData.length > PAGE_SIZE
            ? {
                total: sortedData.length,
                page,
                rowsPerPage: PAGE_SIZE,
                rowsPerPageOptions: [25],
                onPageChange: setPage,
                onRowsPerPageChange: () => {},
                hidePageNavigation: false,
              }
            : undefined
        }
      >
        <Table>
          <TableHeader className="bg-surface-2">
            <TableRow className="border-border-subtle hover:bg-transparent">
              <SortableTableHead<SortField>
                field="name"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleColumnSort}
              >
                Builder
              </SortableTableHead>
              <SortableTableHead<SortField>
                field="address"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleColumnSort}
                className="hidden md:table-cell"
              >
                Address
              </SortableTableHead>
              <SortableTableHead<SortField>
                field="referrerStage"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleColumnSort}
                align="right"
              >
                Stage
              </SortableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row, idx) => {
              const label = formatBuilderDisplayName(row.name);
              const isAnonymous = label === "—";
              const displayName = isAnonymous
                ? `${row.address.slice(0, 6)}…${row.address.slice(-4)}`
                : label;
              const initial = isAnonymous ? "?" : label.charAt(0).toUpperCase();
              const color = isAnonymous ? null : avatarColor(row.address);

              return (
                <motion.tr
                  key={row.address}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02, duration: 0.2 }}
                  className="border-b border-border-subtle last:border-b-0 hover:bg-surface-2 cursor-pointer transition-colors group"
                  onClick={() => router.push(`/market/builders/${encodeURIComponent(row.address)}`)}
                >
                  <TableCell>
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
                      <span className={`text-xs truncate ${isAnonymous ? "mono text-text-secondary" : "text-text-primary font-medium"}`}>
                        {displayName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="mono text-text-secondary hidden md:table-cell">
                    {row.address}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-surface-3 text-text-tertiary">
                      {row.referrerStage || "—"}
                    </span>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </ScrollableTable>
    );
  };

  return (
    <div>
      {/* Search row inside the shared card */}
      <div className="px-3.5 py-2.5 border-b border-border-subtle">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search by name or address…"
          className="max-w-md"
        />
      </div>
      {body()}
    </div>
  );
}
