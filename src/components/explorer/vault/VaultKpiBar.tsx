"use client";

import { useMemo } from "react";
import { TrendingUp, Vault, DollarSign, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/common";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35 },
  }),
} as const;

export function VaultKpiBar() {
  const { vaults, totalTvl, isLoading } = useVaults({ limit: 1000 });

  const stats = useMemo(() => {
    if (!vaults.length) return null;

    const openVaults = vaults.filter((v) => !v.summary.isClosed);
    const closedVaults = vaults.filter((v) => v.summary.isClosed);

    const aprs = vaults.map((v) => v.apr);
    const highestApr = aprs.length ? Math.max(...aprs) : 0;
    const avgApr = aprs.length ? aprs.reduce((a, b) => a + b, 0) / aprs.length : 0;

    const highestAprVault = vaults.find((v) => v.apr === highestApr);

    return {
      totalTvl,
      openCount: openVaults.length,
      closedCount: closedVaults.length,
      highestApr,
      highestAprName: highestAprVault?.summary.name ?? "—",
      avgApr,
    };
  }, [vaults, totalTvl]);

  const cards = [
    {
      title: "Total TVL",
      value: isLoading ? "—" : `$${formatLargeNumber(stats?.totalTvl ?? 0, { decimals: 2 })}`,
      icon: <DollarSign className="w-4 h-4 text-brand" />,
    },
    {
      title: "Active Vaults",
      value: isLoading ? "—" : String(stats?.openCount ?? 0),
      icon: <Vault className="w-4 h-4 text-emerald-400" />,
    },
    {
      title: "Closed Vaults",
      value: isLoading ? "—" : String(stats?.closedCount ?? 0),
      icon: <Vault className="w-4 h-4 text-text-tertiary" />,
    },
    {
      title: "Highest APR",
      value: isLoading
        ? "—"
        : `${(stats?.highestApr ?? 0).toFixed(2)}%`,
      icon: <TrendingUp className="w-4 h-4 text-gold" />,
    },
    {
      title: "Average APR",
      value: isLoading ? "—" : `${(stats?.avgApr ?? 0).toFixed(2)}%`,
      icon: <BarChart2 className="w-4 h-4 text-brand" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <StatsCard
            title={card.title}
            value={card.value}
            icon={card.icon}
            isLoading={isLoading}
            className="bg-surface border border-border-subtle rounded-lg h-full"
          />
        </motion.div>
      ))}
    </div>
  );
}
