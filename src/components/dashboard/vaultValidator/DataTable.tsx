import { memo } from "react";
import { Loader2, Database } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DataTableProps, 
  TableHeaderButtonProps
} from "@/components/types/dashboard.types";
import { Pagination } from "@/components/common/pagination";

export type { Column } from "@/components/types/dashboard.types";

interface DataTableWithPaginationProps<T> extends DataTableProps<T> {
  // Pagination props
  total?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (newPage: number) => void;
  onRowsPerPageChange?: (newRowsPerPage: number) => void;
  showPagination?: boolean;
  paginationDisabled?: boolean;
  hidePageNavigation?: boolean;
  // Text size prop
  textSize?: 'xs' | 'sm';
}

// Optimisation des composants répétés
const TableHeaderButtonComponent = ({ header, align }: TableHeaderButtonProps & { align?: string }) => (
  <span className={`text-[#83e9ff] text-[10px] font-semibold uppercase tracking-wider block w-full ${align === 'right' ? 'text-right' : 'text-left'}`}>
    {header}
  </span>
);

const TableHeaderButton = memo(TableHeaderButtonComponent);
TableHeaderButton.displayName = 'TableHeaderButton';

export function DataTable<T>({
  data,
  columns,
  isLoading,
  error,
          emptyMessage = "No data available",
  total = 0,
  page = 0,
  rowsPerPage = 5,
  onPageChange,
  onRowsPerPageChange,
  showPagination = false,
  paginationDisabled = false,
  hidePageNavigation = false,
  textSize = 'sm',
}: DataTableWithPaginationProps<T>) {
  return (
    <div className="w-full h-full flex flex-col">
      {isLoading ? (
        <div className="flex justify-center items-center h-[200px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF] mb-2" />
            <span className="text-zinc-500 text-sm">Chargement...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-[200px]">
          <div className="flex flex-col items-center text-center px-4">
            <Database className="w-8 h-8 mb-3 text-red-400" />
            <p className="text-red-400 text-sm mb-1">Une erreur est survenue</p>
            <p className="text-zinc-500 text-xs">Veuillez réessayer plus tard</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-1">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#1692ad]/20 hover:bg-transparent">
                  {columns.map((column, index) => (
                    <TableHead
                      key={index}
                      className={`${textSize === 'xs' ? 'py-2' : 'py-3'} px-4 ${column.className || ''}`}
                    >
                      <TableHeaderButton header={column.header} align={column.align} />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? (
                  data.map((item, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      className="border-b border-[#1692ad]/20 hover:bg-[#1692ad]/10 transition-colors"
                    >
                      {columns.map((column, colIndex) => (
                        <TableCell
                          key={colIndex}
                          className={`${textSize === 'xs' ? 'py-2' : 'py-3'} px-4 ${column.className || ''} text-${textSize} text-white font-medium`}
                        >
                          {typeof column.accessor === "function"
                            ? column.accessor(item)
                            : String(item[column.accessor])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="py-8 border-none"
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <Database className="w-10 h-10 mb-3 text-[#1692ad]/50" />
                        <p className="text-[#83e9ff] text-sm mb-1">{emptyMessage}</p>
                        <p className="text-zinc-600 text-xs">Come later</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {showPagination && total > 0 && onPageChange && onRowsPerPageChange && (
            <div className="border-t border-[#1692ad]/20 px-4 py-3">
              <Pagination
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 15, 20]}
                disabled={paginationDisabled}
                hidePageNavigation={hidePageNavigation}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
