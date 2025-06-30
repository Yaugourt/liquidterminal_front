import { memo } from "react";
import { Card } from "@/components/ui/card";
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
  Column, 
  TableHeaderButtonProps
} from "@/components/types/dashboard.types";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/common/pagination";

export type { Column };

interface DataTableWithPaginationProps<T> extends DataTableProps<T> {
  // Pagination props
  total?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (newPage: number) => void;
  onRowsPerPageChange?: (newRowsPerPage: number) => void;
  showPagination?: boolean;
}

// Optimisation des composants répétés
const TableHeaderButton = memo(({ header, align }: TableHeaderButtonProps & { align?: string }) => (
  <Button
    variant="ghost"
    className={`text-[#FFFFFF99] hover:text-white text-xs font-medium tracking-wide p-0 h-auto flex items-center transition-colors w-full ${align === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}
  >
    {header}
  </Button>
));

export function DataTable<T>({
  data,
  columns,
  isLoading,
  error,
  emptyMessage = "Aucune donnée disponible",
  total = 0,
  page = 0,
  rowsPerPage = 5,
  onPageChange,
  onRowsPerPageChange,
  showPagination = false,
}: DataTableWithPaginationProps<T>) {
  return (
    <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg mx-auto">
      {isLoading ? (
        <div className="flex justify-center items-center h-[200px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF] mb-2" />
            <span className="text-[#FFFFFF80] text-sm">Chargement...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-[200px]">
          <div className="flex flex-col items-center text-center px-4">
            <Database className="w-8 h-8 mb-3 text-[#83E9FF4D]" />
            <p className="text-[#FF5757] text-sm mb-1">Une erreur est survenue</p>
            <p className="text-[#FFFFFF80] text-xs">Veuillez réessayer plus tard</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent flex-1">
            <Table>
              <TableHeader>
                <TableRow className="border-none bg-[#051728]">
                  {columns.map((column, index) => (
                    <TableHead
                      key={index}
                      className={`py-3 px-4 ${column.className || ''}`}
                    >
                      <TableHeaderButton header={column.header} align={column.align} />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="bg-[#051728]">
                {data.length > 0 ? (
                  data.map((item, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A] transition-colors"
                    >
                      {columns.map((column, colIndex) => (
                        <TableCell
                          key={colIndex}
                          className={`py-3 px-4 ${column.className || ''} text-sm text-white`}
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
                      className="py-8"
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <Database className="w-10 h-10 mb-3 text-[#83E9FF4D]" />
                        <p className="text-white text-sm mb-1">{emptyMessage}</p>
                        <p className="text-[#FFFFFF80] text-xs">Revenez plus tard</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {showPagination && total > 0 && onPageChange && onRowsPerPageChange && (
            <div className="border-t border-[#FFFFFF1A] px-4 py-3 bg-[#051728]">
              <Pagination
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 15, 20]}
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
} 