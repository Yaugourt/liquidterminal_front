"use client";

import { useEvmBridgeEvents } from "@/services/indexer/evm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNowStrict } from "date-fns";

function BridgeSkeleton() {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          <TableCell>
            <div className="h-5 w-20 bg-white/5 animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 bg-white/5 animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-16 bg-white/5 animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-20 bg-white/5 animate-pulse rounded" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function truncateAddress(addr: string, start = 6, end = 4): string {
  if (addr.length <= start + end + 2) return addr;
  return `${addr.slice(0, start)}…${addr.slice(-end)}`;
}

function formatEventTime(timeMs: number): string {
  try {
    return formatDistanceToNowStrict(new Date(timeMs), { addSuffix: true });
  } catch {
    return "-";
  }
}

export function EvmBridgeEventsTable() {
  const { events, isLoading } = useEvmBridgeEvents(10);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Bridge Activity</h3>
        <p className="text-xs text-text-secondary mt-0.5">Recent HyperEVM bridge deposits and withdrawals</p>
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>
                <span className="text-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                  Type
                </span>
              </TableHead>
              <TableHead>
                <span className="text-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                  Address
                </span>
              </TableHead>
              <TableHead>
                <span className="text-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                  Amount
                </span>
              </TableHead>
              <TableHead>
                <span className="text-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                  Time
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <BridgeSkeleton />
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-text-secondary text-sm py-6">
                  No bridge events available
                </TableCell>
              </TableRow>
            ) : (
              events.map((event, i) => (
                <TableRow key={`${event.tx_hash}-${i}`} className="hover:bg-white/[0.02]">
                  <TableCell>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        event.type === "deposit"
                          ? "bg-brand-success/10 text-brand-success"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {event.type === "deposit" ? "Deposit" : "Withdrawal"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-text-secondary text-sm">
                      {truncateAddress(event.address)}
                    </span>
                  </TableCell>
                  <TableCell className="text-white text-sm font-medium">
                    {event.amount}
                  </TableCell>
                  <TableCell className="text-text-secondary text-sm">
                    {formatEventTime(event.time_ms)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
