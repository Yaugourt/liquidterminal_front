"use client";

import { useMemo } from "react";
import { Gauge } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KpiRibbon, Skeleton, type KpiCell, type KpiTone } from "@/components/common";
import { useVaultDailySnapshots } from "@/services/explorer/vault/hooks/useVaultDailySnapshots";

const DAY_MS = 86_400_000;
// Vaults run 24/7, so annualize daily returns on calendar days, not 252.
const CALENDAR_DAYS = 365;
// A Sharpe from fewer than ~2 weeks of returns is noise, not a grade.
const MIN_RETURNS = 14;

interface VaultRiskCardProps {
  vaultAddress: string;
}

interface RiskStats {
  sharpe: number | null;
  maxDrawdown: number; // negative fraction, e.g. -0.12
  cagr: number | null;
  days: number;
  grade: { letter: string; tone: KpiTone } | null;
}

function gradeFromSharpe(s: number): { letter: string; tone: KpiTone } {
  if (s >= 2) return { letter: "A", tone: "success" };
  if (s >= 1) return { letter: "B", tone: "success" };
  if (s >= 0.5) return { letter: "C", tone: "gold" };
  if (s >= 0) return { letter: "D", tone: "default" };
  return { letter: "E", tone: "danger" };
}

/**
 * Risk grade for a vault, computed front-side from its daily snapshots. Returns
 * are flow-adjusted (day PnL ÷ prior equity, the same ΔtotalRawPnl basis the
 * Daily PnL chart uses) so deposits and withdrawals don't masquerade as
 * performance. Sharpe is annualized (rf 0), Max drawdown and CAGR come off the
 * compounded performance index.
 */
export function VaultRiskCard({ vaultAddress }: VaultRiskCardProps) {
  const { snapshots, isLoading } = useVaultDailySnapshots({ vaultAddress, limit: 365 });

  const stats = useMemo<RiskStats | null>(() => {
    if (snapshots.length < MIN_RETURNS + 1) return null;
    // Snapshots arrive newest-first; reverse to chronological for delta math.
    const series = [...snapshots].reverse();

    const returns: number[] = [];
    for (let i = 1; i < series.length; i++) {
      const prevEquity = series[i - 1].accountValue;
      if (!(prevEquity > 0)) continue;
      const dayPnl = series[i].totalRawPnl - series[i - 1].totalRawPnl;
      const r = dayPnl / prevEquity;
      if (Number.isFinite(r)) returns.push(r);
    }
    if (returns.length < MIN_RETURNS) return null;

    const n = returns.length;
    const mean = returns.reduce((a, b) => a + b, 0) / n;
    const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1);
    const std = Math.sqrt(variance);
    const sharpe = std > 0 ? (mean / std) * Math.sqrt(CALENDAR_DAYS) : null;

    // Compounded performance index → drawdown + CAGR.
    let pi = 1;
    let peak = 1;
    let maxDrawdown = 0;
    for (const r of returns) {
      pi *= 1 + r;
      if (pi > peak) peak = pi;
      const dd = peak > 0 ? (pi - peak) / peak : 0;
      if (dd < maxDrawdown) maxDrawdown = dd;
    }

    const spanMs = series[series.length - 1].time - series[0].time;
    const days = spanMs > 0 ? spanMs / DAY_MS : n;
    const cagr = pi > 0 && days > 0 ? Math.pow(pi, CALENDAR_DAYS / days) - 1 : null;

    return {
      sharpe,
      maxDrawdown,
      cagr,
      days: Math.round(days),
      grade: sharpe != null ? gradeFromSharpe(sharpe) : null,
    };
  }, [snapshots]);

  const cells: KpiCell[] = stats
    ? [
        {
          label: "Sharpe",
          value: stats.sharpe == null ? "—" : stats.sharpe.toFixed(2),
          sub: "annualized",
          tone:
            stats.sharpe == null
              ? "default"
              : stats.sharpe >= 1
                ? "success"
                : stats.sharpe < 0
                  ? "danger"
                  : "default",
        },
        {
          label: "Max drawdown",
          value: `${(stats.maxDrawdown * 100).toFixed(1)}%`,
          sub: "peak-to-trough",
          tone: "danger",
        },
        {
          label: "CAGR",
          value:
            stats.cagr == null
              ? "—"
              : `${stats.cagr >= 0 ? "+" : ""}${(stats.cagr * 100).toFixed(1)}%`,
          sub: "annualized",
          tone: stats.cagr == null ? "default" : stats.cagr >= 0 ? "success" : "danger",
        },
      ]
    : [];

  const gradeChipClass = (tone: KpiTone) =>
    tone === "success"
      ? "bg-success/10 text-success border-success/20"
      : tone === "danger"
        ? "bg-danger/10 text-danger border-danger/20"
        : tone === "gold"
          ? "bg-gold/10 text-gold border-gold/20"
          : "bg-surface-2 text-text-secondary border-border-subtle";

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Gauge size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Risk profile</h3>
        {stats?.grade && (
          <span
            className={`ml-auto text-xs font-semibold px-1.5 py-0.5 rounded border ${gradeChipClass(
              stats.grade.tone,
            )}`}
          >
            Grade {stats.grade.letter}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="p-3">
          <Skeleton className="h-16 rounded" />
        </div>
      ) : !stats ? (
        <div className="px-3.5 py-4 text-xs text-text-tertiary">
          Not enough history to grade this vault (need ≥ {MIN_RETURNS} daily points).
        </div>
      ) : (
        <>
          <KpiRibbon cells={cells} />
          <div className="px-3.5 py-2 text-[10px] text-text-tertiary border-t border-border-subtle">
            Flow-adjusted from daily PnL over {stats.days}d · excludes deposits/withdrawals · rf 0%
          </div>
        </>
      )}
    </Card>
  );
}
