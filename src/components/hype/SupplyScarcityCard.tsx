"use client";

import { memo, type ReactNode } from "react";
import { Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DominanceBar, chartPalette } from "@/components/common";
import type { DominanceSegment } from "@/components/common";
import { useHypeOverview } from "@/services/market/hype";
import { compactHype } from "@/lib/formatters/numberFormatting";
import { fmtUsd, fmtPct } from "./format";

/**
 * SupplyScarcityCard — how the 1B genesis HYPE splits today: circulating,
 * locked/vesting, Assistance Fund, future-emission reserve and burned. The
 * five segments are expressed as a share of max supply and always sum to 100%
 * (the locked bucket is the residual), so the bar is exact regardless of how
 * the API classifies AF vs circulating.
 */
export const SupplyScarcityCard = memo(function SupplyScarcityCard() {
  const { overview } = useHypeOverview();

  const max = overview?.maxSupply ?? 0;
  const pctOfMax = (v: number) => (max > 0 ? (v / max) * 100 : 0);

  const segments: DominanceSegment[] = overview
    ? [
        {
          key: "circulating",
          label: "Circulating",
          pct: pctOfMax(overview.composition.circulating),
          color: chartPalette.accent,
          labelClassName: "text-brand-text-on",
        },
        {
          key: "emissions",
          label: "Future emissions",
          pct: pctOfMax(overview.composition.futureEmissions),
          color: chartPalette.multiSeries[1],
          labelClassName: "text-text-primary",
        },
        {
          key: "locked",
          label: "Locked / vesting",
          pct: pctOfMax(overview.composition.lockedExAf),
          color: chartPalette.violet,
          labelClassName: "text-text-primary",
        },
        {
          key: "af",
          label: "Assistance Fund",
          pct: pctOfMax(overview.composition.assistanceFund),
          color: chartPalette.gold,
        },
        {
          key: "burned",
          label: "Burned",
          pct: pctOfMax(overview.composition.burned),
          color: chartPalette.danger,
        },
      ]
    : [];

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Layers size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Supply &amp; Scarcity</h3>
        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono">
          max 1B HYPE
        </span>
      </div>

      <div className="px-3.5 pt-4 pb-3 border-b border-border-subtle">
        {segments.length > 0 ? (
          <DominanceBar
            title="Composition · % of max supply"
            caption={
              overview
                ? `AF + burned ≈ ${fmtPct(overview.removedFromFloatPct)} out of float`
                : undefined
            }
            segments={segments}
            height={40}
            labelThresholdPct={12}
          />
        ) : (
          <div className="h-[120px] flex items-center justify-center text-[11px] text-text-tertiary">
            Loading supply…
          </div>
        )}
      </div>

      <div className="px-3.5 py-3 flex-1 flex flex-col gap-0.5">
        <StatRow
          label="Max supply"
          value={overview ? `${compactHype(overview.maxSupply)} HYPE` : "—"}
          sub={overview ? `FDV ${fmtUsd(overview.fdv)}` : undefined}
        />
        <StatRow
          label="Total supply"
          value={overview ? `${compactHype(overview.totalSupply)} HYPE` : "—"}
          sub={overview ? `${fmtPct(pctOfMax(overview.totalSupply))} of max` : undefined}
        />
        <StatRow
          label="Circulating"
          value={overview ? `${compactHype(overview.circulatingSupply)} HYPE` : "—"}
          sub={overview ? `mcap ${fmtUsd(overview.marketCap)}` : undefined}
          accent={chartPalette.accent}
        />
        <StatRow
          label="Future emissions"
          value={overview ? `${compactHype(overview.futureEmissions)} HYPE` : "—"}
          sub={overview ? `${fmtPct(pctOfMax(overview.futureEmissions))} reserve` : undefined}
          accent={chartPalette.multiSeries[1]}
        />
        <StatRow
          label="Assistance Fund"
          value={overview ? `${compactHype(overview.composition.assistanceFund)} HYPE` : "—"}
          sub={overview ? `${fmtUsd(overview.af?.hypeValueUsd)} · ${fmtPct(overview.afPctOfMax ?? 0)} of max` : undefined}
          accent={chartPalette.gold}
        />
        <StatRow
          label="Burned"
          value={overview ? `${compactHype(overview.burned)} HYPE` : "—"}
          sub={overview ? `${fmtUsd(overview.burnedUsd)} · permanent` : undefined}
          accent={chartPalette.danger}
        />
      </div>

      <div className="flex items-center gap-x-3 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Source: Hyperliquid info · tokenDetails (live)</span>
      </div>
    </Card>
  );
});

function StatRow({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-border-subtle/60 last:border-b-0">
      {accent ? (
        <span
          className="w-2 h-2 rounded-sm shrink-0"
          style={{ background: accent }}
        />
      ) : (
        <span className="w-2 h-2 shrink-0" />
      )}
      <span className="text-[12px] text-text-secondary">{label}</span>
      <span className="mono text-[12.5px] font-semibold text-text-primary ml-auto">{value}</span>
      {sub && <span className="mono text-[10.5px] text-text-tertiary w-[150px] text-right">{sub}</span>}
    </div>
  );
}
