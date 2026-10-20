"use client";

import type { BuilderDetailStatsPayload } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { KpiRibbon } from "@/components/common";
import type { KpiCell } from "@/components/common";

interface BuilderIntelligenceSecondaryStatsProps {
  stats: BuilderDetailStatsPayload;
}

export function BuilderIntelligenceSecondaryStats({ stats }: BuilderIntelligenceSecondaryStatsProps) {
  const { format } = useNumberFormat();
  const c = stats.current;
  const avgFillsPerUser = c.uniqueUsers > 0 ? c.fillCount / c.uniqueUsers : 0;

  const cells: KpiCell[] = [
    {
      key: "Total fills",
      label: "Total fills",
      value: formatNumber(c.fillCount, format, { maximumFractionDigits: 0 }),
    },
    {
      key: "Avg fills / user",
      label: "Avg fills / user",
      value: formatNumber(avgFillsPerUser, format, { maximumFractionDigits: 1 }),
    },
    {
      key: "Coins traded",
      label: "Coins traded",
      value: formatNumber(c.uniqueCoins, format, { maximumFractionDigits: 0 }),
    },
    {
      key: "Total volume",
      label: "Total volume",
      value: formatNumber(c.totalVolume, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true }),
    },
  ];

  return <KpiRibbon cells={cells} />;
}
