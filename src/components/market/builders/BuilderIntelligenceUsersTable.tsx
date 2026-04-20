"use client";

import { useMemo, useState } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableHeadLabel,
  SortableTableHead,
} from "@/components/ui/table";
import { ScrollableTable } from "@/components/common/ScrollableTable";
import type { BuilderUserRow } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

interface BuilderIntelligenceUsersTableProps {
  users: BuilderUserRow[];
  isLoading: boolean;
  limit?: number;
}

type SortKey = "fees" | "volume";

function pickFees(u: BuilderUserRow): number {
  if (typeof u.totalBuilderFees === "number") return u.totalBuilderFees;
  if (typeof u.builderFees === "number") return u.builderFees;
  return 0;
}

function pickVolume(u: BuilderUserRow): number {
  return (u.totalVolume as number) ?? (u.volume as number) ?? 0;
}

export function BuilderIntelligenceUsersTable({
  users,
  isLoading,
  limit = 15,
}: BuilderIntelligenceUsersTableProps) {
  const { format } = useNumberFormat();
  const [sortKey, setSortKey] = useState<SortKey>("fees");
  const [sortAsc, setSortAsc] = useState(false);

  const totalFees = useMemo(() => users.reduce((acc, u) => acc + pickFees(u), 0), [users]);

  const sorted = useMemo(() => {
    return [...users].sort((a, b) => {
      const va = sortKey === "fees" ? pickFees(a) : pickVolume(a);
      const vb = sortKey === "fees" ? pickFees(b) : pickVolume(b);
      return sortAsc ? va - vb : vb - va;
    });
  }, [users, sortKey, sortAsc]);

  const rows = sorted.slice(0, limit);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm">Top Users</h2>
        {users.length > 0 && <span className="text-text-muted text-xs">{users.length} users</span>}
      </div>

      {isLoading && users.length === 0 ? (
        <LoadingState message="Loading users…" size="sm" withCard={false} />
      ) : users.length === 0 ? (
        <EmptyState
          title="No data"
          description="No user data for this window."
          withCard={false}
          className="h-[120px]"
        />
      ) : (
        <ScrollableTable>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border-subtle">
                <TableHead className="w-8">
                  <TableHeadLabel>#</TableHeadLabel>
                </TableHead>
                <TableHead>
                  <TableHeadLabel>User</TableHeadLabel>
                </TableHead>
                <SortableTableHead
                  label="Revenue"
                  isActive={sortKey === "fees"}
                  sortDirection={sortKey === "fees" ? (sortAsc ? "asc" : "desc") : undefined}
                  onClick={() => handleSort("fees")}
                />
                <SortableTableHead
                  className="hidden sm:table-cell"
                  label="Volume"
                  isActive={sortKey === "volume"}
                  sortDirection={sortKey === "volume" ? (sortAsc ? "asc" : "desc") : undefined}
                  onClick={() => handleSort("volume")}
                />
                <TableHead className="hidden md:table-cell">
                  <TableHeadLabel>Share</TableHeadLabel>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u, idx) => {
                const addr = ((u.user ?? u.address ?? "—") as string);
                const fees = pickFees(u);
                const vol = pickVolume(u);
                const share = totalFees > 0 ? (fees / totalFees) * 100 : 0;

                return (
                  <TableRow
                    key={addr + idx}
                    className="border-border-subtle hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="text-text-muted text-xs font-bold">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[9px] text-text-muted shrink-0">
                          {addr.length > 2 ? addr.slice(2, 3).toUpperCase() : "?"}
                        </div>
                        <span className="text-xs text-text-secondary font-mono truncate max-w-[100px]">
                          {addr.slice(0, 8)}…{addr.slice(-4)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-brand-gold tabular-nums">
                      {formatNumber(fees, format, { maximumFractionDigits: 2, currency: "$", showCurrency: true })}
                    </TableCell>
                    <TableCell className="text-text-secondary tabular-nums hidden sm:table-cell">
                      {vol > 0
                        ? formatNumber(vol, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })
                        : "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-accent/50 rounded-full"
                            style={{ width: `${Math.min(share, 100)}%` }}
                          />
                        </div>
                        <span className="text-text-muted text-xs w-8 text-left tabular-nums">
                          {share.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollableTable>
      )}
    </div>
  );
}
