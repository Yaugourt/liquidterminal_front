"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { BuilderUserRow } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { Loader2 } from "lucide-react";

interface BuilderUsersTableProps {
  users: BuilderUserRow[];
  isLoading: boolean;
  error: Error | null;
}

function pickAddress(row: BuilderUserRow): string {
  const u = row.user ?? row.address;
  return typeof u === "string" ? u : "—";
}

function pickFees(row: BuilderUserRow): number | undefined {
  if (typeof row.totalBuilderFees === "number") return row.totalBuilderFees;
  if (typeof row.builderFees === "number") return row.builderFees;
  return undefined;
}

export function BuilderUsersTable({ users, isLoading, error }: BuilderUsersTableProps) {
  const { format } = useNumberFormat();

  const totalFees = useMemo(
    () => users.reduce((acc, u) => acc + (pickFees(u) ?? 0), 0),
    [users]
  );

  if (error) {
    return <div className="glass-panel border border-rose-500/20 p-4 text-rose-400 text-sm">{error.message}</div>;
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-[160px] glass-panel rounded-2xl">
        <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center text-text-muted text-sm border border-border-subtle">
        No top users for this window.
      </div>
    );
  }

  const hasVolume = users[0]?.volume !== undefined;

  return (
    <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border-subtle hover:bg-transparent">
            <TableHead className="py-3 px-3 w-8">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">#</span>
            </TableHead>
            <TableHead className="py-3 px-3">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">User</span>
            </TableHead>
            <TableHead className="py-3 px-3 text-right">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Builder fees</span>
            </TableHead>
            <TableHead className="py-3 px-3 text-right hidden sm:table-cell">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Share</span>
            </TableHead>
            {hasVolume && (
              <TableHead className="py-3 px-3 text-right hidden md:table-cell">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Volume</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((row, idx) => {
            const addr = pickAddress(row);
            const fees = pickFees(row);
            const sharePct = totalFees > 0 && fees !== undefined ? (fees / totalFees) * 100 : undefined;

            return (
              <motion.tr
                key={`${addr}-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3 px-3 text-sm font-bold tabular-nums text-text-muted w-8">{idx + 1}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-text-muted shrink-0">
                      {addr.slice(2, 3).toUpperCase()}
                    </div>
                    <span className="text-xs text-text-secondary font-mono truncate max-w-[160px] sm:max-w-none">
                      {addr}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right text-sm text-brand-gold tabular-nums">
                  {fees !== undefined
                    ? formatNumber(fees, format, { maximumFractionDigits: 4, currency: "$", showCurrency: true })
                    : "—"}
                </td>
                <td className="py-3 px-3 text-right hidden sm:table-cell">
                  {sharePct !== undefined ? (
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-accent/50 rounded-full"
                          style={{ width: `${Math.min(sharePct, 100)}%` }}
                        />
                      </div>
                      <span className="text-text-muted text-xs tabular-nums w-10 text-right">
                        {sharePct.toFixed(1)}%
                      </span>
                    </div>
                  ) : "—"}
                </td>
                {hasVolume && (
                  <td className="py-3 px-3 text-right text-sm text-text-secondary tabular-nums hidden md:table-cell">
                    {typeof row.volume === "number"
                      ? formatNumber(row.volume, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })
                      : "—"}
                  </td>
                )}
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
