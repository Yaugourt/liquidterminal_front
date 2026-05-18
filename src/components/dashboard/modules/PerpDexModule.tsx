"use client";

import { memo, useMemo } from "react";
import { Building2 } from "lucide-react";
import { OverviewModule, ModuleRow } from "../OverviewModule";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/** PerpDexModule — résumé de /market/perpdex (HIP-3) sur le Dashboard. */
export const PerpDexModule = memo(function PerpDexModule() {
  const { dexs, globalStats, isLoading } = usePerpDexMarketData();
  const { format } = useNumberFormat();

  const intFmt = (v: number | null | undefined) =>
    v != null ? formatNumber(v, format, { maximumFractionDigits: 0 }) : "—";

  const topDexs = useMemo(() => {
    return [...dexs].sort((a, b) => b.totalVolume24h - a.totalVolume24h).slice(0, 7);
  }, [dexs]);

  return (
    <OverviewModule
      title="PerpDexs (HIP-3)"
      icon={Building2}
      href="/market/perpdex"
      isLoading={isLoading}
      stats={[
        { label: "Perp Dexes", value: intFmt(globalStats?.totalDexs) },
        { label: "Markets", value: intFmt(globalStats?.totalAssets) },
        { label: "24h Volume", value: compactUsd(globalStats?.totalVolume24h) },
        { label: "Open Interest", value: compactUsd(globalStats?.totalOpenInterest) },
      ]}
    >
      {/* En-tête de colonnes */}
      <div className="flex items-center gap-3 px-4 pt-2.5 pb-1.5 text-[9px] uppercase tracking-[0.08em] text-text-tertiary font-medium border-b border-border-subtle">
        <span className="flex-1 min-w-0">Dex</span>
        <span className="w-[52px] text-right">Markets</span>
        <span className="w-[68px] text-right">Vol 24h</span>
        <span className="w-[68px] text-right">OI</span>
      </div>
      {isLoading && topDexs.length === 0 && (
        <div className="px-4 py-2 text-[12px] text-text-tertiary">…</div>
      )}
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
            <>
              <span className="mono text-[12px] text-text-secondary w-[52px] text-right">
                {intFmt(dex.totalAssets)}
              </span>
              <span className="mono text-[12px] text-text-secondary w-[68px] text-right">
                {compactUsd(dex.totalVolume24h)}
              </span>
              <span className="mono text-[12px] text-text-secondary w-[68px] text-right">
                {compactUsd(dex.totalOpenInterest)}
              </span>
            </>
          }
        />
      ))}
    </OverviewModule>
  );
});
