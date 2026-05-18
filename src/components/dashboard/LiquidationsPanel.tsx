"use client";

import { memo, useMemo } from "react";
import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLiquidations24h } from "@/services/dashboard/hooks/useLiquidations24h";
import { useRecentLiquidations } from "@/services/explorer/liquidation";
import { compactUsd } from "@/lib/formatters/numberFormatting";

/**
 * LiquidationsPanel — carte "Liquidations" de la colonne live du Dashboard.
 *
 * Section haute : total 24h + ratio Long/Short. Flux : 6 dernières
 * liquidations. Tokens V4 uniquement, aucune donnée inventée.
 */

const FEED_LIMIT = 6;

/** Âge compact relatif : "12s" / "4m" / "2h" / "1d". */
function timeAgo(ms: number): string {
  const diff = Math.max(0, Date.now() - ms);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export const LiquidationsPanel = memo(function LiquidationsPanel() {
  const { stats } = useLiquidations24h(30000);
  const { liquidations } = useRecentLiquidations({ limit: 30 });

  const longPct = useMemo(() => {
    const total = stats.longCount + stats.shortCount;
    return total > 0 ? (stats.longCount / total) * 100 : 50;
  }, [stats.longCount, stats.shortCount]);

  const shortPct = 100 - longPct;

  const feed = useMemo(() => liquidations.slice(0, FEED_LIMIT), [liquidations]);

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
            <Flame size={13} className="text-brand" />
          </span>
          <h3 className="text-[13px] font-semibold text-text-primary">Liquidations</h3>
        </div>
        <span className="text-[11px] text-text-tertiary">24h</span>
      </div>

      <div className="px-3.5 py-3 border-b border-border-subtle">
        <div className="flex items-baseline justify-between gap-2">
          <span className="mono text-[18px] font-semibold text-text-primary">
            {compactUsd(stats.totalVolume)}
          </span>
          <span className="text-[11px] text-text-tertiary mono">
            {stats.liquidationsCount.toLocaleString()} liqs
          </span>
        </div>
        <div className="h-1.5 rounded overflow-hidden flex mt-2">
          <span className="bg-success" style={{ width: `${longPct}%` }} />
          <span className="bg-danger" style={{ width: `${shortPct}%` }} />
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[10px] mono">
          <span className="text-success">{Math.round(longPct)}% Long</span>
          <span className="text-danger">{Math.round(shortPct)}% Short</span>
        </div>
      </div>

      <div>
        {feed.map((liq, i) => {
          const isLong = liq.liq_dir === "Long";
          return (
            <div
              key={`${liq.tid}-${i}`}
              className="flex items-center gap-2 px-3.5 py-1.5 border-t border-border-subtle text-[11px]"
            >
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  isLong ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                }`}
              >
                {isLong ? "LONG" : "SHORT"}
              </span>
              <span className="font-semibold text-text-primary">{liq.coin}</span>
              <span className="mono text-text-secondary">
                {compactUsd(liq.notional_total)}
              </span>
              <span className="ml-auto text-text-tertiary text-[10px]">
                {timeAgo(liq.time_ms)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
});
