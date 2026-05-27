import type { ReactNode } from "react";
import { TypedDataTable, type Column } from "@/components/common";
import { cn } from "@/lib/utils";

/**
 * Hip4CompareTable — static comparison table used in HIP-4 educational
 * chapters. Renders a `headers × cells` matrix where each cell is an
 * arbitrary `ReactNode` (badges, code snippets, prose).
 *
 * Built on top of the design-system primitive `TypedDataTable` to stay V4
 * compliant — column definitions are synthesised from the `headers` array
 * and each cell is rendered as-is via a custom accessor.
 */
interface CompareRow {
  idx: number;
  cells: ReactNode[];
}

export function Hip4CompareTable({
  headers,
  rows,
  className,
}: {
  headers: string[];
  rows: ReactNode[][];
  className?: string;
}) {
  const data: CompareRow[] = rows.map((cells, idx) => ({ idx, cells }));

  const columns: Column<CompareRow>[] = headers.map((header, columnIdx) => ({
    key: `col-${columnIdx}`,
    header,
    accessor: (row) => row.cells[columnIdx],
    className: "align-top whitespace-normal min-w-[100px]",
  }));

  return (
    <TypedDataTable
      data={data}
      columns={columns}
      density="compact"
      getRowKey={(row) => row.idx}
      className={cn("scrollbar-brand", className)}
      emptyMessage="—"
      emptyDescription=""
    />
  );
}
