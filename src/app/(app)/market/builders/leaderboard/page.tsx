"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/store/use-page-title";
import { useUsersLeaderboard } from "@/services/indexer/users/hooks/useUsersLeaderboard";
import { Button } from "@/components/ui/button";
import { TradersLeaderboardTable } from "@/components/market/builders";
import type { LeaderboardSortBy } from "@/services/indexer/users/api";

const SORT_OPTIONS: { key: LeaderboardSortBy; label: string }[] = [
  { key: "volume", label: "Volume" },
  { key: "pnl", label: "PnL" },
  { key: "trades", label: "Trades" },
  { key: "priority_fees", label: "Priority Fees" },
];

const HOURS_OPTIONS = [
  { value: 24, label: "24h" },
  { value: 168, label: "7d" },
  { value: 720, label: "30d" },
];

export default function BuildersLeaderboardPage() {
  const { setTitle } = usePageTitle();
  const [sortBy, setSortBy] = useState<LeaderboardSortBy>("volume");
  const [hours, setHours] = useState(24);

  const { data, isLoading, error } = useUsersLeaderboard({ by: sortBy, hours, limit: 100 });

  useEffect(() => {
    setTitle("Traders Leaderboard");
  }, [setTitle]);

  const sortLabel = SORT_OPTIONS.find((s) => s.key === sortBy)?.label ?? sortBy;

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Traders Leaderboard</h1>
          <p className="text-text-secondary text-sm mt-1 max-w-2xl">
            Top traders on HyperLiquid ranked by volume, PnL, trades, and priority fees.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {HOURS_OPTIONS.map((h) => (
            <Button
              key={h.value}
              type="button"
              size="sm"
              onClick={() => setHours(h.value)}
              className={
                hours === h.value
                  ? "bg-brand-accent/20 text-brand-accent border border-brand-accent/40 hover:bg-brand-accent/30"
                  : "border border-border-subtle text-text-secondary hover:bg-white/5 hover:text-white bg-transparent"
              }
            >
              {h.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              sortBy === opt.key
                ? "bg-brand-secondary border-brand-accent/40 text-brand-accent"
                : "bg-transparent border-border-subtle text-text-secondary hover:bg-white/5 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <TradersLeaderboardTable
        data={data}
        isLoading={isLoading}
        error={error}
        sortBy={sortBy}
        sortLabel={sortLabel}
        hours={hours}
      />
    </motion.div>
  );
}
