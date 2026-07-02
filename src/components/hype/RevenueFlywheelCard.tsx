"use client";

import { Fragment, memo, useMemo, useState } from "react";
import { Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChartEmpty, ChartError, ChartLoading } from "@/components/common";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { useRevenueBreakdown } from "@/services/market/revenue";
import type { RevenueWindow } from "@/services/market/revenue";
import { fmtUsd } from "./format";

const WINDOWS: readonly RevenueWindow[] = ["7d", "30d", "90d"] as const;
const WINDOW_LABELS: Record<RevenueWindow, string> = {
  "7d": "7D",
  "30d": "30D",
  "90d": "90D",
  "1y": "1Y",
  all: "All",
};

/**
 * RevenueFlywheelCard — protocol revenue framed as the fuel for the HYPE
 * buyback. Reuses the dashboard `RevenueChart` (5-source stacked bars + KPI
 * strip + source breakdown). The actual buyback figures live in the Assistance
 * Fund card; here we only note that ~97–99% of these fees fund it.
 */
export const RevenueFlywheelCard = memo(function RevenueFlywheelCard() {
  const [window, setWindow] = useState<RevenueWindow>("30d");
  const { breakdown, isLoading, error } = useRevenueBreakdown(window);

  const days = useMemo(() => breakdown?.days ?? [], [breakdown]);

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Coins size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Protocol Revenue</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          buyback fuel
        </span>
        <div className="ml-auto flex items-center gap-1 text-[11px] font-semibold">
          {WINDOWS.map((w, i) => (
            <Fragment key={w}>
              {i > 0 && <span className="text-text-tertiary/40">·</span>}
              <button
                type="button"
                onClick={() => setWindow(w)}
                className={`px-1 py-0.5 transition-colors hover:text-text-primary ${
                  w === window ? "text-text-primary" : "text-text-tertiary"
                }`}
              >
                {WINDOW_LABELS[w]}
              </button>
            </Fragment>
          ))}
        </div>
      </div>

      {/* buyback annotation */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3.5 py-2 border-b border-border-subtle bg-surface-2/30 text-[11px]">
        <span className="text-text-secondary">
          ~97–99% of these fees fund the on-chain HYPE buyback
        </span>
        <span className="text-text-tertiary/50">·</span>
        <span className="text-text-tertiary">
          lifetime{" "}
          <span className="mono text-gold font-semibold">{fmtUsd(breakdown?.lifetime?.total)}</span>
        </span>
      </div>

      <div className="flex-1 min-h-[340px] flex flex-col">
        {error ? (
          <div className="flex-1 flex items-center justify-center">
            <ChartError />
          </div>
        ) : isLoading && days.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <ChartLoading />
          </div>
        ) : days.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <ChartEmpty suggestion="Try selecting a wider window" />
          </div>
        ) : (
          <RevenueChart days={days} height={220} />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Sources: Hypurrscan · HypeDexer · HL</span>
        <span className="opacity-50">·</span>
        <span title="Spot fees doubled to approximate gross-user (deployer takes 50% on HIP-1 pairs).">
          Spot ×{breakdown?.meta?.spotMultiplier ?? 2}
        </span>
      </div>
    </Card>
  );
});
