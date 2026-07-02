import { memo } from "react";
import { useValidators } from "@/services/explorer/validator";
import { useHoldersStats } from "@/services/explorer/validator/hooks/useHoldersStats";
import { useUnstakingStatsData } from "@/services/explorer/validator/hooks/staking";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useHypePrice } from "@/services/market/hype/hooks/useHypePrice";
import { KpiRibbon, type KpiCell } from "@/components/common";

/**
 * Network-health KPI strip. Migrated from a hand-rolled card grid to the
 * canonical <KpiRibbon> primitive (DESIGN_SYSTEM §7.b) — same data hooks.
 */
export const ValidatorStatsCard = memo(function ValidatorStatsCard() {
  const { stats } = useValidators();
  const { stats: holdersStats } = useHoldersStats();
  const { upcomingUnstaking } = useUnstakingStatsData();
  const { format } = useNumberFormat();
  const { price: hypePrice } = useHypePrice();

  const totalStaked = stats?.totalHypeStaked ?? 0;
  const fmt = (n: number) => formatNumber(n, format, { maximumFractionDigits: 0 });

  const cells: KpiCell[] = [
    {
      label: "Validators",
      value: `${stats.total}`,
      sub: `${stats.active} active · ${stats.inactive} jailed`,
    },
    {
      label: "HYPE Staked",
      value: fmt(totalStaked),
      sub: hypePrice ? `$${fmt(totalStaked * hypePrice)}` : undefined,
    },
    {
      label: "Active Stakers",
      value: holdersStats ? fmt(holdersStats.totalHolders) : "…",
      sub: holdersStats ? `avg ${fmt(holdersStats.averageStaked)} HYPE` : undefined,
    },
    {
      label: "Upcoming Unstaking",
      value: upcomingUnstaking ? fmt(upcomingUnstaking.next24Hours.totalTokens) : "…",
      sub: upcomingUnstaking ? `${fmt(upcomingUnstaking.nextHour.totalTokens)} next hour` : undefined,
    },
  ];

  return <KpiRibbon cells={cells} variant="plain" />;
});
