"use client";

import { useMemo } from "react";
import { Info, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PriorityFeesGossipRecord, PriorityFeesStats } from "@/services/explorer/priority-fees";
import { computePriorityFeesRunRate } from "@/lib/priority-fees-run-rate";
import { formatPriorityFeeNumber, formatPriorityFeesWindowLabel } from "./priority-fees-format";

function formatDays(days: number): string {
  if (days >= 1) return `${days.toFixed(2)}d`;
  const h = days * 24;
  return `${h.toFixed(2)}h`;
}

function formatLargeAnnualized(hype: number): string {
  if (!Number.isFinite(hype)) return "—";
  if (hype >= 1000) return `${(hype / 1000).toFixed(2)}K`;
  return formatPriorityFeeNumber(hype);
}

export interface PriorityFeesRunRateCardProps {
  stats: PriorityFeesStats | null;
  isLoading: boolean;
  gossipSlots: PriorityFeesGossipRecord[] | null;
  selectedWindowHours: number;
}

/**
 * Write-side run-rate from priority-fees stats `time_range` + linear ×365 annualization.
 * Read/combined: not shown until gossip history amounts are validated upstream.
 */
export function PriorityFeesRunRateCard({
  stats,
  isLoading,
  gossipSlots,
  selectedWindowHours,
}: PriorityFeesRunRateCardProps) {
  const run = useMemo(() => computePriorityFeesRunRate(stats), [stats]);

  const cadenceLine = useMemo(() => {
    const n = gossipSlots?.length ?? 0;
    const first = gossipSlots?.[0];
    const sec =
      typeof first?.durationSeconds === "number" && Number.isFinite(first.durationSeconds)
        ? first.durationSeconds
        : 180;
    const min = Math.round(sec / 60);
    return `${n || 5} gossip slots · ~${min} min Dutch cycle (HIP-3)`;
  }, [gossipSlots]);

  return (
    <Card className="p-5 border-border-subtle bg-brand-secondary/40 backdrop-blur-md">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-inter text-lg font-semibold text-white tracking-tight">
            Write gas · run-rate
          </h2>
          <p className="text-xs text-text-muted mt-1 max-w-2xl">
            Totals and projections use the <strong className="text-text-secondary">effective</strong>{" "}
            indexer window from <code className="text-[10px]">time_range</code>, not only the{" "}
            {formatPriorityFeesWindowLabel(selectedWindowHours)} selector. Applies to the selected
            stats window only.
          </p>
        </div>
        <p className="text-[11px] text-text-secondary shrink-0 mt-2 sm:mt-0">{cadenceLine}</p>
      </div>

      {run?.earlyWindow && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-brand-gold/25 bg-brand-gold/5 px-3 py-2 text-xs text-brand-gold">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          <span>
            Short observation window — linear annualization is volatile. Prefer longer windows when
            available.
          </span>
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border-subtle bg-brand-primary/30 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
            Total write gas
          </p>
          <p className="mt-1 text-lg text-white">
            {isLoading && !run ? "—" : `${formatPriorityFeeNumber(run?.totalPriorityGasHype ?? 0)} HYPE`}
          </p>
          <p className="text-[11px] text-text-muted mt-1">
            {run ? `${run.fillCount.toLocaleString("en-US")} fills w/ priority` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-brand-primary/30 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
            Effective span
          </p>
          <p className="mt-1 text-sm text-white leading-snug">
            {run?.timeRange
              ? `${new Date(run.timeRange.start).toLocaleString()} → ${new Date(run.timeRange.end).toLocaleString()}`
              : "—"}
          </p>
          <p className="text-[11px] text-text-muted mt-1">
            {run ? `~${formatDays(run.effectiveDays)} calendar` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-brand-primary/30 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
            HYPE / day
          </p>
          <p className="mt-1 text-lg text-white">
            {isLoading && !run ? "—" : `${formatPriorityFeeNumber(run?.hypePerDay ?? 0)} HYPE`}
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-brand-primary/30 p-4">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              Annualized (linear)
            </p>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-text-muted hover:text-brand-accent outline-none"
                    aria-label="About annualized projection"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs border-border-subtle bg-brand-secondary text-text-secondary text-xs"
                >
                  (HYPE in window ÷ effective days) × 365. Same idea as common dashboards; not a
                  guaranteed future burn.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="mt-1 text-lg text-brand-accent">
            {isLoading && !run
              ? "—"
              : `${formatLargeAnnualized(run?.annualizedLinearHype ?? 0)} HYPE`}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border-subtle grid gap-2 sm:grid-cols-2 text-xs text-text-muted">
        <div>
          <span className="text-text-secondary font-medium">Read gas (gossip)</span>
          <p className="mt-0.5">Not shown — history payload not validated for paid HYPE totals.</p>
        </div>
        <div>
          <span className="text-text-secondary font-medium">Combined</span>
          <p className="mt-0.5">N/A until read side is wired to reliable gossip settlement data.</p>
        </div>
      </div>
    </Card>
  );
}
