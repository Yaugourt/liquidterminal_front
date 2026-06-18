"use client";

import Link from "next/link";
import { useTopTraders } from "@/services/market/toptraders";
import { useActiveUsers } from "@/services/market/activeusers";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { TrendingUp, DollarSign, Activity, Trophy, Crown, Zap, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { StatsCard } from "@/components/common";

interface NotableWalletCardProps {
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  walletAddress: string | null;
  stat: string | null;
  statColor: string;
}

function NotableWalletCard({
  label,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  walletAddress,
  stat,
  statColor,
}: NotableWalletCardProps) {
  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  return (
    <Card className={`p-4 border ${borderColor} ${bgColor}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className={`text-xs font-medium ${color}`}>{label}</span>
      </div>
      {walletAddress ? (
        <div className="flex flex-col gap-1">
          <Link
            href={`/market/tracker/wallet/${walletAddress}`}
            className="text-sm text-text-primary hover:text-brand transition-colors truncate"
          >
            {truncate(walletAddress)}
          </Link>
          <span className={`text-xs font-medium ${statColor}`}>{stat}</span>
        </div>
      ) : (
        <span className="text-text-tertiary text-sm">No data</span>
      )}
    </Card>
  );
}

export function TrackerStatsBar() {
  const { traders, isLoading: tradersLoading } = useTopTraders({ sort: 'pnl_pos', limit: 50 });
  const { traders: volumeTraders, isLoading: volumeLoading } = useTopTraders({ sort: 'volume', limit: 1 });
  const { traders: tradeCountTraders, isLoading: tradeCountLoading } = useTopTraders({ sort: 'trades', limit: 1 });
  const { users, isLoading: usersLoading } = useActiveUsers({ hours: 24, limit: 100 });

  const isLoading = tradersLoading || usersLoading || volumeLoading || tradeCountLoading;

  const totalPnl24h = traders.reduce((sum, t) => sum + t.totalPnl, 0);
  const totalVolume24h = traders.reduce((sum, t) => sum + t.totalVolume, 0);
  const totalFills24h = users.reduce((sum, u) => sum + u.fill_count, 0);

  const topPnlTrader = traders[0];
  const topVolumeTrader = volumeTraders[0];
  const topTradeCountTrader = tradeCountTraders[0];
  const mostActiveUser = users[0];

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center gap-3">
          <InlineSpinner className="w-5 h-5 text-brand" />
          <span className="text-text-tertiary text-sm">Loading tracker stats...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <StatsCard
          icon={<DollarSign className="h-4 w-4 text-gold" />}
          iconClassName="bg-surface-2 rounded-lg"
          title="24h Volume"
          value={`$${formatLargeNumber(totalVolume24h)}`}
          valueClassName="text-lg font-semibold text-text-primary"
        />
        <StatsCard
          icon={<TrendingUp className="h-4 w-4 text-success" />}
          iconClassName="bg-surface-2 rounded-lg"
          title="24h PnL (Top 50)"
          value={`+$${formatLargeNumber(totalPnl24h)}`}
          valueClassName="text-lg font-semibold text-text-primary"
        />
        <StatsCard
          icon={<Activity className="h-4 w-4 text-brand" />}
          iconClassName="bg-surface-2 rounded-lg"
          title="24h Fills"
          value={formatLargeNumber(totalFills24h)}
          valueClassName="text-lg font-semibold text-text-primary"
        />
      </div>

      {/* Notable Wallets Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <NotableWalletCard
          label="Top PnL"
          icon={Crown}
          color="text-gold"
          bgColor="bg-gold/10"
          borderColor="border-gold/20"
          walletAddress={topPnlTrader?.user ?? null}
          stat={topPnlTrader ? `+$${formatLargeNumber(topPnlTrader.totalPnl)}` : null}
          statColor="text-success"
        />
        <NotableWalletCard
          label="Top Volume"
          icon={DollarSign}
          color="text-brand"
          bgColor="bg-brand/10"
          borderColor="border-brand/20"
          walletAddress={topVolumeTrader?.user ?? null}
          stat={topVolumeTrader ? `$${formatLargeNumber(topVolumeTrader.totalVolume)}` : null}
          statColor="text-brand"
        />
        <NotableWalletCard
          label="Most Trades"
          icon={Zap}
          color="text-brand"
          bgColor="bg-brand/10"
          borderColor="border-brand/20"
          walletAddress={topTradeCountTrader?.user ?? null}
          stat={topTradeCountTrader ? `${formatLargeNumber(topTradeCountTrader.tradeCount)} trades` : null}
          statColor="text-brand"
        />
        <NotableWalletCard
          label="Most Active"
          icon={Trophy}
          color="text-brand"
          bgColor="bg-brand/10"
          borderColor="border-brand/20"
          walletAddress={mostActiveUser?.user ?? null}
          stat={mostActiveUser ? `${formatLargeNumber(mostActiveUser.fill_count)} fills` : null}
          statColor="text-brand"
        />
      </div>
    </div>
  );
}
