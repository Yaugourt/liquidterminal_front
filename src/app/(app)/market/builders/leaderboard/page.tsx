"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/store/use-page-title";
import { useUsersLeaderboard } from "@/services/indexer/users/hooks/useUsersLeaderboard";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import type { LeaderboardEntry, LeaderboardSortBy } from "@/services/indexer/users/api";

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

const RANK_COLORS = ["text-brand-gold", "text-zinc-300", "text-amber-600"];

export default function BuildersLeaderboardPage() {
  const { setTitle } = usePageTitle();
  const { format } = useNumberFormat();
  const [sortBy, setSortBy] = useState<LeaderboardSortBy>("volume");
  const [hours, setHours] = useState(24);

  const { data, isLoading, error } = useUsersLeaderboard({ by: sortBy, hours, limit: 100 });

  useEffect(() => {
    setTitle("Traders Leaderboard");
  }, [setTitle]);

  const maxValue =
    data.length > 0
      ? Math.max(
          ...data.map((r: LeaderboardEntry) => {
            if (sortBy === "volume") return (r.total_volume ?? 0) as number;
            if (sortBy === "trades") return (r.fill_count ?? 0) as number;
            if (sortBy === "pnl") return Math.abs((r.pnl ?? 0) as number);
            return ((r[sortBy] ?? 0) as number);
          }),
          1
        )
      : 1;

  const getValue = (row: LeaderboardEntry): number => {
    if (sortBy === "volume") return (row.total_volume as number) ?? 0;
    if (sortBy === "trades") return (row.fill_count as number) ?? 0;
    if (sortBy === "pnl") return (row.pnl as number) ?? 0;
    return ((row[sortBy] as number) ?? 0);
  };

  const formatValue = (val: number): string => {
    if (sortBy === "volume" || sortBy === "pnl") {
      return formatNumber(val, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true });
    }
    return formatNumber(val, format, { maximumFractionDigits: 0 });
  };

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
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

      {/* Sort tabs */}
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

      {/* Content */}
      {error ? (
        <div className="glass-panel border border-rose-500/20 p-4 text-rose-400 text-sm">
          {error.message}
        </div>
      ) : isLoading && data.length === 0 ? (
        <div className="flex justify-center items-center h-[300px] glass-panel rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
            <span className="text-text-muted text-xs">Loading leaderboard…</span>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="py-3 px-3 w-10">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    #
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Trader
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3 text-right">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    {SORT_OPTIONS.find((s) => s.key === sortBy)?.label}
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3 text-right hidden sm:table-cell">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Fills
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3 text-right hidden md:table-cell">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Coins
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3 hidden lg:table-cell">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Share
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row: LeaderboardEntry, idx: number) => {
                const val = getValue(row);
                const pct = (Math.abs(val) / maxValue) * 100;
                const isNegative = val < 0;
                return (
                  <motion.tr
                    key={row.user + idx}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.01, duration: 0.2 }}
                    className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-3 w-10">
                      <span
                        className={`text-sm font-bold tabular-nums ${
                          RANK_COLORS[idx] ?? "text-text-muted"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-text-muted shrink-0">
                          {row.user.slice(2, 3).toUpperCase()}
                        </div>
                        <span className="text-xs text-text-secondary font-mono">
                          {row.user.slice(0, 8)}&hellip;{row.user.slice(-4)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-sm tabular-nums font-medium">
                      <span className={isNegative ? "text-rose-400" : "text-white"}>
                        {formatValue(val)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-sm text-text-secondary tabular-nums hidden sm:table-cell">
                      {row.fill_count !== undefined
                        ? formatNumber(row.fill_count as number, format, {
                            maximumFractionDigits: 0,
                          })
                        : "—"}
                    </td>
                    <td className="py-3 px-3 text-right text-sm text-text-secondary tabular-nums hidden md:table-cell">
                      {row.unique_coins !== undefined
                        ? formatNumber(row.unique_coins as number, format, {
                            maximumFractionDigits: 0,
                          })
                        : "—"}
                    </td>
                    <td className="py-3 px-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden max-w-24">
                          <div
                            className={`h-full rounded-full ${
                              isNegative ? "bg-rose-500/50" : "bg-brand-accent/40"
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-text-muted text-xs tabular-nums w-8 text-right">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
          <div className="px-4 py-3 border-t border-border-subtle">
            <span className="text-text-muted text-xs">
              {data.length} traders · {hours}h window
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
