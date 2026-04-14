"use client";

import { useMemo } from "react";
import { Flame, Users, Gauge, Hash, Activity, Radio, ArrowDownToLine } from "lucide-react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/common/StatsCard";
import type { PriorityFeesStats } from "@/services/explorer/priority-fees";
import { formatPriorityFeeNumber, toFiniteNumber } from "./priority-fees-format";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
} as const;

export interface PriorityFeesKpiRowProps {
  stats: PriorityFeesStats | null;
  isLoading: boolean;
  liveGossipSlots: number | null;
  gossipLoading?: boolean;
}

export function PriorityFeesKpiRow({
  stats,
  isLoading,
  liveGossipSlots,
  gossipLoading,
}: PriorityFeesKpiRowProps) {
  const fillCount = useMemo(() => {
    if (!stats) return 0;
    return toFiniteNumber(stats.total_fills_with_priority ?? stats.fills_with_priority);
  }, [stats]);

  const cards = useMemo(
    () => [
      {
        title: "Total priority gas",
        value: formatPriorityFeeNumber(stats?.total_priority_gas),
        icon: <Flame className="w-4 h-4 text-brand-accent" />,
      },
      {
        title: "Fills w/ priority",
        value: isLoading ? "—" : String(fillCount),
        icon: <Hash className="w-4 h-4 text-emerald-400" />,
      },
      {
        title: "Avg priority gas",
        value: formatPriorityFeeNumber(stats?.avg_priority_gas),
        icon: <Gauge className="w-4 h-4 text-brand-gold" />,
      },
      {
        title: "Min priority gas",
        value: formatPriorityFeeNumber(stats?.min_priority_gas),
        icon: <ArrowDownToLine className="w-4 h-4 text-text-secondary" />,
      },
      {
        title: "Max priority gas",
        value: formatPriorityFeeNumber(stats?.max_priority_gas),
        icon: <Activity className="w-4 h-4 text-rose-400" />,
      },
      {
        title: "Unique users",
        value:
          stats?.unique_users !== undefined && stats.unique_users !== null
            ? String(stats.unique_users)
            : "—",
        icon: <Users className="w-4 h-4 text-text-secondary" />,
      },
      {
        title: "Live gossip slots",
        value:
          gossipLoading || liveGossipSlots === null
            ? "—"
            : String(liveGossipSlots),
        icon: <Radio className="w-4 h-4 text-brand-accent" />,
      },
    ],
    [stats, isLoading, fillCount, liveGossipSlots, gossipLoading]
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
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
            isLoading={isLoading && card.title !== "Live gossip slots"}
          />
        </motion.div>
      ))}
    </div>
  );
}
