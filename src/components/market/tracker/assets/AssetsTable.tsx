"use client";

import { TypedDataTable, type Column, TokenIcon, chartPalette } from "@/components/common";
import { HoldingDisplay, PerpHoldingDisplay, SortableHolding } from "@/components/types/wallet.types";
import { SortKey } from "./TableHeader";

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
  onViewTypeChange: (type: 'spot' | 'perp') => void;
  totalAssets: number;
  walletDisplay: string | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

// ── Spot columns ───────────────────────────────────────────────────────

function buildSpotColumns(
  formatCurrency: (v: number | string) => string,
  formatTokenAmount: (v: number | string) => string,
  formatPercent: (v: number) => string,
): Column<HoldingDisplay>[] {
  return [
    {
      key: "coin",
      header: "Name",
      sortable: true,
      getSortValue: (row) => row.coin,
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <TokenIcon src={row.logo} name={row.coin} size="md" variant="dark" />
          <span className="text-text-primary text-sm font-medium">{row.coin}</span>
        </div>
      ),
    },
    {
      key: "total",
      header: "Size",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => parseFloat(row.total) || 0,
      accessor: (row) => formatTokenAmount(row.total),
    },
    {
      key: "price",
      header: "Price",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.price,
      accessor: (row) => formatCurrency(row.price),
    },
    {
      key: "pnlPercentage",
      header: "Change 24h",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.pnlPercentage,
      accessor: (row) => (
        <span style={{ color: row.pnlPercentage < 0 ? chartPalette.roseSoft : chartPalette.emeraldLight }}>
          {formatPercent(row.pnlPercentage)}
        </span>
      ),
    },
    {
      key: "totalValue",
      header: "Value",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.totalValue,
      accessor: (row) => formatCurrency(row.totalValue),
    },
  ];
}

// ── Perp columns ───────────────────────────────────────────────────────

function buildPerpColumns(
  formatCurrency: (v: number | string) => string,
  formatTokenAmount: (v: number | string) => string,
): Column<PerpHoldingDisplay>[] {
  const formatTokenSize = (szi: string, coin: string, fmtAmount: (v: number | string) => string) => {
    const amount = parseFloat(szi);
    const absAmount = Math.abs(amount);
    return `${amount < 0 ? '-' : ''}${fmtAmount(absAmount.toString())} ${coin}`;
  };

  return [
    {
      key: "coin",
      header: "Name",
      sortable: true,
      getSortValue: (row) => row.coin,
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <TokenIcon src={row.logo} name={row.coin} size="md" variant="dark" />
          <span className="text-text-primary text-sm font-medium">{row.coin}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      getSortValue: (row) => row.type,
      accessor: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className={row.type === 'Short' ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
            {row.type}
          </span>
          <span className="text-label text-text-tertiary">
            {row.leverage.value}x ({row.leverage.type})
          </span>
        </div>
      ),
    },
    {
      key: "entryPriceNum",
      header: "Entry Price",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.entryPriceNum,
      accessor: (row) => formatCurrency(row.entryPrice),
    },
    {
      key: "liquidationNum",
      header: "Liquidation Price",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.liquidationNum,
      accessor: (row) => formatCurrency(row.liquidation),
    },
    {
      key: "price",
      header: "Price",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.price,
      accessor: (row) => formatCurrency(row.price),
    },
    {
      key: "positionValueNum",
      header: "Value",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.positionValueNum,
      accessor: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-text-primary text-sm font-medium">
            {formatCurrency(row.positionValue)}
          </span>
          <span className="text-label text-text-tertiary">
            {formatTokenSize(row.szi, row.coin, formatTokenAmount)}
          </span>
        </div>
      ),
    },
    {
      key: "unrealizedPnl",
      header: "Unrealized PNL",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => parseFloat(row.unrealizedPnl) || 0,
      accessor: (row) => {
        const pnlNum = parseFloat(row.unrealizedPnl);
        return (
          <span className={pnlNum >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
            {formatCurrency(pnlNum)}
          </span>
        );
      },
    },
    {
      key: "funding",
      header: "Funding",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => parseFloat(row.funding) || 0,
      accessor: (row) => {
        const fundingNum = parseFloat(row.funding);
        return (
          <span className={fundingNum >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
            {formatCurrency(fundingNum)}
          </span>
        );
      },
    },
  ];
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
  // Convert the external sort callback to the TypedDataTable server-sort API.
  // TypedDataTable will call onSortChange when a column header is clicked;
  // we forward that to the parent's requestSort.
  const handleSortChange = (field: string) => {
    onSort(field as SortKey);
  };

  const spotColumns = buildSpotColumns(
    formatCurrency, formatTokenAmount, formatPercent
  );
  const perpColumns = buildPerpColumns(formatCurrency, formatTokenAmount);

  return (
    <div className="bg-surface/60 border border-border-subtle rounded-2xl overflow-hidden">
      {/* Tab header + stats */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div className="flex bg-base rounded-lg p-1 border border-border-subtle">
          {[
            { key: 'spot', label: 'Spot' },
            { key: 'perp', label: 'Perps' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => onViewTypeChange(tab.key as "spot" | "perp")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                type === tab.key
                  ? 'bg-brand text-brand-text-on shadow-sm font-bold'
                  : 'tab-inactive'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-baseline gap-2">
            <span className="text-text-secondary text-xs">Total assets:</span>
            <span className="text-brand text-sm font-bold">{totalAssets}</span>
          </div>
          {walletDisplay && (
            <>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-baseline gap-2">
                <span className="text-text-secondary text-xs">Wallet:</span>
                <span className="text-brand text-sm font-medium">({walletDisplay})</span>
              </div>
            </>
          )}
          <div className="w-px h-4 bg-white/10" />
          <button
            onClick={onRefresh}
            disabled={isRefreshing || isLoading}
            className={`p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-white/5 ${
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

      {/* Table — tabs kept above, TypedDataTable inside */}
      {type === 'spot' ? (
        <TypedDataTable<HoldingDisplay>
          data={holdings as HoldingDisplay[]}
          columns={spotColumns}
          getRowKey={(row) => row.coin}
          isLoading={isLoading}
          emptyMessage="No positions found"
          emptyDescription="Add a position or check back later"
          onSortChange={handleSortChange}
          sortField={activeSortKey}
          sortDirection={sortDirection}
        />
      ) : (
        <TypedDataTable<PerpHoldingDisplay>
          data={holdings as PerpHoldingDisplay[]}
          columns={perpColumns}
          getRowKey={(row) => row.coin}
          isLoading={isLoading}
          emptyMessage="No positions found"
          emptyDescription="Add a position or check back later"
          onSortChange={handleSortChange}
          sortField={activeSortKey}
          sortDirection={sortDirection}
        />
      )}
    </div>
  );
}
