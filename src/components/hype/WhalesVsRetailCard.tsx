"use client";

import { memo } from "react";
import { Fish } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KpiRibbon, StackedShareBar, chartPalette } from "@/components/common";
import type { KpiCell } from "@/components/common";
import { compactCount } from "@/lib/formatters/numberFormatting";
import { useHypeHolderCohorts } from "@/services/market/spot/hooks/useHypeHolderCohorts";

/**
 * Tier colors, whale → retail. Whale takes the brand cyan; the ramp deepens
 * toward the smaller cohorts so the concentration reads at a glance. Sourced
 * from `chartPalette.cyanRamp` (no raw hex per the design system).
 */
const TIER_COLORS = chartPalette.cyanRamp;

/**
 * WhalesVsRetailCard — HYPE holders bucketed by balance size.
 *
 * Reuses the merged Hypurrscan holders + staked map (via useHypeHolderCohorts)
 * and shows how supply concentrates across whale → retail tiers: a KPI ribbon
 * for the headline read, then a proportional supply-share bar with a per-tier
 * legend. Self-gates to null when there is no holder data or an error, so it
 * never paints a fake distribution.
 */
export const WhalesVsRetailCard = memo(function WhalesVsRetailCard() {
  const { tiers, totalHolders, error } = useHypeHolderCohorts();

  // Self-gate: no fabricated distribution on empty/error.
  if (error || totalHolders === 0) return null;

  const whales = tiers[0];

  const cells: KpiCell[] = [
    {
      key: "whales",
      label: "Whales",
      value: compactCount(whales.count),
      sub: "≥ 100K HYPE",
    },
    {
      key: "whaleShare",
      label: "Whale % of supply",
      value: `${whales.supplyPct.toFixed(1)}%`,
      tone: "gold",
      sub: "top tier",
    },
    {
      key: "holders",
      label: "Holders",
      value: compactCount(totalHolders),
      sub: "tracked",
    },
  ];

  const segments = tiers.map((t, i) => ({
    key: t.label,
    value: t.balance,
    color: TIER_COLORS[i] ?? TIER_COLORS[TIER_COLORS.length - 1],
    label: `${t.label} · ${t.supplyPct.toFixed(1)}% of supply`,
  }));

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Fish size={13} className="text-brand" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-text-primary leading-tight">
            Whales vs retail
          </h3>
          <p className="text-[10px] text-text-tertiary leading-tight">
            HYPE holders by size tier
          </p>
        </div>
        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          concentration
        </span>
      </div>

      <div className="p-3.5 border-b border-border-subtle">
        <KpiRibbon cells={cells} columns="grid-cols-3" />
      </div>

      <div className="px-3.5 py-3.5 flex-1 flex flex-col gap-3">
        <StackedShareBar segments={segments} height={10} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
          {tiers.map((t, i) => (
            <div key={t.label} className="flex items-center gap-2 py-0.5">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ background: TIER_COLORS[i] ?? TIER_COLORS[TIER_COLORS.length - 1] }}
              />
              <span className="text-[11px] font-medium text-text-secondary">{t.label}</span>
              <span className="ml-auto mono text-[11px] text-text-tertiary">
                {compactCount(t.count)}
              </span>
              <span className="mono text-[11px] text-text-primary w-12 text-right">
                {t.supplyPct.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Whale ≥ 100K · Shark ≥ 10K · Dolphin ≥ 1K · Fish ≥ 100 · Shrimp &lt; 100 HYPE</span>
        <span className="opacity-50">·</span>
        <span>share of tracked supply</span>
      </div>
    </Card>
  );
});
