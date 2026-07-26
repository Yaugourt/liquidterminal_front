"use client";

import { memo, useMemo } from "react";
import { Repeat } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChartError, ChartLoading } from "@/components/common";
import { compactHype, compactUsd } from "@/lib/formatters/numberFormatting";
import { useAfBuybacks } from "@/services/market/hype";
import { useRevenueBreakdown } from "@/services/market/revenue";

/**
 * Capital returned to holders.
 *
 * The buyback is the protocol's equivalent of a share repurchase: revenue is
 * converted into HYPE and taken off the market. Measured against revenue over
 * the same window it gives a payout ratio, which is the number that decides
 * whether the flywheel is funded by earnings or by something else.
 *
 * Both sides come from our own endpoints so they share a basis — the buyback
 * from Assistance Fund fills, revenue from the six-source breakdown. Mixing in
 * a third-party aggregate here would make the ratio unreadable.
 */

const RATIO_WINDOW = "30d" as const;

export const CapitalReturnedCard = memo(function CapitalReturnedCard() {
  const { data: buybacks, isLoading: loadingBuybacks, error: buybackError } = useAfBuybacks();
  const { breakdown, isLoading: loadingRevenue, error: revenueError } =
    useRevenueBreakdown(RATIO_WINDOW);

  const revenue30d = useMemo(
    () => (breakdown?.days ?? []).reduce((sum, d) => sum + (d.total ?? 0), 0) || null,
    [breakdown]
  );

  const buyback30d = buybacks?.monthlyUsd ?? null;
  const payout = buyback30d != null && revenue30d ? buyback30d / revenue30d : null;

  const isLoading = (loadingBuybacks || loadingRevenue) && !buybacks && !breakdown;
  const error = buybackError ?? revenueError;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Repeat size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Capital Returned</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono ml-auto">
          last 30 days
        </span>
      </div>

      <div className="flex-1 px-4 py-3.5">
        {error ? (
          <ChartError />
        ) : isLoading ? (
          <ChartLoading />
        ) : (
          <>
            <div className="flex items-baseline gap-3">
              <span className="text-[34px] font-semibold text-text-primary mono leading-none">
                {payout == null ? "—" : `${(payout * 100).toFixed(0)}%`}
              </span>
              <span className="text-[13px] text-text-secondary">
                of protocol revenue bought back
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border-subtle mt-4 rounded-md overflow-hidden">
              {[
                {
                  label: "Bought back",
                  value: buyback30d == null ? "—" : compactUsd(buyback30d),
                  sub: "Assistance Fund fills",
                },
                {
                  label: "In HYPE",
                  value:
                    buybacks?.monthlyHype == null ? "—" : `${compactHype(buybacks.monthlyHype)}`,
                  sub: "taken off the market",
                },
                {
                  label: "Avg fill",
                  value: buybacks?.avgPrice ? `$${buybacks.avgPrice.toFixed(2)}` : "—",
                  sub: `realized over ${buybacks?.windowDays ?? "—"}d`,
                },
                {
                  label: "Revenue",
                  value: revenue30d == null ? "—" : compactUsd(revenue30d),
                  sub: "six sources",
                },
              ].map((cell) => (
                <div key={cell.label} className="bg-surface px-3 py-2.5">
                  <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
                    {cell.label}
                  </div>
                  <div className="text-[16px] font-semibold text-text-primary mono mt-1">
                    {cell.value}
                  </div>
                  <div className="text-[10.5px] text-text-tertiary/80 mt-0.5">{cell.sub}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Buyback from Assistance Fund fills · revenue from the six-source breakdown</span>
        <span className="opacity-50">·</span>
        <span>
          A ratio near 100% means the buyback is funded by earnings over the window, not above them.
        </span>
      </div>
    </Card>
  );
});
