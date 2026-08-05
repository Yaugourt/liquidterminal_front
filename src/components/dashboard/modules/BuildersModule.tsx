"use client";

import { memo, useMemo } from "react";
import { Wrench } from "lucide-react";
import { ExportButton } from "@/components/export/ExportButton";
import {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
  DataStatus,
} from "@/components/common";
import { useBuildersStatsAllTimeframes } from "@/services/indexer/builders/hooks/useBuildersStatsAllTimeframes";
import { useBuildersTop } from "@/services/indexer/builders/hooks/useBuildersTop";
import { BuilderAvatar, resolveBuilderLabel } from "@/components/market/builders";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/**
 * BuildersModule — top 5 builders du Dashboard.
 *
 * Aligné sur `VaultsModule` / `ValidatorsModule` : `OverviewModule` +
 * `ModuleTable` + `ModuleAsset` — même avatar `rounded-md bg-brand/10`
 * 2-initiales, même espacement, même card-head.
 */
export const BuildersModule = memo(function BuildersModule() {
  const { stats } = useBuildersStatsAllTimeframes();
  const { data, isLoading, isRefreshing, refetch, dataUpdatedAt } = useBuildersTop({
    timeframe: "24h",
    sort: "builder_fees",
    limit: 5,
  });
  const { format } = useNumberFormat();

  const current = stats?.["24h"]?.current ?? null;

  const topBuilders = useMemo(
    () =>
      [...(data?.builders ?? [])]
        .sort((a, b) => (b.totalBuilderFees ?? 0) - (a.totalBuilderFees ?? 0))
        .slice(0, 5),
    [data?.builders]
  );

  const intFmt = (v: number | null | undefined) =>
    v != null ? formatNumber(v, format, { maximumFractionDigits: 0 }) : "—";

  return (
    <OverviewModule
      title="Top Builders"
      icon={<Wrench size={13} className="text-brand" />}
      tag={`${compactUsd(current?.totalBuilderFees)} fees 24h`}
      viewAllLabel="All builders"
      href="/market/builders"
      actions={
        <>
          <DataStatus
            variant="polled"
            updatedAt={dataUpdatedAt}
            isRefreshing={isRefreshing}
            onRefresh={refetch}
          />
          <ExportButton datasetId="builders" />
        </>
      }
    >
      <ModuleTable
        columns={[
          { header: "Builder" },
          { header: "Fees 24h" },
          { header: "Volume" },
          { header: "Users" },
        ]}
      >
        {isLoading && topBuilders.length === 0 && (
          <tr>
            <td colSpan={4} className="px-4 py-2.5 text-[12px] text-text-tertiary">
              …
            </td>
          </tr>
        )}
        {topBuilders.map((b) => {
          const { label: displayName, isAnonymous } = resolveBuilderLabel(
            b.builder,
            b.builderName
          );
          return (
            <ModuleTableRow
              key={b.builder}
              href={`/market/builders/${encodeURIComponent(b.builder)}`}
              cells={[
                <ModuleAsset
                  key="builder"
                  logo={
                    <BuilderAvatar
                      address={b.builder}
                      label={isAnonymous ? "—" : displayName}
                      size={24}
                      className="w-full h-full rounded-none"
                    />
                  }
                  name={displayName}
                />,
                <span key="fees" className="mono font-semibold text-gold">
                  {compactUsd(b.totalBuilderFees)}
                </span>,
                <span key="volume" className="mono text-text-primary">
                  {compactUsd(b.totalVolume)}
                </span>,
                <span key="users" className="mono text-text-secondary">
                  {intFmt(b.uniqueUsers)}
                </span>,
              ]}
            />
          );
        })}
      </ModuleTable>
    </OverviewModule>
  );
});
