"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { useDashboardStats } from "@/services/dashboard";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { useSpotGlobalStats } from "@/services/market/spot/hooks/useSpotGlobalStats";
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/**
 * HeroPulse — l'en-tête « cockpit » du Dashboard.
 *
 * Un seul chiffre héros (volume 24h de l'écosystème) + 4 KPI secondaires
 * calmes. Pas un mur de cartes : la hiérarchie est portée par la taille.
 * Données 100 % réelles — pas de delta inventé.
 */
export const HeroPulse = memo(function HeroPulse() {
  const { stats: dash, isLoading } = useDashboardStats();
  const { stats: perp } = usePerpGlobalStats();
  const { stats: spot } = useSpotGlobalStats();
  const { feesStats } = useFeesStats();
  const { format } = useNumberFormat();

  const secondary = [
    { label: "Vaults TVL", value: compactUsd(dash?.vaultsTvl) },
    { label: "Open Interest", value: compactUsd(perp?.totalOpenInterest) },
    { label: "24h Fees", value: compactUsd(feesStats?.dailyFees) },
    {
      label: "Users",
      value:
        dash?.numberOfUsers != null
          ? formatNumber(dash.numberOfUsers, format, { maximumFractionDigits: 0 })
          : "—",
    },
  ];

  return (
    <Card className="px-5 py-5">
      {/* Chiffre héros */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] uppercase tracking-[0.1em] text-text-tertiary font-medium">
          24h Ecosystem Volume
        </span>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="mono text-[40px] leading-none font-semibold text-text-primary">
            {isLoading ? "…" : compactUsd(dash?.dailyVolume)}
          </span>
          <span className="text-[12px] text-text-tertiary">
            Perp <span className="mono text-text-secondary">{compactUsd(perp?.totalVolume24h)}</span>
            <span className="mx-1.5">·</span>
            Spot <span className="mono text-text-secondary">{compactUsd(spot?.totalVolume24h)}</span>
          </span>
        </div>
      </div>

      {/* KPI secondaires */}
      <div className="mt-4 pt-4 border-t border-border-subtle grid grid-cols-2 sm:grid-cols-4 gap-4">
        {secondary.map((s) => (
          <div key={s.label}>
            <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary font-medium mb-1">
              {s.label}
            </div>
            <div className="mono text-[16px] font-semibold text-text-primary">{s.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
});
