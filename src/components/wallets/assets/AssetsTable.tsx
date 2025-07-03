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
  // Nouvelles props pour les tabs et stats
  onViewTypeChange: (type: 'spot' | 'perp') => void;
  totalAssets: number;
  walletDisplay: string | null;
  onRefresh: () => void;
  isRefreshing: boolean;
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
  formatPercent = (v) => `${v}%`,
  onViewTypeChange,
  totalAssets,
  walletDisplay,
  onRefresh,
  isRefreshing
}: AssetsTableProps) {
  return (
    <div className="bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] rounded-lg overflow-hidden">
      {/* Header avec tabs et stats */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#051728]">
        <div className="flex items-center bg-[#FFFFFF0A] rounded-md p-0.5 w-fit">
          {[
            { key: 'spot', label: 'Spot' },
            { key: 'perp', label: 'Perps' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => onViewTypeChange(tab.key as "spot" | "perp")}
              className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors ${
                type === tab.key
                  ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                  : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-baseline gap-2">
            <span className="text-white text-xs font-medium">Total assets:</span>
            <span className="text-[#83E9FF] text-sm font-semibold">{totalAssets}</span>
          </div>
          {walletDisplay && (
            <>
              <div className="w-px h-4 bg-[#FFFFFF20]"></div>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-xs font-medium">Wallet:</span>
                <span className="text-[#F9E370] text-sm font-semibold">({walletDisplay})</span>
              </div>
            </>
          )}
          <div className="w-px h-4 bg-[#FFFFFF20]"></div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing || isLoading}
            className={`p-2 text-[#FFFFFF99] hover:text-white transition-colors ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#051728]">
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
    </div>
  );
} 