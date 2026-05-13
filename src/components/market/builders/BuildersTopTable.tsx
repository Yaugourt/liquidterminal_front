"use client";

import { useMemo } from "react";
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
} from "@/components/common";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import type { BuilderTopRow } from "@/services/indexer/builders/types";
import { formatBuilderDisplayName } from "./formatBuilderDisplayName";

interface BuildersTopTableProps {
  rows: BuilderTopRow[];
  isLoading: boolean;
  error: Error | null;
}

type SortField = "name" | "totalVolume" | "totalBuilderFees" | "uniqueUsers" | "fillCount";

const PAGE_SIZE = 25;
const RANK_COLORS = ["text-brand-gold", "text-zinc-300", "text-amber-600"];

export function BuildersTopTable({ rows, isLoading, error }: BuildersTopTableProps) {
  const router = useRouter();
  const { format } = useNumberFormat();

  const {
    page,
    setPage,
    sortField,
    sortDirection,
    handleColumnSort,
    paginatedData: pageRows,
    sortedData,
    startIndex,
  } = useSortablePagination<BuilderTopRow, SortField>({
    data: rows,
    itemsPerPage: PAGE_SIZE,
    getSortValue: (row, field) => {
      if (field === "name") return formatBuilderDisplayName(row.builderName).toLowerCase();
      return (row[field] as number) ?? 0;
    },
    initialSort: { field: "totalVolume", direction: "desc" },
  });

  const maxVolume = useMemo(
    () => Math.max(...rows.map((r) => r.totalVolume ?? 0), 1),
    [rows]
  );

  if (error) {
    return <ErrorState title="Failed to load top builders" message={error.message} withCard={false} />;
  }

  if (isLoading && rows.length === 0) {
    return <LoadingState message="Loading builders…" size="md" withCard={false} />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No builders"
        description="No builder data for this window."
        withCard={false}
        className="h-[200px]"
      />
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
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
          <TableHeader>
            <TableRow className="border-border-subtle hover:bg-transparent">
              <TableHead className="w-10">
                <TableHeadLabel>#</TableHeadLabel>
              </TableHead>
              <SortableTableHead<SortField>
                field="name"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleColumnSort}
              >
                Builder
              </SortableTableHead>
              <SortableTableHead<SortField>
                field="totalVolume"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleColumnSort}
              >
                Volume
              </SortableTableHead>
              <SortableTableHead<SortField>
                field="totalBuilderFees"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleColumnSort}
                className="hidden sm:table-cell"
              >
                Builder Fees
              </SortableTableHead>
              <SortableTableHead<SortField>
                field="uniqueUsers"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleColumnSort}
                className="hidden md:table-cell"
              >
                Users
              </SortableTableHead>
              <SortableTableHead<SortField>
                field="fillCount"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleColumnSort}
                className="hidden lg:table-cell"
              >
                Fills
              </SortableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row, idx) => {
              const globalRank = startIndex + idx;
              const label = formatBuilderDisplayName(row.builderName);
              const initial = label === "—" ? row.builder.slice(2, 3) : label.charAt(0);
              const volumePct = (row.totalVolume / maxVolume) * 100;

              return (
                <motion.tr
                  key={row.builder}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02, duration: 0.2 }}
                  className="border-b border-border-subtle hover:bg-white/[0.02] cursor-pointer transition-colors group"
                  onClick={() => router.push(`/market/builders/${encodeURIComponent(row.builder)}`)}
                >
                  <TableCell className="w-10">
                    <span className={`text-sm font-bold tabular-nums ${RANK_COLORS[globalRank] ?? "text-text-muted"}`}>
                      {globalRank + 1}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-xs font-bold text-brand-accent shrink-0 group-hover:scale-105 transition-transform">
                        {initial.toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0 gap-0.5">
                        <span className="text-white text-sm font-medium truncate">{label}</span>
                        <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-accent/40 rounded-full" style={{ width: `${volumePct}%` }} />
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white tabular-nums font-medium">
                    {formatNumber(row.totalVolume, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })}
                  </TableCell>
                  <TableCell className="text-brand-gold tabular-nums hidden sm:table-cell">
                    {formatNumber(row.totalBuilderFees, format, { maximumFractionDigits: 2, currency: "$", showCurrency: true })}
                  </TableCell>
                  <TableCell className="text-text-secondary tabular-nums hidden md:table-cell">
                    {formatNumber(row.uniqueUsers, format, { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="text-text-secondary tabular-nums hidden lg:table-cell">
                    {formatNumber(row.fillCount, format, { maximumFractionDigits: 0 })}
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </ScrollableTable>
    </div>
  );
}
