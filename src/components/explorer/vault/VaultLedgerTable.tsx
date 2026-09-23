"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useVaultLedger } from "@/services/explorer/vault/hooks/useVaultLedger";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { TypedDataTable, TableSearch, SourceBadge, sourceStatus, type Column } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { Button } from "@/components/ui/button";
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
      type: "time",
      accessor: (e) => formatDateTime(e.time, dateFormat),
    },
    {
      key: "type",
      header: "Type",
      accessor: (e) => {
        const type = classifyLedger(e, vaultAddress);
        return (
          <StatusBadge variant={type === "deposit" ? "buy" : "sell"}>
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
      type: "numeric",
      tone: (e) => (classifyLedger(e, vaultAddress) === "deposit" ? "success" : "danger"),
      accessor: (e) => {
        const sign = classifyLedger(e, vaultAddress) === "deposit" ? "+" : "-";
        return `${sign}$${formatNumber(e.amount, format, { maximumFractionDigits: 2 })} ${e.token}`;
      },
    },
    {
      key: "txHash",
      header: "Tx",
      accessor: (e) => (
        <AddressDisplay
          address={e.txHash}
          href={`/explorer/transaction/${e.txHash}`}
          copyMessage="Hash copied to clipboard"
        />
      ),
    },
  ];

  const headerAction = (
    <div className="flex items-center gap-2">
      <SourceBadge source="hypedexer" status={sourceStatus(error, isLoading)} />
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
          filtered.length === 0 ? "No rows to export" : `Export ${filtered.length} filtered rows`
        }
      >
        <Download className="h-3 w-3" />
        Export
      </Button>
    </div>
  );

  const toolbar = (
    <>
      <PillTabs
        variant="text"
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
      <TableSearch
        value={filterQuery}
        onChange={handleFilterChange}
        placeholder="Filter by address or hash…"
        className="max-w-xs sm:ml-auto"
      />
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35 }}
      className="min-w-0"
    >
      <TypedDataTable<VaultLedgerEntry>
        title="Activity"
        // Exact counts: "Load more" adding 43 rows must show, "2.0K" would hide it.
        tag={`${formatNumber(filtered.length, format, { maximumFractionDigits: 0 })} shown · ${formatNumber(entries.length, format, { maximumFractionDigits: 0 })} loaded`}
        headerAction={headerAction}
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
        density="compact"
        toolbar={toolbar}
      />
    </motion.div>
  );
}
