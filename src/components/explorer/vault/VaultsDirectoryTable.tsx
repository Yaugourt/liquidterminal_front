"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { TypedDataTable, ModuleAsset, TableStat, TableSearch, type Column } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { AddressDisplay } from "@/components/ui/address-display";
import { formatNumber, truncateAddress } from "@/lib/formatters/numberFormatting";
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
      type: "rank",
      accessor: (_v, _i, absoluteIndex) => absoluteIndex + 1,
    },
    {
      key: "name",
      header: "Vault",
      sortable: true,
      getSortValue: (v) => v.summary.name.toLowerCase(),
      className: "max-w-[240px]",
      accessor: (v) => (
        <ModuleAsset
          logo={initials(v.summary.name)}
          name={v.summary.name}
          sub={truncateAddress(v.summary.vaultAddress)}
        />
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
        v.followerCount !== null
          ? formatNumber(v.followerCount, format, { maximumFractionDigits: 0 })
          : "—",
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
      header: "Created",
      type: "time",
      align: "right",
      sortable: true,
      getSortValue: (v) => v.summary.createTimeMillis,
      accessor: (v) => formatDate(v.summary.createTimeMillis, dateFormat),
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
    <>
      <TableSearch value={search} onChange={setSearch} placeholder="Search name, address, leader…" />
      <PillTabs
        variant="text"
        tabs={statusTabs}
        activeTab={statusFilter}
        onTabChange={(v) => setStatusFilter(v as typeof statusFilter)}
      />
      <TableStat
        className="ml-auto"
        label={filtered.length !== 1 ? "Vaults" : "Vault"}
        value={formatNumber(filtered.length, format, { maximumFractionDigits: 0 })}
      />
    </>
  );

  return (
    <TypedDataTable<VaultRow>
      className="min-w-0"
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
      onRowClick={handleRowClick}
      toolbar={toolbar}
    />
  );
}
