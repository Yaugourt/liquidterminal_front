"use client";

import { memo, useMemo } from "react";
import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  useLiquidationsData,
  useRecentLiquidations,
} from "@/services/explorer/liquidation";
import { compactUsd } from "@/lib/formatters/numberFormatting";

/**
 * LiquidationsPanel — carte "Liquidations" du Dashboard, en 3 niveaux :
 *  1. Stats 24h (volume, events, ratio long/short) — endpoint `/liquidations/data`.
 *  2. Recent — flux des dernières liquidations via REST `fetchRecentLiquidations`,
 *     même appel que la page Liquidations.
 *  3. Chart — histogramme du volume liquidé par bucket de 30 min sur 24h.
 *
 * Aucune donnée inventée — uniquement des champs réels de l'API.
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

/** Taille de position compacte sans devise : "12.4K" / "0.83". */
function compactSize(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (abs >= 1) return n.toFixed(2);
  return n.toPrecision(2);
}

/** Heure courte "HH:mm" d'un bucket. */
function bucketHour(timestamp: string): string {
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export const LiquidationsPanel = memo(function LiquidationsPanel() {
  const { stats, buckets, isLoading } = useLiquidationsData("24h", 30000);
  // Recent — même appel REST que la page Liquidations (`fetchRecentLiquidations`).
  const {
    liquidations: restLiquidations,
    isLoading: feedLoading,
    error: feedError,
  } = useRecentLiquidations({ limit: 30, hours: 24 });

  const longPct = useMemo(() => {
    const total = stats.longCount + stats.shortCount;
    return total > 0 ? (stats.longCount / total) * 100 : 50;
  }, [stats.longCount, stats.shortCount]);

  const shortPct = 100 - longPct;

  /** Dernières liquidations, les plus récentes en tête. */
  const feed = useMemo(
    () =>
      [...restLiquidations]
        .sort((a, b) => b.time_ms - a.time_ms)
        .slice(0, FEED_LIMIT),
    [restLiquidations]
  );

  /** Volume max d'un bucket — sert d'échelle à l'histogramme. */
  const maxBucketVolume = useMemo(
    () => buckets.reduce((m, b) => Math.max(m, b.totalVolume), 0),
    [buckets]
  );

  /** Bornes de temps de l'histogramme (premier / milieu / dernier bucket). */
  const timeAxis = useMemo(() => {
    if (buckets.length === 0) return null;
    return {
      start: bucketHour(buckets[0].timestamp),
      mid: bucketHour(buckets[Math.floor(buckets.length / 2)].timestamp),
      end: bucketHour(buckets[buckets.length - 1].timestamp),
    };
  }, [buckets]);

  const hasChart = maxBucketVolume > 0;

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* Card-head V4 : icône + titre + tag période + top coin */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Flame size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Liquidations</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          24h
        </span>
        <span className="ml-auto text-[10px] text-text-tertiary mono">
          Top · {stats.topCoin || "-"}
        </span>
      </div>

      {/* Niveau 1 — liq-summary : grille 2×2 de stats 24h */}
      <div className="grid grid-cols-2 gap-px bg-border-subtle">
        <div className="bg-surface px-3.5 py-3">
          <div className="text-[10px] uppercase tracking-wide text-text-tertiary">
            Total liquidated
          </div>
          <div className="mono text-[17px] font-semibold text-text-primary mt-1">
            {compactUsd(stats.totalVolume)}
          </div>
        </div>
        <div className="bg-surface px-3.5 py-3">
          <div className="text-[10px] uppercase tracking-wide text-text-tertiary">Events</div>
          <div className="mono text-[17px] font-semibold text-text-primary mt-1">
            {stats.liquidationsCount.toLocaleString()}
          </div>
        </div>
        <div className="bg-surface px-3.5 py-3">
          <div className="text-[10px] uppercase tracking-wide text-text-tertiary">Avg size</div>
          <div className="mono text-[17px] font-semibold text-text-primary mt-1">
            {compactUsd(stats.avgSize)}
          </div>
        </div>
        <div className="bg-surface px-3.5 py-3">
          <div className="text-[10px] uppercase tracking-wide text-text-tertiary">
            Largest liq.
          </div>
          <div className="mono text-[17px] font-semibold text-text-primary mt-1">
            {compactUsd(stats.maxLiq)}
          </div>
        </div>
      </div>

      {/* ls-bar : ratio Long / Short */}
      <div className="flex h-2 rounded overflow-hidden mx-3.5 mt-3 mb-1.5 border border-border-default">
        <span className="bg-success" style={{ width: `${longPct}%` }} />
        <span className="bg-danger" style={{ width: `${shortPct}%` }} />
      </div>
      <div className="flex items-center justify-between px-3.5 pb-3 text-[10.5px]">
        <span className="text-success font-semibold">
          Long {Math.round(longPct)}% · {stats.longCount.toLocaleString()}
        </span>
        <span className="text-danger font-semibold">
          {stats.shortCount.toLocaleString()} · {Math.round(shortPct)}% Short
        </span>
      </div>

      {/* Niveau 2 — Recent : flux des dernières liquidations */}
      <div className="border-t border-border-subtle">
        <div className="flex items-center justify-between px-3.5 pt-2.5 pb-1.5">
          <span className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            Recent
          </span>
          {feed.length > 0 && (
            <span className="text-[10px] text-text-tertiary">{feed.length} shown</span>
          )}
        </div>
        {feedError ? (
          <div className="px-3.5 py-3 text-[11px] text-text-tertiary text-center">
            Feed temporarily unavailable
          </div>
        ) : feed.length === 0 ? (
          <div className="px-3.5 py-3 text-[11px] text-text-tertiary text-center">
            {feedLoading ? "Loading…" : "No recent liquidations"}
          </div>
        ) : (
          feed.map((liq, i) => {
            const isLong = liq.liq_dir === "Long";
            return (
              <div
                key={`${liq.tid}-${i}`}
                className="flex items-center gap-2.5 px-3.5 py-2 border-b border-border-subtle text-[11.5px] last:border-b-0"
              >
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide min-w-[46px] text-center ${
                    isLong ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                  }`}
                >
                  {isLong ? "LONG" : "SHORT"}
                </span>
                <span className="font-semibold text-text-primary truncate">{liq.coin}</span>
                <span
                  className={`mono font-semibold ml-auto ${
                    isLong ? "text-success" : "text-danger"
                  }`}
                >
                  {compactUsd(liq.notional_total)}
                </span>
                <span className="mono text-text-secondary">
                  {compactSize(liq.size_total)}
                </span>
                <span className="mono text-text-tertiary text-[10px] min-w-[34px] text-right">
                  {timeAgo(liq.time_ms)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Niveau 3 — Chart : volume liquidé par bucket de 30 min sur 24h */}
      <div className="flex-1 flex flex-col border-t border-border-subtle px-3.5 pt-2.5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            Liquidated volume
          </span>
          <span className="text-[10px] text-text-tertiary">30m buckets</span>
        </div>

        {!hasChart ? (
          <div className="flex-1 grid place-items-center py-5 text-[11px] text-text-tertiary">
            {isLoading ? "Loading…" : "No liquidations in the last 24h"}
          </div>
        ) : (
          <>
            <div className="flex-1 flex items-end gap-px min-h-[64px]">
              {buckets.map((b) => {
                const longH = (b.longVolume / maxBucketVolume) * 100;
                const shortH = (b.shortVolume / maxBucketVolume) * 100;
                return (
                  <div
                    key={b.timestampMs}
                    title={`${bucketHour(b.timestamp)} · ${compactUsd(b.totalVolume)} · ${b.liquidationsCount} liqs`}
                    className="flex-1 h-full flex flex-col justify-end gap-px hover:opacity-70 transition-opacity"
                  >
                    <span
                      className="block bg-danger/80 rounded-sm"
                      style={{ height: `${shortH}%` }}
                    />
                    <span
                      className="block bg-success/80 rounded-sm"
                      style={{ height: `${longH}%` }}
                    />
                  </div>
                );
              })}
            </div>
            {timeAxis && (
              <div className="flex justify-between mt-1.5 text-[9px] text-text-tertiary mono">
                <span>{timeAxis.start}</span>
                <span>{timeAxis.mid}</span>
                <span>{timeAxis.end}</span>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
});
