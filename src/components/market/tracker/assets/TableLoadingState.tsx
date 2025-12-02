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
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={type === 'perp' ? 8 : 5} className="text-center py-8">
        <div className="flex flex-col items-center justify-center">
          {isLoading ? (
            <>
              <Loader2 className="w-8 h-8 mb-3 text-[#83E9FF] animate-spin" />
              <p className="text-zinc-400 text-sm">Loading...</p>
            </>
          ) : isEmpty ? (
            <>
              <Database className="w-10 h-10 mb-3 text-zinc-600" />
              <p className="text-zinc-400 text-sm mb-1">No positions found</p>
              <p className="text-zinc-600 text-xs">Add a position or check back later</p>
            </>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
} 