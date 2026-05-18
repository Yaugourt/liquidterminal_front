"use client";

import { memo } from "react";
import { Search } from "lucide-react";
import { OverviewModule, ModuleRow, ModuleSubhead } from "../OverviewModule";
import { useValidators } from "@/services/explorer/validator";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { useLiquidations24h } from "@/services/dashboard/hooks/useLiquidations24h";
import { compactUsd, formatStakeValue } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/** ExplorerModule — résumé de /explorer sur le Dashboard. */
export const ExplorerModule = memo(function ExplorerModule() {
  const { validators, stats, isLoading: validatorsLoading } = useValidators();
  const { totalTvl, isLoading: vaultsLoading } = useVaults({ limit: 1000, sortBy: "tvl" });
  const { stats: liqStats, isLoading: liqLoading } = useLiquidations24h(30000);
  const { format } = useNumberFormat();

  const topValidators = [...validators].sort((a, b) => b.stake - a.stake).slice(0, 3);

  return (
    <OverviewModule
      title="Explorer"
      icon={Search}
      href="/explorer"
      isLoading={validatorsLoading || vaultsLoading || liqLoading}
      stats={[
        {
          label: "Validators",
          value: (
            <span className="mono">
              {stats.active}/{stats.total}
            </span>
          ),
        },
        { label: "Vaults TVL", value: compactUsd(totalTvl) },
        { label: "Liq. 24h", value: compactUsd(liqStats.totalVolume) },
      ]}
    >
      <ModuleSubhead>Top validators</ModuleSubhead>
      {topValidators.map((v) => (
        <ModuleRow
          key={v.validator}
          left={
            <>
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  v.isActive ? "bg-success" : "bg-text-tertiary"
                }`}
              />
              <span className="font-medium text-text-primary truncate">{v.name}</span>
            </>
          }
          right={
            <>
              <span className="mono text-[12px] text-text-secondary">
                {v.apr.toFixed(1)}%
              </span>
              <span className="mono text-[12px] w-20 text-right">
                {formatStakeValue(v.stake, format)}
              </span>
            </>
          }
        />
      ))}
    </OverviewModule>
  );
});
