"use client";

import { useTopTraders } from "@/services/market/toptraders";
import { useActiveUsers } from "@/services/market/activeusers";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { Loader2, TrendingUp, Users, DollarSign, Activity } from "lucide-react";

/**
 * Barre de statistiques agrégées pour la home page du tracker
 * Combine les données Top Traders et Active Users
 */
export function TrackerStatsBar() {
  const { traders, isLoading: tradersLoading } = useTopTraders({
    sort: 'pnl_pos',
    limit: 50
  });

  const { users, metadata: activeMetadata, isLoading: usersLoading } = useActiveUsers({
    hours: 24,
    limit: 100
  });

  const isLoading = tradersLoading || usersLoading;

  // Calculate aggregated stats
  const totalPnl24h = traders.reduce((sum, t) => sum + t.totalPnl, 0);
  const totalVolume24h = traders.reduce((sum, t) => sum + t.totalVolume, 0);
  const totalTrades24h = traders.reduce((sum, t) => sum + t.tradeCount, 0);
  const avgWinRate = traders.length > 0
    ? traders.reduce((sum, t) => sum + t.winRate, 0) / traders.length
    : 0;
  const totalActiveUsers = activeMetadata?.totalCount || users.length;
  const totalFills24h = users.reduce((sum, u) => sum + u.fill_count, 0);

  const stats = [
    {
      label: "Active Traders",
      value: isLoading ? null : formatLargeNumber(totalActiveUsers),
      icon: Users,
      color: "text-brand-accent"
    },
    {
      label: "24h Volume",
      value: isLoading ? null : `$${formatLargeNumber(totalVolume24h)}`,
      icon: DollarSign,
      color: "text-brand-gold"
    },
    {
      label: "24h PnL (Top 50)",
      value: isLoading ? null : `+$${formatLargeNumber(totalPnl24h)}`,
      icon: TrendingUp,
      color: "text-emerald-400"
    },
    {
      label: "Total Trades",
      value: isLoading ? null : formatLargeNumber(totalTrades24h),
      icon: Activity,
      color: "text-purple-400"
    },
    {
      label: "Total Fills",
      value: isLoading ? null : formatLargeNumber(totalFills24h),
      icon: Activity,
      color: "text-cyan-400"
    },
    {
      label: "Avg Win Rate",
      value: isLoading ? null : `${(avgWinRate * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: avgWinRate >= 0.5 ? "text-emerald-400" : "text-rose-400"
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass-panel rounded-xl p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
            <span className="text-text-muted text-xs uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
          <div className="text-xl font-semibold text-white">
            {stat.value === null ? (
              <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
            ) : (
              stat.value
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
