"use client";

import { memo, useCallback, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
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
const TableHeaderCell = memo(({ label, onClick, className, isActive, icon }: TableHeaderCellProps) => {
  return (
    <TableHead className={className}>
      <Button
        variant="ghost"
        onClick={onClick}
        className={`${isActive ? "text-[#f9e370] hover:text-[#f9e370]" : "text-white hover:text-white"} font-normal p-0 flex items-center justify-start w-full`}
      >
        {icon}
        {label}
        {onClick && <ArrowUpDown className="ml-2 h-4 w-4" />}
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
        <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
        <p className="text-white text-lg">No PerpDex available</p>
        <p className="text-[#FFFFFF80] text-sm mt-2">Check back later</p>
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
      className="border-b border-[#FFFFFF1A] hover:bg-[#0a2035] transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Name */}
      <TableCell className="py-3 pl-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#83E9FF20] to-[#f9e37020] flex items-center justify-center text-sm font-bold text-[#83E9FF]">
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
          <span className="text-white text-sm">{dex.activeAssets}</span>
          {dex.activeAssets !== dex.totalAssets && (
            <span className="text-[#FF4D4F] text-[10px]">
              +{dex.totalAssets - dex.activeAssets} delisted
            </span>
          )}
        </div>
      </TableCell>

      {/* 24h Volume */}
      <TableCell className="py-3 text-left">
        <span className="text-white text-sm">
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
        <span className="text-white text-sm">
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
        <span className={`text-sm ${dex.avgFunding >= 0 ? 'text-[#52C41A]' : 'text-[#FF4D4F]'}`}>
          {dex.avgFunding !== 0 ? formatFunding(dex.avgFunding) : '-'}
        </span>
      </TableCell>

      {/* OI Cap Utilization */}
      <TableCell className="py-3 pr-4 text-left">
        <div className="flex flex-col items-start">
          <span className="text-white text-sm">
            {formatNumber(dex.totalOiCap, format, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              currency: '$',
              showCurrency: true
            })}
          </span>
          {dex.totalOpenInterest > 0 && dex.totalOiCap > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-12 h-1 bg-[#FFFFFF20] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#f9e370] rounded-full"
                  style={{ 
                    width: `${Math.min((dex.totalOpenInterest / dex.totalOiCap) * 100, 100)}%` 
                  }}
                />
              </div>
              <span className="text-[#FFFFFF60] text-[10px]">
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
      <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="border-none bg-[#051728]">
              <TableHeaderCell
                label="Name"
                onClick={() => handleSort('name')}
                isActive={sortField === 'name'}
                className="text-white text-sm py-3 bg-[#051728] pl-4 w-[22%]"
              />
              <TableHeaderCell
                label="Markets"
                onClick={() => handleSort('activeAssets')}
                isActive={sortField === 'activeAssets'}
                className="text-white text-sm py-3 bg-[#051728] w-[12%]"
              />
              <TableHeaderCell
                label="24h Volume"
                onClick={() => handleSort('totalVolume24h')}
                isActive={sortField === 'totalVolume24h'}
                className="text-white text-sm py-3 bg-[#051728] w-[18%]"
              />
              <TableHeaderCell
                label="Open Interest"
                onClick={() => handleSort('totalOpenInterest')}
                isActive={sortField === 'totalOpenInterest'}
                className="text-white text-sm py-3 bg-[#051728] w-[18%]"
              />
              <TableHeaderCell
                label="Avg Funding"
                onClick={() => handleSort('avgFunding')}
                isActive={sortField === 'avgFunding'}
                className="text-white text-sm py-3 bg-[#051728] w-[15%]"
              />
              <TableHeaderCell
                label="OI Cap"
                className="text-white text-sm py-3 bg-[#051728] pr-4 w-[15%]"
              />
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#051728]">
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
    </Card>
  );
}

