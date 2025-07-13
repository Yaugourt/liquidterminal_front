"use client";

import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Définir explicitement les clés de tri possibles
export type SortKey = 'coin' | 'price' | 'type' | 'marginUsedValue' | 'positionValueNum' | 'entryPriceNum' | 'liquidationNum' | 'total' | 'pnlPercentage' | 'totalValue' | 'unrealizedPnl' | 'funding';

interface SortableColumnHeaderProps {
  label: string;
  sortKey: SortKey;
  onSort: (key: SortKey) => void;
  className?: string;
  isActive?: boolean;
  sortDirection?: 'asc' | 'desc';
}

const SortableColumnHeader = ({ 
  label, 
  sortKey, 
  onSort, 
  className = "",
  isActive = false,
  sortDirection
}: SortableColumnHeaderProps) => (
  <Button
    variant="ghost"
    onClick={() => onSort(sortKey)}
    className={`text-white font-normal hover:text-white p-0 flex items-center ${isActive ? 'text-[#83E9FF]' : ''} ${className}`}
  >
    {label}
    <ArrowUpDown className={`ml-2 h-4 w-4 ${isActive ? 'text-[#83E9FF]' : ''}`} />
  </Button>
);

interface TableHeaderComponentProps {
  onSort: (key: SortKey) => void;
  type: 'spot' | 'perp';
  activeSortKey?: SortKey;
  sortDirection?: 'asc' | 'desc';
}

export function TableHeaderComponent({ onSort, type, activeSortKey, sortDirection }: TableHeaderComponentProps) {
  if (type === 'perp') {
    return (
      <TableHeader>
        <TableRow className="border-none bg-[#051728]">
          <TableHead className="text-white font-normal py-1 bg-[#051728] pl-4 w-[140px]">
            <SortableColumnHeader 
              label="Name" 
              sortKey="coin" 
              onSort={onSort}
              isActive={activeSortKey === 'coin'}
              sortDirection={sortDirection}
            />
          </TableHead>
          <TableHead className="text-white font-normal py-1 bg-[#051728] w-[100px]">
            <SortableColumnHeader 
              label="Type" 
              sortKey="type" 
              onSort={onSort}
              isActive={activeSortKey === 'type'}
              sortDirection={sortDirection}
            />
          </TableHead>
          <TableHead className="text-white font-normal py-1 bg-[#051728] w-[120px]">
            <SortableColumnHeader 
              label="Entry Price" 
              sortKey="entryPriceNum" 
              onSort={onSort}
              isActive={activeSortKey === 'entryPriceNum'}
              sortDirection={sortDirection}
            />
          </TableHead>
          <TableHead className="text-white font-normal py-1 bg-[#051728] w-[120px]">
            <SortableColumnHeader 
              label="Liquidation Price" 
              sortKey="liquidationNum" 
              onSort={onSort}
              isActive={activeSortKey === 'liquidationNum'}
              sortDirection={sortDirection}
            />
          </TableHead>
          <TableHead className="text-white font-normal py-1 bg-[#051728] w-[100px]">
            <SortableColumnHeader 
              label="Price" 
              sortKey="price" 
              onSort={onSort}
              isActive={activeSortKey === 'price'}
              sortDirection={sortDirection}
            />
          </TableHead>
          <TableHead className="text-white font-normal py-1 bg-[#051728] w-[140px]">
            <SortableColumnHeader 
              label="Value" 
              sortKey="positionValueNum" 
              onSort={onSort}
              isActive={activeSortKey === 'positionValueNum'}
              sortDirection={sortDirection}
            />
          </TableHead>
          <TableHead className="text-white font-normal py-1 bg-[#051728] w-[140px]">
            <SortableColumnHeader 
              label="Unrealized PNL" 
              sortKey="unrealizedPnl" 
              onSort={onSort}
              isActive={activeSortKey === 'unrealizedPnl'}
              sortDirection={sortDirection}
            />
          </TableHead>
          <TableHead className="text-white font-normal py-1 bg-[#051728] pr-4 w-[120px]">
            <SortableColumnHeader 
              label="Funding" 
              sortKey="funding" 
              onSort={onSort}
              isActive={activeSortKey === 'funding'}
              sortDirection={sortDirection}
            />
          </TableHead>
        </TableRow>
      </TableHeader>
    );
  }

  return (
    <TableHeader>
      <TableRow className="border-none bg-[#051728]">
        <TableHead className="text-white font-normal py-1 bg-[#051728] pl-4">
          <SortableColumnHeader 
            label="Name" 
            sortKey="coin" 
            onSort={onSort}
            isActive={activeSortKey === 'coin'}
            sortDirection={sortDirection}
          />
        </TableHead>
        <TableHead className="text-white font-normal py-1 bg-[#051728]">
          <SortableColumnHeader 
            label="Size" 
            sortKey="total" 
            onSort={onSort}
            isActive={activeSortKey === 'total'}
            sortDirection={sortDirection}
          />
        </TableHead>
        <TableHead className="text-white font-normal py-1 bg-[#051728]">
          <SortableColumnHeader 
            label="Price" 
            sortKey="price" 
            onSort={onSort}
            isActive={activeSortKey === 'price'}
            sortDirection={sortDirection}
          />
        </TableHead>
        <TableHead className="text-white font-normal py-1 bg-[#051728]">
          <SortableColumnHeader 
            label="Change 24h" 
            sortKey="pnlPercentage" 
            onSort={onSort}
            isActive={activeSortKey === 'pnlPercentage'}
            sortDirection={sortDirection}
          />
        </TableHead>
        <TableHead className="text-white font-normal py-1 bg-[#051728] pr-4">
          <SortableColumnHeader 
            label="Value" 
            sortKey="totalValue" 
            onSort={onSort}
            isActive={activeSortKey === 'totalValue'}
            sortDirection={sortDirection}
          />
        </TableHead>
      </TableRow>
    </TableHeader>
  );
} 