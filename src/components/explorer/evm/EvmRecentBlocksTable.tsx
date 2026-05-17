"use client";

import { useEvmBlocks } from "@/services/indexer/evm";
import type { EvmBlock } from "@/services/indexer/evm";
import { TypedDataTable, type Column } from "@/components/common";
import { formatDistanceToNowStrict } from "date-fns";

function formatBlockTime(blockTime: string | undefined): string {
  if (!blockTime) return "-";
  try {
    return formatDistanceToNowStrict(new Date(blockTime), { addSuffix: true });
  } catch {
    return "-";
  }
}

const COLUMNS: Column<EvmBlock>[] = [
  {
    key: "block_number",
    header: "Block #",
    accessor: (b) => (
      <span className="font-mono text-brand-accent text-sm">
        #{b.block_number.toLocaleString()}
      </span>
    ),
  },
  {
    key: "block_time",
    header: "Time",
    accessor: (b) => (
      <span className="text-text-secondary text-sm">{formatBlockTime(b.block_time)}</span>
    ),
  },
  {
    key: "tx_count",
    header: "Txs",
    type: "numeric",
    accessor: (b) => (
      <span className="text-text-primary text-sm">{b.tx_count}</span>
    ),
  },
];

export function EvmRecentBlocksTable() {
  const { blocks, isLoading } = useEvmBlocks(10);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Recent EVM Blocks</h3>
        <p className="text-xs text-text-secondary mt-0.5">Latest indexed HyperEVM blocks</p>
      </div>
      <TypedDataTable<EvmBlock>
        data={blocks}
        columns={COLUMNS}
        getRowKey={(b) => b.block_number}
        isLoading={isLoading}
        emptyMessage="No blocks available"
        emptyDescription=""
      />
    </div>
  );
}
