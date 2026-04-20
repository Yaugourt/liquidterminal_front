"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BuilderUserRow } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

interface BuilderIntelligenceUsersTableProps {
  users: BuilderUserRow[];
  isLoading: boolean;
  limit?: number;
}

export function BuilderIntelligenceUsersTable({
  users,
  isLoading,
  limit = 15,
}: BuilderIntelligenceUsersTableProps) {
  const { format } = useNumberFormat();

  const totalFees = useMemo(
    () =>
      users.reduce((acc, u) => {
        const fees =
          typeof u.totalBuilderFees === "number"
            ? u.totalBuilderFees
            : typeof u.builderFees === "number"
              ? u.builderFees
              : 0;
        return acc + fees;
      }, 0),
    [users]
  );

  const rows = users.slice(0, limit);

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm">Top Users</h2>
        <span className="text-text-muted text-xs">{users.length} users</span>
      </div>

      {isLoading && users.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-brand-accent" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-8">No data for this window.</p>
      ) : (
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border-subtle">
                <TableHead className="py-2 px-2 w-8">
                  <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">#</span>
                </TableHead>
                <TableHead className="py-2 px-2">
                  <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">User</span>
                </TableHead>
                <TableHead className="py-2 px-2 text-right">
                  <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">Rev</span>
                </TableHead>
                <TableHead className="py-2 px-2 text-right hidden sm:table-cell">
                  <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">Volume</span>
                </TableHead>
                <TableHead className="py-2 px-2 text-right hidden md:table-cell">
                  <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">Share</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u, idx) => {
                const addr = ((u.user ?? u.address ?? "—") as string);
                const fees =
                  typeof u.totalBuilderFees === "number"
                    ? u.totalBuilderFees
                    : typeof u.builderFees === "number"
                      ? u.builderFees
                      : 0;
                const vol = (u.totalVolume as number) ?? 0;
                const share = totalFees > 0 ? (fees / totalFees) * 100 : 0;

                return (
                  <TableRow
                    key={addr + idx}
                    className="border-border-subtle hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="py-2 px-2 text-text-muted text-xs font-bold">{idx + 1}</TableCell>
                    <TableCell className="py-2 px-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[9px] text-text-muted shrink-0">
                          {addr.slice(2, 3).toUpperCase()}
                        </div>
                        <span className="text-xs text-text-secondary font-mono truncate max-w-[100px]">
                          {addr.slice(0, 8)}…{addr.slice(-4)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-2 text-right text-sm text-brand-gold tabular-nums">
                      {formatNumber(fees, format, { maximumFractionDigits: 2, currency: "$", showCurrency: true })}
                    </TableCell>
                    <TableCell className="py-2 px-2 text-right text-sm text-text-secondary tabular-nums hidden sm:table-cell">
                      {vol > 0
                        ? formatNumber(vol, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })
                        : "—"}
                    </TableCell>
                    <TableCell className="py-2 px-2 hidden md:table-cell">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-accent/50 rounded-full"
                            style={{ width: `${Math.min(share, 100)}%` }}
                          />
                        </div>
                        <span className="text-text-muted text-xs w-8 text-right tabular-nums">
                          {share.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
