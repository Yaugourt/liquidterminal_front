"use client";

import { memo, useMemo } from "react";
import { Vault } from "lucide-react";
import { OverviewModule, ModuleRow, ModuleSubhead } from "../OverviewModule";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/** VaultsModule — résumé de /explorer/vaults sur le Dashboard. */
export const VaultsModule = memo(function VaultsModule() {
  const { vaults, totalTvl, totalCount, isLoading } = useVaults({
    limit: 1000,
    sortBy: "tvl",
  });
  const { format } = useNumberFormat();

  const topVaults = useMemo(() => vaults.slice(0, 5), [vaults]);

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
      ]}
    >
      <ModuleSubhead>Top by TVL</ModuleSubhead>
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
              <span className="mono text-[12px] text-text-secondary">
                {`${v.apr.toFixed(1)}%`}
              </span>
              <span className="mono text-[12px] text-text-primary">
                {compactUsd(parseFloat(v.summary.tvl))}
              </span>
            </>
          }
        />
      ))}
    </OverviewModule>
  );
});
