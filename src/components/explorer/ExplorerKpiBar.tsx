"use client";

import { useMemo } from "react";
import { BarChart3, Coins, Activity, Users, Layers, Hash } from "lucide-react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/common/StatsCard";
import { useOverviewStats24h } from "@/services/indexer/overview";
import { useEvmStats } from "@/services/indexer/evm";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
} as const;

function formatUSD(value: number | undefined, format: string): string {
  if (value === undefined || value === null) return "-";
  return formatNumber(value, format as "US" | "EU" | "FR" | "PLAIN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    currency: "$",
    showCurrency: true,
  });
}

function formatCount(value: number | undefined, format: string): string {
  if (value === undefined || value === null) return "-";
  return formatNumber(value, format as "US" | "EU" | "FR" | "PLAIN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatLargeNumber(n?: number): string {
  if (n === undefined || n === null) return "-";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

type KpiCard = {
  title: string;
  value: string;
  icon: React.ReactNode;
  isLoading: boolean;
};

export function ExplorerKpiBar() {
  const { overview, isLoading: overviewLoading } = useOverviewStats24h();
  const { stats, isLoading: evmLoading } = useEvmStats();
  const { format } = useNumberFormat();

  const cards = useMemo((): KpiCard[] => [
    {
      title: "Volume 24h",
      value: formatUSD(overview?.total_volume_24h, format),
      icon: <BarChart3 className="w-4 h-4 text-brand-accent" />,
      isLoading: overviewLoading && !overview,
    },
    {
      title: "Fees 24h",
      value: formatUSD(overview?.total_fees_24h, format),
      icon: <Coins className="w-4 h-4 text-brand-gold" />,
      isLoading: overviewLoading && !overview,
    },
    {
      title: "Trades 24h",
      value: formatCount(overview?.total_trades_24h, format),
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
      isLoading: overviewLoading && !overview,
    },
    {
      title: "Active DEXs",
      value: overview?.total_dexs !== undefined ? String(overview.total_dexs) : "-",
      icon: <Users className="w-4 h-4 text-rose-400" />,
      isLoading: overviewLoading && !overview,
    },
    {
      title: "EVM Blocks",
      value: formatLargeNumber(stats?.blocks_indexed),
      icon: <Layers className="w-4 h-4 text-brand-accent" />,
      isLoading: evmLoading && !stats,
    },
    {
      title: "EVM Txs",
      value: formatLargeNumber(stats?.txs_indexed),
      icon: <Hash className="w-4 h-4 text-brand-accent" />,
      isLoading: evmLoading && !stats,
    },
  ], [overview, overviewLoading, stats, evmLoading, format]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="h-full"
        >
          <StatsCard
            title={card.title}
            value={card.value}
            icon={card.icon}
            isLoading={card.isLoading}
          />
        </motion.div>
      ))}
    </div>
  );
}
