"use client";

import { useEffect, useMemo, useState } from "react";
import { PillTabs } from "@/components/ui/pill-tabs";
import {
  TypedDataTable,
  ModuleAsset,
  CellValue,
  TableStat,
  AddressIdenticon,
  TableSearch,
  type Column,
} from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { getTokenInitials } from "@/lib/tokenIconUrl";
import { useNumberFormat, type NumberFormatType } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import type { DateFormatType } from "@/store/date-format.store";
import { compactUsd, formatNumber, truncateAddress } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import {
  useEvmTransactions,
  hyperEvmTxUrl,
  type EvmTransaction,
  type EvmTransactionType,
} from "@/services/market/tracker/hyperfolio";
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

/** "12.5 USDC" — one token leg of a transaction. */
const tokenLeg = (t: EvmTransaction["tokens"][number], format: NumberFormatType): string =>
  `${formatNumber(t.amount, format, { maximumFractionDigits: t.amount >= 1000 ? 2 : 4 })} ${t.symbol}`;

/** The other side of a transaction, seen from the wallet. */
const counterparty = (tx: EvmTransaction): string => (tx.direction === "in" ? tx.from : tx.to);

function buildColumns(format: NumberFormatType, dateFormat: DateFormatType): Column<EvmTransaction>[] {
  return [
    {
      key: "time",
      header: "Date",
      type: "time",
      width: 150,
      accessor: (tx) => formatDateTime(tx.timestamp, dateFormat),
    },
    {
      key: "action",
      header: "Action",
      type: "text",
      tone: (tx) => (tx.failed ? "danger" : undefined),
      accessor: (tx) => (tx.failed ? `${actionLabel(tx.action)} (failed)` : actionLabel(tx.action)),
    },
    {
      key: "protocol",
      header: "Protocol",
      accessor: (tx) =>
        tx.protocol.id === "unknown" ? (
          // No decoded protocol: show the counterparty (on an incoming
          // transfer `to` is the wallet itself, so read `from`).
          <ModuleAsset
            logo={<AddressIdenticon address={counterparty(tx)} size={24} />}
            name="Unknown"
            sub={truncateAddress(counterparty(tx))}
          />
        ) : tx.protocol.logo ? (
          <ModuleAsset assetName={tx.protocol.name} src={tx.protocol.logo} name={tx.protocol.name} />
        ) : (
          <ModuleAsset logo={getTokenInitials(tx.protocol.name)} name={tx.protocol.name} />
        ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      accessor: (tx) => {
        if (tx.tokens.length === 0) return "—";
        const [first, ...rest] = tx.tokens;
        const usd = first.valueUsd !== null && first.valueUsd > 0 ? compactUsd(first.valueUsd) : undefined;
        const others = rest
          .slice(0, 2)
          .map((t) => (t.valueUsd !== null && t.valueUsd > 0 ? `${tokenLeg(t, format)} (${compactUsd(t.valueUsd)})` : tokenLeg(t, format)))
          .join(" · ");
        const more = rest.length > 2 ? ` +${rest.length - 2}` : "";
        return (
          <CellValue
            value={tokenLeg(first, format)}
            sub={rest.length > 0 ? [usd, `${others}${more}`].filter(Boolean).join(" · ") : usd}
            tone={tx.direction === "in" ? "success" : tx.direction === "out" ? "danger" : "primary"}
          />
        );
      },
    },
    {
      key: "hash",
      header: "Hash",
      align: "right",
      width: 150,
      accessor: (tx) => (
        <AddressDisplay address={tx.hash} href={hyperEvmTxUrl(tx.hash)} external copyMessage="Hash copied to clipboard" />
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
    <>
      {error && transactions.length === 0 && (
        <HyperfolioNotice error={error} onRetry={refetch} className="w-full" />
      )}
      <TableSearch value={search} onChange={setSearch} placeholder="Search hash, address, token, method…" />
      <PillTabs
        variant="text"
        tabs={TYPE_TABS}
        activeTab={params.type ?? "all"}
        onTabChange={(value) => updateParams({ type: value as EvmTransactionType })}
      />
      <TableStat label="Txs" value={total.toLocaleString()} className="ml-auto" />
    </>
  );

  return (
    <TypedDataTable<EvmTransaction>
      data={transactions}
      columns={columns}
      getRowKey={(tx) => `${tx.hash}-${tx.type}`}
      isLoading={isLoading && transactions.length === 0}
      emptyMessage="No HyperEVM activity"
      emptyDescription={params.search || params.type ? "No transaction matches these filters." : "This wallet has no decoded HyperEVM transactions yet."}
      toolbar={toolbar}
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
  );
}
