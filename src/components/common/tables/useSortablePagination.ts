"use client";

import { useMemo, useState, useCallback } from "react";

export type SortDirection = "asc" | "desc";

export interface SortableColumn<F extends string> {
  field: F | null;
  direction: SortDirection;
}

interface UseSortablePaginationOptions<T, F extends string> {
  /** The full dataset (already filtered if applicable — sorting + paginating happens here). */
  data: T[];
  /** How many items to render per page. Defaults to 10. */
  itemsPerPage?: number;
  /**
   * Map a sortable field key to a comparable value (number or string).
   * Implement once per consumer to handle field-specific extractions
   * (e.g. parse ISO dates to Date.getTime()).
   */
  getSortValue: (item: T, field: F) => number | string;
  /** Initial sort column. Defaults to `{ field: null, direction: 'desc' }`. */
  initialSort?: SortableColumn<F>;
}

interface UseSortablePaginationResult<T, F extends string> {
  /** Zero-indexed current page. */
  page: number;
  setPage: (page: number) => void;
  /** Current sort field (null when unsorted — original order). */
  sortField: F | null;
  /** Current sort direction. Meaningless when `sortField` is null. */
  sortDirection: SortDirection;
  /** Click a column header — toggles desc → asc → unsorted, or sets to desc on a new field. */
  handleColumnSort: (field: F) => void;
  /** Full sorted array (paginated slice is `paginatedData`). */
  sortedData: T[];
  /** Slice of `sortedData` for the current page. */
  paginatedData: T[];
  /** Total page count. */
  totalPages: number;
  /** Zero-indexed start index of the current page within `sortedData`. */
  startIndex: number;
}

/**
 * Shared pagination + tri-state column sort state machine for table cards.
 *
 * Used internally by `<TypedDataTable>` when at least one column is
 * `sortable: true` or `paginate: true`. Surfaces the same primitives
 * (sort field, direction, page, paginated slice) for outlier tables that
 * need custom row rendering (e.g. `motion.tr`) while keeping a consistent
 * sort/pagination interaction.
 */
export function useSortablePagination<T, F extends string>({
  data,
  itemsPerPage = 10,
  getSortValue,
  initialSort = { field: null, direction: "desc" } as SortableColumn<F>,
}: UseSortablePaginationOptions<T, F>): UseSortablePaginationResult<T, F> {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortableColumn<F>>(initialSort);

  const sortedData = useMemo(() => {
    if (!sort.field) return data;
    const field = sort.field;
    const direction = sort.direction;
    return [...data].sort((a, b) => {
      const aVal = getSortValue(a, field);
      const bVal = getSortValue(b, field);
      if (typeof aVal === "number" && typeof bVal === "number") {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return direction === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sort, getSortValue]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const startIndex = page * itemsPerPage;
  const paginatedData = useMemo(
    () => sortedData.slice(startIndex, startIndex + itemsPerPage),
    [sortedData, startIndex, itemsPerPage]
  );

  const handleColumnSort = useCallback((field: F) => {
    setPage(0);
    setSort((prev) => {
      if (prev.field !== field) return { field, direction: "desc" };
      if (prev.direction === "desc") return { field, direction: "asc" };
      return { field: null, direction: "desc" };
    });
  }, []);

  return {
    page,
    setPage,
    sortField: sort.field,
    sortDirection: sort.direction,
    handleColumnSort,
    sortedData,
    paginatedData,
    totalPages,
    startIndex,
  };
}
