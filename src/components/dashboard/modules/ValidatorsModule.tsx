"use client";

import { memo, useMemo } from "react";
import { Shield } from "lucide-react";
import { OverviewModule, ModuleRow } from "../OverviewModule";
import { useValidators } from "@/services/explorer/validator";
import { compactUsd, formatStakeValue } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/** Normalise une valeur en pourcentage : fraction (0-1) → ×100. */
const asPercent = (value: number): number => (value <= 1 ? value * 100 : value);

/** ValidatorsModule — résumé de /explorer/validator sur le Dashboard. */
export const ValidatorsModule = memo(function ValidatorsModule() {
  const { validators, stats, isLoading } = useValidators();
  const { format } = useNumberFormat();

  const topValidators = useMemo(
    () => [...validators].sort((a, b) => b.stake - a.stake).slice(0, 7),
    [validators]
  );

  // APR moyen des validators actifs.
  const avgApr = useMemo(() => {
    const active = validators.filter((v) => v.isActive);
    if (active.length === 0) return 0;
    const sum = active.reduce((acc, v) => acc + asPercent(v.apr), 0);
    return sum / active.length;
  }, [validators]);

  return (
    <OverviewModule
      title="Validators"
      icon={Shield}
      href="/explorer/validator"
      isLoading={isLoading}
      stats={[
        {
          label: "Active",
          value: (
            <span className="mono">{`${stats.active}/${stats.total}`}</span>
          ),
        },
        { label: "Staked", value: compactUsd(stats.totalHypeStaked) },
        { label: "Avg APR", value: `${avgApr.toFixed(1)}%` },
      ]}
    >
      {/* En-tête de colonnes */}
      <div className="flex items-center gap-3 px-4 pt-2.5 pb-1.5 text-[9px] uppercase tracking-[0.08em] text-text-tertiary font-medium">
        <span className="min-w-0 flex-1">Validator</span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="w-[44px] text-right">Comm.</span>
          <span className="w-[52px] text-right">Uptime</span>
          <span className="w-[48px] text-right">APR</span>
          <span className="w-[64px] text-right">Stake</span>
        </div>
      </div>
      {isLoading && topValidators.length === 0 && (
        <div className="px-4 py-2 text-[12px] text-text-tertiary">…</div>
      )}
      {topValidators.map((v) => (
        <ModuleRow
          key={v.validator}
          href={`/explorer/validator/${encodeURIComponent(v.validator)}`}
          left={
            <>
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  v.isActive ? "bg-success" : "bg-text-tertiary"
                }`}
              />
              <span className="font-medium text-text-primary truncate">
                {v.name}
              </span>
            </>
          }
          right={
            <>
              <span className="mono text-[12px] text-text-tertiary w-[44px] text-right">
                {`${asPercent(v.commission).toFixed(1)}%`}
              </span>
              <span className="mono text-[12px] text-text-tertiary w-[52px] text-right">
                {`${asPercent(v.uptime).toFixed(1)}%`}
              </span>
              <span className="mono text-[12px] text-text-secondary w-[48px] text-right">
                {`${asPercent(v.apr).toFixed(1)}%`}
              </span>
              <span className="mono text-[12px] text-text-primary w-[64px] text-right">
                {formatStakeValue(v.stake, format)}
              </span>
            </>
          }
        />
      ))}
    </OverviewModule>
  );
});
