import * as React from "react";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table ref={ref} className={cn("w-full", className)} {...props} />
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn(className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn(className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn("border-b border-border-subtle transition-colors", className)} {...props} />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn("text-left table-column-head py-2.5 px-3 align-middle", className)}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("text-table-cell py-3 px-3", className)} {...props} />
));
TableCell.displayName = "TableCell";

// Shared sortable column header
interface SortableTableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  label: string;
  isActive?: boolean;
  /** When set with isActive, shows up/down chevron instead of neutral ArrowUpDown */
  sortDirection?: "asc" | "desc";
  onClick?: () => void;
  /** Active sort column color; default gold site-wide */
  highlight?: "gold" | "accent";
}

const SortableTableHead = React.forwardRef<HTMLTableCellElement, SortableTableHeadProps>(
  ({ className, label, isActive, sortDirection, onClick, highlight = "gold", ...props }, ref) => (
    <TableHead ref={ref} className={className} {...props}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick?.();
        }}
        disabled={!onClick}
        className={cn(
          "table-column-head w-full min-h-8 px-0 py-0.5 flex items-center justify-start gap-1 transition-colors hover:text-text-secondary cursor-pointer disabled:cursor-default disabled:opacity-80 disabled:hover:text-text-muted",
          isActive
            ? highlight === "accent"
              ? "!text-brand-accent"
              : "!text-brand-gold"
            : ""
        )}
        aria-sort={
          isActive && sortDirection
            ? sortDirection === "asc"
              ? "ascending"
              : "descending"
            : undefined
        }
      >
        {label}
        {onClick &&
          (isActive && sortDirection ? (
            sortDirection === "asc" ? (
              <ChevronUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
          ))}
      </button>
    </TableHead>
  )
);
SortableTableHead.displayName = "SortableTableHead";

// Shared non-sortable column label
interface TableHeadLabelProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const TableHeadLabel = ({ children, align = 'left', className }: TableHeadLabelProps) => (
  <span
    className={cn(
      "table-column-head block w-full",
      align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
      className
    )}
  >
    {children}
  </span>
);
TableHeadLabel.displayName = "TableHeadLabel";

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, SortableTableHead, TableHeadLabel };
