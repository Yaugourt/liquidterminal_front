"use client";

import { useMemo } from "react";
import { Gauge, Hash, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/common";
import { AssetLogo } from "@/components/common";
import type { PriorityFeesStats } from "@/services/explorer/priority-fees";
import { computePriorityFeesRunRate } from "@/lib/priority-fees-run-rate";
import {
  formatAnnualizedLinearHype,
  formatPriorityFeeNumber,
  toFiniteNumber,
} from "./priority-fees-format";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
} as const;

type KpiCardConfig = {
  title: string;
  value: string;
  icon: React.ReactNode;
  /** When set, overrides row default for this card. */
  cardLoading?: boolean;
  valueClassName?: string;
  tooltip?: string;
};

export interface PriorityFeesKpiRowProps {
  stats: PriorityFeesStats | null;
  isLoading: boolean;
}

export function PriorityFeesKpiRow({ stats, isLoading }: PriorityFeesKpiRowProps) {
  const fillCount = useMemo(() => {
    if (!stats) return 0;
    return toFiniteNumber(stats.total_fills_with_priority ?? stats.fills_with_priority);
  }, [stats]);

  const run = useMemo(() => computePriorityFeesRunRate(stats), [stats]);

  const cards = useMemo((): KpiCardConfig[] => {
    const annualizedLoading = isLoading && !run;
    return [
      {
        title: "Total priority gas",
        value: formatPriorityFeeNumber(stats?.total_priority_gas),
        icon: <AssetLogo assetName="HYPE_USDC" className="w-4 h-4 shrink-0" />,
      },
      {
        title: "Annualized burn (linear)",
        value: annualizedLoading
          ? "—"
          : run
            ? `${formatAnnualizedLinearHype(run.annualizedLinearHype)} HYPE`
            : "—",
        icon: <AssetLogo assetName="HYPE_USDC" className="w-4 h-4 shrink-0" />,
        cardLoading: annualizedLoading,
        tooltip:
          "(Priority gas in indexer window ÷ effective calendar days from time_range) × 365. Not a forecast.",
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
        title: "Max priority gas",
        value: formatPriorityFeeNumber(stats?.max_priority_gas),
        icon: <Activity className="w-4 h-4 text-rose-400" />,
      },
    ];
  }, [stats, isLoading, fillCount, run]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {cards.map((card, i) => {
        const loading = card.cardLoading ?? isLoading;
        const body = (
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
              isLoading={loading}
              valueClassName={card.valueClassName}
            />
          </motion.div>
        );

        if (card.tooltip) {
          return (
            <TooltipProvider key={card.title} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-full cursor-help">{body}</div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs border-border-subtle bg-brand-secondary text-text-secondary text-xs"
                >
                  {card.tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return body;
      })}
    </div>
  );
}
