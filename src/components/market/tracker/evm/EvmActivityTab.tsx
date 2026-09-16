"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ExternalLink, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PillTabs } from "@/components/ui/pill-tabs";
import { TypedDataTable, type Column } from "@/components/common";
import { useNumberFormat, type NumberFormatType } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import type { DateFormatType } from "@/store/date-format.store";
import { formatNumber, truncateAddress } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import {
  useEvmTransactions,
  hyperEvmTxUrl,
  type EvmTransaction,
  type EvmTransactionType,
} from "@/services/market/tracker/hyperfolio";
import { ProtocolAvatar } from "./ProtocolAvatar";
import { HyperfolioNotice } from "./HyperfolioNotice";

interface EvmActivityTabProps {
  address: string;
}

const TYPE_TABS: { value: EvmTransactionType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "normal", label: "Normal" },
  { value: "token", label: "Token" },
  { value: "internal", label: "Internal" },
];

const SEARCH_DEBOUNCE_MS = 400;

const actionLabel = (action: string): string =>
  action.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^\w/, (c) => c.toUpperCase());

function buildColumns(format: NumberFormatType, dateFormat: DateFormatType): Column<EvmTransaction>[] {
  return [
    {
      key: "time",
      header: "Date",
      accessor: (tx) => <span className="text-text-secondary text-xs whitespace-nowrap">{formatDateTime(tx.timestamp, dateFormat)}</span>,
      width: 150,
    },
    {
      key: "action",
      header: "Action",
      accessor: (tx) => (
        <span className="inline-flex items-center gap-1.5">
          {tx.direction === "in" ? (
            <ArrowDownLeft size={13} className="text-success shrink-0" />
          ) : tx.direction === "out" ? (
            <ArrowUpRight size={13} className="text-danger shrink-0" />
          ) : null}
          <span className={`font-semibold ${tx.failed ? "text-danger line-through" : "text-text-primary"}`}>
            {actionLabel(tx.action)}
          </span>
          {tx.failed && <span className="text-[10px] font-semibold text-danger">failed</span>}
        </span>
      ),
    },
    {
      key: "protocol",
      header: "Protocol",
      accessor: (tx) =>
        tx.protocol.id === "unknown" ? (
          <span className="text-text-tertiary text-xs mono">{truncateAddress(tx.to)}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <ProtocolAvatar name={tx.protocol.name} logo={tx.protocol.logo} size="sm" />
            <span className="text-text-primary">{tx.protocol.name}</span>
          </span>
        ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      accessor: (tx) =>
        tx.tokens.length === 0 ? (
          <span className="text-text-tertiary">—</span>
        ) : (
          <span className="flex flex-col items-end gap-0.5">
            {tx.tokens.slice(0, 3).map((t, i) => (
              <span key={`${t.symbol}-${i}`} className="mono text-xs whitespace-nowrap">
                <span className="text-text-primary">
                  {formatNumber(t.amount, format, { maximumFractionDigits: t.amount >= 1000 ? 2 : 4 })}
                </span>{" "}
                <span className="text-text-tertiary">{t.symbol}</span>
                {t.valueUsd !== null && t.valueUsd > 0 && (
                  <span className="text-text-tertiary"> · ${formatNumber(t.valueUsd, format, { maximumFractionDigits: 2 })}</span>
                )}
              </span>
            ))}
          </span>
        ),
    },
    {
      key: "hash",
      header: "Hash",
      align: "right",
      width: 120,
      accessor: (tx) => (
        <a
          href={hyperEvmTxUrl(tx.hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mono text-xs text-text-secondary hover:text-brand transition-colors"
          title="Open on HyperEVMScan"
        >
          {truncateAddress(tx.hash)}
          <ExternalLink size={11} />
        </a>
      ),
    },
  ];
}

/**
 * Decoded HyperEVM transactions — server-side pagination, search and type
 * filter (Hyperfolio `/wallet/transactions`). Hashes link to HyperEVMScan:
 * the in-app explorer only resolves HyperCore transactions.
 */
export function EvmActivityTab({ address }: EvmActivityTabProps) {
  const { transactions, total, page, pageSize, params, updateParams, isLoading, error, refetch } =
    useEvmTransactions(address);
  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = search.trim();
      if (next !== (params.search ?? "")) updateParams({ search: next || undefined });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search, params.search, updateParams]);

  const columns = useMemo(() => buildColumns(format, dateFormat), [format, dateFormat]);

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2 px-3.5 py-2.5">
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search hash, address, token, method…"
          className="h-8 pl-8 text-xs"
        />
      </div>
      <PillTabs
        variant="text"
        tabs={TYPE_TABS}
        activeTab={params.type ?? "all"}
        onTabChange={(value) => updateParams({ type: value as EvmTransactionType })}
      />
      <span className="ml-auto text-[11px] text-text-tertiary mono">{total.toLocaleString()} txs</span>
    </div>
  );

  return (
    <div>
      {error && transactions.length === 0 && (
        <div className="p-3.5">
          <HyperfolioNotice error={error} onRetry={refetch} />
        </div>
      )}
      <TypedDataTable<EvmTransaction>
        data={transactions}
        columns={columns}
        getRowKey={(tx) => `${tx.hash}-${tx.type}`}
        isLoading={isLoading && transactions.length === 0}
        emptyMessage="No HyperEVM activity"
        emptyDescription={params.search || params.type ? "No transaction matches these filters." : "This wallet has no decoded HyperEVM transactions yet."}
        toolbar={toolbar}
        headerFill={false}
        density="compact"
        paginationVariant="full"
        total={total}
        page={page - 1}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[10, 25, 50]}
        onPageChange={(next) => updateParams({ page: next + 1 })}
        onRowsPerPageChange={(rows) => updateParams({ offset: rows, page: 1 })}
        paginationDisabled={isLoading}
      />
    </div>
  );
}
