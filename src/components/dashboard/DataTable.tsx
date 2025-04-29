import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableProps, Column } from "@/components/types/dashboard.types";

export type { Column };

export function DataTable<T>({
  data,
  columns,
  isLoading,
  error,
  emptyMessage = "Aucune donnée disponible",
}: DataTableProps<T>) {
  return (
    <Card className="h-[250px] sm:h-[300px] lg:h-[350px] bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-red-500">Une erreur est survenue lors du chargement des données</p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728] scrollbar-thumb-rounded-full">
          <Table className="border-separate border-spacing-0 min-w-[300px]">
            <TableHeader>
              <TableRow className="bg-[#051728E5] hover:bg-[#0B2437]">
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={`border-b-[1px] border-[#83E9FF4D] p-2 sm:p-3 text-xs sm:text-sm font-normal text-[#FFFFFF99] text-${column.align || "left"}`}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="text-white">
              {data.length > 0 ? (
                data.map((item, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className="bg-[#051728E5] border-t border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]"
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className={`p-2 sm:p-3 text-xs sm:text-sm text-${column.align || "left"}`}
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
                    className="p-6 text-center"
                  >
                    <p className="text-[#FFFFFF99] text-sm">{emptyMessage}</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
} 