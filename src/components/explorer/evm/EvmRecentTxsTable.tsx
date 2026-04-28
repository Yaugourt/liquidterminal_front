"use client";

import { useEvmTransactions } from "@/services/indexer/evm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNowStrict } from "date-fns";

function TxsSkeleton() {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          <TableCell>
            <div className="h-4 w-20 bg-white/5 animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-20 bg-white/5 animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-20 bg-white/5 animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-14 bg-white/5 animate-pulse rounded" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

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

function formatTxTime(timeMs?: number): string {
  if (!timeMs) return "-";
  try {
    return formatDistanceToNowStrict(new Date(timeMs), { addSuffix: true });
  } catch {
    return "-";
  }
}

export function EvmRecentTxsTable() {
  const { transactions, isLoading } = useEvmTransactions(10);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Recent EVM Transactions</h3>
        <p className="text-xs text-text-secondary mt-0.5">Latest indexed HyperEVM transactions</p>
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>
                <span className="text-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                  Hash
                </span>
              </TableHead>
              <TableHead>
                <span className="text-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                  From
                </span>
              </TableHead>
              <TableHead>
                <span className="text-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                  To
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
              <TxsSkeleton />
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-text-secondary text-sm py-6">
                  No transactions available
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.hash} className="hover:bg-white/[0.02]">
                  <TableCell>
                    <span className="font-mono text-brand-accent text-sm">
                      {truncateHash(tx.hash)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-text-secondary text-sm">
                      {truncateAddress(tx.from_addr)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-text-secondary text-sm">
                      {truncateAddress(tx.to_addr)}
                    </span>
                  </TableCell>
                  <TableCell className="text-text-secondary text-sm">
                    {formatTxTime(tx.time_ms)}
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
