"use client";

import { TypedDataTable, type Column } from "@/components/common";
import { formatNumber, formatFunding } from "@/lib/formatters/numberFormatting";
import { useNumberFormat, type NumberFormatType } from "@/store/number-format.store";
import { AssetLogo } from "@/components/common";
import type { PerpDexAssetWithMarketData } from "@/services/market/perpDex/types";
import type { PerpDexMarketsSortField } from "@/lib/perpDexMarketsSort";
import { Sprout, AlertCircle } from "lucide-react";

interface PerpDexMarketsTableProps {
  /** Already sorted (parent owns sort state). */
  assets: PerpDexAssetWithMarketData[];
  totalAssets: number;
  activeAssets: number;
  sortField: PerpDexMarketsSortField;
  sortOrder: "asc" | "desc";
  onSort: (field: PerpDexMarketsSortField) => void;
}

const SORTABLE_FIELDS = new Set<string>(["dayNtlVlm", "openInterest", "priceChange24h"]);

const getTicker = (assetName: string) => {
  const parts = assetName.split(":");
  return parts.length > 1 ? parts[1] : assetName;
};

const formatPriceChange = (change: number | undefined) => {
  if (change === undefined) return "-";
  return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
};

function renderAssetBadges(asset: PerpDexAssetWithMarketData) {
  return (
    <div className="flex items-center gap-2 mt-0.5">
      <span className="text-label text-text-tertiary">{asset.maxLeverage}x</span>
      {asset.growthMode === "enabled" && (
        <span className="text-success text-label flex items-center gap-0.5">
          <Sprout className="h-2.5 w-2.5" />
          Growth
        </span>
      )}
      {asset.isDelisted && (
        <span className="text-danger text-label flex items-center gap-0.5">
          <AlertCircle className="h-2.5 w-2.5" />
          Delisted
        </span>
      )}
    </div>
  );
}

function buildColumns(
  format: NumberFormatType
): Column<PerpDexAssetWithMarketData>[] {
  return [
    {
      key: "name",
      header: "Asset",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <AssetLogo assetName={row.name} isDelisted={row.isDelisted} />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-text-primary text-sm font-medium">{getTicker(row.name)}</span>
              <span className="text-text-tertiary text-sm">/</span>
              <span className="text-text-tertiary text-xs">{row.collateralToken}</span>
            </div>
            {renderAssetBadges(row)}
          </div>
        </div>
      ),
    },
    {
      key: "markPx",
      header: "Price",
      type: "numeric",
      accessor: (row) =>
        row.markPx
          ? `$${formatNumber(row.markPx, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : "-",
    },
    {
      key: "priceChange24h",
      header: "24h",
      sortable: true,
      getSortValue: (row) => row.priceChange24h ?? 0,
      accessor: (row) => (
        <span
          className={`text-sm font-medium ${(row.priceChange24h ?? 0) >= 0 ? "text-success" : "text-danger"}`}
        >
          {formatPriceChange(row.priceChange24h)}
        </span>
      ),
    },
    {
      key: "dayNtlVlm",
      header: "Volume",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.dayNtlVlm ?? 0,
      accessor: (row) =>
        row.dayNtlVlm && row.dayNtlVlm > 0
          ? formatNumber(row.dayNtlVlm, format, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              currency: "$",
              showCurrency: true,
            })
          : "-",
    },
    {
      key: "openInterest",
      header: "OI",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.openInterest ?? 0,
      accessor: (row) =>
        row.openInterest && row.openInterest > 0
          ? formatNumber(row.openInterest, format, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              currency: "$",
              showCurrency: true,
            })
          : "-",
    },
    {
      key: "funding",
      header: "Funding",
      accessor: (row) => (
        <span
          className={`text-sm font-medium ${(row.funding ?? 0) >= 0 ? "text-success" : "text-danger"}`}
        >
          {formatFunding(row.funding)}
        </span>
      ),
    },
    {
      key: "streamingOiCap",
      header: "OI Cap",
      type: "numeric",
      accessor: (row) =>
        formatNumber(row.streamingOiCap, format, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          currency: "$",
          showCurrency: true,
        }),
    },
  ];
}

export function PerpDexMarketsTable({
  assets,
  totalAssets,
  activeAssets,
  sortField,
  sortOrder,
  onSort,
}: PerpDexMarketsTableProps) {
  const { format } = useNumberFormat();

  // Bridge: TypedDataTable onSortChange receives (field, dir) — but only
  // sortable columns (priceChange24h, dayNtlVlm, openInterest) will fire it.
  // The parent owns sort state and re-renders with pre-sorted `assets`.
  const handleSortChange = (field: string) => {
    if (SORTABLE_FIELDS.has(field)) {
      onSort(field as PerpDexMarketsSortField);
    }
  };

  return (
    <div>
      <h2 className="text-table-header mb-3">
        Markets ({activeAssets} active / {totalAssets} total)
      </h2>
      <TypedDataTable<PerpDexAssetWithMarketData>
        data={assets}
        columns={buildColumns(format)}
        getRowKey={(row) => row.name}
        emptyMessage="No markets available"
        rowClassName={(row) => (row.isDelisted ? "opacity-50" : "")}
        onSortChange={handleSortChange}
        sortField={sortField}
        sortDirection={sortOrder}
      />
    </div>
  );
}
