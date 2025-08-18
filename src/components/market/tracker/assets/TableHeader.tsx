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
}

const SortableColumnHeader = ({ 
  label, 
  sortKey, 
  onSort, 
  className = "",
  isActive = false
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

export function TableHeaderComponent({ onSort, type, activeSortKey }: TableHeaderComponentProps) {
  if (type === 'perp') {
    return (
      <TableHeader>
        <TableRow className="border-none bg-[#051728]">
          <TableHead className="text-white font-normal py-3 bg-[#051728] pl-6">
            <SortableColumnHeader 
              label="Name" 
              sortKey="coin" 
              onSort={onSort}
              isActive={activeSortKey === 'coin'}
            />
          </TableHead>
          <TableHead className="text-white font-normal py-3 bg-[#051728] px-4">
            <SortableColumnHeader 
              label="Type" 
              sortKey="type" 
              onSort={onSort}
              isActive={activeSortKey === 'type'}
            />
          </TableHead>
          <TableHead className="text-white font-normal py-3 bg-[#051728] px-4">
            <SortableColumnHeader 
              label="Entry Price" 
              sortKey="entryPriceNum" 
              onSort={onSort}
              isActive={activeSortKey === 'entryPriceNum'}
            />
          </TableHead>
          <TableHead className="text-white font-normal py-3 bg-[#051728] px-4">
            <SortableColumnHeader 
              label="Liquidation Price" 
              sortKey="liquidationNum" 
              onSort={onSort}
              isActive={activeSortKey === 'liquidationNum'}
            />
          </TableHead>
          <TableHead className="text-white font-normal py-3 bg-[#051728] px-4">
            <SortableColumnHeader 
              label="Price" 
              sortKey="price" 
              onSort={onSort}
              isActive={activeSortKey === 'price'}
            />
          </TableHead>
          <TableHead className="text-white font-normal py-3 bg-[#051728] px-4">
            <SortableColumnHeader 
              label="Value" 
              sortKey="positionValueNum" 
              onSort={onSort}
              isActive={activeSortKey === 'positionValueNum'}
            />
          </TableHead>
          <TableHead className="text-white font-normal py-3 bg-[#051728] px-4">
            <SortableColumnHeader 
              label="Unrealized PNL" 
              sortKey="unrealizedPnl" 
              onSort={onSort}
              isActive={activeSortKey === 'unrealizedPnl'}
            />
          </TableHead>
          <TableHead className="text-white font-normal py-3 bg-[#051728] px-4 pr-6">
            <SortableColumnHeader 
              label="Funding" 
              sortKey="funding" 
              onSort={onSort}
              isActive={activeSortKey === 'funding'}
            />
          </TableHead>
        </TableRow>
      </TableHeader>
    );
  }

  return (
    <TableHeader>
      <TableRow className="border-none bg-[#051728]">
        <TableHead className="text-white font-normal py-3 bg-[#051728] pl-6">
          <SortableColumnHeader 
            label="Name" 
            sortKey="coin" 
            onSort={onSort}
            isActive={activeSortKey === 'coin'}
          />
        </TableHead>
        <TableHead className="text-white font-normal py-3 bg-[#051728] px-4">
          <SortableColumnHeader 
            label="Size" 
            sortKey="total" 
            onSort={onSort}
            isActive={activeSortKey === 'total'}
          />
        </TableHead>
        <TableHead className="text-white font-normal py-3 bg-[#051728] px-4">
          <SortableColumnHeader 
            label="Price" 
            sortKey="price" 
            onSort={onSort}
            isActive={activeSortKey === 'price'}
          />
        </TableHead>
        <TableHead className="text-white font-normal py-3 bg-[#051728] px-4">
          <SortableColumnHeader 
            label="Change 24h" 
            sortKey="pnlPercentage" 
            onSort={onSort}
            isActive={activeSortKey === 'pnlPercentage'}
          />
        </TableHead>
        <TableHead className="text-white font-normal py-3 bg-[#051728] px-4 pr-6">
          <SortableColumnHeader 
            label="Value" 
            sortKey="totalValue" 
            onSort={onSort}
            isActive={activeSortKey === 'totalValue'}
          />
        </TableHead>
      </TableRow>
    </TableHeader>
  );
} 