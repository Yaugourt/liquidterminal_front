"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  KpiRibbon,
  AuroraAreaChart,
  chartPalette,
  TypedDataTable,
  CardHead,
  ChartSkeleton,
  SourceBadge,
  sourceStatus,
  type KpiCell,
  type Column,
} from "@/components/common";
import { LoadingState } from "@/components/ui/loading-state";
import { compactCount } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { useDateFormat } from "@/store/date-format.store";
import {
  useEvmStats,
  useEvmDailyStats,
  useEvmBlocks,
  type EvmBlock,
} from "@/services/indexer/evm";

// ── Lifetime stats ribbon ──────────────────────────────────────────────────
function EvmStatsRibbon() {
  const { stats, isLoading } = useEvmStats();

  const cells: KpiCell[] = stats
    ? [
        { key: "blocks", label: "Total blocks", value: compactCount(stats.total_blocks) },
        {
          key: "txs",
          label: "Total transactions",
          value: compactCount(stats.total_transactions),
        },
        { key: "logs", label: "Event logs", value: compactCount(stats.total_logs) },
        {
          key: "tip",
          label: "Latest block",
          value: `#${compactCount(stats.last_block)}`,
          sub: "chain tip",
        },
      ]
    : [];

  if (isLoading && !stats) {
    return (
      <Card className="p-4">
        <LoadingState message="Loading chain stats…" size="sm" withCard={false} />
      </Card>
    );
  }
  if (!stats) return null;
  return <KpiRibbon cells={cells} />;
}

// ── Daily activity chart ───────────────────────────────────────────────────
function EvmActivityChart() {
  const { daily, isLoading, error } = useEvmDailyStats(31);

  // Series comes newest-first; reverse to chronological for the trend.
  const data = useMemo(
    () =>
      [...daily]
        .reverse()
        .map((d) => ({ time: Date.parse(d.day), value: d.transactions }))
        .filter((p) => Number.isFinite(p.time)),
    [daily]
  );

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHead
        title="Transactions / day"
        tag="31D"
        actions={<SourceBadge source="hypedexer" status={sourceStatus(error, isLoading)} />}
      />
      <div className="p-3 h-[260px]">
        {isLoading && data.length === 0 ? (
          <ChartSkeleton minHeight="min-h-[220px]" />
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-tertiary text-sm">
            No activity data.
          </div>
        ) : (
          <AuroraAreaChart
            data={data}
            height={230}
            lineColor={chartPalette.accent}
            formatValue={(v) => compactCount(v)}
          />
        )}
      </div>
    </Card>
  );
}

// ── Recent blocks table ────────────────────────────────────────────────────
function EvmBlocksTable() {
  const { blocks, isLoading, error, refetch } = useEvmBlocks(20);
  const { format: dateFormat } = useDateFormat();

  const columns: Column<EvmBlock>[] = [
    {
      key: "block_number",
      header: "Block",
      type: "numeric",
      align: "left",
      tone: () => "brand",
      accessor: (b) => `#${b.block_number.toLocaleString()}`,
    },
    {
      key: "block_time",
      header: "Time",
      type: "time",
      accessor: (b) => formatDateTime(b.block_time, dateFormat),
    },
    {
      key: "tx_count",
      header: "Txns",
      type: "numeric",
      accessor: (b) => b.tx_count.toLocaleString(),
    },
    {
      key: "gas_used",
      header: "Gas used",
      type: "numeric",
      tone: () => "muted",
      className: "max-md:hidden",
      accessor: (b) => (b.gas_used != null ? compactCount(b.gas_used) : "—"),
    },
    {
      key: "base_fee",
      header: "Base fee",
      type: "numeric",
      tone: () => "muted",
      className: "max-lg:hidden",
      // base_fee_per_gas is in wei; show it in gwei.
      accessor: (b) =>
        b.base_fee_per_gas != null ? `${(b.base_fee_per_gas / 1e9).toFixed(3)} gwei` : "—",
    },
  ];

  return (
    <TypedDataTable<EvmBlock>
      title="Recent blocks"
      headerAction={<SourceBadge source="hypedexer" status={sourceStatus(error, isLoading)} />}
      data={blocks}
      columns={columns}
      getRowKey={(b) => b.block_number}
      isLoading={isLoading}
      error={error}
      onErrorRetry={refetch}
      emptyMessage="No blocks"
      density="compact"
      paginate
      itemsPerPage={10}
      paginationVariant="compact"
    />
  );
}

/**
 * HyperEVM overview — lifetime stats, daily transaction trend and the most
 * recent blocks, from the indexer's EVM endpoints. The transactions endpoint
 * is intentionally not surfaced here: it returns rows without hash or sender,
 * so a tx table would be blank. Blocks and stats are complete.
 */
export function EvmOverview() {
  return (
    <div className="space-y-4">
      <EvmStatsRibbon />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <EvmActivityChart />
        <EvmBlocksTable />
      </div>
    </div>
  );
}
