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
    className={`text-[10px] font-semibold uppercase tracking-wider hover:text-zinc-200 p-0 h-auto flex items-center ${isActive ? 'text-brand-accent' : 'text-zinc-400'} ${className}`}
  >
    {label}
    <ArrowUpDown className={`ml-1.5 h-3 w-3 ${isActive ? 'text-brand-accent' : ''}`} />
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
        <TableRow className="border-b border-white/5 hover:bg-transparent">
          <TableHead className="py-3 pl-4">
            <SortableColumnHeader 
              label="Name" 
              sortKey="coin" 
              onSort={onSort}
              isActive={activeSortKey === 'coin'}
            />
          </TableHead>
          <TableHead className="py-3 px-3">
            <SortableColumnHeader 
              label="Type" 
              sortKey="type" 
              onSort={onSort}
              isActive={activeSortKey === 'type'}
            />
          </TableHead>
          <TableHead className="py-3 px-3">
            <SortableColumnHeader 
              label="Entry Price" 
              sortKey="entryPriceNum" 
              onSort={onSort}
              isActive={activeSortKey === 'entryPriceNum'}
            />
          </TableHead>
          <TableHead className="py-3 px-3">
            <SortableColumnHeader 
              label="Liquidation Price" 
              sortKey="liquidationNum" 
              onSort={onSort}
              isActive={activeSortKey === 'liquidationNum'}
            />
          </TableHead>
          <TableHead className="py-3 px-3">
            <SortableColumnHeader 
              label="Price" 
              sortKey="price" 
              onSort={onSort}
              isActive={activeSortKey === 'price'}
            />
          </TableHead>
          <TableHead className="py-3 px-3">
            <SortableColumnHeader 
              label="Value" 
              sortKey="positionValueNum" 
              onSort={onSort}
              isActive={activeSortKey === 'positionValueNum'}
            />
          </TableHead>
          <TableHead className="py-3 px-3">
            <SortableColumnHeader 
              label="Unrealized PNL" 
              sortKey="unrealizedPnl" 
              onSort={onSort}
              isActive={activeSortKey === 'unrealizedPnl'}
            />
          </TableHead>
          <TableHead className="py-3 px-3 pr-4">
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
      <TableRow className="border-b border-white/5 hover:bg-transparent">
        <TableHead className="py-3 pl-4">
          <SortableColumnHeader 
            label="Name" 
            sortKey="coin" 
            onSort={onSort}
            isActive={activeSortKey === 'coin'}
          />
        </TableHead>
        <TableHead className="py-3 px-3">
          <SortableColumnHeader 
            label="Size" 
            sortKey="total" 
            onSort={onSort}
            isActive={activeSortKey === 'total'}
          />
        </TableHead>
        <TableHead className="py-3 px-3">
          <SortableColumnHeader 
            label="Price" 
            sortKey="price" 
            onSort={onSort}
            isActive={activeSortKey === 'price'}
          />
        </TableHead>
        <TableHead className="py-3 px-3">
          <SortableColumnHeader 
            label="Change 24h" 
            sortKey="pnlPercentage" 
            onSort={onSort}
            isActive={activeSortKey === 'pnlPercentage'}
          />
        </TableHead>
        <TableHead className="py-3 px-3 pr-4">
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
