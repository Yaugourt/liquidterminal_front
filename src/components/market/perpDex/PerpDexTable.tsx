"use client";

import { memo, useCallback, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  SortableTableHead,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useRouter } from "next/navigation";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { PerpDexWithMarketData } from "@/services/market/perpDex/types";
import { TableEmptyState } from "@/components/ui/table-states";
import { LoadingState } from "@/components/ui/loading-state";

type SortField = 'name' | 'activeAssets' | 'totalVolume24h' | 'totalOpenInterest' | 'avgFunding';





// Row component with live market data
const PerpDexRow = memo(({
  dex,
  onClick,
  format
}: {
  dex: PerpDexWithMarketData;
  onClick: () => void;
  format: NumberFormatType;
}) => {
  const formatFunding = (funding: number) => {
    const percentage = funding * 100;
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(4)}%`;
  };

  return (
    <TableRow
      className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Name */}
      <TableCell className="pl-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-sm font-bold text-brand-accent">
            {dex.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-white text-sm font-medium">{dex.fullName}</span>
            <span className="text-brand-accent text-xs">{dex.name}</span>
          </div>
        </div>
      </TableCell>

      {/* Active Markets */}
      <TableCell className="text-left">
        <div className="flex flex-col items-start">
          <span className="text-white text-sm font-medium">{dex.activeAssets}</span>
          {dex.activeAssets !== dex.totalAssets && (
            <span className="text-rose-400 text-label">
              +{dex.totalAssets - dex.activeAssets} delisted
            </span>
          )}
        </div>
      </TableCell>

      {/* 24h Volume */}
      <TableCell className="text-left">
        <span className="text-white text-sm font-medium">
          {dex.totalVolume24h > 0
            ? formatNumber(dex.totalVolume24h, format, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              currency: '$',
              showCurrency: true
            })
            : '-'}
        </span>
      </TableCell>

      {/* Open Interest */}
      <TableCell className="text-left">
        <span className="text-white text-sm font-medium">
          {dex.totalOpenInterest > 0
            ? formatNumber(dex.totalOpenInterest, format, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              currency: '$',
              showCurrency: true
            })
            : '-'}
        </span>
      </TableCell>

      {/* Avg Funding */}
      <TableCell className="text-left">
        <span className={`text-sm font-medium ${dex.avgFunding >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {dex.avgFunding !== 0 ? formatFunding(dex.avgFunding) : '-'}
        </span>
      </TableCell>

      {/* OI Cap Utilization */}
      <TableCell className="pr-4 text-left">
        <div className="flex flex-col items-start">
          <span className="text-white text-sm font-medium">
            {formatNumber(dex.totalOiCap, format, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              currency: '$',
              showCurrency: true
            })}
          </span>
          {dex.totalOpenInterest > 0 && dex.totalOiCap > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-accent rounded-full"
                  style={{
                    width: `${Math.min((dex.totalOpenInterest / dex.totalOiCap) * 100, 100)}%`
                  }}
                />
              </div>
              <span className="text-label text-text-muted">
                {((dex.totalOpenInterest / dex.totalOiCap) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
});

PerpDexRow.displayName = 'PerpDexRow';

export function PerpDexTable() {
  const router = useRouter();
  const { format } = useNumberFormat();
  const { dexs, isLoading } = usePerpDexMarketData();

  const [sortField, setSortField] = useState<SortField>('totalVolume24h');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sort data
  const sortedDexs = useMemo(() => {
    return [...dexs].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'activeAssets':
          comparison = a.activeAssets - b.activeAssets;
          break;
        case 'totalVolume24h':
          comparison = a.totalVolume24h - b.totalVolume24h;
          break;
        case 'totalOpenInterest':
          comparison = a.totalOpenInterest - b.totalOpenInterest;
          break;
        case 'avgFunding':
          comparison = a.avgFunding - b.avgFunding;
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [dexs, sortField, sortOrder]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  }, [sortField]);

  const handleDexClick = useCallback((dexName: string) => {
    router.push(`/market/perpdex/${encodeURIComponent(dexName)}`);
  }, [router]);

  if (isLoading && !sortedDexs.length) {
    return (
      <div className="w-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden">
        <LoadingState message="Loading PerpDex..." size="lg" withCard={false} />
      </div>
    );
  }

  return (
    <div className="w-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <Table className="min-w-[800px] w-full">
          <TableHeader>
            <TableRow className="border-b border-border-subtle hover:bg-transparent">
              <SortableTableHead
                label="Name"
                onClick={() => handleSort('name')}
                isActive={sortField === 'name'}
                className="pl-4 w-[22%]"
              />
              <SortableTableHead
                label="Markets"
                onClick={() => handleSort('activeAssets')}
                isActive={sortField === 'activeAssets'}
                className="w-[12%]"
              />
              <SortableTableHead
                label="24h Volume"
                onClick={() => handleSort('totalVolume24h')}
                isActive={sortField === 'totalVolume24h'}
                className="w-[18%]"
              />
              <SortableTableHead
                label="Open Interest"
                onClick={() => handleSort('totalOpenInterest')}
                isActive={sortField === 'totalOpenInterest'}
                className="w-[18%]"
              />
              <SortableTableHead
                label="Avg Funding"
                onClick={() => handleSort('avgFunding')}
                isActive={sortField === 'avgFunding'}
                className="w-[15%]"
              />
              <SortableTableHead
                label="OI Cap"
                className="pr-4 w-[15%]"
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDexs.length > 0 ? (
              sortedDexs.map((dex) => (
                <PerpDexRow
                  key={dex.name}
                  dex={dex}
                  onClick={() => handleDexClick(dex.name)}
                  format={format}
                />
              ))
            ) : (
              <TableEmptyState colSpan={6} title="No PerpDex available" description="Check back later" />
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

