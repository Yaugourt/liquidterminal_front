"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ExternalLink, Search } from "lucide-react";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { TypedDataTable, type Column } from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDate } from "@/lib/formatters/dateFormatting";
import { VaultSummary } from "@/services/explorer/vault/types";
import type { NumberFormatType } from "@/store/number-format.store";
import type { DateFormatType } from "@/store/date-format.store";

function buildColumns(
  format: NumberFormatType,
  dateFormat: DateFormatType
): Column<VaultSummary>[] {
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      getSortValue: (v) => v.summary.name.toLowerCase(),
      accessor: (v) => (
        <span className="text-sm font-medium text-text-primary">{v.summary.name}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: (v) => (
        <StatusBadge variant={!v.summary.isClosed ? "success" : "error"}>
          {!v.summary.isClosed ? "Open" : "Closed"}
        </StatusBadge>
      ),
    },
    {
      key: "tvl",
      header: "TVL",
      type: "numeric",
      sortable: true,
      getSortValue: (v) => parseFloat(v.summary.tvl),
      accessor: (v) => (
        <span className="font-medium">
          ${formatNumber(parseFloat(v.summary.tvl), format, { maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "apr",
      header: "APR",
      type: "numeric",
      sortable: true,
      getSortValue: (v) => v.apr,
      accessor: (v) => (
        <span className={`font-medium ${v.apr >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
          {formatNumber(v.apr, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
        </span>
      ),
    },
    {
      key: "leader",
      header: "Leader",
      accessor: (v) => <AddressDisplay address={v.summary.leader} />,
    },
    {
      key: "created",
      header: "Created",
      sortable: true,
      getSortValue: (v) => v.summary.createTimeMillis,
      accessor: (v) => (
        <span className="text-text-secondary text-sm">
          {formatDate(v.summary.createTimeMillis, dateFormat)}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
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
            className="bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-bold px-3 py-1 h-7 text-xs flex items-center gap-1 mx-auto"
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

export function VaultEnhancedTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { vaults, isLoading, error } = useVaults({ limit: 1000, sortBy: "tvl" });
  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();

  const filtered = useMemo(() => {
    if (!search.trim()) return vaults;
    const q = search.toLowerCase();
    return vaults.filter(
      (v) =>
        v.summary.name.toLowerCase().includes(q) ||
        v.summary.vaultAddress.toLowerCase().includes(q)
    );
  }, [vaults, search]);

  const handleRowClick = useCallback(
    (vault: VaultSummary) => {
      router.push(`/explorer/vaults/${vault.summary.vaultAddress}`);
    },
    [router]
  );

  const toolbar = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
        <Input
          placeholder="Search vaults…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-8 text-sm bg-white/5 border-border-subtle text-text-primary placeholder:text-text-muted focus:border-brand-accent/50"
        />
      </div>
      <span className="text-text-muted text-xs ml-auto shrink-0">
        {filtered.length} vault{filtered.length !== 1 ? "s" : ""}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.4 }}
      className="glass-panel"
    >
      <TypedDataTable<VaultSummary>
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
        itemsPerPage={15}
        rowsPerPageOptions={[10, 15, 25, 50]}
        paginationVariant="full"
        onRowClick={handleRowClick}
        toolbar={toolbar}
      />
    </motion.div>
  );
}
