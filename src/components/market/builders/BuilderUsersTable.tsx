"use client";

import { useMemo, useState } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  SortableTableHead,
  TableHead,
  TableHeadLabel,
} from "@/components/ui/table";
import { ScrollableTable } from "@/components/common";
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

function pickFees(row: BuilderUserRow): number {
  if (typeof row.totalBuilderFees === "number") return row.totalBuilderFees;
  if (typeof row.builderFees === "number") return row.builderFees;
  return 0;
}

type SortKey = "fees" | "volume";

export function BuilderUsersTable({ users, isLoading, error }: BuilderUsersTableProps) {
  const { format } = useNumberFormat();
  const [sortKey, setSortKey] = useState<SortKey>("fees");
  const [sortAsc, setSortAsc] = useState(false);

  const totalFees = useMemo(() => users.reduce((acc, u) => acc + pickFees(u), 0), [users]);

  const hasVolume = users[0]?.volume !== undefined || users[0]?.totalVolume !== undefined;

  const sorted = useMemo(() => {
    return [...users].sort((a, b) => {
      if (sortKey === "fees") {
        const va = pickFees(a);
        const vb = pickFees(b);
        return sortAsc ? va - vb : vb - va;
      }
      const va = (a.volume as number) ?? (a.totalVolume as number) ?? 0;
      const vb = (b.volume as number) ?? (b.totalVolume as number) ?? 0;
      return sortAsc ? va - vb : vb - va;
    });
  }, [users, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

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

  return (
    <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
      <ScrollableTable>
        <Table>
          <TableHeader>
            <TableRow className="border-border-subtle hover:bg-transparent">
              <TableHead className="w-8">
                <TableHeadLabel>#</TableHeadLabel>
              </TableHead>
              <TableHead>
                <TableHeadLabel>User</TableHeadLabel>
              </TableHead>
              <SortableTableHead
                label="Builder Fees"
                isActive={sortKey === "fees"}
                sortDirection={sortKey === "fees" ? (sortAsc ? "asc" : "desc") : undefined}
                onClick={() => handleSort("fees")}
              />
              <TableHead className="hidden sm:table-cell">
                <TableHeadLabel>Share</TableHeadLabel>
              </TableHead>
              {hasVolume && (
                <SortableTableHead
                  className="hidden md:table-cell"
                  label="Volume"
                  isActive={sortKey === "volume"}
                  sortDirection={sortKey === "volume" ? (sortAsc ? "asc" : "desc") : undefined}
                  onClick={() => handleSort("volume")}
                />
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row, idx) => {
              const addr = pickAddress(row);
              const fees = pickFees(row);
              const vol = (row.volume as number) ?? (row.totalVolume as number) ?? 0;
              const sharePct = totalFees > 0 ? (fees / totalFees) * 100 : 0;

              return (
                <TableRow
                  key={`${addr}-${idx}`}
                  className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors"
                >
                  <TableCell className="w-8">
                    <span className="text-sm font-bold tabular-nums text-text-muted">{idx + 1}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-text-muted shrink-0">
                        {addr !== "—" && addr.length > 2 ? addr.slice(2, 3).toUpperCase() : "?"}
                      </div>
                      <span className="text-xs text-text-secondary font-mono truncate max-w-[160px] sm:max-w-none">
                        {addr}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-brand-gold tabular-nums">
                    {fees > 0
                      ? formatNumber(fees, format, { maximumFractionDigits: 4, currency: "$", showCurrency: true })
                      : "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-accent/50 rounded-full"
                          style={{ width: `${Math.min(sharePct, 100)}%` }}
                        />
                      </div>
                      <span className="text-text-muted text-xs tabular-nums w-10 text-left">
                        {sharePct.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  {hasVolume && (
                    <TableCell className="text-text-secondary tabular-nums hidden md:table-cell">
                      {vol > 0
                        ? formatNumber(vol, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })
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
