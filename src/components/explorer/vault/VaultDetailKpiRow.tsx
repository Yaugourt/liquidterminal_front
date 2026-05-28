"use client";

import { useMemo } from "react";
import { DollarSign, TrendingUp, BarChart2, Percent, Users, Activity, Calendar } from "lucide-react";
import { StatsCard } from "@/components/common";
import { useVaultEquitySnapshots } from "@/services/explorer/vault/hooks/useVaultEquitySnapshots";
import { useVaultIndexerDetails } from "@/services/explorer/vault/hooks/useVaultIndexerDetails";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";

interface VaultDetailKpiRowProps {
  vaultAddress: string;
  isLoading?: boolean;
}

const DAY_MS = 86_400_000;

export function VaultDetailKpiRow({ vaultAddress, isLoading: parentLoading }: VaultDetailKpiRowProps) {
  const { snapshots, isLoading: snapsLoading } = useVaultEquitySnapshots({
    vaultAddress,
    limit: 200,
  });

  const { vaults, isLoading: vaultsLoading } = useVaults({ limit: 1000 });
  const { details, isLoading: detailsLoading } = useVaultIndexerDetails({ vaultAddress });

  const isLoading = parentLoading || snapsLoading || vaultsLoading || detailsLoading;

  const kpis = useMemo(() => {
    const latest = snapshots[0];
    const tvl = latest?.accountValue ?? 0;
    const allTimePnl = latest?.totalRawPnl ?? 0;
    const followers = latest?.followerCount ?? details?.followerCount ?? 0;

    const matched = vaults.find(
      (v) => v.summary.vaultAddress.toLowerCase() === vaultAddress.toLowerCase()
    );
    const apr = matched ? matched.apr : null;

    let delta24h: number | null = null;
    if (snapshots.length > 1 && latest) {
      const cutoff = latest.time - DAY_MS;
      const past = snapshots.find((s) => s.time <= cutoff);
      if (past && past.accountValue > 0) {
        delta24h = ((latest.accountValue - past.accountValue) / past.accountValue) * 100;
      }
    }

    const commission = details?.leaderCommission;

    return { tvl, allTimePnl, apr, followers, delta24h, commission };
  }, [snapshots, vaults, vaultAddress, details]);

  const cards = [
    {
      title: "TVL",
      value: `$${formatLargeNumber(kpis.tvl, { decimals: 2 })}`,
      icon: <DollarSign className="w-4 h-4 text-brand" />,
    },
    {
      title: "24h Δ",
      value:
        kpis.delta24h !== null
          ? `${kpis.delta24h >= 0 ? "+" : ""}${kpis.delta24h.toFixed(2)}%`
          : "—",
      valueClassName:
        kpis.delta24h !== null
          ? kpis.delta24h >= 0
            ? "text-success font-bold tabular-nums"
            : "text-danger font-bold tabular-nums"
          : undefined,
      icon: <Activity className="w-4 h-4 text-brand" />,
    },
    {
      title: "APR",
      value: kpis.apr !== null ? `${kpis.apr.toFixed(2)}%` : "—",
      valueClassName:
        kpis.apr !== null
          ? kpis.apr >= 0
            ? "text-success font-bold tabular-nums"
            : "text-danger font-bold tabular-nums"
          : undefined,
      icon: <Percent className="w-4 h-4 text-gold" />,
      iconClassName: "bg-gold/10",
    },
    {
      title: "All-Time PnL",
      value: kpis.allTimePnl
        ? `${kpis.allTimePnl >= 0 ? "+" : "-"}$${formatLargeNumber(Math.abs(kpis.allTimePnl), { decimals: 2 })}`
        : "—",
      valueClassName: kpis.allTimePnl
        ? kpis.allTimePnl >= 0
          ? "text-success font-bold tabular-nums"
          : "text-danger font-bold tabular-nums"
        : undefined,
      icon: <TrendingUp className="w-4 h-4 text-success" />,
      iconClassName: "bg-success/10",
    },
    {
      title: "Followers",
      value: kpis.followers ? kpis.followers.toLocaleString() : "—",
      icon: <Users className="w-4 h-4 text-brand" />,
    },
    {
      title: "Commission",
      value: kpis.commission !== undefined ? `${(kpis.commission * 100).toFixed(0)}%` : "—",
      icon: <BarChart2 className="w-4 h-4 text-gold" />,
      iconClassName: "bg-gold/10",
    },
    {
      title: "Positions",
      value: snapshots[0]?.nPositions != null ? snapshots[0].nPositions.toString() : "—",
      icon: <Calendar className="w-4 h-4 text-brand" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
      {cards.map((card) => (
        <StatsCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          iconClassName={card.iconClassName}
          valueClassName={card.valueClassName}
          isLoading={isLoading}
          density="compact"
        />
      ))}
    </div>
  );
}
