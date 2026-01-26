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
    variant="tableHeaderSortable"
    onClick={() => onSort(sortKey)}
    className={isActive ? 'table-header-active-accent' : className}
  >
    {label}
    <ArrowUpDown className="h-3 w-3" />
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
        <TableRow className="border-b border-border-subtle hover:bg-transparent">
          <TableHead className="pl-4">
            <SortableColumnHeader 
              label="Name" 
              sortKey="coin" 
              onSort={onSort}
              isActive={activeSortKey === 'coin'}
            />
          </TableHead>
          <TableHead>
            <SortableColumnHeader 
              label="Type" 
              sortKey="type" 
              onSort={onSort}
              isActive={activeSortKey === 'type'}
            />
          </TableHead>
          <TableHead>
            <SortableColumnHeader 
              label="Entry Price" 
              sortKey="entryPriceNum" 
              onSort={onSort}
              isActive={activeSortKey === 'entryPriceNum'}
            />
          </TableHead>
          <TableHead>
            <SortableColumnHeader 
              label="Liquidation Price" 
              sortKey="liquidationNum" 
              onSort={onSort}
              isActive={activeSortKey === 'liquidationNum'}
            />
          </TableHead>
          <TableHead>
            <SortableColumnHeader 
              label="Price" 
              sortKey="price" 
              onSort={onSort}
              isActive={activeSortKey === 'price'}
            />
          </TableHead>
          <TableHead>
            <SortableColumnHeader 
              label="Value" 
              sortKey="positionValueNum" 
              onSort={onSort}
              isActive={activeSortKey === 'positionValueNum'}
            />
          </TableHead>
          <TableHead>
            <SortableColumnHeader 
              label="Unrealized PNL" 
              sortKey="unrealizedPnl" 
              onSort={onSort}
              isActive={activeSortKey === 'unrealizedPnl'}
            />
          </TableHead>
          <TableHead className="pr-4">
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
      <TableRow className="border-b border-border-subtle hover:bg-transparent">
        <TableHead className="pl-4">
          <SortableColumnHeader 
            label="Name" 
            sortKey="coin" 
            onSort={onSort}
            isActive={activeSortKey === 'coin'}
          />
        </TableHead>
        <TableHead>
          <SortableColumnHeader 
            label="Size" 
            sortKey="total" 
            onSort={onSort}
            isActive={activeSortKey === 'total'}
          />
        </TableHead>
        <TableHead>
          <SortableColumnHeader 
            label="Price" 
            sortKey="price" 
            onSort={onSort}
            isActive={activeSortKey === 'price'}
          />
        </TableHead>
        <TableHead>
          <SortableColumnHeader 
            label="Change 24h" 
            sortKey="pnlPercentage" 
            onSort={onSort}
            isActive={activeSortKey === 'pnlPercentage'}
          />
        </TableHead>
        <TableHead className="pr-4">
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
