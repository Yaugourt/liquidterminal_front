"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, TrendingUp, Layers } from "lucide-react";
import { StatsCard } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type {
  Hip4QuestionWithOutcomesRow,
  Hip4SettlementRow,
} from "@/services/indexer/hip4";

interface Hip4GlobalStatsStripProps {
  questions: Hip4QuestionWithOutcomesRow[];
  settlements: Hip4SettlementRow[];
  isLoading: boolean;
}

export function Hip4GlobalStatsStrip({ questions, settlements, isLoading }: Hip4GlobalStatsStripProps) {
  const stats = useMemo(() => {
    const activeMarkets = questions.filter((q) => q.status === "live").length;
    const settledMarkets = settlements.length;
    const totalVolume = questions.reduce((s, q) => s + (q.total_volume ?? 0), 0);
    return { activeMarkets, settledMarkets, totalVolume, questions: questions.length };
  }, [questions, settlements]);

  const cards = [
    {
      title: "Active Markets",
      value: isLoading ? "—" : stats.activeMarkets.toString(),
      icon: <BarChart3 className="h-4 w-4 text-brand-accent" />,
      valueClassName: "text-lg font-bold text-brand-accent tracking-tight",
    },
    {
      title: "Questions",
      value: isLoading ? "—" : stats.questions.toString(),
      icon: <Layers className="h-4 w-4 text-violet-400" />,
      valueClassName: "text-lg font-bold text-violet-400 tracking-tight",
    },
    {
      title: "Total Volume",
      value: isLoading ? "—" : compactUsd(stats.totalVolume),
      icon: <TrendingUp className="h-4 w-4 text-brand-gold" />,
      valueClassName: "text-lg font-bold text-brand-gold tracking-tight",
    },
    {
      title: "Settled Markets",
      value: isLoading ? "—" : stats.settledMarkets.toString(),
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
      valueClassName: "text-lg font-bold text-emerald-400 tracking-tight",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
        >
          <StatsCard
            title={card.title}
            value={card.value}
            icon={card.icon}
            isLoading={isLoading}
            valueClassName={card.valueClassName}
          />
        </motion.div>
      ))}
    </div>
  );
}
