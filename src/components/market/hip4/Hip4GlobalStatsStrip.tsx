"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, TrendingUp, Layers } from "lucide-react";
import { StatsCard } from "@/components/common/StatsCard";
import type {
  Hip4MarketEnrichedRow,
  Hip4QuestionWithOutcomesRow,
} from "@/services/indexer/hip4";

interface Hip4GlobalStatsStripProps {
  markets: Hip4MarketEnrichedRow[];
  questions: Hip4QuestionWithOutcomesRow[];
  isLoading: boolean;
}

function compactUsd(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function Hip4GlobalStatsStrip({ markets, questions, isLoading }: Hip4GlobalStatsStripProps) {
  const stats = useMemo(() => {
    const activeMarkets = markets.filter((m) => !m.is_settled).length;
    const settledMarkets = markets.filter((m) => m.is_settled).length;
    const totalVolume = markets.reduce((s, m) => s + (m.total_volume ?? 0), 0);
    const volume24h = markets.reduce((s, m) => s + (m.volume_24h ?? 0), 0);
    return { activeMarkets, settledMarkets, totalVolume, volume24h, questions: questions.length };
  }, [markets, questions]);

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
      title: "Volume 24h",
      value: isLoading ? "—" : compactUsd(stats.volume24h),
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
