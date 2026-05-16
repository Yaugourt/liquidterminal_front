"use client";

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
  chartPalette,
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
const AVATAR_PALETTE = chartPalette.multiSeries;

/** Stable color per builder address (hash mod palette length). */
function avatarColor(address: string): string {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash * 31 + address.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

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
            <TableHead className="w-[50px]">
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
              align="right"
            >
              Volume
            </SortableTableHead>
            <SortableTableHead<SortField>
              field="totalBuilderFees"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleColumnSort}
              align="right"
              className="hidden sm:table-cell"
            >
              Builder Fees
            </SortableTableHead>
            <SortableTableHead<SortField>
              field="uniqueUsers"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleColumnSort}
              align="right"
              className="hidden md:table-cell"
            >
              Users
            </SortableTableHead>
            <SortableTableHead<SortField>
              field="fillCount"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleColumnSort}
              align="right"
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
            const isAnonymous = label === "—";
            const displayName = isAnonymous
              ? `${row.builder.slice(0, 6)}…${row.builder.slice(-4)}`
              : label;
            const initial = isAnonymous ? "?" : label.charAt(0).toUpperCase();
            const color = isAnonymous ? null : avatarColor(row.builder);

            return (
              <motion.tr
                key={row.builder}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02, duration: 0.2 }}
                className="border-b border-border-subtle last:border-b-0 hover:bg-surface-2 cursor-pointer transition-colors group"
                onClick={() => router.push(`/market/builders/${encodeURIComponent(row.builder)}`)}
              >
                <TableCell className="w-[50px]">
                  <span className="mono text-[11px] text-text-tertiary">
                    {globalRank + 1}
                  </span>
                </TableCell>
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
                <TableCell className="mono text-text-primary text-right">
                  {formatNumber(row.totalVolume, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })}
                </TableCell>
                <TableCell className="mono fees-cell text-right hidden sm:table-cell">
                  {formatNumber(row.totalBuilderFees, format, { maximumFractionDigits: 2, currency: "$", showCurrency: true })}
                </TableCell>
                <TableCell className="mono text-text-secondary text-right hidden md:table-cell">
                  {formatNumber(row.uniqueUsers, format, { maximumFractionDigits: 0 })}
                </TableCell>
                <TableCell className="mono text-text-secondary text-right hidden lg:table-cell">
                  {formatNumber(row.fillCount, format, { maximumFractionDigits: 0 })}
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </ScrollableTable>
  );
}
