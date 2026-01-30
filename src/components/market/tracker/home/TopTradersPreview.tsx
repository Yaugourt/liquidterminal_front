"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTopTraders } from "@/services/market/toptraders";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { Loader2, TrendingUp, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TopTradersSortType, TopTrader } from "@/services/market/toptraders";

const ITEMS_PER_PAGE = 10;

type SortField = 'tradeCount' | 'totalVolume' | 'winRate' | 'totalPnl';
type SortDirection = 'asc' | 'desc';

interface ColumnSort {
  field: SortField | null;
  direction: SortDirection;
}

/**
 * Composant Top Traders avec pagination et tri par colonnes
 */
export function TopTradersPreview() {
  const [apiSort] = useState<TopTradersSortType>('pnl_pos');
  const [page, setPage] = useState(1);
  const [columnSort, setColumnSort] = useState<ColumnSort>({ field: null, direction: 'desc' });

  const { traders, isLoading, error, refetch } = useTopTraders({
    sort: apiSort,
    limit: 50
  });

  // Sort traders locally based on column click
  const sortedTraders = useMemo(() => {
    if (!columnSort.field) return traders;

    return [...traders].sort((a, b) => {
      const aVal = a[columnSort.field as keyof TopTrader] as number;
      const bVal = b[columnSort.field as keyof TopTrader] as number;

      if (columnSort.direction === 'asc') {
        return aVal - bVal;
      }
      return bVal - aVal;
    });
  }, [traders, columnSort]);

  // Pagination logic
  const totalPages = Math.ceil(sortedTraders.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedTraders = sortedTraders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handle column sort click
  const handleColumnSort = (field: SortField) => {
    setPage(1);
    if (columnSort.field === field) {
      // Toggle direction or reset
      if (columnSort.direction === 'desc') {
        setColumnSort({ field, direction: 'asc' });
      } else {
        setColumnSort({ field: null, direction: 'desc' });
      }
    } else {
      setColumnSort({ field, direction: 'desc' });
    }
  };

  // Get sort icon for column
  const getSortIcon = (field: SortField) => {
    if (columnSort.field !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    if (columnSort.direction === 'desc') {
      return <ArrowDown className="h-3 w-3 ml-1 text-brand-accent" />;
    }
    return <ArrowUp className="h-3 w-3 ml-1 text-brand-accent" />;
  };

  // Sortable column header component
  const SortableHeader = ({ field, children, align = 'left' }: { field: SortField; children: React.ReactNode; align?: 'left' | 'right' }) => (
    <TableHead className={`py-3 px-4 ${align === 'right' ? 'text-right' : ''}`}>
      <button
        onClick={() => handleColumnSort(field)}
        className={`inline-flex items-center gap-0.5 text-text-secondary text-[10px] font-semibold uppercase tracking-wider hover:text-white transition-colors ${
          columnSort.field === field ? 'text-brand-accent' : ''
        }`}
      >
        {children}
        {getSortIcon(field)}
      </button>
    </TableHead>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] glass-panel rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
          <span className="text-text-muted text-sm">Loading top traders...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 text-center">
          <p className="text-rose-400 text-sm mb-3">Failed to load top traders</p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="border-rose-500/50 text-rose-400 hover:bg-rose-500/10"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-accent/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-brand-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Top Traders 24h</h2>
            <p className="text-text-muted text-sm">
              {traders.length} traders
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border-subtle hover:bg-transparent">
              <TableHead className="py-3 px-4">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                  Rank
                </span>
              </TableHead>
              <TableHead className="py-3 px-4">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                  Trader
                </span>
              </TableHead>
              <SortableHeader field="tradeCount" align="right">Trades</SortableHeader>
              <SortableHeader field="totalVolume" align="right">Volume</SortableHeader>
              <SortableHeader field="winRate" align="right">Win Rate</SortableHeader>
              <SortableHeader field="totalPnl" align="right">PnL (24h)</SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTraders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-text-muted">
                  No traders data available
                </TableCell>
              </TableRow>
            ) : (
              paginatedTraders.map((trader, index) => (
                <TableRow
                  key={trader.user}
                  className="border-b border-border-subtle hover:bg-white/5 transition-colors"
                >
                  <TableCell className="py-3 px-4 text-sm text-white">
                    <span className="text-brand-gold font-semibold">#{startIndex + index + 1}</span>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Link
                      href={`/market/tracker/wallet/${trader.user}`}
                      className="text-sm text-brand-accent hover:underline font-mono"
                    >
                      {trader.user.slice(0, 6)}...{trader.user.slice(-4)}
                    </Link>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-white text-right">
                    {trader.tradeCount}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-white text-right">
                    ${formatLargeNumber(trader.totalVolume)}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-right">
                    <span className={trader.winRate >= 0.5 ? 'text-emerald-400' : 'text-zinc-400'}>
                      {(trader.winRate * 100).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-right">
                    <span className={trader.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {trader.totalPnl >= 0 ? '+' : ''}${formatLargeNumber(Math.abs(trader.totalPnl))}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-border-subtle flex items-center justify-between">
          <span className="text-text-muted text-xs">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 p-0 text-text-muted hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`h-8 w-8 p-0 text-sm ${
                      pageNum === page
                        ? 'bg-brand-accent/20 text-brand-accent'
                        : 'text-text-muted hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 p-0 text-text-muted hover:text-white disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
