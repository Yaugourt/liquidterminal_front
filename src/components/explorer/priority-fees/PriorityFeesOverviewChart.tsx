"use client";

import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { PriorityFeesStats } from "@/services/explorer/priority-fees";
import { formatPriorityFeeNumber, toFiniteNumber } from "./priority-fees-format";

const HOUR_OPTIONS = [1, 6, 24, 72, 168] as const;

function formatTimeRange(stats: PriorityFeesStats | null): string {
  const tr = stats?.time_range;
  if (!tr || typeof tr !== "object") return "—";
  const start = typeof tr.start === "string" ? tr.start : null;
  const end = typeof tr.end === "string" ? tr.end : null;
  if (!start && !end) return "—";
  if (start && end) {
    try {
      return `${new Date(start).toLocaleString()} → ${new Date(end).toLocaleString()}`;
    } catch {
      return `${start} → ${end}`;
    }
  }
  return start ?? end ?? "—";
}

export interface PriorityFeesOverviewChartProps {
  hours: number;
  onHoursChange: (h: number) => void;
  stats: PriorityFeesStats | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * HypeDexer `GET /analytics/priority-fees/stats` returns window aggregates + `time_range` only
 * (no hourly buckets). This panel surfaces those fields instead of a time-series chart.
 */
export function PriorityFeesOverviewChart({
  hours,
  onHoursChange,
  stats,
  isLoading,
  error,
}: PriorityFeesOverviewChartProps) {
  const fillCount = stats
    ? toFiniteNumber(stats.total_fills_with_priority ?? stats.fills_with_priority)
    : 0;

  return (
    <Card className="p-5 border-border-subtle bg-brand-secondary/40 backdrop-blur-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-outfit text-lg font-semibold text-white tracking-tight">
            Window summary
          </h2>
          <p className="text-xs text-text-muted mt-1">
            HypeDexer <code className="text-[10px]">GET /analytics/priority-fees/stats</code> only
            returns window totals and <code className="text-[10px]">time_range</code> — not per-hour
            buckets — so there is no line chart data from this call. Totals below match the KPI row
            for the same hours.
          </p>
        </div>
        <div className="inline-flex rounded-lg p-1 border border-border-subtle bg-brand-primary/60">
          {HOUR_OPTIONS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onHoursChange(h)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                hours === h
                  ? "bg-brand-accent text-brand-tertiary"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400">
          {error.message}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-border-subtle bg-brand-primary/30 p-4 sm:p-5">
        {isLoading && !stats ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
            <span className="text-text-muted text-sm">Loading window stats…</span>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                Effective time range
              </p>
              <p className="mt-1 text-sm text-white font-mono leading-snug">
                {formatTimeRange(stats)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                Total priority gas (window)
              </p>
              <p className="mt-1 text-lg text-white font-mono">
                {formatPriorityFeeNumber(stats?.total_priority_gas)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                Fills with priority
              </p>
              <p className="mt-1 text-lg text-white font-mono">
                {isLoading ? "—" : fillCount.toLocaleString("en-US")}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                Avg / min / max gas
              </p>
              <p className="mt-1 text-sm text-white font-mono">
                {formatPriorityFeeNumber(stats?.avg_priority_gas)} ·{" "}
                {formatPriorityFeeNumber(stats?.min_priority_gas)} ·{" "}
                {formatPriorityFeeNumber(stats?.max_priority_gas)}
              </p>
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                Unique users
              </p>
              <p className="mt-1 text-sm text-white font-mono">
                {stats?.unique_users !== undefined && stats.unique_users !== null
                  ? String(stats.unique_users)
                  : "—"}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
