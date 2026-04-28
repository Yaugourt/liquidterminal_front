"use client";

import { useEvmBlocks } from "@/services/indexer/evm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNowStrict } from "date-fns";

function BlocksSkeleton() {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          <TableCell>
            <div className="h-4 w-16 bg-white/5 animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 bg-white/5 animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-10 bg-white/5 animate-pulse rounded" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function formatBlockTime(blockTimeMs: number): string {
  try {
    return formatDistanceToNowStrict(new Date(blockTimeMs), { addSuffix: true });
  } catch {
    return "-";
  }
}

export function EvmRecentBlocksTable() {
  const { blocks, isLoading } = useEvmBlocks(10);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Recent EVM Blocks</h3>
        <p className="text-xs text-text-secondary mt-0.5">Latest indexed HyperEVM blocks</p>
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>
                <span className="text-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                  Block #
                </span>
              </TableHead>
              <TableHead>
                <span className="text-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                  Time
                </span>
              </TableHead>
              <TableHead>
                <span className="text-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                  Txs
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <BlocksSkeleton />
            ) : blocks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-text-secondary text-sm py-6">
                  No blocks available
                </TableCell>
              </TableRow>
            ) : (
              blocks.map((block) => (
                <TableRow key={block.block_number} className="hover:bg-white/[0.02]">
                  <TableCell>
                    <span className="font-mono text-brand-accent text-sm">
                      #{block.block_number.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-text-secondary text-sm">
                    {formatBlockTime(block.block_time)}
                  </TableCell>
                  <TableCell className="text-white text-sm">
                    {block.tx_count}
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
