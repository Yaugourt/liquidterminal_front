"use client";

import { memo, useMemo } from "react";
import { Users } from "lucide-react";
import { OverviewModule, ModuleRow } from "../OverviewModule";
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
    limit: 7,
  });
  const { format } = useNumberFormat();

  const current = stats?.["24h"]?.current ?? null;

  const intFmt = (v: number | null | undefined) =>
    v != null ? formatNumber(v, format, { maximumFractionDigits: 0 }) : "—";

  const topBuilders = useMemo(
    () =>
      [...(top?.builders ?? [])]
        .sort((a, b) => (b.totalBuilderFees ?? 0) - (a.totalBuilderFees ?? 0))
        .slice(0, 7),
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
        { label: "Users 24h", value: intFmt(current?.uniqueUsers) },
        { label: "Active Builders", value: intFmt(current?.uniqueBuilders) },
      ]}
    >
      {/* En-tête de colonnes */}
      <div className="flex items-center gap-3 px-4 pt-2.5 pb-1.5 text-[9px] uppercase tracking-[0.08em] text-text-tertiary font-medium border-b border-border-subtle">
        <span className="flex-1 min-w-0">Builder</span>
        <span className="w-[68px] text-right">Fees</span>
        <span className="w-[68px] text-right">Volume</span>
        <span className="w-[52px] text-right">Users</span>
      </div>
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
            <>
              <span className="mono text-[12px] font-semibold text-gold w-[68px] text-right">
                {compactUsd(b.totalBuilderFees)}
              </span>
              <span className="mono text-[12px] text-text-secondary w-[68px] text-right">
                {compactUsd(b.totalVolume)}
              </span>
              <span className="mono text-[12px] text-text-secondary w-[52px] text-right">
                {intFmt(b.uniqueUsers)}
              </span>
            </>
          }
        />
      ))}
    </OverviewModule>
  );
});
