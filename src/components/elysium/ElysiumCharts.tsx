"use client";

import { memo, useMemo, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { CardHead, ChartSkeleton } from "@/components/common";
import { MultiSeriesAreaChart } from "@/components/dashboard/chart";
import type { MultiSeries } from "@/components/dashboard/chart/MultiSeriesAreaChart";
import { useElysiumIngestStatus } from "@/services/elysium";
import { Empty, dayMs, elysiumTimeLabel } from "./shared";

export interface DailySeriesDef<T> {
  id: string;
  name: string;
  color: string;
  axis: "left" | "right";
  pick: (row: T) => number;
  format: (v: number) => string;
}

/** A daily trend card over complete UTC days, one or two axes. */
function DailyChartCardInner<T extends { day: string }>({
  title,
  meta,
  rows,
  loading,
  defs,
}: {
  title: string;
  meta?: ReactNode;
  rows: T[];
  loading: boolean;
  defs: DailySeriesDef<T>[];
}) {
  const series: MultiSeries[] = useMemo(
    () =>
      defs.map((d) => ({
        id: d.id,
        name: d.name,
        color: d.color,
        axis: d.axis,
        formatValue: d.format,
        data: rows.map((r) => ({ time: dayMs(r.day), value: d.pick(r) })).filter((p) => Number.isFinite(p.time)),
      })),
    [rows, defs]
  );
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead title={title} tag={meta ?? (rows.length ? `${rows.length} complete days` : undefined)} />
      <div className="p-3 h-[260px]">
        {loading && rows.length === 0 ? (
          <ChartSkeleton minHeight="min-h-[230px]" />
        ) : rows.length < 2 ? (
          <Empty>Not enough complete days yet.</Empty>
        ) : (
          <MultiSeriesAreaChart series={series} height={230} />
        )}
      </div>
    </Card>
  );
}

export const DailyChartCard = memo(DailyChartCardInner) as typeof DailyChartCardInner;

/** Tells the reader when history is still being backfilled, so early days are not misread. */
export const IngestNotice = memo(function IngestNotice() {
  const { data } = useElysiumIngestStatus();
  const tx = data?.streams.find((s) => s.stream === "tx");
  if (!tx || tx.backfillDone) return null;
  return (
    <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-[12px] text-warning">
      History is still loading{tx.cursor ? `, indexed up to ${elysiumTimeLabel(tx.cursor)} UTC` : ""}. Totals below grow until the backfill reaches today.
    </div>
  );
});
