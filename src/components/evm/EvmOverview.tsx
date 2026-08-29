"use client";

import { useMemo } from "react";
import { Boxes, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  KpiRibbon,
  AuroraAreaChart,
  chartPalette,
  TypedDataTable,
  ChartSkeleton,
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
  const { daily, isLoading } = useEvmDailyStats(31);

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
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Activity size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Transactions / day</h3>
        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          31D
        </span>
      </div>
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
      accessor: (b) => <span className="mono text-brand">#{b.block_number.toLocaleString()}</span>,
    },
    {
      key: "block_time",
      header: "Time",
      accessor: (b) => (
        <span className="text-text-secondary text-xs">{formatDateTime(b.block_time, dateFormat)}</span>
      ),
    },
    {
      key: "tx_count",
      header: "Txns",
      align: "right",
      accessor: (b) => <span className="mono text-text-primary">{b.tx_count.toLocaleString()}</span>,
    },
    {
      key: "gas_used",
      header: "Gas used",
      align: "right",
      className: "max-md:hidden",
      accessor: (b) => (
        <span className="mono text-text-tertiary">
          {b.gas_used != null ? compactCount(b.gas_used) : "—"}
        </span>
      ),
    },
    {
      key: "base_fee",
      header: "Base fee",
      align: "right",
      className: "max-lg:hidden",
      // base_fee_per_gas is in wei; show it in gwei.
      accessor: (b) => (
        <span className="mono text-text-tertiary">
          {b.base_fee_per_gas != null ? `${(b.base_fee_per_gas / 1e9).toFixed(3)} gwei` : "—"}
        </span>
      ),
    },
  ];

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Boxes size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Recent blocks</h3>
      </div>
      <div className="p-2">
        <TypedDataTable<EvmBlock>
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
      </div>
    </Card>
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
