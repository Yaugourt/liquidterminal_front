import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Database, ArrowUpDown } from "lucide-react";
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
  TableHeaderButtonProps, 
  TableRowCellProps 
} from "@/components/types/dashboard.types";
import { Button } from "@/components/ui/button";

export type { Column };

// Optimisation des composants répétés
const TableHeaderButton = memo(({ header, align }: TableHeaderButtonProps & { align?: string }) => (
  <Button
    variant="ghost"
    className={`text-[#FFFFFF99] hover:text-white text-xs font-medium tracking-wide p-0 h-auto flex items-center transition-colors w-full ${align === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}
  >
    {header}
  </Button>
));

const TableRowCell = memo(({ column, item }: TableRowCellProps) => (
  <TableCell
    className={`py-3 ${column.className || ''}`}
  >
    {typeof column.accessor === "function"
      ? column.accessor(item)
      : String(item[column.accessor])}
  </TableCell>
));

export function DataTable<T>({
  data,
  columns,
  isLoading,
  error,
  emptyMessage = "Aucune donnée disponible",
}: DataTableProps<T>) {
  return (
    <Card className="w-full h-[300px] bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-xl mx-auto">
      <div className="relative h-full">
        {/* Header Background Gradient */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#051728] to-transparent pointer-events-none" />
        
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF] mb-2" />
              <span className="text-[#FFFFFF80] text-sm">Chargement...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center text-center px-4">
              <Database className="w-8 h-8 mb-3 text-[#83E9FF4D]" />
              <p className="text-[#FF5757] text-sm mb-1">Une erreur est survenue</p>
              <p className="text-[#FFFFFF80] text-xs">Veuillez réessayer plus tard</p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto flex flex-col h-full">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="border-b border-[#83E9FF33] bg-[#051728]/95 backdrop-blur-sm">
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
              <TableBody className="flex-grow">
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
                      className="h-[240px]"
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
        )}
        
        {/* Footer Background Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#051728] to-transparent pointer-events-none" />
      </div>
    </Card>
  );
} 