"use client";

import { memo, useMemo } from "react";
import { KpiRibbon, type KpiCell } from "@/components/common";
import type { PriorityFeesSeries, PriorityFeesSeriesWindow } from "@/services/explorer/priority-fees";
import { compactCount, compactHype, compactUsd } from "@/lib/formatters/numberFormatting";
import {
  annualizeHype,
  bucketSpanHours,
  formatPriorityFeeNumber,
  formatShare,
  hypeToUsd,
  seriesWindowToHours,
} from "./priority-fees-format";

const PLACEHOLDER = "—";

/** Below this share of the window, the gap is worth naming rather than rounding away. */
const COVERAGE_TOLERANCE = 0.95;

/** Compact hour count for the coverage notice, e.g. "11h" or "10.5h". */
function formatHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}h`;
}

/** USD caption under a HYPE value, dropped entirely when no price is known. */
function usdSub(hype: number | null, hypeUsd: number | null): string | undefined {
  const usd = hypeToUsd(hype, hypeUsd);
  return usd === null ? undefined : `≈ ${compactUsd(usd)}`;
}

export interface PriorityFeesRibbonProps {
  series: PriorityFeesSeries | null;
  window: PriorityFeesSeriesWindow;
  isLoading: boolean;
}

/**
 * The six numbers that frame the priority burn: how much HYPE the window
 * destroyed, what that annualizes to, and how narrow the set of traders paying
 * it really is.
 *
 * The two share captions are the point of the strip. A burn figure on its own
 * says nothing about whether priority is a market-wide cost or a tax a handful
 * of latency-sensitive desks pay, and it is the latter.
 *
 * When the upstream drops slices, the helper says how much of the window really
 * answered instead of letting a partial total pass for a full one.
 */
export const PriorityFeesRibbon = memo(function PriorityFeesRibbon({
  series,
  window,
  isLoading,
}: PriorityFeesRibbonProps) {
  // Hours the buckets really cover. A rollup the upstream never answered leaves
  // its slice out, and the total then describes a shorter window than the tab
  // claims — worth saying rather than presenting a partial day as a whole one.
  const coveredHours = useMemo(
    () => series?.buckets.reduce((acc, b) => acc + bucketSpanHours(b), 0) ?? 0,
    [series],
  );
  const nominalHours = seriesWindowToHours(window);
  const shortCoverage = series !== null && coveredHours < nominalHours * COVERAGE_TOLERANCE;

  const cells = useMemo((): KpiCell[] => {
    const totals = series?.totals;
    const hypeUsd = series?.meta.hypeUsd ?? null;
    const annualized = totals ? annualizeHype(totals.gas, coveredHours) : null;

    return [
      {
        key: "burned",
        label: "Gas burned",
        value: totals ? `${compactHype(totals.gas)} HYPE` : PLACEHOLDER,
        sub: usdSub(totals?.gas ?? null, hypeUsd),
        tone: "gold",
      },
      {
        key: "annualized",
        label: "Annualized",
        value: annualized === null ? PLACEHOLDER : `${compactHype(annualized)} HYPE`,
        sub: usdSub(annualized, hypeUsd),
        tone: "gold",
      },
      {
        key: "fills",
        label: "Fills paying",
        value: compactCount(totals?.fills, { fallback: PLACEHOLDER }),
        sub: totals ? `${formatShare(totals.fills, totals.allFills)} of all fills` : undefined,
      },
      {
        key: "payers",
        label: "Payers",
        value: compactCount(totals?.uniqueUsers, { fallback: PLACEHOLDER }),
        sub: totals ? `${formatShare(totals.uniqueUsers, totals.allUsers)} of traders` : undefined,
      },
      {
        key: "avg",
        label: "Avg per fill",
        value: totals ? `${formatPriorityFeeNumber(totals.avgGas)} HYPE` : PLACEHOLDER,
        sub: usdSub(totals?.avgGas ?? null, hypeUsd),
      },
      {
        key: "max",
        label: "Largest fill",
        value: totals ? `${formatPriorityFeeNumber(totals.maxGas)} HYPE` : PLACEHOLDER,
        sub: usdSub(totals?.maxGas ?? null, hypeUsd),
      },
    ];
  }, [series, coveredHours]);

  const helper = isLoading && !series
    ? "Loading…"
    : shortCoverage
      ? `Partial window: ${formatHours(coveredHours)} of ${formatHours(nominalHours)} answered`
      : "Burned, never redistributed";

  return <KpiRibbon cells={cells} header={{ label: "Order priority", helper }} />;
});
