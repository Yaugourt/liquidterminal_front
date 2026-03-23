"use client";

import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database, Sprout, AlertCircle, ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { AssetLogo } from "@/components/common";
import { PerpDexAssetWithMarketData } from "@/services/market/perpDex/types";
import { cn } from "@/lib/utils";
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

function MarketsSortableHead({
  label,
  field,
  activeField,
  sortOrder,
  onSort,
}: {
  label: string;
  field: PerpDexMarketsSortField;
  activeField: PerpDexMarketsSortField;
  sortOrder: "asc" | "desc";
  onSort: (f: PerpDexMarketsSortField) => void;
}) {
  const isActive = activeField === field;
  return (
    <TableHead
      className={cn(
        "cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary",
        isActive ? "!text-brand-gold" : "hover:text-white"
      )}
      onClick={() => onSort(field)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSort(field);
        }
      }}
      tabIndex={0}
      aria-sort={
        isActive
          ? sortOrder === "asc"
            ? "ascending"
            : "descending"
          : undefined
      }
    >
      <span className="table-column-head inline-flex items-center justify-start gap-1">
        {label}
        {isActive ? (
          sortOrder === "asc" ? (
            <ChevronUp className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
        )}
      </span>
    </TableHead>
  );
}

/** Static column — inherits `table-column-head` from TableHead. */
function MarketsStaticHead({ children }: { children: ReactNode }) {
  return <TableHead>{children}</TableHead>;
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

  const formatFunding = (funding: number | undefined) => {
    if (funding === undefined) return "-";
    const percentage = funding * 100;
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(4)}%`;
  };

  const formatPriceChange = (change: number | undefined) => {
    if (change === undefined) return "-";
    return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
  };

  const getTicker = (assetName: string) => {
    const parts = assetName.split(":");
    return parts.length > 1 ? parts[1] : assetName;
  };

  const renderAssetBadges = (asset: PerpDexAssetWithMarketData) => {
    const badges = [];

    badges.push(
      <span key="leverage" className="text-label text-text-muted">
        {asset.maxLeverage}x
      </span>
    );

    if (asset.growthMode === "enabled") {
      badges.push(
        <span key="growth" className="text-emerald-400 text-label flex items-center gap-0.5">
          <Sprout className="h-2.5 w-2.5" />
          Growth
        </span>
      );
    }

    if (asset.isDelisted) {
      badges.push(
        <span key="delisted" className="text-rose-400 text-label flex items-center gap-0.5">
          <AlertCircle className="h-2.5 w-2.5" />
          Delisted
        </span>
      );
    }

    return <div className="flex items-center gap-2 mt-0.5">{badges}</div>;
  };

  return (
    <div>
      <h2 className="text-table-header mb-3">
        Markets ({activeAssets} active / {totalAssets} total)
      </h2>
      <div className="w-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border-subtle hover:bg-transparent">
                <MarketsStaticHead>Asset</MarketsStaticHead>
                <MarketsStaticHead>Price</MarketsStaticHead>
                <MarketsSortableHead
                  label="24h"
                  field="priceChange24h"
                  activeField={sortField}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
                <MarketsSortableHead
                  label="Volume"
                  field="dayNtlVlm"
                  activeField={sortField}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
                <MarketsSortableHead
                  label="OI"
                  field="openInterest"
                  activeField={sortField}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
                <MarketsStaticHead>Funding</MarketsStaticHead>
                <MarketsStaticHead>OI Cap</MarketsStaticHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.length > 0 ? (
                assets.map((asset) => (
                  <TableRow
                    key={asset.name}
                    className={`border-b border-border-subtle hover:bg-white/[0.02] transition-colors ${asset.isDelisted ? "opacity-50" : ""}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AssetLogo assetName={asset.name} isDelisted={asset.isDelisted} />
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-white text-sm font-medium">{getTicker(asset.name)}</span>
                            <span className="text-text-muted text-sm">/</span>
                            <span className="text-text-muted text-xs">{asset.collateralToken}</span>
                          </div>
                          {renderAssetBadges(asset)}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-white text-sm font-medium">
                        {asset.markPx
                          ? `$${formatNumber(asset.markPx, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : "-"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`text-sm font-medium ${(asset.priceChange24h ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {formatPriceChange(asset.priceChange24h)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-white text-sm font-medium">
                        {asset.dayNtlVlm && asset.dayNtlVlm > 0
                          ? formatNumber(asset.dayNtlVlm, format, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                              currency: "$",
                              showCurrency: true,
                            })
                          : "-"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-white text-sm font-medium">
                        {asset.openInterest && asset.openInterest > 0
                          ? formatNumber(asset.openInterest, format, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                              currency: "$",
                              showCurrency: true,
                            })
                          : "-"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`text-sm font-medium ${(asset.funding ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {formatFunding(asset.funding)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-white text-sm font-medium">
                        {formatNumber(asset.streamingOiCap, format, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                          currency: "$",
                          showCurrency: true,
                        })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <Database className="w-10 h-10 mb-3 text-text-muted" />
                      <p className="text-text-secondary text-sm mb-1">No markets available</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
