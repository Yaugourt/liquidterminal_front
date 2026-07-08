import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface PaginationProps {
  total: number;
  page: number;
  rowsPerPage: number;
  rowsPerPageOptions?: number[];
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  className?: string;
  disabled?: boolean;
  hidePageNavigation?: boolean;
}

/** Window of page numbers around the current page (V4 ref shows `1 2 3`). */
function pageWindow(current: number, count: number): number[] {
  if (count <= 5) return Array.from({ length: count }, (_, i) => i);
  let start = Math.max(0, current - 2);
  const end = Math.min(count - 1, start + 4);
  start = Math.max(0, end - 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/** V4 pagination — numbered page buttons (24×24 squares), mono range, items-per-page. */
export function Pagination({
  total,
  page,
  rowsPerPage,
  rowsPerPageOptions = [10, 25, 50, 100],
  onPageChange,
  onRowsPerPageChange,
  className = "",
  disabled = false,
  hidePageNavigation = false,
}: PaginationProps) {
  const from = total === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min((page + 1) * rowsPerPage, total);
  const pageCount = Math.ceil(total / rowsPerPage);

  const navBtn =
    "h-6 w-6 inline-flex items-center justify-center rounded border border-border-subtle " +
    "bg-surface-2 text-text-secondary hover:bg-surface-3 hover:text-text-primary " +
    "transition-colors disabled:opacity-30 disabled:pointer-events-none";

  return (
    <div className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[11px] text-text-tertiary ${className}`}>
      {/* Items per page */}
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline">Items per page:</span>
        {rowsPerPageOptions.length <= 1 ? (
          <span className="mono text-text-secondary">{rowsPerPage}</span>
        ) : (
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(v) => onRowsPerPageChange(Number(v))}
            disabled={disabled}
          >
            <SelectTrigger className="h-6 w-[60px] text-[11px] bg-surface-2 border-border-subtle">
              <SelectValue placeholder={rowsPerPage} />
            </SelectTrigger>
            <SelectContent>
              {rowsPerPageOptions.map((opt) => (
                <SelectItem key={opt} value={opt.toString()}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Range */}
      <div className="mono text-text-secondary">
        {from}–{to} <span className="text-text-tertiary">of</span> {total}
      </div>

      {/* Page navigation */}
      {!hidePageNavigation && (
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className={navBtn}
            onClick={() => onPageChange(0)}
            disabled={page === 0 || disabled}
            aria-label="First page"
          >
            <ChevronsLeft className="h-3 w-3" />
          </button>
          <button
            type="button"
            className={navBtn}
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0 || disabled}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>

          {pageWindow(page, pageCount).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              disabled={disabled}
              aria-current={p === page ? "page" : undefined}
              className={
                p === page
                  ? "mono h-6 min-w-6 px-1 inline-flex items-center justify-center rounded border border-brand bg-brand text-brand-text-on text-[11px]"
                  : "mono h-6 min-w-6 px-1 inline-flex items-center justify-center rounded border border-border-subtle bg-surface-2 text-text-secondary hover:bg-surface-3 hover:text-text-primary transition-colors text-[11px]"
              }
            >
              {p + 1}
            </button>
          ))}

          <button
            type="button"
            className={navBtn}
            onClick={() => onPageChange(Math.min(pageCount - 1, page + 1))}
            disabled={page >= pageCount - 1 || disabled}
            aria-label="Next page"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
          <button
            type="button"
            className={navBtn}
            onClick={() => onPageChange(pageCount - 1)}
            disabled={page >= pageCount - 1 || disabled}
            aria-label="Last page"
          >
            <ChevronsRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
