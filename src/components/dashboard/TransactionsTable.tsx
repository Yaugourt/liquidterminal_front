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
    <div>
      <div className="flex justify-center gap-8 mb-2">
        <div className="text-white">
          <span className="text-[#FFFFFF99] text-base lg:text-lg font-medium">
            Volume:
          </span>
          <span className="ml-2 text-[#83E9FF] text-base lg:text-lg font-bold">
            {volume}
          </span>
        </div>
        <div className="text-white">
          <span className="text-[#FFFFFF99] text-base lg:text-lg font-medium">
            User:
          </span>
          <span className="ml-2 text-[#83E9FF] text-base lg:text-lg font-bold">
            {users}
          </span>
        </div>
      </div>
      <Card className="p-0 bg-[#051728E5] border border-[#83E9FF26] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden">
        <Table className="border-separate border-spacing-0">
          <TableHeader>
            <TableRow className="bg-[#0B2437] hover:bg-[#0B2437]">
              <TableHead className="text-left p-4 text-sm font-normal text-[#FFFFFF99]">
                Name
              </TableHead>
              <TableHead className="text-right p-4 text-sm font-normal text-[#FFFFFF99]">
                Price
              </TableHead>
              <TableHead className="text-right p-4 text-sm font-normal text-[#FFFFFF99]">
                Variation
              </TableHead>
              <TableHead className="text-right p-4 text-sm font-normal text-[#FFFFFF99]">
                Volume
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-white">
            <TableRow className="border-t border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
              <TableCell className="p-4 text-sm">0xc5264...15bf</TableCell>
              <TableCell className="text-right p-4 text-sm">
                Cancel order
              </TableCell>
              <TableCell className="text-right p-4 text-sm text-[#83E9FF]">
                45691547
              </TableCell>
              <TableCell className="text-right p-4 text-sm text-[#FFFFFF99]">
                0 sec ago
              </TableCell>
            </TableRow>
            <TableRow className="border-t border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
              <TableCell className="p-4 text-sm">0xc5264...15bf</TableCell>
              <TableCell className="text-right p-4 text-sm">
                Cancel order
              </TableCell>
              <TableCell className="text-right p-4 text-sm text-[#83E9FF]">
                45691547
              </TableCell>
              <TableCell className="text-right p-4 text-sm text-[#FFFFFF99]">
                0 sec ago
              </TableCell>
            </TableRow>
            <TableRow className="border-t border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
              <TableCell className="p-4 text-sm">0xc5264...15bf</TableCell>
              <TableCell className="text-right p-4 text-sm">
                Cancel order
              </TableCell>
              <TableCell className="text-right p-4 text-sm text-[#83E9FF]">
                45691547
              </TableCell>
              <TableCell className="text-right p-4 text-sm text-[#FFFFFF99]">
                0 sec ago
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
