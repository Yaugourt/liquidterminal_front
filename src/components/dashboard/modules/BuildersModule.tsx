"use client";

import { memo, useMemo } from "react";
import { Users } from "lucide-react";
import { OverviewModule, ModuleRow, ModuleSubhead } from "../OverviewModule";
import { useBuildersStatsAllTimeframes } from "@/services/indexer/builders/hooks/useBuildersStatsAllTimeframes";
import { useBuildersTop } from "@/services/indexer/builders/hooks/useBuildersTop";
import {
  formatBuilderDisplayNameOrAddress,
} from "@/components/market/builders/formatBuilderDisplayName";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/** BuildersModule — résumé de /market/builders sur le Dashboard. */
export const BuildersModule = memo(function BuildersModule() {
  const { stats, isLoading } = useBuildersStatsAllTimeframes();
  const { data: top, isLoading: topLoading } = useBuildersTop({
    timeframe: "24h",
    sort: "builder_fees",
    limit: 3,
  });
  const { format } = useNumberFormat();

  const current = stats?.["24h"]?.current ?? null;

  const topBuilders = useMemo(
    () =>
      [...(top?.builders ?? [])]
        .sort((a, b) => (b.totalBuilderFees ?? 0) - (a.totalBuilderFees ?? 0))
        .slice(0, 3),
    [top?.builders]
  );

  return (
    <OverviewModule
      title="Builders"
      icon={Users}
      href="/market/builders"
      isLoading={isLoading}
      stats={[
        { label: "Builder Fees 24h", value: compactUsd(current?.totalBuilderFees) },
        { label: "Volume 24h", value: compactUsd(current?.totalVolume) },
        {
          label: "Users 24h",
          value:
            current?.uniqueUsers != null
              ? formatNumber(current.uniqueUsers, format, { maximumFractionDigits: 0 })
              : "—",
        },
      ]}
    >
      <ModuleSubhead>Top builders</ModuleSubhead>
      {topLoading && topBuilders.length === 0 && (
        <div className="px-4 py-2 text-[12px] text-text-tertiary">…</div>
      )}
      {topBuilders.map((b) => (
        <ModuleRow
          key={b.builder}
          href={`/market/builders/${encodeURIComponent(b.builder)}`}
          left={
            <span className="font-medium text-text-primary truncate">
              {formatBuilderDisplayNameOrAddress(b.builderName, b.builder)}
            </span>
          }
          right={
            <span className="mono text-[12px] font-semibold text-gold">
              {compactUsd(b.totalBuilderFees)}
            </span>
          }
        />
      ))}
    </OverviewModule>
  );
});
