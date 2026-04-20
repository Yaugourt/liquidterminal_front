"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableHeadLabel,
} from "@/components/ui/table";
import { ScrollableTable } from "@/components/common/ScrollableTable";
import { SearchBar } from "@/components/common/SearchBar";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
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

  if (error) {
    return <ErrorState title="Failed to load builders" message={error.message} withCard={false} />;
  }

  if (isLoading && builders.length === 0) {
    return <LoadingState message="Loading builders…" size="md" withCard={false} />;
  }

  return (
    <div className="space-y-3">
      <SearchBar
        onSearch={handleSearch}
        placeholder="Search by name or address…"
        className="max-w-md"
      />

      <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="No builders found"
            description={q ? `No results for "${q}"` : "No builders available."}
            withCard={false}
            className="h-[200px]"
          />
        ) : (
          <ScrollableTable
            pagination={{
              total: filtered.length,
              page,
              rowsPerPage: PAGE_SIZE,
              rowsPerPageOptions: [25],
              onPageChange: setPage,
              onRowsPerPageChange: () => {},
              hidePageNavigation: false,
            }}
          >
            <Table>
              <TableHeader>
                <TableRow className="border-border-subtle hover:bg-transparent">
                  <TableHead className="py-3 px-4">
                    <TableHeadLabel>Name</TableHeadLabel>
                  </TableHead>
                  <TableHead className="py-3 px-4 hidden md:table-cell">
                    <TableHeadLabel>Address</TableHeadLabel>
                  </TableHead>
                  <TableHead className="py-3 px-4">
                    <TableHeadLabel>Stage</TableHeadLabel>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((b) => {
                  const name = formatBuilderDisplayName(b.name);
                  const initial = name !== "—" ? name.charAt(0).toUpperCase() : "?";
                  return (
                    <TableRow
                      key={b.address}
                      className="border-b border-border-subtle hover:bg-white/[0.02] cursor-pointer transition-colors"
                      onClick={() => router.push(`/market/builders/${encodeURIComponent(b.address)}`)}
                    >
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-[10px] font-bold text-brand-accent shrink-0">
                            {initial}
                          </div>
                          <span className="text-white text-sm font-medium">{name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-xs text-text-secondary font-mono hidden md:table-cell">
                        {b.address}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span className="text-xs text-text-muted px-2 py-0.5 rounded-full bg-white/5 border border-border-subtle">
                          {b.referrerStage ?? "—"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollableTable>
        )}
      </div>

      <p className="text-text-muted text-xs px-1">
        {filtered.length} of {builders.length} builders
      </p>
    </div>
  );
}
