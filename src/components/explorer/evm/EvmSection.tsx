"use client";

import { Layers, Hash, FileText } from "lucide-react";
import { useEvmStats } from "@/services/indexer/evm";
import { StatsCard } from "@/components/common/StatsCard";
import { Card } from "@/components/ui/card";
import { EvmRecentBlocksTable } from "./EvmRecentBlocksTable";
import { EvmRecentTxsTable } from "./EvmRecentTxsTable";

function formatLargeNumber(n?: number): string {
  if (n === undefined || n === null) return "-";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function EvmSection() {
  const { stats, isLoading } = useEvmStats();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-white">EVM Activity</h2>
        <p className="text-sm text-text-secondary">
          HyperLiquid EVM — indexed blocks, transactions, and on-chain activity.
        </p>
      </div>

      {/* 3 mini stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Blocks Indexed"
          value={formatLargeNumber(stats?.blocks_indexed)}
          icon={<Layers className="w-4 h-4 text-brand-accent" />}
          isLoading={isLoading && !stats}
        />
        <StatsCard
          title="Txs Indexed"
          value={formatLargeNumber(stats?.txs_indexed)}
          icon={<Hash className="w-4 h-4 text-brand-accent" />}
          isLoading={isLoading && !stats}
        />
        <StatsCard
          title="Logs Indexed"
          value={formatLargeNumber(stats?.logs_indexed)}
          icon={<FileText className="w-4 h-4 text-brand-accent" />}
          isLoading={isLoading && !stats}
        />
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <EvmRecentBlocksTable />
        </Card>
        <Card>
          <EvmRecentTxsTable />
        </Card>
      </div>
    </div>
  );
}
