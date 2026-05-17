"use client";

import { useCallback } from "react";
import { TypedDataTable, type Column } from "@/components/common";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useRouter } from "next/navigation";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { useNumberFormat, type NumberFormatType } from "@/store/number-format.store";
import type { PerpDexWithMarketData } from "@/services/market/perpDex/types";

const formatFunding = (funding: number) => {
  const percentage = funding * 100;
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(4)}%`;
};

function buildColumns(format: NumberFormatType): Column<PerpDexWithMarketData>[] {
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      getSortValue: (row) => row.name.toLowerCase(),
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-sm font-bold text-brand-accent">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-text-primary text-sm font-medium">{row.fullName}</span>
            <span className="text-brand-accent text-xs">{row.name}</span>
          </div>
        </div>
      ),
    },
    {
      key: "activeAssets",
      header: "Markets",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.activeAssets,
      accessor: (row) => (
        <div className="flex flex-col items-start">
          <span className="text-text-primary text-sm font-medium">{row.activeAssets}</span>
          {row.activeAssets !== row.totalAssets && (
            <span className="text-rose-400 text-label">
              +{row.totalAssets - row.activeAssets} delisted
            </span>
          )}
        </div>
      ),
    },
    {
      key: "totalVolume24h",
      header: "24h Volume",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.totalVolume24h,
      accessor: (row) =>
        row.totalVolume24h > 0
          ? formatNumber(row.totalVolume24h, format, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              currency: '$',
              showCurrency: true,
            })
          : '-',
    },
    {
      key: "totalOpenInterest",
      header: "Open Interest",
      type: "numeric",
      sortable: true,
      getSortValue: (row) => row.totalOpenInterest,
      accessor: (row) =>
        row.totalOpenInterest > 0
          ? formatNumber(row.totalOpenInterest, format, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              currency: '$',
              showCurrency: true,
            })
          : '-',
    },
    {
      key: "avgFunding",
      header: "Avg Funding",
      sortable: true,
      getSortValue: (row) => row.avgFunding,
      accessor: (row) => (
        <span className={`text-sm font-medium ${row.avgFunding >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {row.avgFunding !== 0 ? formatFunding(row.avgFunding) : '-'}
        </span>
      ),
    },
    {
      key: "totalOiCap",
      header: "OI Cap",
      accessor: (row) => (
        <div className="flex flex-col items-start">
          <span className="text-text-primary text-sm font-medium">
            {formatNumber(row.totalOiCap, format, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              currency: '$',
              showCurrency: true,
            })}
          </span>
          {row.totalOpenInterest > 0 && row.totalOiCap > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-accent rounded-full"
                  style={{
                    width: `${Math.min((row.totalOpenInterest / row.totalOiCap) * 100, 100)}%`,
                  }}
                />
              </div>
              <span className="text-label text-text-muted">
                {((row.totalOpenInterest / row.totalOiCap) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      ),
    },
  ];
}

export function PerpDexTable() {
  const router = useRouter();
  const { format } = useNumberFormat();
  const { dexs, isLoading } = usePerpDexMarketData();

  const handleDexClick = useCallback(
    (dex: PerpDexWithMarketData) => {
      router.push(`/market/perpdex/${encodeURIComponent(dex.name)}`);
    },
    [router]
  );

  return (
    <TypedDataTable<PerpDexWithMarketData>
      data={dexs}
      columns={buildColumns(format)}
      getRowKey={(row) => row.name}
      isLoading={isLoading && dexs.length === 0}
      emptyMessage="No PerpDex available"
      emptyDescription="Check back later"
      onRowClick={handleDexClick}
      rowMotion
      initialSort={{ field: "totalVolume24h", direction: "desc" }}
    />
  );
}
