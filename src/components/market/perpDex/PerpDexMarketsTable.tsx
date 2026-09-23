"use client";

import { useRouter } from "next/navigation";
import { TypedDataTable, ModuleAsset, formatPriceChange, type Column } from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";
import { hip3AssetHref } from "@/lib/hip3/coin";
import { formatNumber, formatFunding } from "@/lib/formatters/numberFormatting";
import { useNumberFormat, type NumberFormatType } from "@/store/number-format.store";
import type { PerpDexAssetWithMarketData } from "@/services/market/perpDex/types";
import type { PerpDexMarketsSortField } from "@/lib/perpDexMarketsSort";

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

function buildColumns(
  format: NumberFormatType
): Column<PerpDexAssetWithMarketData>[] {
  return [
    {
      key: "name",
      header: "Asset",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <ModuleAsset
            assetName={row.name}
            name={getTicker(row.name)}
            sub={`${row.maxLeverage}x · ${row.collateralToken}`}
          />
          {row.growthMode === "enabled" && <StatusBadge variant="success">Growth</StatusBadge>}
          {row.isDelisted && <StatusBadge variant="error">Delisted</StatusBadge>}
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
      type: "change",
      sortable: true,
      getSortValue: (row) => row.priceChange24h ?? 0,
      accessor: (row) =>
        row.priceChange24h === undefined ? "-" : formatPriceChange(row.priceChange24h),
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
      type: "change",
      getSortValue: (row) => row.funding ?? 0,
      accessor: (row) => formatFunding(row.funding),
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
  const router = useRouter();

  // Bridge: TypedDataTable onSortChange receives (field, dir) — but only
  // sortable columns (priceChange24h, dayNtlVlm, openInterest) will fire it.
  // The parent owns sort state and re-renders with pre-sorted `assets`.
  const handleSortChange = (field: string) => {
    if (SORTABLE_FIELDS.has(field)) {
      onSort(field as PerpDexMarketsSortField);
    }
  };

  return (
    <TypedDataTable<PerpDexAssetWithMarketData>
      title="Markets"
      tag={`${activeAssets} active / ${totalAssets} total`}
      data={assets}
      columns={buildColumns(format)}
      getRowKey={(row) => row.name}
      emptyMessage="No markets available"
      // Each market now has a page of its own — this table was the natural
      // entry point to it and had no destination until now.
      onRowClick={(row) => router.push(hip3AssetHref(row.name))}
      rowClassName={(row) =>
        `cursor-pointer ${row.isDelisted ? "opacity-50" : ""}`.trim()
      }
      onSortChange={handleSortChange}
      sortField={sortField}
      sortDirection={sortOrder}
    />
  );
}
