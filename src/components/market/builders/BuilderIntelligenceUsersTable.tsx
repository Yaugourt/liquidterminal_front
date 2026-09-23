"use client";

import { useMemo } from "react";
import { TypedDataTable, CellBar, type Column } from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import type { BuilderUserRow } from "@/services/indexer/builders/types";
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
      type: "rank",
      width: "40px",
      accessor: (_u, idx) => idx + 1,
    },
    {
      key: "user",
      header: "User",
      accessor: (u) => {
        const addr = u.user ?? u.address;
        return typeof addr === "string" ? <AddressDisplay address={addr} /> : "—";
      },
    },
    {
      key: "fees",
      header: "Revenue",
      type: "fees",
      sortable: true,
      getSortValue: pickFees,
      accessor: (u) =>
        formatNumber(pickFees(u), format, { maximumFractionDigits: 2, currency: "$", showCurrency: true }),
    },
    {
      key: "volume",
      header: "Volume",
      type: "numeric",
      tone: () => "muted",
      sortable: true,
      getSortValue: pickVolume,
      className: "hidden sm:table-cell",
      accessor: (u) => {
        const vol = pickVolume(u);
        return vol > 0
          ? formatNumber(vol, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })
          : "—";
      },
    },
    {
      key: "share",
      header: "Share",
      align: "right",
      className: "hidden md:table-cell",
      accessor: (u) => {
        const share = totalFees > 0 ? (pickFees(u) / totalFees) * 100 : 0;
        return (
          <CellBar value={share / 100} tone="gold" label={`${share.toFixed(1)}%`} />
        );
      },
    },
  ], [format, totalFees]);

  return (
    <TypedDataTable<BuilderUserRow>
      title="Top users"
      tag={users.length > 0 ? `${users.length} users` : undefined}
      data={rows}
      columns={columns}
      getRowKey={(u, i) => `${(u.user ?? u.address ?? "—")}-${i}`}
      isLoading={isLoading && users.length === 0}
      emptyMessage="No data"
      emptyDescription="No user data for this window."
      initialSort={{ field: "fees", direction: "desc" }}
      density="compact"
    />
  );
}
