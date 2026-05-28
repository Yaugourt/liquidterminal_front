"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useVaultLedger } from "@/services/explorer/vault/hooks/useVaultLedger";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { TypedDataTable, type Column } from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import type { VaultLedgerEntry } from "@/services/explorer/vault/types";

interface VaultLedgerTableProps {
  vaultAddress: string;
}

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
        <span className="text-text-secondary text-xs whitespace-nowrap">
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
            {type === "deposit" ? "Deposit" : "Withdraw"}
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
      align: "right",
      headerAlign: "right",
      accessor: (e) => {
        const type = getLedgerType(e, vaultAddress);
        const sign = type === "deposit" ? "+" : "-";
        return (
          <span
            className={`mono font-medium ${type === "deposit" ? "text-success" : "text-danger"}`}
          >
            {sign}${formatNumber(e.amount, format, { maximumFractionDigits: 2 })}{" "}
            <span className="text-text-tertiary text-[10px]">{e.token}</span>
          </span>
        );
      },
    },
    {
      key: "txHash",
      header: "Tx",
      accessor: (e) => <AddressDisplay address={e.txHash} showExternalLink showCopy />,
    },
  ];

  const handleFilterChange = useCallback((val: string) => {
    setFilterQuery(val);
  }, []);

  const toolbar = (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-sm font-semibold text-text-primary">Activity</h3>
      <Input
        placeholder="Filter by address or hash…"
        value={filterQuery}
        onChange={(e) => handleFilterChange(e.target.value)}
        className="h-7 px-3 text-xs bg-white/5 border-border-subtle text-text-primary placeholder:text-text-tertiary focus:border-brand/50 max-w-xs"
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35 }}
      className="bg-surface border border-border-subtle rounded-lg"
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
        itemsPerPage={20}
        rowsPerPageOptions={[20, 50, 100]}
        paginationVariant="full"
        toolbar={toolbar}
      />
    </motion.div>
  );
}
