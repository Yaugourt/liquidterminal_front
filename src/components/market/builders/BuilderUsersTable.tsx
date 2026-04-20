"use client";

import { useMemo } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableHeadLabel,
} from "@/components/ui/table";
import { ScrollableTable } from "@/components/common/ScrollableTable";
import type { BuilderUserRow } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

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
    return <ErrorState title="Failed to load users" message={error.message} withCard={false} />;
  }

  if (isLoading && users.length === 0) {
    return <LoadingState message="Loading top users…" size="md" withCard={false} />;
  }

  if (users.length === 0) {
    return (
      <EmptyState
        title="No top users"
        description="No user data for this window."
        withCard={false}
        className="h-[200px]"
      />
    );
  }

  const hasVolume = users[0]?.volume !== undefined;

  return (
    <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
      <ScrollableTable>
        <Table>
          <TableHeader>
            <TableRow className="border-border-subtle hover:bg-transparent">
              <TableHead className="py-3 px-4 w-8">
                <TableHeadLabel>#</TableHeadLabel>
              </TableHead>
              <TableHead className="py-3 px-4">
                <TableHeadLabel>User</TableHeadLabel>
              </TableHead>
              <TableHead className="py-3 px-4">
                <TableHeadLabel align="right">Builder Fees</TableHeadLabel>
              </TableHead>
              <TableHead className="py-3 px-4 hidden sm:table-cell">
                <TableHeadLabel align="right">Share</TableHeadLabel>
              </TableHead>
              {hasVolume && (
                <TableHead className="py-3 px-4 hidden md:table-cell">
                  <TableHeadLabel align="right">Volume</TableHeadLabel>
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
                <TableRow
                  key={`${addr}-${idx}`}
                  className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors"
                >
                  <TableCell className="py-3 px-4 text-sm font-bold tabular-nums text-text-muted w-8">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-text-muted shrink-0">
                        {addr !== "—" && addr.length > 2 ? addr.slice(2, 3).toUpperCase() : "?"}
                      </div>
                      <span className="text-xs text-text-secondary font-mono truncate max-w-[160px] sm:max-w-none">
                        {addr}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right text-sm text-brand-gold tabular-nums">
                    {fees !== undefined
                      ? formatNumber(fees, format, { maximumFractionDigits: 4, currency: "$", showCurrency: true })
                      : "—"}
                  </TableCell>
                  <TableCell className="py-3 px-4 hidden sm:table-cell">
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
                  </TableCell>
                  {hasVolume && (
                    <TableCell className="py-3 px-4 text-right text-sm text-text-secondary tabular-nums hidden md:table-cell">
                      {typeof row.volume === "number"
                        ? formatNumber(row.volume, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })
                        : "—"}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollableTable>
    </div>
  );
}
