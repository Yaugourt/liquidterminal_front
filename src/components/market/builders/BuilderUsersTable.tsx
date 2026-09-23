"use client";

import { useMemo } from "react";
import { TypedDataTable, CellBar, type Column } from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import type { BuilderUserRow } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

interface BuilderUsersTableProps {
  users: BuilderUserRow[];
  isLoading: boolean;
  error: Error | null;
  /** Window label shown in the title ("7d"). */
  timeframe?: string;
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

export function BuilderUsersTable({ users, isLoading, error, timeframe }: BuilderUsersTableProps) {
  const { format } = useNumberFormat();
  const hasVolume = users[0]?.volume !== undefined || users[0]?.totalVolume !== undefined;

  const totalFees = useMemo(() => users.reduce((acc, u) => acc + pickFees(u), 0), [users]);

  const columns = useMemo<Column<BuilderUserRow>[]>(() => {
    const cols: Column<BuilderUserRow>[] = [
      {
        key: "rank",
        header: "#",
        type: "rank",
        width: "40px",
        accessor: (_row, _idx, abs) => abs + 1,
      },
      {
        key: "user",
        header: "User",
        accessor: (row) => {
          const addr = pickAddress(row);
          return addr === "—" ? "—" : <AddressDisplay address={addr} />;
        },
      },
      {
        key: "fees",
        header: "Builder Fees",
        type: "fees",
        sortable: true,
        getSortValue: pickFees,
        accessor: (row) => {
          const fees = pickFees(row);
          return fees > 0
            ? formatNumber(fees, format, { maximumFractionDigits: 4, currency: "$", showCurrency: true })
            : "—";
        },
      },
      {
        key: "share",
        header: "Share",
        align: "right",
        className: "hidden sm:table-cell",
        accessor: (row) => {
          const sharePct = totalFees > 0 ? (pickFees(row) / totalFees) * 100 : 0;
          return (
            <CellBar value={sharePct / 100} tone="gold" label={`${sharePct.toFixed(1)}%`} />
          );
        },
      },
    ];
    if (hasVolume) {
      cols.push({
        key: "volume",
        header: "Volume",
        type: "numeric",
        tone: () => "muted",
        sortable: true,
        getSortValue: pickVolume,
        className: "hidden md:table-cell",
        accessor: (row) => {
          const vol = pickVolume(row);
          return vol > 0
            ? formatNumber(vol, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })
            : "—";
        },
      });
    }
    return cols;
  }, [format, totalFees, hasVolume]);

  return (
    <TypedDataTable<BuilderUserRow>
      title={timeframe ? `Top users (${timeframe})` : "Top users"}
      tag={users.length > 0 ? `${users.length} users` : undefined}
      data={users}
      columns={columns}
      getRowKey={(row, idx) => `${pickAddress(row)}-${idx}`}
      isLoading={isLoading && users.length === 0}
      error={error}
      errorTitle="Failed to load users"
      emptyMessage="No top users"
      emptyDescription="No user data for this window."
      initialSort={{ field: "fees", direction: "desc" }}
      density="compact"
    />
  );
}
