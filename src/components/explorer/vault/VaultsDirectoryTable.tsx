"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { TypedDataTable, type Column } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { AddressDisplay } from "@/components/ui/address-display";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDate } from "@/lib/formatters/dateFormatting";
import type {
  UseVaultsDirectoryResult,
  VaultRow,
} from "@/services/explorer/vault/hooks/useVaultsDirectory";
import type { NumberFormatType } from "@/store/number-format.store";
import type { DateFormatType } from "@/store/date-format.store";

const initials = (name: string) =>
  name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?";

function buildColumns(
  format: NumberFormatType,
  dateFormat: DateFormatType
): Column<VaultRow>[] {
  return [
    {
      key: "rank",
      header: "#",
      align: "right",
      headerAlign: "right",
      accessor: (_v, _i, absoluteIndex) => (
        <span className="mono text-text-tertiary text-xs">{absoluteIndex + 1}</span>
      ),
    },
    {
      key: "name",
      header: "Vault",
      sortable: true,
      getSortValue: (v) => v.summary.name.toLowerCase(),
      accessor: (v) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-6 h-6 shrink-0 rounded-md grid place-items-center text-[9px] font-semibold bg-surface-2 text-text-secondary">
            {initials(v.summary.name)}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium text-text-primary truncate max-w-[240px]">
              {v.summary.name}
            </div>
            <div className="mono text-[11px] text-text-tertiary">
              {v.summary.vaultAddress.slice(0, 8)}…{v.summary.vaultAddress.slice(-4)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "leader",
      header: "Leader",
      accessor: (v) => <AddressDisplay address={v.summary.leader} />,
    },
    {
      key: "tvl",
      header: "TVL",
      type: "numeric",
      sortable: true,
      getSortValue: (v) => parseFloat(v.summary.tvl),
      accessor: (v) =>
        `$${formatNumber(parseFloat(v.summary.tvl), format, { maximumFractionDigits: 0 })}`,
    },
    {
      key: "apr",
      header: "APR",
      type: "change",
      sortable: true,
      getSortValue: (v) => v.apr,
      accessor: (v) => `${v.apr.toFixed(2)}%`,
    },
    {
      key: "followers",
      header: "Followers",
      type: "numeric",
      sortable: true,
      getSortValue: (v) => v.followerCount ?? -1,
      accessor: (v) =>
        v.followerCount !== null ? formatNumber(v.followerCount, format) : "—",
    },
    {
      key: "commission",
      header: "Comm.",
      type: "numeric",
      sortable: true,
      getSortValue: (v) => v.leaderCommission ?? -1,
      accessor: (v) =>
        v.leaderCommission !== null ? `${(v.leaderCommission * 100).toFixed(0)}%` : "—",
    },
    {
      key: "created",
      header: "Age",
      sortable: true,
      getSortValue: (v) => v.summary.createTimeMillis,
      accessor: (v) => (
        <span className="text-text-secondary text-xs">
          {formatDate(v.summary.createTimeMillis, dateFormat)}
        </span>
      ),
    },
  ];
}

interface VaultsDirectoryTableProps {
  directory: UseVaultsDirectoryResult;
}

export function VaultsDirectoryTable({ directory }: VaultsDirectoryTableProps) {
  const router = useRouter();
  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();

  const {
    filtered,
    isLoading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    totalCount,
    openCount,
    closedCount,
  } = directory;

  const handleRowClick = useCallback(
    (vault: VaultRow) => {
      router.push(`/explorer/vaults/${vault.summary.vaultAddress}`);
    },
    [router]
  );

  const fmt = (n: number) => n.toLocaleString("en-US");
  const statusTabs = [
    { value: "all", label: `All ${fmt(totalCount)}` },
    { value: "open", label: `Open ${fmt(openCount)}` },
    { value: "closed", label: `Closed ${fmt(closedCount)}` },
  ];

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[160px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
        <Input
          placeholder="Search name, address, leader…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-8 text-sm bg-transparent border-border-subtle text-text-primary placeholder:text-text-tertiary focus:border-brand/50"
        />
      </div>
      <PillTabs
        variant="text"
        tabs={statusTabs}
        activeTab={statusFilter}
        onTabChange={(v) => setStatusFilter(v as typeof statusFilter)}
      />
      <span className="text-text-tertiary text-xs ml-auto shrink-0">
        {filtered.length} vault{filtered.length !== 1 ? "s" : ""}
      </span>
    </div>
  );

  return (
    <div className="min-w-0 bg-surface border border-border-subtle rounded-lg">
      <TypedDataTable<VaultRow>
        data={filtered}
        columns={buildColumns(format, dateFormat)}
        getRowKey={(v) => v.summary.vaultAddress}
        isLoading={isLoading}
        error={error}
        errorTitle="Failed to load vaults"
        emptyMessage="No vaults found"
        emptyDescription="Try adjusting your search or filters."
        initialSort={{ field: "tvl", direction: "desc" }}
        paginate
        itemsPerPage={20}
        rowsPerPageOptions={[20, 50, 100]}
        paginationVariant="full"
        headerFill={false}
        onRowClick={handleRowClick}
        toolbar={toolbar}
      />
    </div>
  );
}
