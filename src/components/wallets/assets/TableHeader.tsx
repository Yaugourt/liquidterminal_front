"use client";

import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableKey } from "@/components/types/wallet.types";

interface SortableColumnHeaderProps {
  label: string;
  sortKey: SortableKey;
  onSort: (key: SortableKey) => void;
  className?: string;
}

// Composant pour l'en-tête de colonne triable
const SortableColumnHeader = ({ 
  label, 
  sortKey, 
  onSort, 
  className = "" 
}: SortableColumnHeaderProps) => (
  <Button
    variant="ghost"
    onClick={() => onSort(sortKey)}
    className={`text-[#FFFFFF99] font-normal hover:text-white p-0 flex items-center ${className}`}
  >
    {label}
    <ArrowUpDown className="ml-2 h-4 w-4" />
  </Button>
);

interface TableHeaderComponentProps {
  onSort: (key: SortableKey) => void;
  type: 'spot' | 'perp';
}

export function TableHeaderComponent({ onSort, type }: TableHeaderComponentProps) {
  if (type === 'perp') {
    return (
      <TableHeader>
        <TableRow className="border-none bg-[#051728]">
          <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728] pl-4">
            <SortableColumnHeader 
              label="Name" 
              sortKey="coin" 
              onSort={onSort} 
            />
          </TableHead>
          <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
            <SortableColumnHeader 
              label="Type" 
              sortKey="type" 
              onSort={onSort}
              className="ml-auto justify-end w-full" 
            />
          </TableHead>
          <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
            <SortableColumnHeader 
              label="Margin used" 
              sortKey="marginUsed" 
              onSort={onSort}
              className="ml-auto justify-end w-full" 
            />
          </TableHead>
          <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
            <SortableColumnHeader 
              label="Position value" 
              sortKey="positionValue" 
              onSort={onSort}
              className="ml-auto justify-end w-full" 
            />
          </TableHead>
          <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
            <SortableColumnHeader 
              label="Entry price" 
              sortKey="entryPrice" 
              onSort={onSort}
              className="ml-auto justify-end w-full" 
            />
          </TableHead>
          <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728] pr-4">
            <SortableColumnHeader 
              label="Liquidation" 
              sortKey="liquidation" 
              onSort={onSort}
              className="ml-auto justify-end w-full" 
            />
          </TableHead>
        </TableRow>
      </TableHeader>
    );
  }

  return (
    <TableHeader>
      <TableRow className="border-none bg-[#051728]">
        <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728] pl-4">
          <SortableColumnHeader 
            label="Name" 
            sortKey="coin" 
            onSort={onSort} 
          />
        </TableHead>
        <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
          <SortableColumnHeader 
            label="Size" 
            sortKey="total" 
            onSort={onSort}
            className="ml-auto justify-end w-full" 
          />
        </TableHead>
        <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
          <SortableColumnHeader 
            label="Price" 
            sortKey="price" 
            onSort={onSort}
            className="ml-auto justify-end w-full" 
          />
        </TableHead>
        <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
          <SortableColumnHeader 
            label="Change 24h" 
            sortKey="pnlPercentage" 
            onSort={onSort}
            className="ml-auto justify-end w-full" 
          />
        </TableHead>
        <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728] pr-4">
          <SortableColumnHeader 
            label="Value" 
            sortKey="pnl" 
            onSort={onSort}
            className="ml-auto justify-end w-full" 
          />
        </TableHead>
      </TableRow>
    </TableHeader>
  );
} 