"use client";

import { useMemo } from "react";
import { TypedDataTable, type Column } from "@/components/common";
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

function pickVolume(row: BuilderUserRow): number {
  return (row.volume as number) ?? (row.totalVolume as number) ?? 0;
}

export function BuilderUsersTable({ users, isLoading, error }: BuilderUsersTableProps) {
  const { format } = useNumberFormat();
  const hasVolume = users[0]?.volume !== undefined || users[0]?.totalVolume !== undefined;

  const totalFees = useMemo(() => users.reduce((acc, u) => acc + pickFees(u), 0), [users]);

  const columns = useMemo<Column<BuilderUserRow>[]>(() => {
    const cols: Column<BuilderUserRow>[] = [
      {
        key: "rank",
        header: "#",
        accessor: () => null, // overridden by render order below; we use absoluteIndex via getRowKey approach
        className: "w-8",
      },
      {
        key: "user",
        header: "User",
        accessor: (row) => {
          const addr = pickAddress(row);
          return (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-text-muted shrink-0">
                {addr !== "—" && addr.length > 2 ? addr.slice(2, 3).toUpperCase() : "?"}
              </div>
              <span className="text-xs text-text-secondary font-mono truncate max-w-[160px] sm:max-w-none">
                {addr}
              </span>
            </div>
          );
        },
      },
      {
        key: "fees",
        header: "Builder Fees",
        sortable: true,
        getSortValue: pickFees,
        accessor: (row) => {
          const fees = pickFees(row);
          return (
            <span className="text-brand-gold tabular-nums">
              {fees > 0
                ? formatNumber(fees, format, { maximumFractionDigits: 4, currency: "$", showCurrency: true })
                : "—"}
            </span>
          );
        },
      },
      {
        key: "share",
        header: "Share",
        className: "hidden sm:table-cell",
        accessor: (row) => {
          const sharePct = totalFees > 0 ? (pickFees(row) / totalFees) * 100 : 0;
          return (
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
          );
        },
      },
    ];
    if (hasVolume) {
      cols.push({
        key: "volume",
        header: "Volume",
        sortable: true,
        getSortValue: pickVolume,
        className: "hidden md:table-cell",
        accessor: (row) => {
          const vol = pickVolume(row);
          return (
            <span className="text-text-secondary tabular-nums">
              {vol > 0
                ? formatNumber(vol, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })
                : "—"}
            </span>
          );
        },
      });
    }
    return cols;
  }, [format, totalFees, hasVolume]);

  return (
    <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
      <TypedDataTable<BuilderUserRow>
        data={users}
        columns={columns}
        getRowKey={(row, idx) => `${pickAddress(row)}-${idx}`}
        isLoading={isLoading && users.length === 0}
        error={error}
        errorTitle="Failed to load users"
        emptyMessage="No top users"
        emptyDescription="No user data for this window."
        initialSort={{ field: "fees", direction: "desc" }}
      />
    </div>
  );
}
