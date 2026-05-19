"use client";

import { memo, useMemo } from "react";
import { OverviewModule, ModuleRow } from "../OverviewModule";
import { useBuildersStatsAllTimeframes } from "@/services/indexer/builders/hooks/useBuildersStatsAllTimeframes";
import { useBuildersTop } from "@/services/indexer/builders/hooks/useBuildersTop";
import { formatBuilderDisplayNameOrAddress } from "@/components/market/builders/formatBuilderDisplayName";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/** BuildersModule — résumé de /market/builders sur le Dashboard (leaderboard "Builders"). */
export const BuildersModule = memo(function BuildersModule() {
  const { stats } = useBuildersStatsAllTimeframes();
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
        .slice(0, 4),
    [top?.builders]
  );

  return (
    <OverviewModule
      title="Builder Leaderboard"
      tag={`${compactUsd(current?.totalBuilderFees)} fees 24h`}
      viewAllLabel="Full leaderboard"
      href="/market/builders"
    >
      {topLoading && topBuilders.length === 0 && (
        <div className="px-3.5 py-2.5 text-[12px] text-text-tertiary">…</div>
      )}
      {topBuilders.map((b, i) => {
        const displayName = formatBuilderDisplayNameOrAddress(
          b.builderName,
          b.builder
        );
        return (
          <ModuleRow
            key={b.builder}
            href={`/market/builders/${encodeURIComponent(b.builder)}`}
            rank={i + 1}
            logo={displayName.slice(0, 2).toUpperCase()}
            name={displayName}
            stats={[
              {
                label: "Fees",
                value: compactUsd(b.totalBuilderFees),
                valueClassName: "text-gold",
                width: 64,
              },
              {
                label: "Volume",
                value: compactUsd(b.totalVolume),
                width: 64,
              },
              {
                label: "Users",
                value: intFmt(b.uniqueUsers),
                width: 52,
              },
            ]}
          />
        );
      })}
    </OverviewModule>
  );
});
