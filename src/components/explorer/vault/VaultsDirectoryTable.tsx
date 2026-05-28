"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Search } from "lucide-react";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { TypedDataTable, type Column } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDate } from "@/lib/formatters/dateFormatting";
import type {
  UseVaultsDirectoryResult,
  VaultRow,
  StatusFilter,
} from "@/services/explorer/vault/hooks/useVaultsDirectory";
import type { NumberFormatType } from "@/store/number-format.store";
import type { DateFormatType } from "@/store/date-format.store";

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
        <div className="min-w-0">
          <div className="text-sm font-medium text-text-primary truncate max-w-[240px]">
            {v.summary.name}
          </div>
          <div className="mono text-[11px] text-text-tertiary">
            {v.summary.vaultAddress.slice(0, 8)}…{v.summary.vaultAddress.slice(-4)}
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
    {
      key: "status",
      header: "Status",
      align: "center",
      headerAlign: "center",
      accessor: (v) => (
        <StatusBadge variant={v.summary.isClosed ? "inactive" : "success"}>
          {v.summary.isClosed ? "Closed" : "Open"}
        </StatusBadge>
      ),
    },
    {
      key: "action",
      header: "",
      align: "center",
      headerAlign: "center",
      accessor: (v) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            onClick={() =>
              window.open(
                `https://app.hyperliquid.xyz/vaults/${v.summary.vaultAddress}`,
                "_blank"
              )
            }
            className="bg-brand hover:bg-brand/90 text-brand-text-on font-semibold px-2.5 py-1 h-7 text-[11px] flex items-center gap-1 mx-auto"
            disabled={v.summary.isClosed}
          >
            Deposit
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
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
    openCount,
    closedCount,
    totalCount,
    isLoading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
  } = directory;

  const handleRowClick = useCallback(
    (vault: VaultRow) => {
      router.push(`/explorer/vaults/${vault.summary.vaultAddress}`);
    },
    [router]
  );

  const toolbar = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <PillTabs
        activeTab={statusFilter}
        onTabChange={(v) => setStatusFilter(v as StatusFilter)}
        tabs={[
          { value: "all", label: `All ${totalCount ? `· ${totalCount}` : ""}` },
          { value: "open", label: `Open ${openCount ? `· ${openCount}` : ""}` },
          { value: "closed", label: `Closed ${closedCount ? `· ${closedCount}` : ""}` },
        ]}
      />
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
        <Input
          placeholder="Search name, address, leader…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-8 text-sm bg-white/5 border-border-subtle text-text-primary placeholder:text-text-tertiary focus:border-brand/50"
        />
      </div>
      <span className="text-text-tertiary text-xs ml-auto shrink-0">
        {filtered.length} vault{filtered.length !== 1 ? "s" : ""}
      </span>
    </div>
  );

  return (
    <div className="bg-surface border border-border-subtle rounded-lg">
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
        onRowClick={handleRowClick}
        toolbar={toolbar}
      />
    </div>
  );
}
