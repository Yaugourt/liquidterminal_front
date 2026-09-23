"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TablePaginationFooterProps {
  /** Zero-indexed current page. */
  page: number;
  /** Total page count. */
  totalPages: number;
  /** Page change handler — receives the new zero-indexed page. */
  onPageChange: (page: number) => void;
  /** Max number of numbered page buttons to render. Defaults to 5. */
  maxNumberButtons?: number;
  /** Extra class on the wrapping container. */
  className?: string;
}

/**
 * Compact pagination footer for "Top X" / leaderboard tables.
 *
 * Renders: `Page N of M` · `[<]` · numbered page buttons (windowed) · `[>]`.
 * Returns `null` if `totalPages <= 1` (no nav needed).
 *
 * For data tables with a "rows per page" selector and items range,
 * use `<Pagination>` from `@/components/common` instead.
 */
export function TablePaginationFooter({
  page,
  totalPages,
  onPageChange,
  maxNumberButtons = 5,
  className,
}: TablePaginationFooterProps) {
  if (totalPages <= 1) return null;

  // Page index ranges from 0 to totalPages-1. UI displays 1-based.
  const displayPage = page + 1;

  const navBtn =
    "h-6 w-6 inline-flex items-center justify-center rounded border border-border-subtle " +
    "bg-surface-2 text-text-secondary hover:bg-surface-3 hover:text-text-primary " +
    "transition-colors disabled:opacity-30 disabled:pointer-events-none";

  // Windowed page numbers (1-based for display).
  const count = Math.min(totalPages, maxNumberButtons);
  const first =
    totalPages <= maxNumberButtons || displayPage <= 3
      ? 1
      : displayPage >= totalPages - 2
      ? totalPages - (maxNumberButtons - 1)
      : displayPage - 2;

  return (
    <div
      className={cn(
        "px-4 py-2.5 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-tertiary",
        className
      )}
    >
      <span>
        Page <span className="mono text-text-secondary">{displayPage}</span> of{" "}
        <span className="mono text-text-secondary">{totalPages}</span>
      </span>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          className={navBtn}
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
        {Array.from({ length: count }, (_, i) => first + i).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPageChange(n - 1)}
            aria-current={n === displayPage ? "page" : undefined}
            className={cn(
              "mono h-6 min-w-6 px-1 inline-flex items-center justify-center rounded border text-[11px] transition-colors",
              n === displayPage
                ? "border-brand bg-brand text-brand-text-on"
                : "border-border-subtle bg-surface-2 text-text-secondary hover:bg-surface-3 hover:text-text-primary"
            )}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          className={navBtn}
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page === totalPages - 1}
          aria-label="Next page"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
