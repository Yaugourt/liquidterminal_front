"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  usePriorityFeesFillsTimeseries,
  type PriorityFeesFillsTimeseriesBucketHours,
} from "@/services/explorer/priority-fees";
import { formatPriorityFeeNumber, formatPriorityFeesWindowLabel } from "./priority-fees-format";

const BUCKET_OPTIONS = [1, 6, 24] as const satisfies readonly PriorityFeesFillsTimeseriesBucketHours[];

export interface PriorityFeesFillsTimeseriesChartProps {
  hours: number;
}

interface ChartRow {
  label: string;
  totalGas: number;
  fillCount: number;
  bucketStart: string;
}

export function PriorityFeesFillsTimeseriesChart({ hours }: PriorityFeesFillsTimeseriesChartProps) {
  const [bucketHours, setBucketHours] = useState<PriorityFeesFillsTimeseriesBucketHours>(1);
  const { data, isLoading, error, refetch } = usePriorityFeesFillsTimeseries({ hours, bucketHours });

  const chartRows = useMemo((): ChartRow[] => {
    if (!data?.buckets?.length) return [];
    return data.buckets.map((b) => {
      const d = new Date(b.bucketStart);
      const label = Number.isNaN(d.getTime())
        ? b.bucketStart
        : d.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
      return {
        label,
        totalGas: b.totalGas,
        fillCount: b.fillCount,
        bucketStart: b.bucketStart,
      };
    });
  }, [data]);

  return (
    <Card className="p-5 border-border-subtle bg-brand-secondary/40 backdrop-blur-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-inter text-lg font-semibold text-white tracking-tight">
            Priority gas by bucket (fills)
          </h2>
          <p className="text-xs text-text-muted mt-1 max-w-2xl">
            Aggregated on the server from fills with <code className="text-[10px]">has_priority_gas</code>.
            Same{" "}
            <strong className="text-text-secondary">
              {formatPriorityFeesWindowLabel(hours)}
            </strong>{" "}
            window as above; bucket width selectable. Cached ~90s at the API.
          </p>
        </div>
        <div className="inline-flex rounded-lg p-1 border border-border-subtle bg-brand-primary/60 shrink-0">
          {BUCKET_OPTIONS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setBucketHours(h)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                bucketHours === h
                  ? "bg-brand-accent text-brand-tertiary"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {data?.partial && (
        <div className="mt-3 rounded-lg border border-brand-gold/25 bg-brand-gold/5 px-3 py-2 text-xs text-brand-gold">
          {data.computationNote ??
            `Partial data: fill scan stopped at ${data.scannedRows.toLocaleString("en-US")} rows (safety cap).`}
          <button
            type="button"
            onClick={() => refetch()}
            className="ml-2 text-brand-accent hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400 flex flex-wrap items-center gap-3">
          {error.message}
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs text-brand-accent hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mt-4 h-[280px] w-full">
        {isLoading && !data ? (
          <div className="flex h-full items-center justify-center flex-col gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
            <span className="text-text-muted text-sm">Loading timeseries…</span>
          </div>
        ) : chartRows.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-text-secondary text-center px-4">
            No bucket data for this window (empty fills or upstream limit).
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartRows} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-brand-accent/10" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#a1a1aa", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tick={{ fill: "#a1a1aa", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatPriorityFeeNumber(typeof v === "number" ? v : Number(v))}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as ChartRow;
                  return (
                    <div className="bg-brand-secondary/95 backdrop-blur-md border border-border-subtle rounded-lg p-3 shadow-xl text-xs">
                      <p className="text-brand-accent font-medium mb-1">{p.label}</p>
                      <p className="text-white">
                        Gas: {formatPriorityFeeNumber(p.totalGas)} HYPE
                      </p>
                      <p className="text-text-secondary mt-0.5">
                        Fills: {p.fillCount.toLocaleString("en-US")}
                      </p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="totalGas"
                stroke="#83E9FF"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#83E9FF" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
