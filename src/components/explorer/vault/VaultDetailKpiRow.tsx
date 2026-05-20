"use client";

import { useMemo } from "react";
import { DollarSign, TrendingUp, BarChart2, Percent } from "lucide-react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/common";
import { useVaultEquitySnapshots } from "@/services/explorer/vault/hooks/useVaultEquitySnapshots";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";

interface VaultDetailKpiRowProps {
  vaultAddress: string;
  isLoading?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35 },
  }),
} as const;

export function VaultDetailKpiRow({ vaultAddress, isLoading: parentLoading }: VaultDetailKpiRowProps) {
  // Latest equity snapshot for TVL and PnL (limit=1 → only the most-recent entry)
  const { snapshots, isLoading: snapsLoading } = useVaultEquitySnapshots({
    vaultAddress,
    limit: 1,
  });

  // APR comes from the HL stats API (cached in backend), not HypeDexer
  const { vaults, isLoading: vaultsLoading } = useVaults({ limit: 1000 });

  const isLoading = parentLoading || snapsLoading || vaultsLoading;

  const kpis = useMemo(() => {
    const latest = snapshots[0];
    const tvl = latest?.accountValue ?? 0;
    const allTimePnl = latest?.totalRawPnl ?? 0;

    const matched = vaults.find(
      (v) => v.summary.vaultAddress.toLowerCase() === vaultAddress.toLowerCase()
    );
    const apr = matched ? matched.apr * 100 : null;

    return { tvl, allTimePnl, apr };
  }, [snapshots, vaults, vaultAddress]);

  const cards = [
    {
      title: "TVL",
      value: `$${formatLargeNumber(kpis.tvl, { decimals: 2 })}`,
      icon: <DollarSign className="w-4 h-4 text-brand" />,
    },
    {
      title: "APR",
      value: kpis.apr !== null ? `${kpis.apr.toFixed(2)}%` : "—",
      icon: <Percent className="w-4 h-4 text-gold" />,
    },
    {
      title: "All-Time PnL",
      value: kpis.allTimePnl
        ? `${kpis.allTimePnl >= 0 ? "+" : ""}$${formatLargeNumber(Math.abs(kpis.allTimePnl), { decimals: 2 })}`
        : "—",
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
    },
    {
      title: "Followers",
      value: snapshots[0]?.followerCount
        ? snapshots[0].followerCount.toLocaleString()
        : "—",
      icon: <BarChart2 className="w-4 h-4 text-violet-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
