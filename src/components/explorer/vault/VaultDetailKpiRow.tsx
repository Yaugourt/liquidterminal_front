"use client";

import { useMemo } from "react";
import { KpiRibbon, type KpiCell, type KpiTone } from "@/components/common";
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

  const ph = isLoading ? "…" : "—";
  const signedTone = (v: number | null | undefined): KpiTone =>
    v === null || v === undefined ? "default" : v >= 0 ? "success" : "danger";
  const signedPct = (v: number | null) =>
    v === null ? ph : `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;

  // Dense KPI ribbon (mockup B §detail). No icons, value + optional sub.
  // Commission is intentionally omitted — it already lives in the header meta
  // and the Vault metadata card (no duplicate stats).
  const cells: KpiCell[] = [
    { label: "TVL", value: isLoading && !kpis.tvl ? ph : compactUsd(kpis.tvl) },
    {
      label: "APR",
      value: kpis.apr !== null ? `${kpis.apr >= 0 ? "+" : ""}${kpis.apr.toFixed(2)}%` : ph,
      tone: signedTone(kpis.apr),
      sub: "annualized",
    },
    { label: "24h Δ", value: signedPct(kpis.delta24h), tone: signedTone(kpis.delta24h) },
    { label: "7d Δ", value: signedPct(kpis.delta7d), tone: signedTone(kpis.delta7d) },
    {
      label: "All-Time PnL",
      value: kpis.allTimePnl
        ? `${kpis.allTimePnl >= 0 ? "+" : "-"}${compactUsd(Math.abs(kpis.allTimePnl))}`
        : ph,
      tone: signedTone(kpis.allTimePnl || null),
      sub: "cumulative",
    },
    { label: "Followers", value: kpis.followers ? kpis.followers.toLocaleString() : ph },
    {
      label: "Sharpe · 90d",
      value: kpis.sharpe ? kpis.sharpe.value.toFixed(2) : ph,
      sub: kpis.sharpe ? `vol ${kpis.sharpe.vol.toFixed(1)}%` : undefined,
    },
  ];

  return <KpiRibbon cells={cells} />;
}
