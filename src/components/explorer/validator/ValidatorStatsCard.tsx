import { memo } from "react";
import { motion } from "framer-motion";
import { useValidators } from "@/services/explorer/validator";
import { useHoldersStats } from "@/services/explorer/validator/hooks/useHoldersStats";
import { useUnstakingStatsData } from "@/services/explorer/validator/hooks/staking";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useHypePrice } from "@/services/market/hype/hooks/useHypePrice";

interface KpiItem {
  label: string;
  value: string;
  sub?: string;
}

export const ValidatorStatsCard = memo(function ValidatorStatsCard() {
  const { stats, isLoading } = useValidators();
  const { stats: holdersStats } = useHoldersStats();
  const { upcomingUnstaking } = useUnstakingStatsData();
  const { format } = useNumberFormat();
  const { price: hypePrice } = useHypePrice();

  const loading = isLoading && !stats;

  const totalStaked = stats?.totalHypeStaked ?? 0;

  const items: KpiItem[] = [
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

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          className="bg-surface border border-border-subtle rounded-lg px-3.5 py-3"
        >
          <div className="mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary font-medium">
              {item.label}
            </span>
          </div>
          <div className="mono text-[20px] leading-tight font-semibold text-text-primary">
            {item.value}
          </div>
          {item.sub && (
            <div className="mono text-[11px] text-text-tertiary mt-0.5">
              {item.sub}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
});
