"use client";

import { useMemo } from "react";
import { DollarSign, TrendingUp, BarChart2, Percent, Users, Activity, Calendar, Sigma } from "lucide-react";
import { StatsCard } from "@/components/common";
import { useVaultEquitySnapshots } from "@/services/explorer/vault/hooks/useVaultEquitySnapshots";
import { useVaultIndexerDetails } from "@/services/explorer/vault/hooks/useVaultIndexerDetails";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { compactUsd } from "@/lib/formatters/numberFormatting";

interface VaultDetailKpiRowProps {
  vaultAddress: string;
  isLoading?: boolean;
}

const DAY_MS = 86_400_000;
const SHARPE_MIN_POINTS = 30;
const SHARPE_WINDOW_DAYS = 90;
/** Equity snapshots are sub-daily, so we down-sample to one point per day. */
const SHARPE_BUCKET_MS = DAY_MS;

function lookupAtOrBefore<T extends { time: number }>(arr: T[], cutoff: number): T | undefined {
  // arr is sorted newest → oldest; return the first sample at or before cutoff.
  return arr.find((s) => s.time <= cutoff);
}

interface Sharpe {
  value: number;
  vol: number;
  pointsUsed: number;
}

/**
 * Down-samples sub-daily equity snapshots to one point per day, then computes
 * annualised Sharpe over the last `SHARPE_WINDOW_DAYS` days.
 * Returns null when there are fewer than `SHARPE_MIN_POINTS` daily returns.
 */
function computeSharpe(snapshots: Array<{ time: number; accountValue: number }>): Sharpe | null {
  if (snapshots.length < SHARPE_MIN_POINTS) return null;

  // snapshots are newest-first; reverse to chronological, down-sample to daily.
  const chronological = [...snapshots].reverse();
  const byDay = new Map<number, number>();
  for (const s of chronological) {
    const bucket = Math.floor(s.time / SHARPE_BUCKET_MS) * SHARPE_BUCKET_MS;
    // Last sample of the day wins.
    byDay.set(bucket, s.accountValue);
  }
  const daily = Array.from(byDay.entries()).sort((a, b) => a[0] - b[0]);
  if (daily.length < SHARPE_MIN_POINTS + 1) return null;

  // Keep only the trailing window.
  const tail = daily.slice(-SHARPE_WINDOW_DAYS - 1);
  const returns: number[] = [];
  for (let i = 1; i < tail.length; i++) {
    const prev = tail[i - 1][1];
    const curr = tail[i][1];
    if (prev > 0) returns.push((curr - prev) / prev);
  }
  if (returns.length < SHARPE_MIN_POINTS) return null;

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((acc, r) => acc + (r - mean) ** 2, 0) / (returns.length - 1);
  const std = Math.sqrt(variance);
  if (std === 0) return null;

  const sharpe = (mean / std) * Math.sqrt(365);
  const vol = std * Math.sqrt(365) * 100;
  return { value: sharpe, vol, pointsUsed: returns.length };
}

export function VaultDetailKpiRow({ vaultAddress, isLoading: parentLoading }: VaultDetailKpiRowProps) {
  const { snapshots, isLoading: snapsLoading } = useVaultEquitySnapshots({
    vaultAddress,
    limit: 500,
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

    const computeDelta = (windowMs: number): number | null => {
      if (!latest || snapshots.length < 2) return null;
      const past = lookupAtOrBefore(snapshots, latest.time - windowMs);
      if (!past || past.accountValue <= 0) return null;
      return ((latest.accountValue - past.accountValue) / past.accountValue) * 100;
    };

    const delta24h = computeDelta(DAY_MS);
    const delta7d = computeDelta(DAY_MS * 7);
    const sharpe = computeSharpe(snapshots);
    const commission = details?.leaderCommission;

    return { tvl, allTimePnl, apr, followers, delta24h, delta7d, sharpe, commission };
  }, [snapshots, vaults, vaultAddress, details]);

  const signedClass = (v: number | null) =>
    v === null
      ? undefined
      : v >= 0
        ? "text-success font-bold tabular-nums"
        : "text-danger font-bold tabular-nums";

  const cards: Array<{
    title: string;
    value: string;
    valueClassName?: string;
    icon: React.ReactNode;
    iconClassName?: string;
    titleAttr?: string;
  }> = [
    {
      title: "TVL",
      value: compactUsd(kpis.tvl),
      icon: <DollarSign className="w-4 h-4 text-brand" />,
    },
    {
      title: "24h Δ",
      value:
        kpis.delta24h !== null
          ? `${kpis.delta24h >= 0 ? "+" : ""}${kpis.delta24h.toFixed(2)}%`
          : "—",
      valueClassName: signedClass(kpis.delta24h),
      icon: <Activity className="w-4 h-4 text-brand" />,
    },
    {
      title: "7d Δ",
      value:
        kpis.delta7d !== null
          ? `${kpis.delta7d >= 0 ? "+" : ""}${kpis.delta7d.toFixed(2)}%`
          : "—",
      valueClassName: signedClass(kpis.delta7d),
      icon: <Calendar className="w-4 h-4 text-brand" />,
    },
    {
      title: "APR",
      value: kpis.apr !== null ? `${kpis.apr.toFixed(2)}%` : "—",
      valueClassName: signedClass(kpis.apr),
      icon: <Percent className="w-4 h-4 text-gold" />,
      iconClassName: "bg-gold/10",
    },
    {
      title: "All-Time PnL",
      value: kpis.allTimePnl
        ? `${kpis.allTimePnl >= 0 ? "+" : "-"}${compactUsd(Math.abs(kpis.allTimePnl))}`
        : "—",
      valueClassName: signedClass(kpis.allTimePnl ? kpis.allTimePnl : null),
      icon: <TrendingUp className="w-4 h-4 text-success" />,
      iconClassName: "bg-success/10",
    },
    {
      title: "Followers",
      value: kpis.followers ? kpis.followers.toLocaleString() : "—",
      icon: <Users className="w-4 h-4 text-brand" />,
    },
    {
      title: "Sharpe (90d)",
      value: kpis.sharpe ? kpis.sharpe.value.toFixed(2) : "—",
      titleAttr: kpis.sharpe
        ? `Annualised · vol ${kpis.sharpe.vol.toFixed(1)}% · ${kpis.sharpe.pointsUsed} daily returns`
        : `Insufficient history (need ≥${SHARPE_MIN_POINTS} days)`,
      icon: <Sigma className="w-4 h-4 text-brand" />,
    },
    {
      title: "Commission",
      value: kpis.commission !== undefined ? `${(kpis.commission * 100).toFixed(0)}%` : "—",
      icon: <BarChart2 className="w-4 h-4 text-gold" />,
      iconClassName: "bg-gold/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
      {cards.map((card) => (
        <div key={card.title} title={card.titleAttr}>
          <StatsCard
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconClassName={card.iconClassName}
            valueClassName={card.valueClassName}
            isLoading={isLoading}
            density="compact"
          />
        </div>
      ))}
    </div>
  );
}
