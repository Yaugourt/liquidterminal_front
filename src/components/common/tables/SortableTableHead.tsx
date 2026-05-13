"use client";

import { type ReactNode } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SortDirection } from "./useSortablePagination";

interface SortableTableHeadProps<F extends string> {
  /** Field key for this column (passed to `onSort`). */
  field: F;
  /** Currently sorted field (null when unsorted). */
  currentField: F | null;
  /** Currently active sort direction. */
  direction: SortDirection;
  /** Click handler — receives the field key. */
  onSort: (field: F) => void;
  /** Text alignment for the header label. */
  align?: "left" | "right" | "center";
  /** Header label content. */
  children: ReactNode;
  /** Extra class on the wrapping `<TableHead>`. */
  className?: string;
}

/**
 * Clickable column header for sortable tables. Shows a dim ArrowUpDown when
 * unsorted, and a highlighted ArrowUp/ArrowDown when this column is the
 * active sort. Pairs with `useSortablePagination` for state.
 */
export function SortableTableHead<F extends string>({
  field,
  currentField,
  direction,
  onSort,
  align = "left",
  children,
  className,
}: SortableTableHeadProps<F>) {
  const isActive = currentField === field;
  const Icon =
    !isActive
      ? ArrowUpDown
      : direction === "desc"
      ? ArrowDown
      : ArrowUp;

  return (
    <TableHead className={cn("py-3 px-4", align === "right" && "text-right", className)}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "table-column-head inline-flex items-center gap-0.5 hover:text-text-secondary transition-colors",
          align === "right" && "w-full justify-end",
          isActive && "!text-brand-gold"
        )}
      >
        {children}
        <Icon
          className={cn(
            "h-3 w-3 ml-1",
            !isActive && "opacity-50",
            isActive && "text-brand-gold"
          )}
        />
      </button>
    </TableHead>
  );
}
