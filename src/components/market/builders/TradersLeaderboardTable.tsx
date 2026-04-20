"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LeaderboardEntry, LeaderboardSortBy } from "@/services/indexer/users/api";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

const RANK_COLORS = ["text-brand-gold", "text-zinc-300", "text-amber-600"];

interface TradersLeaderboardTableProps {
  data: LeaderboardEntry[];
  isLoading: boolean;
  error: Error | null;
  sortBy: LeaderboardSortBy;
  sortLabel: string;
  hours: number;
}

export function TradersLeaderboardTable({
  data,
  isLoading,
  error,
  sortBy,
  sortLabel,
  hours,
}: TradersLeaderboardTableProps) {
  const { format } = useNumberFormat();

  const maxValue = useMemo(
    () =>
      data.length > 0
        ? Math.max(
            ...data.map((r) => {
              if (sortBy === "volume") return (r.total_volume ?? 0) as number;
              if (sortBy === "trades") return (r.fill_count ?? 0) as number;
              if (sortBy === "pnl") return Math.abs((r.pnl ?? 0) as number);
              return ((r[sortBy] ?? 0) as number);
            }),
            1
          )
        : 1,
    [data, sortBy]
  );

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

  if (error) {
    return (
      <div className="glass-panel border border-rose-500/20 p-4 text-rose-400 text-sm">
        {error.message}
      </div>
    );
  }

  if (isLoading && data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] glass-panel rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
          <span className="text-text-muted text-xs">Loading leaderboard…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border-subtle hover:bg-transparent">
            <TableHead className="py-3 px-3 w-10">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">#</span>
            </TableHead>
            <TableHead className="py-3 px-3">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Trader</span>
            </TableHead>
            <TableHead className="py-3 px-3 text-right">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">{sortLabel}</span>
            </TableHead>
            <TableHead className="py-3 px-3 text-right hidden sm:table-cell">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Fills</span>
            </TableHead>
            <TableHead className="py-3 px-3 text-right hidden md:table-cell">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Coins</span>
            </TableHead>
            <TableHead className="py-3 px-3 hidden lg:table-cell">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Share</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => {
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
                  <span className={`text-sm font-bold tabular-nums ${RANK_COLORS[idx] ?? "text-text-muted"}`}>
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
                  <span className={isNegative ? "text-rose-400" : "text-white"}>{formatValue(val)}</span>
                </td>
                <td className="py-3 px-3 text-right text-sm text-text-secondary tabular-nums hidden sm:table-cell">
                  {row.fill_count !== undefined
                    ? formatNumber(row.fill_count as number, format, { maximumFractionDigits: 0 })
                    : "—"}
                </td>
                <td className="py-3 px-3 text-right text-sm text-text-secondary tabular-nums hidden md:table-cell">
                  {row.unique_coins !== undefined
                    ? formatNumber(row.unique_coins as number, format, { maximumFractionDigits: 0 })
                    : "—"}
                </td>
                <td className="py-3 px-3 hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden max-w-24">
                      <div
                        className={`h-full rounded-full ${isNegative ? "bg-rose-500/50" : "bg-brand-accent/40"}`}
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
  );
}
