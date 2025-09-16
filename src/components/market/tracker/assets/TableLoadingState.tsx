"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Loader2, Database } from "lucide-react";

interface TableLoadingStateProps {
  colSpan: number;
  isLoading: boolean;
  isEmpty?: boolean;
  type: 'spot' | 'perp';
}

export function TableLoadingState({ 
  isLoading, 
  isEmpty = false,
  type
}: TableLoadingStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={type === 'perp' ? 7 : 5} className="text-center py-8">
        <div className="flex flex-col items-center justify-center">
          {isLoading ? (
            <>
              <Loader2 className="w-10 h-10 mb-4 text-[#83E9FF4D] animate-spin" />
              <p className="text-white text-lg">Loading...</p>
            </>
          ) : isEmpty ? (
            <>
              <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
              <p className="text-white text-lg">No positions found</p>
              <p className="text-[#FFFFFF80] text-sm mt-2">Add a position or check back later</p>
            </>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
} 