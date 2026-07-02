"use client";

import { memo } from "react";
import { PieChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DominanceBar, chartPalette } from "@/components/common";
import type { DominanceSegment } from "@/components/common";
import {
  HYPE_GENESIS_DISTRIBUTION,
  HYPE_GENESIS_DATE,
} from "@/services/market/hype";
import { compactHype } from "@/lib/formatters/numberFormatting";

/** Stable color per genesis bucket (index into the multi-series palette). */
const BUCKET_COLOR: Record<string, string> = {
  airdrop: chartPalette.multiSeries[5], // emerald — community
  emissions: chartPalette.multiSeries[0], // cyan
  core: chartPalette.violet,
  foundation: chartPalette.multiSeries[6], // orange
  grants: chartPalette.multiSeries[4], // pink
  hip2: chartPalette.multiSeries[7], // blue
};

/**
 * GenesisDistributionCard — the fixed allocation of the 1B HYPE minted at the
 * TGE (no VC / private / CEX / market-maker allocation). Static reference data;
 * the bar shows the split and the list carries each bucket's vesting note.
 */
export const GenesisDistributionCard = memo(function GenesisDistributionCard() {
  const segments: DominanceSegment[] = HYPE_GENESIS_DISTRIBUTION.map((a) => ({
    key: a.key,
    label: a.label,
    pct: a.pct,
    color: BUCKET_COLOR[a.key] ?? chartPalette.accent,
  }));

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <PieChart size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Genesis Distribution</h3>
        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono">
          TGE {HYPE_GENESIS_DATE}
        </span>
      </div>

      <div className="px-3.5 pt-4 pb-3 border-b border-border-subtle">
        <DominanceBar
          title="Allocation · 1B HYPE at genesis"
          caption="31% airdropped to users"
          segments={segments}
          height={40}
          legend={false}
          labelThresholdPct={101}
        />
      </div>

      <div className="px-3.5 py-3 flex-1 flex flex-col gap-0.5">
        {HYPE_GENESIS_DISTRIBUTION.map((a) => (
          <div
            key={a.key}
            className="flex items-start gap-2.5 py-1.5 border-b border-border-subtle/60 last:border-b-0"
          >
            <span
              className="w-2 h-2 rounded-sm shrink-0 mt-1"
              style={{ background: BUCKET_COLOR[a.key] }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[12.5px] font-semibold text-text-primary">{a.label}</span>
                {a.locked && (
                  <span className="text-[9px] uppercase tracking-[0.06em] text-text-tertiary border border-border-subtle rounded px-1 py-px">
                    locked
                  </span>
                )}
                <span className="mono text-[11px] text-text-tertiary ml-auto">
                  {compactHype(a.amount)} HYPE
                </span>
                <span className="mono text-[12px] font-semibold text-text-primary w-12 text-right">
                  {a.pct}%
                </span>
              </div>
              <p className="text-[10.5px] leading-snug text-text-tertiary mt-0.5">{a.note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-x-3 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Source: Hyperliquid tokenomics docs · no VC / CEX allocation</span>
      </div>
    </Card>
  );
});
