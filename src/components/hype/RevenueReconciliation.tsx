"use client";

import { memo, useMemo } from "react";
import { Scale } from "lucide-react";
import { Card } from "@/components/ui/card";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { useRevenueBreakdown } from "@/services/market/revenue";
import { toIncomeStatement, useProtocolFundamentals } from "@/services/market/fundamentals";
import { SourceCoverageNote } from "./SourceCoverageNote";

/**
 * Why the two revenue figures on this page differ.
 *
 * The statement is DefiLlama's, because it is the basis the market quotes and
 * the only public one that splits fees from revenue. The segment view is ours,
 * summed from six sources. They do not land on the same number, and a reader
 * who spots that without explanation is right to distrust both.
 *
 * So it is stated here instead: same window, both figures, the gap, and what
 * causes it. Publishing the discrepancy costs one card and buys the right to
 * be quoted.
 */

/** Fixed at 30 days: the one window both sources report on identically. */
const WINDOW = "30d" as const;

export const RevenueReconciliation = memo(function RevenueReconciliation() {
  const { fundamentals } = useProtocolFundamentals();
  const { breakdown } = useRevenueBreakdown(WINDOW);

  const llama = useMemo(
    () => toIncomeStatement(fundamentals, "total30d").protocolRevenue,
    [fundamentals]
  );
  const ours = useMemo(
    () => (breakdown?.days ?? []).reduce((sum, d) => sum + (d.total ?? 0), 0) || null,
    [breakdown]
  );

  const gap = llama != null && ours != null ? ours - llama : null;
  const gapPct = gap != null && llama ? gap / llama : null;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-gold/10 grid place-items-center shrink-0">
          <Scale size={13} className="text-gold" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">
          Why the two revenue figures differ
        </h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono ml-auto">
          last 30 days
        </span>
      </div>

      <div className="px-4 py-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border-subtle rounded-md overflow-hidden">
          {[
            {
              label: "DefiLlama",
              value: llama == null ? "—" : compactUsd(llama),
              sub: "used by the income statement",
            },
            {
              label: "Liquid Terminal",
              value: ours == null ? "—" : compactUsd(ours),
              sub: "six sources, used by the segments",
            },
            {
              label: "Difference",
              value:
                gap == null
                  ? "—"
                  : `${gap >= 0 ? "+" : "−"}${compactUsd(Math.abs(gap))}`,
              sub: gapPct == null ? "" : `${(Math.abs(gapPct) * 100).toFixed(1)}% apart`,
            },
          ].map((cell) => (
            <div key={cell.label} className="bg-surface px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
                {cell.label}
              </div>
              <div className="text-[17px] font-semibold text-text-primary mono mt-1">
                {cell.value}
              </div>
              <div className="text-[10.5px] text-text-tertiary/80 mt-0.5">{cell.sub}</div>
            </div>
          ))}
        </div>

        <p className="text-[11.5px] text-text-secondary leading-relaxed mt-3">
          Both are protocol revenue over the same 30 days, counted differently. Ours doubles spot
          fees to approximate the gross-user figure before the deployer takes their half on HIP-1
          pairs, and it counts HIP-3 deploy auctions and priority fees as revenue lines of their
          own. DefiLlama aggregates on its own schedule and methodology. Neither is a correction of
          the other: the segment view is the more granular, the DefiLlama line is the one other
          venues are quoted on, which is why the comparison uses it.
        </p>
      </div>

      {/* A frozen source shrinks our side of the comparison and would show up as
          a narrower gap, which is the one reading this card must not invite. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary empty:hidden">
        <SourceCoverageNote meta={breakdown?.meta} />
      </div>
    </Card>
  );
});
