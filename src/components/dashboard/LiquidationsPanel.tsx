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
 * Section haute : stats 24h détaillées (volume total, count, ratio Long/Short,
 * notionnel moyen, top token, frais). Flux : mini-tableau des dernières
 * liquidations avec en-tête de colonnes. Tokens V4 uniquement, aucune
 * donnée inventée — uniquement des champs réels de l'API.
 */

const FEED_LIMIT = 9;

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

/** Taille de position compacte sans devise : "12.4K" / "0.83". */
function compactSize(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (abs >= 1) return n.toFixed(2);
  return n.toPrecision(2);
}

export const LiquidationsPanel = memo(function LiquidationsPanel() {
  const { stats } = useLiquidations24h(30000);
  const { liquidations } = useRecentLiquidations({ limit: 30 });

  const longPct = useMemo(() => {
    const total = stats.longCount + stats.shortCount;
    return total > 0 ? (stats.longCount / total) * 100 : 50;
  }, [stats.longCount, stats.shortCount]);

  const shortPct = 100 - longPct;

  /** Notionnel moyen par liquidation — dérivé des stats 24h réelles. */
  const avgNotional = useMemo(
    () => (stats.liquidationsCount > 0 ? stats.totalVolume / stats.liquidationsCount : 0),
    [stats.totalVolume, stats.liquidationsCount]
  );

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

      {/* Section haute : total + ratio L/S */}
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
          <span className="text-success">
            {Math.round(longPct)}% Long · {stats.longCount.toLocaleString()}
          </span>
          <span className="text-danger">
            {stats.shortCount.toLocaleString()} · {Math.round(shortPct)}% Short
          </span>
        </div>
      </div>

      {/* Stats détaillées 24h */}
      <div className="grid grid-cols-3 border-b border-border-subtle">
        <div className="px-3.5 py-2 border-r border-border-subtle">
          <div className="text-[9px] uppercase tracking-wide text-text-tertiary">Avg size</div>
          <div className="mono text-[12px] font-semibold text-text-primary mt-0.5">
            {compactUsd(avgNotional)}
          </div>
        </div>
        <div className="px-3.5 py-2 border-r border-border-subtle">
          <div className="text-[9px] uppercase tracking-wide text-text-tertiary">Top token</div>
          <div className="mono text-[12px] font-semibold text-text-primary mt-0.5 truncate">
            {stats.topToken || "-"}
          </div>
        </div>
        <div className="px-3.5 py-2">
          <div className="text-[9px] uppercase tracking-wide text-text-tertiary">Fees</div>
          <div className="mono text-[12px] font-semibold text-text-primary mt-0.5">
            {compactUsd(stats.totalFees)}
          </div>
        </div>
      </div>

      {/* Flux : mini-tableau des dernières liquidations */}
      <div className="flex-1">
        <div className="grid grid-cols-[44px_1fr_auto_auto_36px] gap-2 px-3.5 py-1.5 border-b border-border-subtle text-[9px] uppercase tracking-wide text-text-tertiary">
          <span>Side</span>
          <span>Coin</span>
          <span className="text-right">Notional</span>
          <span className="text-right">Size</span>
          <span className="text-right">Time</span>
        </div>

        {feed.length === 0 ? (
          <div className="px-3.5 py-4 text-[11px] text-text-tertiary text-center">
            No recent liquidations
          </div>
        ) : (
          feed.map((liq, i) => {
            const isLong = liq.liq_dir === "Long";
            return (
              <div
                key={`${liq.tid}-${i}`}
                className="grid grid-cols-[44px_1fr_auto_auto_36px] gap-2 items-center px-3.5 py-1.5 border-b border-border-subtle text-[11px] last:border-b-0"
              >
                <span
                  className={`text-[9px] font-bold px-1 py-0.5 rounded text-center ${
                    isLong ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                  }`}
                >
                  {isLong ? "LONG" : "SHORT"}
                </span>
                <span className="font-semibold text-text-primary truncate">{liq.coin}</span>
                <span
                  className={`mono text-right ${isLong ? "text-success" : "text-danger"}`}
                >
                  {compactUsd(liq.notional_total)}
                </span>
                <span className="mono text-right text-text-secondary">
                  {compactSize(liq.size_total)}
                </span>
                <span className="mono text-right text-text-tertiary text-[10px]">
                  {timeAgo(liq.time_ms)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
});
