import { memo } from "react";
import { useValidators } from "@/services/explorer/validator";
import { useHoldersStats } from "@/services/explorer/validator/hooks/useHoldersStats";
import { useUnstakingStatsData } from "@/services/explorer/validator/hooks/staking";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useHypePrice } from "@/services/market/hype/hooks/useHypePrice";
import { KpiRibbon, type KpiCell } from "@/components/common";

export const ValidatorStatsCard = memo(function ValidatorStatsCard() {
  const { stats, isLoading } = useValidators();
  const { stats: holdersStats } = useHoldersStats();
  const { upcomingUnstaking } = useUnstakingStatsData();
  const { format } = useNumberFormat();
  const { price: hypePrice } = useHypePrice();

  const loading = isLoading && !stats;

  const totalStaked = stats?.totalHypeStaked ?? 0;

  const cells: KpiCell[] = [
    {
      label: "Validators",
      value: loading ? "…" : `${stats.total} (${stats.active} active)`,
    },
    {
      label: "HYPE Staked",
      value: loading ? "…" : formatNumber(totalStaked, format, { maximumFractionDigits: 0 }),
      sub: hypePrice
        ? `$${formatNumber(totalStaked * hypePrice, format, { maximumFractionDigits: 0 })}`
        : undefined,
    },
    {
      label: "Active Stakers",
      value: holdersStats
        ? formatNumber(holdersStats.totalHolders, format, { maximumFractionDigits: 0 })
        : "…",
      sub: holdersStats
        ? `avg ${formatNumber(holdersStats.averageStaked, format, { maximumFractionDigits: 0 })} HYPE`
        : undefined,
    },
    {
      label: "Upcoming Unstaking",
      value: upcomingUnstaking
        ? formatNumber(upcomingUnstaking.next24Hours.totalTokens, format, { maximumFractionDigits: 0 })
        : "…",
      sub: upcomingUnstaking
        ? `${formatNumber(upcomingUnstaking.nextHour.totalTokens, format, { maximumFractionDigits: 0 })} next hour`
        : undefined,
    },
  ];

  return <KpiRibbon cells={cells} columns="grid-cols-2 xl:grid-cols-4" />;
});
