"use client";

import { useState } from "react";
import Link from "next/link";
import { useTopTraders } from "@/services/market/toptraders";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { Loader2, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TopTradersSortType } from "@/services/market/toptraders";

const ITEMS_PER_PAGE = 10;

/**
 * Composant Top Traders avec pagination pour la home page du tracker
 * Affiche les traders avec différents filtres de tri
 */
export function TopTradersPreview() {
  const [sort, setSort] = useState<TopTradersSortType>('pnl_pos');
  const [page, setPage] = useState(1);

  const { traders, isLoading, error, refetch } = useTopTraders({
    sort,
    limit: 50
  });

  // Pagination logic
  const totalPages = Math.ceil(traders.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedTraders = traders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page when sort changes
  const handleSortChange = (newSort: TopTradersSortType) => {
    setSort(newSort);
    setPage(1);
  };

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
        <Select value={sort} onValueChange={(val) => handleSortChange(val as TopTradersSortType)}>
          <SelectTrigger className="w-[140px] bg-brand-secondary/40 border-border-subtle text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pnl_pos">Top PnL</SelectItem>
            <SelectItem value="pnl_neg">Worst PnL</SelectItem>
            <SelectItem value="volume">Top Volume</SelectItem>
            <SelectItem value="trades">Most Trades</SelectItem>
          </SelectContent>
        </Select>
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
              <TableHead className="py-3 px-4 text-right">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                  Trades
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 text-right">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                  Volume
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 text-right">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                  Win Rate
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 text-right">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                  PnL (24h)
                </span>
              </TableHead>
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 p-0 text-sm ${
                    p === page
                      ? 'bg-brand-accent/20 text-brand-accent'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  {p}
                </Button>
              ))}
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
