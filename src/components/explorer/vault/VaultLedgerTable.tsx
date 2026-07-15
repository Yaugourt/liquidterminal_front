"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useVaultLedger } from "@/services/explorer/vault/hooks/useVaultLedger";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { TypedDataTable, type Column } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import type { VaultLedgerEntry } from "@/services/explorer/vault/types";

interface VaultLedgerTableProps {
  vaultAddress: string;
}

type LedgerTypeFilter = "all" | "deposit" | "withdraw";

const PAGE_SIZE = 2000;

function classifyLedger(entry: VaultLedgerEntry, vaultAddress: string): "deposit" | "withdraw" {
  return entry.userTo.toLowerCase() === vaultAddress.toLowerCase() ? "deposit" : "withdraw";
}

function buildLedgerCsv(entries: VaultLedgerEntry[], vaultAddress: string): string {
  const header = ["time_ms", "type", "user", "amount", "token", "txHash"];
  const lines = entries.map((e) => {
    const type = classifyLedger(e, vaultAddress);
    const user = type === "deposit" ? e.userFrom : e.userTo;
    return [e.time, type, user, e.amount, e.token, e.txHash].join(",");
  });
  return [header.join(","), ...lines].join("\n");
}

function downloadLedgerCsv(entries: VaultLedgerEntry[], vaultAddress: string) {
  const blob = new Blob([buildLedgerCsv(entries, vaultAddress)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `vault-${vaultAddress.slice(0, 10)}-ledger-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function VaultLedgerTable({ vaultAddress }: VaultLedgerTableProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<LedgerTypeFilter>("all");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { entries, isLoading, error } = useVaultLedger({ vaultAddress, limit });

  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();

  const depositCount = useMemo(
    () => entries.filter((e) => classifyLedger(e, vaultAddress) === "deposit").length,
    [entries, vaultAddress]
  );
  const withdrawCount = useMemo(
    () => entries.filter((e) => classifyLedger(e, vaultAddress) === "withdraw").length,
    [entries, vaultAddress]
  );

  const filtered = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    return entries.filter((e) => {
      const type = classifyLedger(e, vaultAddress);
      if (typeFilter !== "all" && typeFilter !== type) return false;
      if (!q) return true;
      return (
        e.userFrom.toLowerCase().includes(q) ||
        e.userTo.toLowerCase().includes(q) ||
        e.txHash.toLowerCase().includes(q)
      );
    });
  }, [entries, filterQuery, typeFilter, vaultAddress]);

  const handleFilterChange = useCallback((val: string) => {
    setFilterQuery(val);
  }, []);

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
        const type = classifyLedger(e, vaultAddress);
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
        const type = classifyLedger(e, vaultAddress);
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
        const type = classifyLedger(e, vaultAddress);
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

  const toolbar = (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <h3 className="text-sm font-semibold text-text-primary">Activity</h3>
      <PillTabs
        activeTab={typeFilter}
        onTabChange={(v) => setTypeFilter(v as LedgerTypeFilter)}
        tabs={[
          { value: "all", label: `All ${entries.length ? `· ${entries.length}` : ""}` },
          { value: "deposit", label: `Deposits ${depositCount ? `· ${depositCount}` : ""}` },
          {
            value: "withdraw",
            label: `Withdrawals ${withdrawCount ? `· ${withdrawCount}` : ""}`,
          },
        ]}
      />
      <Input
        placeholder="Filter by address or hash…"
        value={filterQuery}
        onChange={(e) => handleFilterChange(e.target.value)}
        className="h-7 px-3 text-xs bg-white/5 border-border-subtle text-text-primary placeholder:text-text-tertiary focus:border-brand/50 max-w-xs sm:ml-auto"
      />
    </div>
  );

  const footer = (
    <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 border-t border-border-subtle text-[11px] text-text-tertiary">
      <span>
        <span className="mono text-text-primary">{filtered.length}</span> shown ·{" "}
        <span className="mono text-text-primary">{entries.length}</span> loaded
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-3 text-xs"
          onClick={() => setLimit((l) => l + PAGE_SIZE)}
          disabled={isLoading || entries.length < limit}
          title={entries.length < limit ? "All available entries loaded" : "Load 2 000 more"}
        >
          Load more
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-3 text-xs gap-1.5"
          onClick={() => downloadLedgerCsv(filtered, vaultAddress)}
          disabled={filtered.length === 0}
          title={
            filtered.length === 0
              ? "No rows to export"
              : `Export ${filtered.length} filtered rows`
          }
        >
          <Download className="h-3 w-3" />
          Export
        </Button>
      </div>
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
        emptyDescription={
          filterQuery
            ? `No results for "${filterQuery}"`
            : "The indexer has no ledger history for this vault"
        }
        paginate
        itemsPerPage={20}
        rowsPerPageOptions={[20, 50, 100]}
        paginationVariant="full"
        toolbar={toolbar}
      />
      {footer}
    </motion.div>
  );
}
