"use client";

import { memo, useMemo } from "react";
import { Shield } from "lucide-react";
import {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
  DataStatus,
} from "@/components/common";
import { useValidators } from "@/services/explorer/validator";
import { formatStakeValue } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/** Normalise une valeur en pourcentage : fraction (0-1) → ×100. */
const asPercent = (value: number): number => (value <= 1 ? value * 100 : value);

/** ValidatorsModule — résumé de /explorer/validator sur le Dashboard (table "Validators"). */
export const ValidatorsModule = memo(function ValidatorsModule() {
  const { validators, stats, isLoading, isRefreshing, refetch, dataUpdatedAt } = useValidators();
  const { format } = useNumberFormat();

  const topValidators = useMemo(
    () => [...validators].sort((a, b) => b.stake - a.stake).slice(0, 5),
    [validators]
  );

  return (
    <OverviewModule
      title="Validators"
      icon={<Shield size={13} className="text-brand" />}
      tag={`${formatStakeValue(stats.totalHypeStaked, format)} HYPE staked`}
      viewAllLabel="All validators"
      href="/explorer/validator"
      actions={
        <DataStatus
          variant="polled"
          updatedAt={dataUpdatedAt}
          isRefreshing={isRefreshing}
          onRefresh={refetch}
        />
      }
    >
      <ModuleTable
        // Declared widths make the table `table-fixed` so the validator name
        // truncates; without them five dense columns push past every card.
        columns={[
          { header: "Validator" },
          { header: "Stake", width: 86 },
          { header: "APR", width: 62 },
          { header: "Commission", width: 92 },
          { header: "Uptime", width: 72 },
        ]}
      >
        {isLoading && topValidators.length === 0 && (
          <tr>
            <td colSpan={5} className="px-4 py-2.5 text-[12px] text-text-tertiary">
              …
            </td>
          </tr>
        )}
        {topValidators.map((v) => (
          <ModuleTableRow
            key={v.validator}
            href={`/explorer/validator/${encodeURIComponent(v.validator)}`}
            cells={[
              <ModuleAsset
                key="validator"
                logo={v.name.slice(0, 2).toUpperCase()}
                name={v.name}
              />,
              <span key="stake" className="mono text-text-primary">
                {formatStakeValue(v.stake, format)}
              </span>,
              <span key="apr" className="mono text-text-secondary">
                {`${asPercent(v.apr).toFixed(1)}%`}
              </span>,
              <span key="comm" className="mono text-text-secondary">
                {`${asPercent(v.commission).toFixed(1)}%`}
              </span>,
              <span
                key="uptime"
                className={`mono font-semibold ${
                  v.isActive ? "text-success" : "text-danger"
                }`}
              >
                {`${asPercent(v.uptime).toFixed(1)}%`}
              </span>,
            ]}
          />
        ))}
      </ModuleTable>
    </OverviewModule>
  );
});
