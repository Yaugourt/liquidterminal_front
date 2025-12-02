"use client";

import { memo, useCallback, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Database, Loader2 } from "lucide-react";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useRouter } from "next/navigation";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { useNumberFormat } from "@/store/number-format.store";
import { PerpDexWithMarketData } from "@/services/market/perpDex/types";

type SortField = 'name' | 'activeAssets' | 'totalVolume24h' | 'totalOpenInterest' | 'avgFunding';

interface TableHeaderCellProps {
  label: string;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
  icon?: React.ReactNode;
}

// Header cell component
const TableHeaderCell = memo(({ label, onClick, className, isActive }: TableHeaderCellProps) => {
  return (
    <TableHead className={className}>
      <Button
        variant="ghost"
        onClick={onClick}
        className={`${isActive ? "text-[#83E9FF] hover:text-[#83E9FF]" : "text-zinc-400 hover:text-zinc-200"} font-semibold text-[10px] uppercase tracking-wider p-0 flex items-center justify-start w-full h-auto`}
      >
        {label}
        {onClick && <ArrowUpDown className="ml-1.5 h-3 w-3" />}
      </Button>
    </TableHead>
  );
});

TableHeaderCell.displayName = 'TableHeaderCell';

// Empty state component
const EmptyState = memo(() => (
  <TableRow>
    <TableCell colSpan={6} className="text-center py-8">
      <div className="flex flex-col items-center justify-center">
        <Database className="w-10 h-10 mb-3 text-zinc-600" />
        <p className="text-zinc-400 text-sm mb-1">No PerpDex available</p>
        <p className="text-zinc-600 text-xs">Check back later</p>
      </div>
    </TableCell>
  </TableRow>
));

EmptyState.displayName = 'EmptyState';

// Row component with live market data
const PerpDexRow = memo(({ 
  dex, 
  onClick,
  format 
}: { 
  dex: PerpDexWithMarketData; 
  onClick: () => void;
  format: 'US' | 'EU';
}) => {
  const formatFunding = (funding: number) => {
    const percentage = funding * 100;
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(4)}%`;
  };

  return (
    <TableRow
      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Name */}
      <TableCell className="py-3 pl-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#83E9FF]/20 to-[#f9e370]/20 flex items-center justify-center text-sm font-bold text-[#83E9FF]">
            {dex.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-white text-sm font-medium">{dex.fullName}</span>
            <span className="text-[#83E9FF] text-xs">{dex.name}</span>
          </div>
        </div>
      </TableCell>

      {/* Active Markets */}
      <TableCell className="py-3 text-left">
        <div className="flex flex-col items-start">
          <span className="text-white text-sm font-medium">{dex.activeAssets}</span>
          {dex.activeAssets !== dex.totalAssets && (
            <span className="text-rose-400 text-[10px]">
              +{dex.totalAssets - dex.activeAssets} delisted
            </span>
          )}
        </div>
      </TableCell>

      {/* 24h Volume */}
      <TableCell className="py-3 text-left">
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
      <TableCell className="py-3 text-left">
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
      <TableCell className="py-3 text-left">
        <span className={`text-sm font-medium ${dex.avgFunding >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {dex.avgFunding !== 0 ? formatFunding(dex.avgFunding) : '-'}
        </span>
      </TableCell>

      {/* OI Cap Utilization */}
      <TableCell className="py-3 pr-4 text-left">
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
                  className="h-full bg-[#83E9FF] rounded-full"
                  style={{ 
                    width: `${Math.min((dex.totalOpenInterest / dex.totalOiCap) * 100, 100)}%` 
                  }}
                />
              </div>
              <span className="text-zinc-500 text-[10px]">
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
      <div className="w-full bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 overflow-hidden">
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF]" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="border-b border-white/5 hover:bg-transparent">
              <TableHeaderCell
                label="Name"
                onClick={() => handleSort('name')}
                isActive={sortField === 'name'}
                className="py-3 pl-4 w-[22%]"
              />
              <TableHeaderCell
                label="Markets"
                onClick={() => handleSort('activeAssets')}
                isActive={sortField === 'activeAssets'}
                className="py-3 w-[12%]"
              />
              <TableHeaderCell
                label="24h Volume"
                onClick={() => handleSort('totalVolume24h')}
                isActive={sortField === 'totalVolume24h'}
                className="py-3 w-[18%]"
              />
              <TableHeaderCell
                label="Open Interest"
                onClick={() => handleSort('totalOpenInterest')}
                isActive={sortField === 'totalOpenInterest'}
                className="py-3 w-[18%]"
              />
              <TableHeaderCell
                label="Avg Funding"
                onClick={() => handleSort('avgFunding')}
                isActive={sortField === 'avgFunding'}
                className="py-3 w-[15%]"
              />
              <TableHeaderCell
                label="OI Cap"
                className="py-3 pr-4 w-[15%]"
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
              <EmptyState />
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

