"use client";

import Link from "next/link";
import { useTopTraders } from "@/services/market/toptraders";
import { useActiveUsers } from "@/services/market/activeusers";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { Loader2, TrendingUp, DollarSign, Activity, Trophy, Crown, Zap } from "lucide-react";

/**
 * Barre de statistiques et wallets notables pour la home page du tracker
 * Combine les données Top Traders et Active Users
 */
export function TrackerStatsBar() {
  const { traders, isLoading: tradersLoading } = useTopTraders({
    sort: 'pnl_pos',
    limit: 50
  });

  const { traders: volumeTraders, isLoading: volumeLoading } = useTopTraders({
    sort: 'volume',
    limit: 1
  });

  const { traders: tradeCountTraders, isLoading: tradeCountLoading } = useTopTraders({
    sort: 'trades',
    limit: 1
  });

  const { users, isLoading: usersLoading } = useActiveUsers({
    hours: 24,
    limit: 100
  });

  const isLoading = tradersLoading || usersLoading || volumeLoading || tradeCountLoading;

  // Calculate aggregated stats
  const totalPnl24h = traders.reduce((sum, t) => sum + t.totalPnl, 0);
  const totalVolume24h = traders.reduce((sum, t) => sum + t.totalVolume, 0);
  const totalFills24h = users.reduce((sum, u) => sum + u.fill_count, 0);

  // Notable wallets
  const topPnlTrader = traders[0];
  const topVolumeTrader = volumeTraders[0];
  const topTradeCountTrader = tradeCountTraders[0];
  const mostActiveUser = users[0];

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Stats row
  const stats = [
    {
      label: "24h Volume",
      value: `$${formatLargeNumber(totalVolume24h)}`,
      icon: DollarSign,
      color: "text-brand-gold"
    },
    {
      label: "24h PnL (Top 50)",
      value: `+$${formatLargeNumber(totalPnl24h)}`,
      icon: TrendingUp,
      color: "text-emerald-400"
    },
    {
      label: "24h Fills",
      value: formatLargeNumber(totalFills24h),
      icon: Activity,
      color: "text-purple-400"
    }
  ];

  // Notable wallets
  const notableWallets = [
    {
      label: "Top PnL",
      icon: Crown,
      color: "text-brand-gold",
      bgColor: "bg-brand-gold/10",
      borderColor: "border-brand-gold/20",
      wallet: topPnlTrader,
      stat: topPnlTrader ? `+$${formatLargeNumber(topPnlTrader.totalPnl)}` : null,
      statColor: "text-emerald-400"
    },
    {
      label: "Top Volume",
      icon: DollarSign,
      color: "text-brand-accent",
      bgColor: "bg-brand-accent/10",
      borderColor: "border-brand-accent/20",
      wallet: topVolumeTrader,
      stat: topVolumeTrader ? `$${formatLargeNumber(topVolumeTrader.totalVolume)}` : null,
      statColor: "text-brand-accent"
    },
    {
      label: "Most Trades",
      icon: Zap,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/20",
      wallet: topTradeCountTrader,
      stat: topTradeCountTrader ? `${formatLargeNumber(topTradeCountTrader.tradeCount)} trades` : null,
      statColor: "text-purple-400"
    },
    {
      label: "Most Active",
      icon: Trophy,
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10",
      borderColor: "border-cyan-400/20",
      wallet: mostActiveUser ? { user: mostActiveUser.user } : null,
      stat: mostActiveUser ? `${formatLargeNumber(mostActiveUser.fill_count)} fills` : null,
      statColor: "text-cyan-400"
    }
  ];

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-brand-accent" />
          <span className="text-text-muted text-sm">Loading tracker stats...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass-panel rounded-xl p-4 flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg bg-white/5`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-text-muted text-[10px] uppercase tracking-wider">
                {stat.label}
              </span>
              <span className="text-lg font-semibold text-white">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Notable Wallets Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {notableWallets.map((item) => (
          <div
            key={item.label}
            className={`glass-panel rounded-xl p-4 border ${item.borderColor} ${item.bgColor}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className={`text-xs font-medium ${item.color}`}>
                {item.label}
              </span>
            </div>
            {item.wallet ? (
              <div className="flex flex-col gap-1">
                <Link
                  href={`/market/tracker/wallet/${item.wallet.user}`}
                  className="text-sm text-white hover:text-brand-accent transition-colors font-mono truncate"
                >
                  {truncateAddress(item.wallet.user)}
                </Link>
                <span className={`text-xs font-medium ${item.statColor}`}>
                  {item.stat}
                </span>
              </div>
            ) : (
              <span className="text-text-muted text-sm">No data</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
