"use client";

import { memo, useMemo } from "react";
import { Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { useSpotStablecoins } from "@/services/market/stablecoins";
import { compactUsd } from "@/lib/formatters/numberFormatting";

/**
 * StablecoinsCard — stablecoins on-spot d'Hyperliquid via Hypurrscan
 * (`/spotUSDC`). Hero : supply totale + sparkline de sa trajectoire ;
 * dessous, le détail par stablecoin (supply + holders).
 */

/** Compte compact sans devise : "798.7K" / "1.20M" / "342". */
function compactCount(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(Math.round(n));
}

export const StablecoinsCard = memo(function StablecoinsCard() {
  const { stablecoins, supplyHistory, isLoading } = useSpotStablecoins();

  const totals = useMemo(
    () =>
      stablecoins.reduce(
        (acc, s) => ({
          supply: acc.supply + s.supply,
          holders: acc.holders + s.holders,
        }),
        { supply: 0, holders: 0 }
      ),
    [stablecoins]
  );

  const hasData = stablecoins.length > 0;

  return (
    <Card className="overflow-hidden flex flex-col flex-1">
      {/* card-head V4 */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Coins size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Stablecoins</h3>
        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          spot supply
        </span>
      </div>

      {/* Hero — supply totale + sparkline */}
      <div className="px-3.5 pt-3 pb-2 border-b border-border-subtle">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wide text-text-tertiary">
            Total spot supply
          </span>
          {hasData && (
            <span className="text-[10px] text-text-tertiary mono">
              {compactCount(totals.holders)} holders
            </span>
          )}
        </div>
        <div className="mono text-[23px] font-semibold tracking-[-0.02em] leading-none text-text-primary mt-1">
          {hasData ? compactUsd(totals.supply) : isLoading ? "…" : "—"}
        </div>
        <Sparkline data={supplyHistory} height={36} className="mt-2" />
      </div>

      {/* Détail par stablecoin */}
      <div className="flex-1">
        {!hasData ? (
          <div className="px-3.5 py-4 text-[11px] text-text-tertiary text-center">
            {isLoading ? "Loading…" : "No stablecoin data"}
          </div>
        ) : (
          stablecoins.map((s) => (
            <div
              key={s.symbol}
              className="flex items-center gap-2.5 px-3.5 py-2 border-b border-border-subtle last:border-b-0"
            >
              <div className="w-6 h-6 shrink-0 rounded-md flex items-center justify-center text-[9px] font-semibold bg-brand/10 text-brand overflow-hidden">
                {s.symbol.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-[12.5px] font-semibold text-text-primary leading-tight">
                  {s.symbol}
                </div>
                <div className="text-[10px] text-text-tertiary mono">
                  {compactCount(s.holders)} holders
                </div>
              </div>
              <span className="mono text-[12.5px] font-semibold text-text-primary ml-auto">
                {compactUsd(s.supply)}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
});
