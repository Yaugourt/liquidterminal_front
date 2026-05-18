"use client";

import { useEvmTransactions } from "@/services/indexer/evm";
import type { EvmTransaction } from "@/services/indexer/evm";
import { TypedDataTable, type Column } from "@/components/common";
import { formatDistanceToNowStrict } from "date-fns";

function truncateAddress(addr: string | null | undefined, start = 6, end = 4): string {
  if (!addr) return "-";
  if (addr.length <= start + end + 2) return addr;
  return `${addr.slice(0, start)}…${addr.slice(-end)}`;
}

function truncateHash(hash: string | null | undefined): string {
  if (!hash) return "-";
  if (hash.length <= 10) return hash;
  return `${hash.slice(0, 6)}…`;
}

function formatTxTime(blockTime?: string): string {
  if (!blockTime) return "-";
  try {
    return formatDistanceToNowStrict(new Date(blockTime), { addSuffix: true });
  } catch {
    return "-";
  }
}

const COLUMNS: Column<EvmTransaction>[] = [
  {
    key: "tx_hash",
    header: "Hash",
    type: "address",
    accessor: (tx) => (
      <span className="font-mono text-brand text-sm">
        {truncateHash(tx.tx_hash)}
      </span>
    ),
  },
  {
    key: "from_addr",
    header: "From",
    type: "address",
    accessor: (tx) => (
      <span className="font-mono text-text-secondary text-sm">
        {truncateAddress(tx.from_addr)}
      </span>
    ),
  },
  {
    key: "to_addr",
    header: "To",
    type: "address",
    accessor: (tx) => (
      <span className="font-mono text-text-secondary text-sm">
        {truncateAddress(tx.to_addr)}
      </span>
    ),
  },
  {
    key: "block_time",
    header: "Time",
    accessor: (tx) => (
      <span className="text-text-secondary text-sm">{formatTxTime(tx.block_time)}</span>
    ),
  },
];

export function EvmRecentTxsTable() {
  const { transactions, isLoading } = useEvmTransactions(10);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Recent EVM Transactions</h3>
        <p className="text-xs text-text-secondary mt-0.5">Latest indexed HyperEVM transactions</p>
      </div>
      <TypedDataTable<EvmTransaction>
        data={transactions}
        columns={COLUMNS}
        getRowKey={(tx, i) => `${tx.tx_hash}-${i}`}
        isLoading={isLoading}
        emptyMessage="No transactions available"
        emptyDescription=""
      />
    </div>
  );
}
