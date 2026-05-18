"use client";

import { memo } from "react";
import {
  Users,
  BarChart3,
  Layers,
  Receipt,
  ArrowLeftRight,
  Shield,
  Vault,
  Flame,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDashboardStats } from "@/services/dashboard";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats";
import { useLiquidations24h } from "@/services/dashboard/hooks/useLiquidations24h";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/**
 * PulseStrip — la bande de KPI d'en-tête du Dashboard.
 *
 * Agrège les indicateurs « santé de l'écosystème » dispersés dans plusieurs
 * services (dashboard stats, perp global, fees, liquidations) en une seule
 * lecture d'un coup d'œil. Aucune donnée inventée : chaque valeur (et chaque
 * sous-ligne) vient d'un champ réel d'API.
 */

interface KpiProps {
  label: string;
  icon: LucideIcon;
  value: string;
  /** Sous-ligne contextuelle (donnée réelle uniquement). */
  sub?: React.ReactNode;
  loading: boolean;
}

const KpiCell = memo(function KpiCell({ label, icon: Icon, value, sub, loading }: KpiProps) {
  return (
    <div className="bg-surface border border-border-subtle rounded-lg px-3.5 py-3 transition-colors hover:border-border-default">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary font-medium">
          {label}
        </span>
        <Icon size={13} className="text-text-tertiary shrink-0" />
      </div>
      <div className="mono text-[20px] leading-none font-semibold text-text-primary">
        {loading ? <span className="text-text-tertiary">…</span> : value}
      </div>
      {sub && <div className="mt-1.5 text-[11px] text-text-tertiary">{sub}</div>}
    </div>
  );
});

export const PulseStrip = memo(function PulseStrip() {
  const { stats: dash, isLoading: dashLoading, error } = useDashboardStats();
  const { stats: perp, isLoading: perpLoading } = usePerpGlobalStats();
  const { feesStats, isLoading: feesLoading } = useFeesStats();
  const { stats: liq, isLoading: liqLoading } = useLiquidations24h(30000);
  const { format } = useNumberFormat();

  const count = (n: number | undefined | null) =>
    n == null ? "—" : formatNumber(n, format, { maximumFractionDigits: 0 });

  if (error) {
    return (
      <Card className="px-3.5 py-3 text-center text-danger text-sm">
        Failed to load ecosystem stats — {error.message}
      </Card>
    );
  }

  // Liquidations 24h — répartition Long/Short (donnée réelle)
  const lsTotal = liq.longCount + liq.shortCount;
  const longPct = lsTotal > 0 ? (liq.longCount / lsTotal) * 100 : 50;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
      <KpiCell
        label="Users"
        icon={Users}
        value={count(dash?.numberOfUsers)}
        loading={dashLoading}
      />
      <KpiCell
        label="24h Volume"
        icon={BarChart3}
        value={compactUsd(dash?.dailyVolume)}
        loading={dashLoading}
      />
      <KpiCell
        label="Open Interest"
        icon={Layers}
        value={compactUsd(perp?.totalOpenInterest)}
        sub={
          perp?.hlpTvl != null ? (
            <span>
              HLP TVL <span className="mono text-text-secondary">{compactUsd(perp.hlpTvl)}</span>
            </span>
          ) : undefined
        }
        loading={perpLoading}
      />
      <KpiCell
        label="24h Fees"
        icon={Receipt}
        value={compactUsd(feesStats?.dailyFees)}
        sub={
          feesStats?.dailySpotFees != null ? (
            <span>
              Spot <span className="mono text-text-secondary">{compactUsd(feesStats.dailySpotFees)}</span>
            </span>
          ) : undefined
        }
        loading={feesLoading}
      />
      <KpiCell
        label="Bridged USDC"
        icon={ArrowLeftRight}
        value={compactUsd(dash?.bridgedUsdc)}
        loading={dashLoading}
      />
      <KpiCell
        label="HYPE Staked"
        icon={Shield}
        value={dash?.totalHypeStake != null ? `${count(dash.totalHypeStake)}` : "—"}
        sub={<span className="text-text-tertiary">HYPE</span>}
        loading={dashLoading}
      />
      <KpiCell
        label="Vaults TVL"
        icon={Vault}
        value={compactUsd(dash?.vaultsTvl)}
        loading={dashLoading}
      />
      <KpiCell
        label="Liquidations 24h"
        icon={Flame}
        value={compactUsd(liq.totalVolume)}
        sub={
          <div className="space-y-1">
            <div className="h-1 rounded-full bg-danger/70 overflow-hidden">
              <div
                className="h-full bg-success/80 transition-all duration-500"
                style={{ width: `${longPct}%` }}
              />
            </div>
            <div className="flex justify-between mono text-[10px]">
              <span className="text-success">{longPct.toFixed(0)}% L</span>
              <span className="text-text-tertiary">{count(liq.liquidationsCount)} liqs</span>
              <span className="text-danger">{(100 - longPct).toFixed(0)}% S</span>
            </div>
          </div>
        }
        loading={liqLoading}
      />
    </div>
  );
});
