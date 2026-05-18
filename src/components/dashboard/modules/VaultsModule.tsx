"use client";

import { memo, useMemo } from "react";
import { Vault } from "lucide-react";
import { OverviewModule, ModuleRow } from "../OverviewModule";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import {
  compactUsd,
  formatNumber,
  truncateAddress,
} from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/** VaultsModule — résumé de /explorer/vaults sur le Dashboard. */
export const VaultsModule = memo(function VaultsModule() {
  const { vaults, totalTvl, totalCount, isLoading } = useVaults({
    limit: 1000,
    sortBy: "tvl",
  });
  const { format } = useNumberFormat();

  const topVaults = useMemo(() => vaults.slice(0, 7), [vaults]);

  // APR moyen — pondéré par TVL pour refléter le poids réel des vaults.
  const avgApr = useMemo(() => {
    let weightedApr = 0;
    let tvlSum = 0;
    for (const v of vaults) {
      const tvl = parseFloat(v.summary.tvl) || 0;
      if (tvl <= 0) continue;
      weightedApr += v.apr * tvl;
      tvlSum += tvl;
    }
    return tvlSum > 0 ? weightedApr / tvlSum : 0;
  }, [vaults]);

  return (
    <OverviewModule
      title="Vaults"
      icon={Vault}
      href="/explorer/vaults"
      isLoading={isLoading}
      stats={[
        { label: "TVL", value: compactUsd(totalTvl) },
        {
          label: "Vaults",
          value: formatNumber(totalCount, format, { maximumFractionDigits: 0 }),
        },
        { label: "Avg APR", value: `${avgApr.toFixed(1)}%` },
      ]}
    >
      {/* En-tête de colonnes */}
      <div className="flex items-center gap-3 px-4 pt-2.5 pb-1.5 text-[9px] uppercase tracking-[0.08em] text-text-tertiary font-medium">
        <span className="min-w-0 flex-1">Vault</span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="w-[88px] text-right">Leader</span>
          <span className="w-[52px] text-right">APR</span>
          <span className="w-[64px] text-right">TVL</span>
        </div>
      </div>
      {isLoading && topVaults.length === 0 && (
        <div className="px-4 py-2 text-[12px] text-text-tertiary">…</div>
      )}
      {topVaults.map((v) => (
        <ModuleRow
          key={v.summary.vaultAddress}
          href={`/explorer/vaults/${encodeURIComponent(v.summary.vaultAddress)}`}
          left={
            <span className="font-medium text-text-primary truncate">
              {v.summary.name}
            </span>
          }
          right={
            <>
              <span className="mono text-[12px] text-text-tertiary w-[88px] text-right truncate">
                {truncateAddress(v.summary.leader)}
              </span>
              <span className="mono text-[12px] text-text-secondary w-[52px] text-right">
                {`${v.apr.toFixed(1)}%`}
              </span>
              <span className="mono text-[12px] text-text-primary w-[64px] text-right">
                {compactUsd(parseFloat(v.summary.tvl))}
              </span>
            </>
          }
        />
      ))}
    </OverviewModule>
  );
});
