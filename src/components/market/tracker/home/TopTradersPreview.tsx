"use client";

import Link from "next/link";
import { useTopTraders } from "@/services/market/toptraders";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { Loader2, TrendingUp, ArrowRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

/**
 * Composant preview des Top Traders 24h pour la home page du tracker
 * Affiche les 10 traders les plus profitables des dernières 24h
 */
export function TopTradersPreview() {
  const { traders, isLoading, error, refetch } = useTopTraders({
    sort: 'pnl_pos',
    limit: 10
  });

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
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-accent/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-brand-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Top Traders 24h</h2>
            <p className="text-text-muted text-sm">Most profitable traders</p>
          </div>
        </div>
        <Link href="/market/tracker/top-traders">
          <Button
            variant="ghost"
            size="sm"
            className="text-brand-accent hover:text-brand-accent hover:bg-brand-accent/10"
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
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
            {traders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-text-muted">
                  No traders data available
                </TableCell>
              </TableRow>
            ) : (
              traders.map((trader, index) => (
                <TableRow
                  key={trader.user}
                  className="border-b border-border-subtle hover:bg-white/5 transition-colors"
                >
                  <TableCell className="py-3 px-4 text-sm text-white">
                    <div className="flex items-center gap-2">
                      <span className="text-brand-gold font-semibold">#{index + 1}</span>
                    </div>
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
                    <span className="text-emerald-400 font-semibold">
                      +${formatLargeNumber(trader.totalPnl)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
