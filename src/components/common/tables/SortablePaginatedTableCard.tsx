"use client";

import { type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { TableEmptyState } from "@/components/ui/table-states";
import { SortableTableHead } from "./SortableTableHead";
import { TablePaginationFooter } from "./TablePaginationFooter";
import {
  useSortablePagination,
  type SortDirection,
} from "./useSortablePagination";

interface ColumnConfig<T, F extends string> {
  /** Stable key — used by `getSortValue` when sortable, and as React key. */
  key: F | string;
  /** Header label. */
  label: ReactNode;
  /** Cell renderer for this column. Receives the row and its index within the current page. */
  render: (row: T, indexInPage: number, absoluteIndex: number) => ReactNode;
  /** When true, the header is clickable (uses `key` as the sort field). */
  sortable?: boolean;
  /** Text alignment. Defaults to "left". */
  align?: "left" | "right" | "center";
  /** Extra class on both the head and cell of this column. */
  className?: string;
}

interface SortablePaginatedTableCardProps<T, F extends string> {
  /** Card header title (e.g. "Top Traders"). */
  title: string;
  /** Lucide icon shown next to the title (already styled via the wrapping container). */
  icon?: ReactNode;
  /** Optional subtitle below the title (e.g. count of items). */
  subtitle?: ReactNode;
  /** Optional right-aligned slot in the header (Select for window, Refresh button, etc.). */
  headerAction?: ReactNode;
  /** Column configurations. */
  columns: ColumnConfig<T, F>[];
  /** Full dataset. */
  data: T[];
  /** Stable React key per row. */
  getRowKey: (row: T) => string | number;
  /** Map a sort field to a comparable value. Called by the sort engine when the column is sortable. */
  getSortValue: (row: T, field: F) => number | string;
  /** Items per page. Defaults to 10. */
  itemsPerPage?: number;
  /** Loading flag — shows `<LoadingState>`. */
  isLoading?: boolean;
  /** Error object — shows `<ErrorState>` with optional retry. */
  error?: Error | null;
  /** Retry handler for the error state. */
  onErrorRetry?: () => void | Promise<void>;
  /** Title for the error state. Defaults to "Failed to load data". */
  errorTitle?: string;
  /** Title for the empty state. Defaults to "No data available". */
  emptyTitle?: string;
  /** Extra class on the wrapping `<Card>`. */
  className?: string;
  /** Initial sort. Defaults to no sort. */
  initialSort?: { field: F | null; direction: SortDirection };
}

/**
 * Top-level composition for "Top X" / leaderboard cards with sortable columns
 * and simple page navigation. Replaces ~250 lines of duplicate scaffolding
 * across TopTradersPreview, ActiveUsersPreview, and similar.
 *
 * The non-sortable columns render as plain `<TableHead>`; sortable ones use
 * `<SortableTableHead>`. Pagination is rendered by `<TablePaginationFooter>`.
 *
 * For full data tables with rows-per-page selector + items range, use
 * `<TypedDataTable>` or `<DataTable>` instead.
 */
export function SortablePaginatedTableCard<T, F extends string>({
  title,
  icon,
  subtitle,
  headerAction,
  columns,
  data,
  getRowKey,
  getSortValue,
  itemsPerPage = 10,
  isLoading,
  error,
  onErrorRetry,
  errorTitle = "Failed to load data",
  emptyTitle = "No data available",
  className,
  initialSort,
}: SortablePaginatedTableCardProps<T, F>) {
  const {
    page,
    setPage,
    sortField,
    sortDirection,
    handleColumnSort,
    paginatedData,
    totalPages,
    startIndex,
  } = useSortablePagination<T, F>({
    data,
    itemsPerPage,
    getSortValue,
    initialSort: initialSort ?? { field: null, direction: "desc" },
  });

  if (isLoading) {
    return (
      <Card className={className ?? "min-h-[400px]"}>
        <LoadingState size="lg" withCard={false} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className ?? "p-6"}>
        <ErrorState
          title={errorTitle}
          onRetry={onErrorRetry ? () => void onErrorRetry() : undefined}
          withCard={false}
        />
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col ${className ?? ""}`.trim()}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-brand-accent/10 rounded-lg">{icon}</div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {subtitle && (
              <p className="text-text-muted text-sm">{subtitle}</p>
            )}
          </div>
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-brand flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border-subtle hover:bg-transparent">
              {columns.map((col) =>
                col.sortable ? (
                  <SortableTableHead
                    key={col.key}
                    field={col.key as F}
                    currentField={sortField}
                    direction={sortDirection}
                    onSort={handleColumnSort}
                    align={col.align}
                    className={col.className}
                  >
                    {col.label}
                  </SortableTableHead>
                ) : (
                  <TableHead
                    key={col.key}
                    className={`py-3 px-4 ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""} ${col.className ?? ""}`.trim()}
                  >
                    {col.label}
                  </TableHead>
                )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableEmptyState colSpan={columns.length} title={emptyTitle} />
            ) : (
              paginatedData.map((row, indexInPage) => (
                <TableRow
                  key={getRowKey(row)}
                  className="border-b border-border-subtle hover:bg-white/5 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={`py-3 px-4 text-sm text-white ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""} ${col.className ?? ""}`.trim()}
                    >
                      {col.render(row, indexInPage, startIndex + indexInPage)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <TablePaginationFooter
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </Card>
  );
}
