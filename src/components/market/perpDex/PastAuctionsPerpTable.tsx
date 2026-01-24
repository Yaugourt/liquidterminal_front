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
import { ArrowUpDown, Database, Loader2, ExternalLink } from "lucide-react";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { usePastAuctionsPerp } from "@/services/market/perpDex/hooks";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { PastAuctionPerp } from "@/services/market/perpDex/types";
import { AddressDisplay } from "@/components/ui/address-display";

type SortField = 'time' | 'symbol' | 'dex' | 'oraclePx' | 'user';

interface TableHeaderCellProps {
  label: string;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

const TableHeaderCell = memo(({ label, onClick, className, isActive }: TableHeaderCellProps) => {
  return (
    <TableHead className={className}>
      <Button
        variant="ghost"
        onClick={onClick}
        className={`${isActive ? "text-brand-accent hover:text-brand-accent" : "text-text-secondary hover:text-zinc-200"} text-label p-0 flex items-center justify-start w-full h-auto`}
      >
        {label}
        {onClick && <ArrowUpDown className="ml-1.5 h-3 w-3" />}
      </Button>
    </TableHead>
  );
});

TableHeaderCell.displayName = 'TableHeaderCell';

const EmptyState = memo(() => (
  <TableRow>
    <TableCell colSpan={6} className="text-center py-8">
      <div className="flex flex-col items-center justify-center">
        <Database className="w-10 h-10 mb-3 text-text-muted" />
        <p className="text-text-secondary text-sm mb-1">No auction pairs found</p>
        <p className="text-text-muted text-xs">Check back later</p>
      </div>
    </TableCell>
  </TableRow>
));

EmptyState.displayName = 'EmptyState';

const AuctionRow = memo(({
  auction,
  format
}: {
  auction: PastAuctionPerp;
  format: NumberFormatType;
}) => {
  return (
    <TableRow className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors">
      {/* Time */}
      <TableCell className="py-3 pl-4">
        <div className="flex flex-col">
          <span className="text-white text-sm">{formatDateTime(auction.time, 'RELATIVE')}</span>
          <span className="text-text-muted text-xs">
            {auction.time.toLocaleDateString()}
          </span>
        </div>
      </TableCell>

      {/* Symbol */}
      <TableCell className="py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-sm font-bold text-brand-accent">
            {auction.symbol.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-white text-sm font-medium">{auction.symbol}</span>
            <span className="text-brand-accent text-xs">{auction.coin}</span>
          </div>
        </div>
      </TableCell>

      {/* DEX */}
      <TableCell className="py-3">
        <div className="flex flex-col">
          <span className="text-white text-sm font-medium px-2 py-1 bg-brand-secondary/60 rounded-md inline-block w-fit">
            {auction.dex}
          </span>
          {auction.dexFullName && (
            <span className="text-text-muted text-xs mt-0.5">{auction.dexFullName}</span>
          )}
        </div>
      </TableCell>

      {/* Oracle Price */}
      <TableCell className="py-3">
        <span className="text-white text-sm font-medium">
          {formatNumber(auction.oraclePx, format, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            currency: '$',
            showCurrency: true
          })}
        </span>
      </TableCell>

      {/* Deployer */}
      <TableCell className="py-3">
        <AddressDisplay address={auction.user} showCopy={true} />
      </TableCell>

      {/* Transaction */}
      <TableCell className="py-3 pr-4">
        <a
          href={`https://app.hyperliquid.xyz/explorer/tx/${auction.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-brand-accent hover:text-brand-accent/80 transition-colors text-sm"
        >
          View
          <ExternalLink className="w-3 h-3" />
        </a>
      </TableCell>
    </TableRow>
  );
});

AuctionRow.displayName = 'AuctionRow';

export function PastAuctionsPerpTable() {
  const { format } = useNumberFormat();
  const { auctions, isLoading } = usePastAuctionsPerp();

  const [sortField, setSortField] = useState<SortField>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedAuctions = useMemo(() => {
    return [...auctions].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'time':
          comparison = a.time.getTime() - b.time.getTime();
          break;
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'dex':
          comparison = a.dex.localeCompare(b.dex);
          break;
        case 'oraclePx':
          comparison = a.oraclePx - b.oraclePx;
          break;
        case 'user':
          comparison = a.user.localeCompare(b.user);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [auctions, sortField, sortOrder]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  }, [sortField]);

  if (isLoading && !sortedAuctions.length) {
    return (
      <div className="w-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden">
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <Table className="min-w-[800px] w-full">
          <TableHeader>
            <TableRow className="border-b border-border-subtle hover:bg-transparent">
              <TableHeaderCell
                label="Time"
                onClick={() => handleSort('time')}
                isActive={sortField === 'time'}
                className="py-3 pl-4 w-[15%]"
              />
              <TableHeaderCell
                label="Symbol"
                onClick={() => handleSort('symbol')}
                isActive={sortField === 'symbol'}
                className="py-3 w-[20%]"
              />
              <TableHeaderCell
                label="DEX"
                onClick={() => handleSort('dex')}
                isActive={sortField === 'dex'}
                className="py-3 w-[12%]"
              />
              <TableHeaderCell
                label="Oracle Price"
                onClick={() => handleSort('oraclePx')}
                isActive={sortField === 'oraclePx'}
                className="py-3 w-[15%]"
              />
              <TableHeaderCell
                label="Deployer"
                onClick={() => handleSort('user')}
                isActive={sortField === 'user'}
                className="py-3 w-[25%]"
              />
              <TableHeaderCell
                label="Tx"
                className="py-3 pr-4 w-[13%]"
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAuctions.length > 0 ? (
              sortedAuctions.map((auction) => (
                <AuctionRow
                  key={auction.hash}
                  auction={auction}
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