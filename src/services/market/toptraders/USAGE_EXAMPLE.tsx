/**
 * EXEMPLE D'INTÉGRATION DU SERVICE TOP TRADERS
 *
 * Ce fichier montre comment utiliser le service toptraders dans un composant.
 * Il peut être supprimé une fois l'intégration réelle effectuée.
 */

import { useState } from 'react';
import { useTopTraders, TopTradersSortType } from '@/services/market/toptraders';
import { formatLargeNumber } from '@/lib/numberFormatting';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function TopTradersTable() {
  const [sort, setSort] = useState<TopTradersSortType>('pnl_pos');
  const [limit, setLimit] = useState(50);

  // Utilisation du hook
  const { traders, metadata, isLoading, error, refetch } = useTopTraders({
    sort,
    limit
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px] glass-panel">
        <div className="flex flex-col items-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand-accent mb-2" />
          <span className="text-text-muted text-sm">Loading top traders...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 text-center text-rose-400 text-sm backdrop-blur-md">
        Error: {error.message}
        <button
          onClick={() => refetch()}
          className="ml-2 underline hover:text-rose-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-4 items-center">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as TopTradersSortType)}
          className="glass-input px-3 py-2 rounded-lg text-sm"
        >
          <option value="pnl_pos">Top Profits</option>
          <option value="pnl_neg">Top Losses</option>
          <option value="volume">Top Volume</option>
          <option value="trades">Most Active</option>
        </select>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="glass-input px-3 py-2 rounded-lg text-sm"
        >
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
          <option value={50}>Top 50</option>
        </select>

        {metadata && (
          <div className="text-text-muted text-xs ml-auto">
            Last updated: {new Date(metadata.cachedAt).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="w-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border-subtle hover:bg-transparent">
                <TableHead className="py-3 px-3">
                  <span className="text-text-secondary text-label font-semibold uppercase tracking-wider">
                    Rank
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-text-secondary text-label font-semibold uppercase tracking-wider">
                    Trader
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3 text-right">
                  <span className="text-text-secondary text-label font-semibold uppercase tracking-wider">
                    Trades
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3 text-right">
                  <span className="text-text-secondary text-label font-semibold uppercase tracking-wider">
                    Volume
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3 text-right">
                  <span className="text-text-secondary text-label font-semibold uppercase tracking-wider">
                    Win Rate
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3 text-right">
                  <span className="text-text-secondary text-label font-semibold uppercase tracking-wider">
                    PnL (24h)
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {traders.map((trader, index) => (
                <TableRow
                  key={trader.user}
                  className="border-b border-border-subtle hover:bg-white/5 transition-colors"
                >
                  <TableCell className="py-3 px-3 text-sm text-white">
                    {index + 1}
                  </TableCell>
                  <TableCell className="py-3 px-3 text-sm text-white font-mono">
                    {trader.user.slice(0, 6)}...{trader.user.slice(-4)}
                  </TableCell>
                  <TableCell className="py-3 px-3 text-sm text-white text-right">
                    {trader.tradeCount}
                  </TableCell>
                  <TableCell className="py-3 px-3 text-sm text-white text-right">
                    ${formatLargeNumber(trader.totalVolume)}
                  </TableCell>
                  <TableCell className="py-3 px-3 text-sm text-right">
                    <span className={trader.winRate >= 0.5 ? 'text-emerald-400' : 'text-zinc-400'}>
                      {(trader.winRate * 100).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-3 text-sm text-right">
                    <span className={trader.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      ${formatLargeNumber(Math.abs(trader.totalPnl))}
                      {trader.totalPnl < 0 && ' loss'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

/**
 * EXEMPLE D'UTILISATION SIMPLE
 */
export function SimpleTopTradersExample() {
  const { traders, isLoading, error } = useTopTraders({
    sort: 'pnl_pos',
    limit: 10
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Top 10 Most Profitable Traders (24h)</h2>
      <ul>
        {traders.map((trader, index) => (
          <li key={trader.user}>
            #{index + 1} - {trader.user} - PnL: ${trader.totalPnl.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * EXEMPLE AVEC CHANGEMENT DE SORT
 */
export function DynamicSortExample() {
  const [sortType, setSortType] = useState<TopTradersSortType>('volume');

  const { traders, metadata } = useTopTraders({
    sort: sortType,
    limit: 20
  });

  return (
    <div>
      <div>
        <button onClick={() => setSortType('pnl_pos')}>Top Profits</button>
        <button onClick={() => setSortType('pnl_neg')}>Top Losses</button>
        <button onClick={() => setSortType('volume')}>Top Volume</button>
        <button onClick={() => setSortType('trades')}>Most Active</button>
      </div>

      {metadata && (
        <p>Showing {traders.length} traders, sorted by {metadata.sort}</p>
      )}

      {/* Affichage des traders... */}
    </div>
  );
}
