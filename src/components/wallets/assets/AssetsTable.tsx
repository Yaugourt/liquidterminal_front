"use client";

import { Table, TableBody } from "@/components/ui/table";
import { TableHeaderComponent, SortKey } from "./TableHeader";
import { TableLoadingState } from "./TableLoadingState";
import { SpotTableRow, PerpTableRow } from "./TableRow";
import { HoldingDisplay, PerpHoldingDisplay, SortableHolding } from "@/components/types/wallet.types";

interface AssetsTableProps {
  type: 'spot' | 'perp';
  holdings: SortableHolding[];
  isLoading: boolean;
  onSort: (key: SortKey) => void;
  activeSortKey: SortKey;
  sortDirection: 'asc' | 'desc';
  formatCurrency: (value: number | string) => string;
  formatTokenAmount?: (value: number | string) => string;
  formatPercent?: (value: number) => string;
}

export function AssetsTable({
  type,
  holdings,
  isLoading,
  onSort,
  activeSortKey,
  sortDirection,
  formatCurrency,
  formatTokenAmount = (v) => v.toString(),
  formatPercent = (v) => `${v}%`
}: AssetsTableProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-[#FFFFFF1A] bg-[#051728]">
      <Table>
        <TableHeaderComponent 
          type={type} 
          onSort={onSort}
          activeSortKey={activeSortKey}
          sortDirection={sortDirection}
        />
        <TableBody>
          {isLoading ? (
            <TableLoadingState 
              type={type}
              colSpan={type === 'perp' ? 8 : 5} 
              isLoading={true} 
            />
          ) : holdings.length === 0 ? (
            <TableLoadingState 
              type={type}
              colSpan={type === 'perp' ? 8 : 5} 
              isLoading={false} 
              isEmpty={true} 
            />
          ) : (
            holdings.map((holding) => (
              type === 'spot' ? (
                <SpotTableRow
                  key={holding.coin}
                  holding={holding as HoldingDisplay}
                  formatCurrency={formatCurrency}
                  formatTokenAmount={formatTokenAmount}
                  formatPercent={formatPercent}
                />
              ) : (
                <PerpTableRow
                  key={holding.coin}
                  holding={holding as PerpHoldingDisplay}
                  formatCurrency={formatCurrency}
                  formatPercent={formatPercent}
                />
              )
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 