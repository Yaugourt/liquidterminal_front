"use client";

import { memo, useMemo } from "react";
import { Building2 } from "lucide-react";
import { OverviewModule, ModuleRow, ModuleSubhead } from "../OverviewModule";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/** PerpDexModule — résumé de /market/perpdex (HIP-3) sur le Dashboard. */
export const PerpDexModule = memo(function PerpDexModule() {
  const { dexs, globalStats, isLoading } = usePerpDexMarketData();
  const { format } = useNumberFormat();

  const topDexs = useMemo(() => {
    return [...dexs].sort((a, b) => b.totalVolume24h - a.totalVolume24h).slice(0, 5);
  }, [dexs]);

  return (
    <OverviewModule
      title="PerpDexs (HIP-3)"
      icon={Building2}
      href="/market/perpdex"
      isLoading={isLoading}
      stats={[
        {
          label: "Perp Dexes",
          value:
            globalStats?.totalDexs != null
              ? formatNumber(globalStats.totalDexs, format, { maximumFractionDigits: 0 })
              : "—",
        },
        {
          label: "Markets",
          value:
            globalStats?.totalAssets != null
              ? formatNumber(globalStats.totalAssets, format, { maximumFractionDigits: 0 })
              : "—",
        },
        { label: "24h Volume", value: compactUsd(globalStats?.totalVolume24h) },
      ]}
    >
      <ModuleSubhead>Top by volume</ModuleSubhead>
      {topDexs.map((dex) => (
        <ModuleRow
          key={dex.name}
          href={`/market/perpdex/${dex.name}`}
          left={
            <>
              <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center text-[11px] font-semibold text-brand shrink-0">
                {dex.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-text-primary truncate">{dex.fullName}</span>
            </>
          }
          right={
            <span className="mono text-[12px] text-text-secondary">
              {compactUsd(dex.totalVolume24h)}
            </span>
          }
        />
      ))}
    </OverviewModule>
  );
});
