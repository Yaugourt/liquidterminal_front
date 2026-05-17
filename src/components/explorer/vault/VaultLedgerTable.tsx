"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useVaultLedger } from "@/services/explorer/vault/hooks/useVaultLedger";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { TypedDataTable, type Column } from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { VaultLedgerEntry } from "@/services/explorer/vault/types";

interface VaultLedgerTableProps {
  vaultAddress: string;
}

/** Determine if an entry is a deposit or withdrawal based on direction */
function getLedgerType(entry: VaultLedgerEntry, vaultAddress: string): "deposit" | "withdraw" {
  return entry.userTo.toLowerCase() === vaultAddress.toLowerCase() ? "deposit" : "withdraw";
}

export function VaultLedgerTable({ vaultAddress }: VaultLedgerTableProps) {
  const [filterQuery, setFilterQuery] = useState("");

  const { entries, isLoading, error } = useVaultLedger({
    vaultAddress,
    limit: 500,
  });

  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();

  const filtered = useMemo(() => {
    if (!filterQuery.trim()) return entries;
    const q = filterQuery.toLowerCase();
    return entries.filter(
      (e) =>
        e.userFrom.toLowerCase().includes(q) ||
        e.userTo.toLowerCase().includes(q) ||
        e.txHash.toLowerCase().includes(q)
    );
  }, [entries, filterQuery]);

  const columns: Column<VaultLedgerEntry>[] = [
    {
      key: "time",
      header: "Time",
      accessor: (e) => (
        <span className="text-text-secondary text-sm">
          {formatDateTime(e.time, dateFormat)}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      accessor: (e) => {
        const type = getLedgerType(e, vaultAddress);
        return (
          <StatusBadge variant={type === "deposit" ? "success" : "error"}>
            {type}
          </StatusBadge>
        );
      },
    },
    {
      key: "user",
      header: "User",
      accessor: (e) => {
        const type = getLedgerType(e, vaultAddress);
        const user = type === "deposit" ? e.userFrom : e.userTo;
        return <AddressDisplay address={user} />;
      },
    },
    {
      key: "amount",
      header: "Amount",
      type: "numeric",
      accessor: (e) => {
        const type = getLedgerType(e, vaultAddress);
        return (
          <span className={`font-medium ${type === "deposit" ? "text-emerald-400" : "text-rose-400"}`}>
            {type === "deposit" ? "+" : "-"}$
            {formatNumber(e.amount, format, { maximumFractionDigits: 2 })}{" "}
            <span className="text-text-muted text-[10px]">{e.token}</span>
          </span>
        );
      },
    },
    {
      key: "txHash",
      header: "Tx Hash",
      accessor: (e) => (
        <AddressDisplay address={e.txHash} showExternalLink showCopy />
      ),
    },
  ];

  const handleFilterChange = useCallback(
    (val: string) => {
      setFilterQuery(val);
    },
    []
  );

  const toolbar = (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-text-primary">Ledger</h3>
      <input
        placeholder="Filter by address or hash…"
        value={filterQuery}
        onChange={(e) => handleFilterChange(e.target.value)}
        className="h-7 px-3 text-xs bg-white/5 border border-border-subtle rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-accent/50 w-52"
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35 }}
      className="glass-panel"
    >
      <TypedDataTable<VaultLedgerEntry>
        data={filtered}
        columns={columns}
        getRowKey={(e) => `${e.txHash}-${e.time}`}
        isLoading={isLoading}
        error={error}
        errorTitle="Failed to load ledger"
        emptyMessage="No ledger entries found"
        emptyDescription={filterQuery ? `No results for "${filterQuery}"` : "Check back soon"}
        paginate
        itemsPerPage={15}
        rowsPerPageOptions={[10, 15, 25, 50]}
        paginationVariant="full"
        toolbar={toolbar}
      />
    </motion.div>
  );
}
