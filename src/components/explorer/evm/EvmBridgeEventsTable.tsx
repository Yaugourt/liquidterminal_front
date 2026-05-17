"use client";

import { useEvmBridgeEvents } from "@/services/indexer/evm";
import type { EvmBridgeEvent } from "@/services/indexer/evm";
import { TypedDataTable, type Column } from "@/components/common";
import { formatDistanceToNowStrict } from "date-fns";

function formatEventTime(time: string | undefined): string {
  if (!time) return "-";
  try {
    return formatDistanceToNowStrict(new Date(time), { addSuffix: true });
  } catch {
    return "-";
  }
}

function truncateAddress(addr: string | null | undefined, start = 6, end = 4): string {
  if (!addr) return "-";
  if (addr.length <= start + end + 2) return addr;
  return `${addr.slice(0, start)}…${addr.slice(-end)}`;
}

const COLUMNS: Column<EvmBridgeEvent>[] = [
  {
    key: "type",
    header: "Type",
    accessor: (e) => (
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
          e.event_type === "deposit"
            ? "bg-brand-success/10 text-brand-success"
            : "bg-rose-500/10 text-rose-400"
        }`}
      >
        {e.event_type === "deposit" ? "Deposit" : "Withdrawal"}
      </span>
    ),
  },
  {
    key: "address",
    header: "Address",
    type: "address",
    accessor: (e) => (
      <span className="font-mono text-text-secondary text-sm">
        {truncateAddress(e.user_addr)}
      </span>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    accessor: (e) => (
      <span className="text-text-primary text-sm font-medium">{e.amount}</span>
    ),
  },
  {
    key: "time",
    header: "Time",
    accessor: (e) => (
      <span className="text-text-secondary text-sm">{formatEventTime(e.time)}</span>
    ),
  },
];

export function EvmBridgeEventsTable() {
  const { events, isLoading } = useEvmBridgeEvents(10);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Bridge Activity</h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Recent HyperEVM bridge deposits and withdrawals
        </p>
      </div>
      <TypedDataTable<EvmBridgeEvent>
        data={events}
        columns={COLUMNS}
        getRowKey={(e, i) => `${e.user_addr}-${i}`}
        isLoading={isLoading}
        emptyMessage="No bridge events available"
        emptyDescription=""
      />
    </div>
  );
}
