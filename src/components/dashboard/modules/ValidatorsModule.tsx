"use client";

import { memo, useMemo } from "react";
import { Shield } from "lucide-react";
import { OverviewModule, ModuleRow, ModuleSubhead } from "../OverviewModule";
import { useValidators } from "@/services/explorer/validator";
import { compactUsd, formatStakeValue } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/** ValidatorsModule — résumé de /explorer/validator sur le Dashboard. */
export const ValidatorsModule = memo(function ValidatorsModule() {
  const { validators, stats, isLoading } = useValidators();
  const { format } = useNumberFormat();

  const topValidators = useMemo(
    () => [...validators].sort((a, b) => b.stake - a.stake).slice(0, 5),
    [validators]
  );

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
      ]}
    >
      <ModuleSubhead>Top by stake</ModuleSubhead>
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
            <span className="mono text-[12px] text-text-secondary">
              {formatStakeValue(v.stake, format)}
            </span>
          }
        />
      ))}
    </OverviewModule>
  );
});
