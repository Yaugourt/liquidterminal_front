import * as React from "react";
import { ArrowUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  <th ref={ref} className={cn("text-left text-table-header py-3 px-3", className)} {...props} />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("text-table-cell py-3 px-3", className)} {...props} />
));
TableCell.displayName = "TableCell";

// Composant centralisé pour les colonnes triables
interface SortableTableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  highlight?: 'accent' | 'gold';
}

const SortableTableHead = React.forwardRef<HTMLTableCellElement, SortableTableHeadProps>(
  ({ className, label, isActive, onClick, highlight = 'accent', ...props }, ref) => (
    <TableHead ref={ref} className={className} {...props}>
      <Button
        variant="tableHeaderSortable"
        onClick={onClick}
        disabled={!onClick}
        className={isActive ? `table-header-active-${highlight}` : undefined}
      >
        {label}
        {onClick && <ArrowUpDown className="h-3 w-3" />}
      </Button>
    </TableHead>
  )
);
SortableTableHead.displayName = "SortableTableHead";

// Composant centralisé pour les labels de colonnes non-triables
interface TableHeadLabelProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const TableHeadLabel = ({ children, align = 'left', className }: TableHeadLabelProps) => (
  <span className={cn(
    "text-text-secondary font-semibold uppercase tracking-wider block w-full text-[11px]",
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
    className
  )}>
    {children}
  </span>
);
TableHeadLabel.displayName = "TableHeadLabel";

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, SortableTableHead, TableHeadLabel };
