"use client";

import { memo, useCallback } from "react";
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
import { ArrowUpDown, Database, Loader2, ExternalLink } from "lucide-react";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useRouter } from "next/navigation";
import { usePerpDexs } from "@/services/market/perpDex/hooks";
import { useNumberFormat } from "@/store/number-format.store";
import { PerpDex, PerpDexParams } from "@/services/market/perpDex/types";

interface TableHeaderCellProps {
  label: string;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

// Header cell component
const TableHeaderCell = memo(({ label, onClick, className, isActive }: TableHeaderCellProps) => (
  <TableHead className={className}>
    <Button
      variant="ghost"
      onClick={onClick}
      className={`${isActive ? "text-[#f9e370] hover:text-[#f9e370]" : "text-white hover:text-white"} font-normal p-0 flex items-center justify-start w-full`}
    >
      {label}
      {onClick && <ArrowUpDown className="ml-2 h-4 w-4" />}
    </Button>
  </TableHead>
));

TableHeaderCell.displayName = 'TableHeaderCell';

// Empty state component
const EmptyState = memo(() => (
  <TableRow>
    <TableCell colSpan={5} className="text-center py-8">
      <div className="flex flex-col items-center justify-center">
        <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
        <p className="text-white text-lg">No PerpDex available</p>
        <p className="text-[#FFFFFF80] text-sm mt-2">Check back later</p>
      </div>
    </TableCell>
  </TableRow>
));

EmptyState.displayName = 'EmptyState';

// Row component
const PerpDexRow = memo(({ 
  dex, 
  onClick,
  format 
}: { 
  dex: PerpDex; 
  onClick: () => void;
  format: 'US' | 'EU';
}) => {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <TableRow
      className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Name */}
      <TableCell className="py-4 pl-4">
        <div className="flex flex-col">
          <span className="text-white text-sm font-medium">{dex.fullName}</span>
          <span className="text-[#83E9FF] text-xs">{dex.name}</span>
        </div>
      </TableCell>

      {/* Deployer */}
      <TableCell className="py-4">
        <div className="flex items-center gap-1">
          <span className="text-white text-sm font-mono">
            {truncateAddress(dex.deployer)}
          </span>
          <ExternalLink className="h-3 w-3 text-[#83E9FF4D]" />
        </div>
      </TableCell>

      {/* Total Markets */}
      <TableCell className="py-4 text-center">
        <span className="text-white text-sm">{dex.totalAssets}</span>
      </TableCell>

      {/* Total OI Cap */}
      <TableCell className="py-4">
        <span className="text-white text-sm">
          {formatNumber(dex.totalOiCap, format, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            currency: '$',
            showCurrency: true
          })}
        </span>
      </TableCell>

      {/* Fee Scale */}
      <TableCell className="py-4 pr-4">
        <span className="text-[#52C41A] text-sm">
          {(dex.deployerFeeScale * 100).toFixed(0)}%
        </span>
      </TableCell>
    </TableRow>
  );
});

PerpDexRow.displayName = 'PerpDexRow';

export function PerpDexTable() {
  const router = useRouter();
  const { format } = useNumberFormat();
  const { 
    data, 
    isLoading, 
    isInitialLoading,
    params, 
    updateParams 
  } = usePerpDexs();

  const handleSort = useCallback((field: PerpDexParams['sortBy']) => {
    if (!field) return;
    
    if (params.sortBy === field) {
      updateParams({ sortOrder: params.sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      updateParams({ sortBy: field, sortOrder: 'desc' });
    }
  }, [params, updateParams]);

  const handleDexClick = useCallback((dexName: string) => {
    router.push(`/market/perpdex/${encodeURIComponent(dexName)}`);
  }, [router]);

  if (isInitialLoading) {
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
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#051728]">
              <TableHeaderCell
                label="Name"
                onClick={() => handleSort('name')}
                isActive={params.sortBy === 'name'}
                className="text-white font-normal py-3 bg-[#051728] pl-4 w-[25%]"
              />
              <TableHeaderCell
                label="Deployer"
                className="text-white font-normal py-3 bg-[#051728] w-[20%]"
              />
              <TableHeaderCell
                label="Markets"
                onClick={() => handleSort('totalAssets')}
                isActive={params.sortBy === 'totalAssets'}
                className="text-white font-normal py-3 bg-[#051728] text-center w-[15%]"
              />
              <TableHeaderCell
                label="Total OI Cap"
                onClick={() => handleSort('totalOiCap')}
                isActive={params.sortBy === 'totalOiCap'}
                className="text-white font-normal py-3 bg-[#051728] w-[25%]"
              />
              <TableHeaderCell
                label="Fee Scale"
                className="text-white font-normal py-3 bg-[#051728] pr-4 w-[15%]"
              />
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#051728]">
            {data && data.length > 0 ? (
              data.map((dex) => (
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
      
      {/* Loading overlay for background refresh */}
      {isLoading && !isInitialLoading && (
        <div className="absolute top-2 right-2">
          <Loader2 className="h-4 w-4 animate-spin text-[#83E9FF]" />
        </div>
      )}
    </Card>
  );
}

