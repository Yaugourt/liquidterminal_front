"use client";

import { Card } from "@/components/ui/card";
import { CardHead, KpiRibbon, chartPalette, type KpiCell } from "@/components/common";
import { compactCount, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useElysiumBatches, useElysiumEconomics } from "@/services/elysium";
import { DailyChartCard, IngestNotice } from "./ElysiumCharts";
import { Empty, completeDays, duration, pct } from "./shared";

/**
 * Elysium · Economics: what users pay the sequencer (fees in HYPE, from
 * gas used x effective gas price of every indexed transaction), plus network
 * health: failure and spam rates, and settlement delay on HyperEVM.
 */
export function ElysiumEconomics() {
  const { format } = useNumberFormat();
  const { data, isLoading } = useElysiumEconomics(14);
  const { data: batches } = useElysiumBatches(20);
  const days = completeDays(data?.daily);
  const last = days[days.length - 1];
  const hype = (v: number) => formatNumber(v, format, { maximumFractionDigits: v < 1 ? 4 : 2 });

  const delays = (batches ?? []).map((b) => b.posting_delay_s).filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  const medianDelay = delays.length ? delays[Math.floor(delays.length / 2)] : null;

  const cells: KpiCell[] = [
    { key: "fees", label: "Fees paid", value: last ? `${hype(last.feesHype)} HYPE` : "…", tone: "gold", sub: last?.day },
    { key: "avg", label: "Avg fee / tx", // 1 gwei = 1e-9 HYPE: testnet fees are far below a readable HYPE decimal.
      value: last ? `${formatNumber(last.avgFeeHype * 1e9, format, { maximumFractionDigits: 0 })} gwei` : "…", sub: last ? `${compactCount(last.txs)} non-spam txs` : undefined },
    { key: "fail", label: "Failed", value: last ? pct(last.txs ? last.failedTxs / last.txs : null, 1) : "…", sub: last ? `${compactCount(last.failedTxs)} txs` : undefined },
    // `txs` excludes spam, so the spam share is taken over txs + spam.
    { key: "spam", label: "Spam", value: last ? pct(last.txs + last.spamTxs ? last.spamTxs / (last.txs + last.spamTxs) : null, 1) : "…", sub: "of non-system txs" },
    { key: "settle", label: "Settlement delay", value: medianDelay != null ? duration(medianDelay) : "…", sub: `median, last ${delays.length} batches` },
  ];

  return (
    <div className="space-y-4">
      <IngestNotice />
      <KpiRibbon cells={cells} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-2 xl:[&>*:last-child]:col-span-1" />
      <DailyChartCard
        title="Fees paid per day"
        meta="HYPE, all transactions incl. spam"
        rows={days}
        loading={isLoading}
        defs={[
          { id: "fees", name: "Fees (HYPE)", color: chartPalette.gold, axis: "left", pick: (r) => r.feesHype, format: (v) => v.toFixed(3) },
          { id: "txs", name: "Non-spam transactions", color: chartPalette.accent, axis: "right", pick: (r) => r.txs, format: (v) => compactCount(v) },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <DailyChartCard
          title="Failures and spam"
          rows={days}
          loading={isLoading}
          defs={[
            { id: "spam", name: "Spam txs", color: chartPalette.danger, axis: "left", pick: (r) => r.spamTxs, format: (v) => compactCount(v) },
            { id: "fail", name: "Failed txs", color: chartPalette.amber, axis: "right", pick: (r) => r.failedTxs, format: (v) => compactCount(v) },
          ]}
        />
        <Card className="overflow-hidden flex flex-col">
          <CardHead title="Settlement delay" tag="per batch posted on HyperEVM" />
          <div className="p-3.5 space-y-1.5">
            {!batches ? (
              <Empty>Loading batches…</Empty>
            ) : (
              batches.slice(0, 10).map((b) => {
                const max = delays.length ? delays[delays.length - 1] : 1;
                return (
                  <div key={b.batch_number} className="flex items-center gap-2 mono text-[11px]">
                    <span className="w-12 shrink-0 text-brand">#{b.batch_number}</span>
                    <span className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                      <span className="block h-full bg-brand/60" style={{ width: `${(b.posting_delay_s / (max || 1)) * 100}%` }} />
                    </span>
                    <span className="w-14 shrink-0 text-right text-text-secondary">{duration(b.posting_delay_s)}</span>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
      <p className="text-[11px] text-text-tertiary">
        Fee = gas used × effective gas price, summed over every indexed transaction (system transactions excluded). Testnet HYPE has no market value.
      </p>
    </div>
  );
}
