"use client";

import { useMemo } from "react";
import { PieChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KpiRibbon, type KpiCell } from "@/components/common";
import { compactCount } from "@/lib/formatters/numberFormatting";
import { useWalletCoinDistribution } from "@/services/market/tracker/wallet-performance";

interface WalletConcentrationProps {
  address: string;
}

/** Cyan opacity ramp for the stacked share bar — top market brightest. */
const SEG_CLASS = [
  "bg-brand",
  "bg-brand/75",
  "bg-brand/55",
  "bg-brand/40",
  "bg-brand/28",
  "bg-brand/18",
];
const OTHERS_CLASS = "bg-text-tertiary/25";
const TOP_N = 6;

/**
 * Market-concentration profile for a wallet — how its lifetime volume splits
 * across the markets it trades. Derived from the full coin-distribution (every
 * market, not just the top few), so the shares and focus label are honest.
 * Only-here: a flat by-coin table hides whether a trader is a one-market
 * specialist or spread thin. Hidden for wallets with no trading history.
 */
export function WalletConcentration({ address }: WalletConcentrationProps) {
  const { shares, isLoading, error } = useWalletCoinDistribution(address);

  const model = useMemo(() => {
    const rows = [...shares]
      .filter((s) => s.volume > 0)
      .sort((a, b) => b.volume - a.volume);
    const total = rows.reduce((s, r) => s + r.volume, 0);
    if (total <= 0 || rows.length === 0) return null;

    const top = rows.slice(0, TOP_N).map((r) => ({
      coin: r.coin,
      volume: r.volume,
      share: r.volume / total,
    }));
    const othersVolume = total - top.reduce((s, r) => s + r.volume, 0);
    const othersShare = othersVolume > 0 ? othersVolume / total : 0;

    const topShare = rows[0].volume / total;
    const top3 = rows.slice(0, 3).reduce((s, r) => s + r.volume, 0) / total;
    const focus = top3 >= 0.8 ? "Concentrated" : top3 >= 0.5 ? "Balanced" : "Diversified";
    const focusTone: KpiCell["tone"] = top3 >= 0.8 ? "gold" : "default";

    return {
      top,
      othersShare,
      othersVolume,
      markets: rows.length,
      topCoin: rows[0].coin,
      topShare,
      top3,
      focus,
      focusTone,
    };
  }, [shares]);

  // Self-gate: no trading history, or the distribution endpoint is unavailable.
  if (isLoading && shares.length === 0) return null;
  if (error || !model) return null;

  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

  const cells: KpiCell[] = [
    { key: "top", label: "Top market", value: model.topCoin, sub: pct(model.topShare), tone: "gold" },
    { key: "top3", label: "Top 3 markets", value: pct(model.top3), sub: "of volume" },
    { key: "n", label: "Markets traded", value: compactCount(model.markets) },
    { key: "focus", label: "Concentration", value: model.focus, tone: model.focusTone },
  ];

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <PieChart size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Market concentration</h3>
        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          by volume · lifetime
        </span>
      </div>

      <KpiRibbon cells={cells} />

      <div className="border-t border-border-subtle px-3.5 py-3.5 space-y-3">
        {/* Stacked share bar — top markets brightest, remainder muted. */}
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
          {model.top.map((r, i) => (
            <span
              key={r.coin}
              className={SEG_CLASS[i]}
              style={{ width: `${r.share * 100}%` }}
              title={`${r.coin} ${pct(r.share)}`}
            />
          ))}
          {model.othersShare > 0 && (
            <span
              className={OTHERS_CLASS}
              style={{ width: `${model.othersShare * 100}%` }}
              title={`Others ${pct(model.othersShare)}`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
          {model.top.map((r, i) => (
            <div key={r.coin} className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-sm shrink-0 ${SEG_CLASS[i]}`} />
              <span className="text-xs text-text-secondary truncate">{r.coin}</span>
              <span className="mono text-xs text-text-primary ml-auto">{pct(r.share)}</span>
            </div>
          ))}
          {model.othersShare > 0 && (
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-sm shrink-0 ${OTHERS_CLASS}`} />
              <span className="text-xs text-text-secondary truncate">Others</span>
              <span className="mono text-xs text-text-tertiary ml-auto">{pct(model.othersShare)}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
