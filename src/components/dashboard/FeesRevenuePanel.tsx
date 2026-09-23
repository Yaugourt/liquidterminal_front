"use client";

import { Fragment, memo, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  CardHead,
  ChartEmpty,
  ChartError,
  ChartLoading,
  DataStatus,
} from "@/components/common";
import { fullUsd } from "@/lib/formatters/numberFormatting";
import { HypeMark, ShareTile } from "@/components/common";
import { useRevenueBreakdown } from "@/services/market/revenue";
import type { RevenueWindow } from "@/services/market/revenue";
import { RevenueChart } from "./RevenueChart";

/**
 * FeesRevenuePanel — Protocol revenue card.
 *
 * Owns the chrome (card-head with lifetime pill + window selector, footer
 * caveats). The 2-column visualization (chart + KPI strip on the left,
 * Source breakdown + Capital base on the right) lives inside `RevenueChart`.
 *
 * Backend contract: `GET /market/revenue/history?window=30d|90d|1y|all`.
 *
 * The lifetime pill stays stable across windows — always reflects the
 * cumulative all-time total, so users keep an "all-time" anchor even when
 * zooming into a short window.
 */

/** Only short windows on the dashboard card — longer history lives elsewhere. */
const WINDOWS: readonly RevenueWindow[] = ["7d", "30d"] as const;
const WINDOW_LABELS: Record<RevenueWindow, string> = {
  "7d": "7D",
  "30d": "30D",
  "90d": "90D",
  "1y": "1Y",
  all: "All",
};

export const FeesRevenuePanel = memo(function FeesRevenuePanel() {
  const [window, setWindow] = useState<RevenueWindow>("30d");

  const { breakdown, isLoading, isRefreshing, error, refetch, dataUpdatedAt } =
    useRevenueBreakdown(window);

  const days = useMemo(() => breakdown?.days ?? [], [breakdown]);
  const lifetimeTotal = breakdown?.lifetime?.total ?? 0;

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* card-head: title + lifetime total + window tabs */}
      <CardHead
        title="Protocol Revenue"
        tag={<span className="mono">Lifetime {lifetimeTotal > 0 ? fullUsd(lifetimeTotal) : "—"}</span>}
        actions={
          <>
            <DataStatus
              variant="polled"
              updatedAt={dataUpdatedAt}
              isRefreshing={isRefreshing}
              onRefresh={refetch}
            />
            <div className="flex items-center gap-1 text-[11px] font-semibold">
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
            {/* Offered only once there is something to cite. */}
            {days.length > 0 && (
              <ShareTile
                src={`/api/tile/revenue?window=${window}`}
                filename={`liquidterminal-revenue-${window}`}
                label="Copy revenue as image"
              />
            )}
          </>
        }
      />

      {/* body — chart + KPI strip (left) / breakdown + capital base (right) */}
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

      {/* footer: data sources + caveats */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Sources: Hypurrscan · HypeDexer · HL</span>
        <span className="opacity-50">·</span>
        <span title="Spot fees are doubled to approximate gross-user (deployer takes 50% on HIP-1 pairs).">
          Spot ×{breakdown?.meta?.spotMultiplier ?? 2}
        </span>
        {breakdown?.meta?.hypeUsd ? (
          <>
            <span className="opacity-50">·</span>
            <span title="HYPE→USD conversion for HIP-3 auction proceeds.">
              <HypeMark logoOnly size="xs" className="mr-1" />
              HYPE @ ${breakdown.meta.hypeUsd.toFixed(2)}
            </span>
          </>
        ) : null}
        {breakdown?.meta?.sourceStatus?.hip4 === "not_yet_live" ? (
          <>
            <span className="opacity-50">·</span>
            <span className="text-text-tertiary/70">HIP-4 fees pending mainnet activation</span>
          </>
        ) : breakdown?.meta?.sourceStatus?.hip4 === "error" ? (
          <>
            <span className="opacity-50">·</span>
            <span className="text-danger/80">HIP-4 fees unavailable</span>
          </>
        ) : null}
      </div>
    </Card>
  );
});
