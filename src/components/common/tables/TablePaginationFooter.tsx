"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <div
      className={cn(
        "px-6 py-3 border-t border-border-subtle flex items-center justify-between",
        className
      )}
    >
      <span className="text-text-tertiary text-xs">
        Page {displayPage} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="h-8 w-8 p-0 text-text-tertiary hover:text-text-primary disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, maxNumberButtons) }, (_, i) => {
            let n: number;
            if (totalPages <= maxNumberButtons) {
              n = i + 1;
            } else if (displayPage <= 3) {
              n = i + 1;
            } else if (displayPage >= totalPages - 2) {
              n = totalPages - (maxNumberButtons - 1) + i;
            } else {
              n = displayPage - 2 + i;
            }
            return (
              <Button
                key={n}
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(n - 1)}
                className={cn(
                  "h-8 w-8 p-0 text-sm",
                  n === displayPage
                    ? "bg-brand/20 text-brand"
                    : "text-text-tertiary hover:text-text-primary"
                )}
              >
                {n}
              </Button>
            );
          })}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page === totalPages - 1}
          className="h-8 w-8 p-0 text-text-tertiary hover:text-text-primary disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
