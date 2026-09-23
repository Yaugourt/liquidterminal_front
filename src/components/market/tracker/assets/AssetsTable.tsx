"use client";

import {
  TypedDataTable,
  ModuleAsset,
  CellValue,
  SideBadge,
  TableStat,
  DataStatus,
  type Column,
} from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { HoldingDisplay, PerpHoldingDisplay, SortableHolding } from "@/components/types/wallet.types";

// Sort keys shared by spot & perp holdings tables. Kept here as the canonical
// owner now that the legacy TableHeader/TableRow/TableLoadingState files are
// gone (TypedDataTable replaces them).
export type SortKey =
  | 'coin'
  | 'price'
  | 'type'
  | 'marginUsedValue'
  | 'positionValueNum'
  | 'entryPriceNum'
  | 'liquidationNum'
  | 'total'
  | 'pnlPercentage'
  | 'totalValue'
  | 'unrealizedPnl'
  | 'funding';

type ViewType = 'spot' | 'perp';

const VIEW_TABS: { value: ViewType; label: string }[] = [
  { value: 'spot', label: 'Spot' },
  { value: 'perp', label: 'Perps' },
];

interface AssetsTableProps {
  type: ViewType;
  holdings: SortableHolding[];
  isLoading: boolean;
  onSort: (key: SortKey) => void;
  activeSortKey: SortKey;
  sortDirection: 'asc' | 'desc';
  formatCurrency: (value: number | string) => string;
  formatTokenAmount?: (value: number | string) => string;
  formatPercent?: (value: number) => string;
  onViewTypeChange: (type: ViewType) => void;
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
      accessor: (row) => <ModuleAsset src={row.logo} assetName={row.coin} name={row.coin} />,
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
      type: "change",
      sortable: true,
      getSortValue: (row) => row.pnlPercentage,
      accessor: (row) => formatPercent(row.pnlPercentage),
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
  /** "+$1,234.56" / "-$1,234.56": sign before the currency symbol. */
  const signedCurrency = (v: number) => `${v < 0 ? '-' : '+'}${formatCurrency(Math.abs(v))}`;
  const formatTokenSize = (szi: string, coin: string) => {
    const amount = parseFloat(szi);
    return `${amount < 0 ? '-' : ''}${formatTokenAmount(Math.abs(amount).toString())} ${coin}`;
  };

  return [
    {
      key: "coin",
      header: "Name",
      sortable: true,
      getSortValue: (row) => row.coin,
      accessor: (row) => (
        <ModuleAsset
          src={row.logo}
          assetName={row.coin}
          name={row.coin}
          sub={`${row.leverage.value}x ${row.leverage.type}`}
        />
      ),
    },
    {
      key: "type",
      header: "Side",
      sortable: true,
      getSortValue: (row) => row.type,
      accessor: (row) => <SideBadge side={row.type === 'Short' ? 'short' : 'long'} />,
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
      header: "Liq. Price",
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
      align: "right",
      sortable: true,
      getSortValue: (row) => row.positionValueNum,
      accessor: (row) => (
        <CellValue
          value={formatCurrency(row.positionValue)}
          sub={formatTokenSize(row.szi, row.coin)}
        />
      ),
    },
    {
      key: "unrealizedPnl",
      header: "Unrealized PnL",
      type: "change",
      sortable: true,
      getSortValue: (row) => parseFloat(row.unrealizedPnl) || 0,
      accessor: (row) => signedCurrency(parseFloat(row.unrealizedPnl) || 0),
    },
    {
      key: "funding",
      header: "Funding",
      type: "change",
      sortable: true,
      getSortValue: (row) => parseFloat(row.funding) || 0,
      accessor: (row) => signedCurrency(parseFloat(row.funding) || 0),
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
  // TypedDataTable calls onSortChange when a column header is clicked;
  // forward it to the parent's requestSort (server-sort API).
  const handleSortChange = (field: string) => {
    onSort(field as SortKey);
  };

  const toolbar = (
    <>
      <PillTabs
        variant="text"
        tabs={VIEW_TABS}
        activeTab={type}
        onTabChange={(v) => onViewTypeChange(v as ViewType)}
      />
      <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-1">
        <TableStat label="Assets" value={totalAssets} />
        {walletDisplay && <TableStat label="Wallet" value={walletDisplay} tone="brand" />}
        <DataStatus variant="polled" onRefresh={onRefresh} isRefreshing={isRefreshing || isLoading} />
      </div>
    </>
  );

  const shared = {
    toolbar,
    isLoading,
    density: "compact" as const,
    emptyMessage: "No positions found",
    emptyDescription: "Add a position or check back later",
    onSortChange: handleSortChange,
    sortField: activeSortKey,
    sortDirection,
  };

  return type === 'spot' ? (
    <TypedDataTable<HoldingDisplay>
      {...shared}
      data={holdings as HoldingDisplay[]}
      columns={buildSpotColumns(formatCurrency, formatTokenAmount, formatPercent)}
      getRowKey={(row) => row.coin}
    />
  ) : (
    <TypedDataTable<PerpHoldingDisplay>
      {...shared}
      data={holdings as PerpHoldingDisplay[]}
      columns={buildPerpColumns(formatCurrency, formatTokenAmount)}
      getRowKey={(row) => row.coin}
    />
  );
}
