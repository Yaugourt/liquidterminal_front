"use client";

import { useMemo } from "react";
import { TypedDataTable, type Column } from "@/components/common";
import type { BuilderUserRow } from "@/services/indexer/builders/types";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

interface BuilderIntelligenceUsersTableProps {
  users: BuilderUserRow[];
  isLoading: boolean;
  limit?: number;
}

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
  const totalFees = useMemo(() => users.reduce((acc, u) => acc + pickFees(u), 0), [users]);

  // Cap to the requested limit on the input side — TypedDataTable does sort + render.
  const rows = useMemo(() => users.slice(0, limit), [users, limit]);

  const columns = useMemo<Column<BuilderUserRow>[]>(() => [
    {
      key: "rank",
      header: "#",
      className: "w-8",
      accessor: (_u, idx) => (
        <span className="text-text-tertiary text-xs font-bold">{idx + 1}</span>
      ),
    },
    {
      key: "user",
      header: "User",
      accessor: (u) => {
        const addr = (u.user ?? u.address ?? "—") as string;
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[9px] text-text-tertiary shrink-0">
              {addr.length > 2 ? addr.slice(2, 3).toUpperCase() : "?"}
            </div>
            <span className="text-xs text-text-secondary font-mono truncate max-w-[100px]">
              {addr.slice(0, 8)}…{addr.slice(-4)}
            </span>
          </div>
        );
      },
    },
    {
      key: "fees",
      header: "Revenue",
      sortable: true,
      getSortValue: pickFees,
      accessor: (u) => (
        <span className="text-gold tabular-nums">
          {formatNumber(pickFees(u), format, { maximumFractionDigits: 2, currency: "$", showCurrency: true })}
        </span>
      ),
    },
    {
      key: "volume",
      header: "Volume",
      sortable: true,
      getSortValue: pickVolume,
      className: "hidden sm:table-cell",
      accessor: (u) => {
        const vol = pickVolume(u);
        return (
          <span className="text-text-secondary tabular-nums">
            {vol > 0
              ? formatNumber(vol, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })
              : "—"}
          </span>
        );
      },
    },
    {
      key: "share",
      header: "Share",
      className: "hidden md:table-cell",
      accessor: (u) => {
        const share = totalFees > 0 ? (pickFees(u) / totalFees) * 100 : 0;
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand/50 rounded-full"
                style={{ width: `${Math.min(share, 100)}%` }}
              />
            </div>
            <span className="text-text-tertiary text-xs w-8 text-left tabular-nums">
              {share.toFixed(1)}%
            </span>
          </div>
        );
      },
    },
  ], [format, totalFees]);

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-text-primary font-semibold text-sm">Top Users</h2>
        {users.length > 0 && <span className="text-text-tertiary text-xs">{users.length} users</span>}
      </div>

      <TypedDataTable<BuilderUserRow>
        data={rows}
        columns={columns}
        getRowKey={(u, i) => `${(u.user ?? u.address ?? "—")}-${i}`}
        isLoading={isLoading && users.length === 0}
        emptyMessage="No data"
        emptyDescription="No user data for this window."
        initialSort={{ field: "fees", direction: "desc" }}
      />
    </Card>
  );
}
