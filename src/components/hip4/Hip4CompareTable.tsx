import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function Hip4CompareTable({
  headers,
  rows,
  className,
}: {
  headers: string[];
  rows: ReactNode[][];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-subtle bg-brand-secondary/30 overflow-x-auto scrollbar-brand",
        className
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border-subtle hover:bg-transparent">
            {headers.map((h) => (
              <TableHead
                key={h}
                className="text-table-header whitespace-nowrap min-w-[100px]"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((cells, ri) => (
            <TableRow key={ri} className="border-border-subtle">
              {cells.map((cell, ci) => (
                <TableCell key={ci} className="align-top text-table-cell">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
