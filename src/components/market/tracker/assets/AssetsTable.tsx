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
    <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
      {/* Header avec tabs et stats */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex bg-brand-dark rounded-lg p-1 border border-white/5">
          {[
            { key: 'spot', label: 'Spot' },
            { key: 'perp', label: 'Perps' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => onViewTypeChange(tab.key as "spot" | "perp")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                type === tab.key
                  ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-baseline gap-2">
            <span className="text-zinc-400 text-xs">Total assets:</span>
            <span className="text-brand-accent text-sm font-bold">{totalAssets}</span>
          </div>
          {walletDisplay && (
            <>
              <div className="w-px h-4 bg-white/10"></div>
              <div className="flex items-baseline gap-2">
                <span className="text-zinc-400 text-xs">Wallet:</span>
                <span className="text-brand-accent text-sm font-medium">({walletDisplay})</span>
              </div>
            </>
          )}
          <div className="w-px h-4 bg-white/10"></div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing || isLoading}
            className={`p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 ${
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
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
                    formatTokenAmount={formatTokenAmount}
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