"use client";

import type { BuilderDetailStatsPayload } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { StatsCard } from "@/components/common";

interface BuilderIntelligenceSecondaryStatsProps {
  stats: BuilderDetailStatsPayload;
}

export function BuilderIntelligenceSecondaryStats({ stats }: BuilderIntelligenceSecondaryStatsProps) {
  const { format } = useNumberFormat();
  const c = stats.current;
  const avgFillsPerUser = c.uniqueUsers > 0 ? c.fillCount / c.uniqueUsers : 0;

  const items = [
    {
      label: "Total fills",
      value: formatNumber(c.fillCount, format, { maximumFractionDigits: 0 }),
    },
    {
      label: "Avg fills / user",
      value: formatNumber(avgFillsPerUser, format, { maximumFractionDigits: 1 }),
    },
    {
      label: "Coins traded",
      value: formatNumber(c.uniqueCoins, format, { maximumFractionDigits: 0 }),
    },
    {
      label: "Total volume",
      value: formatNumber(c.totalVolume, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true }),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map((item) => (
        <StatsCard
          key={item.label}
          title={item.label}
          value={item.value}
          density="compact"
          withCard={false}
          className="stat-card"
          valueClassName="text-text-primary text-base font-semibold tabular-nums"
        />
      ))}
    </div>
  );
}
