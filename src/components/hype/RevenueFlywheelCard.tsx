"use client";

import { Fragment, memo, useMemo, useState } from "react";
import { Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChartEmpty, ChartError, ChartLoading, FlowConfluence, type FlowSegment } from "@/components/common";
import { chartPalette } from "@/components/common";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { useRevenueBreakdown } from "@/services/market/revenue";
import type { RevenueWindow } from "@/services/market/revenue";
import { fmtUsd } from "./format";

/* Same colours as RevenueChart's series, so the confluence above the bars and
   the bars themselves name each source the same way. */
const CONFLUENCE_COLORS: Record<string, string> = {
  perp: chartPalette.multiSeries[0],
  spot: chartPalette.gold,
  auction: chartPalette.multiSeries[3],
  priority: chartPalette.multiSeries[4],
  hip4: chartPalette.multiSeries[6],
};

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

  /* Where the buyback fuel actually comes from, over the selected window.
     Auctions merge HIP-1 and HIP-3 exactly as RevenueChart does: both are
     slot-pricing Dutch auctions. */
  const confluence = useMemo<FlowSegment[]>(() => {
    if (days.length === 0) return [];
    const sum = (pick: (d: (typeof days)[number]) => number) =>
      days.reduce((acc, d) => acc + (pick(d) || 0), 0);
    return [
      { key: "perp", label: "Perp", value: sum((d) => d.perp), color: CONFLUENCE_COLORS.perp },
      { key: "spot", label: "Spot", value: sum((d) => d.spot), color: CONFLUENCE_COLORS.spot },
      {
        key: "auction",
        label: "Auctions",
        value: sum((d) => (d.hip1 ?? 0) + (d.hip3 ?? 0)),
        color: CONFLUENCE_COLORS.auction,
      },
      { key: "priority", label: "Priority", value: sum((d) => d.priority), color: CONFLUENCE_COLORS.priority },
      { key: "hip4", label: "HIP-4", value: sum((d) => d.hip4), color: CONFLUENCE_COLORS.hip4 },
    ].filter((s) => s.value > 0);
  }, [days]);

  const windowTotal = useMemo(
    () => days.reduce((acc, d) => acc + (d.total || 0), 0),
    [days]
  );

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
          <>
            {confluence.length > 1 && (
              <div className="px-3.5 pt-3 pb-2 border-b border-border-subtle">
                <FlowConfluence
                  segments={confluence}
                  height={150}
                  trunkLabel={`${WINDOW_LABELS[window]} total`}
                  trunkValue={fmtUsd(windowTotal)}
                />
              </div>
            )}
            <RevenueChart days={days} height={220} />
          </>
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
