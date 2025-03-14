import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface TableHeaderProps {
  volume: string;
  users: string;
}

export function TransactionsTable({ volume, users }: TableHeaderProps) {
  return (
    <div className="w-full md:w-[48%] lg:w-[49%]">
      <div className="flex justify-center gap-4 sm:gap-10 mb-2 w-full">
        <div className="text-white">
          <span className="text-[#FFFFFFCC] text-xs sm:text-sm font-normal">Volume:</span>
          <span className="ml-2 text-[#83E9FF] text-base sm:text-[20px] font-medium text-right">
            {volume}
          </span>
        </div>
        <div className="text-white">
          <span className="text-[#FFFFFFCC] text-xs sm:text-sm font-normal">User:</span>
          <span className="ml-2 text-[#83E9FF] text-base sm:text-[20px] font-medium text-right">
            {users}
          </span>
        </div>
      </div>
      <Card className="w-full p-0 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728] scrollbar-thumb-rounded-full">
          <Table className="border-separate border-spacing-0 rounded-lg min-w-[400px]">
            <TableHeader>
              <TableRow className="hover:bg-[#0B2437]">
                <TableHead className="border-b-[1px] border-[#83E9FF4D] text-left p-2 sm:p-3 text-xs sm:text-sm font-normal text-[#FFFFFF99]">
                  Name
                </TableHead>
                <TableHead className="border-b-[1px] border-[#83E9FF4D] text-right p-2 sm:p-3 text-xs sm:text-sm font-normal text-[#FFFFFF99]">
                  Price
                </TableHead>
                <TableHead className="border-b-[1px] border-[#83E9FF4D] text-right p-2 sm:p-3 text-xs sm:text-sm font-normal text-[#FFFFFF99]">
                  Variation
                </TableHead>
                <TableHead className="border-b-[1px] border-[#83E9FF4D] text-right p-2 sm:p-3 text-xs sm:text-sm font-normal text-[#FFFFFF99]">
                  Volume
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-white">
              <TableRow className="border-t border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
                <TableCell className="p-2 sm:p-3 text-xs sm:text-sm">HYPE</TableCell>
                <TableCell className="text-right p-2 sm:p-3 text-xs sm:text-sm">$24,65</TableCell>
                <TableCell className="text-right p-2 sm:p-3 text-xs sm:text-sm text-[#26A69A]">
                  +18,15%
                </TableCell>
                <TableCell className="text-right p-2 sm:p-3 text-xs sm:text-sm">$224,45M</TableCell>
              </TableRow>
              <TableRow className="border-t border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
                <TableCell className="p-2 sm:p-3 text-xs sm:text-sm">0xc5264...15bf</TableCell>
                <TableCell className="text-right p-2 sm:p-3 text-xs sm:text-sm">
                  Cancel order
                </TableCell>
                <TableCell className="text-right p-2 sm:p-3 text-xs sm:text-sm text-[#83E9FF]">
                  45691547
                </TableCell>
                <TableCell className="text-right p-2 sm:p-3 text-xs sm:text-sm text-[#FFFFFF99]">
                  0 sec ago
                </TableCell>
              </TableRow>
              <TableRow className="border-t border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
                <TableCell className="p-2 sm:p-3 text-xs sm:text-sm">0xc5264...15bf</TableCell>
                <TableCell className="text-right p-2 sm:p-3 text-xs sm:text-sm">
                  Cancel order
                </TableCell>
                <TableCell className="text-right p-2 sm:p-3 text-xs sm:text-sm text-[#83E9FF]">
                  45691547
                </TableCell>
                <TableCell className="text-right p-2 sm:p-3 text-xs sm:text-sm text-[#FFFFFF99]">
                  0 sec ago
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}