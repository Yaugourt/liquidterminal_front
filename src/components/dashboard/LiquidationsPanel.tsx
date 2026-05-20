"use client";

import { memo, useMemo, useState } from "react";
import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  useLiquidationsData,
  useRecentLiquidations,
} from "@/services/explorer/liquidation";
import type { Liquidation } from "@/services/explorer/liquidation";
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

/** Configuration de l'histogramme : 48 buckets de 30 min couvrant 24 h. */
const HIST_BUCKET_MS = 30 * 60 * 1000;
const HIST_BUCKET_COUNT = 48;
const HIST_WINDOW_HOURS = 24;
const HIST_FETCH_LIMIT = 1000;

/** Bucket reconstruit côté client à partir du flux /recent. */
interface HistBucket {
  timestamp: string;
  timestampMs: number;
  totalVolume: number;
  longVolume: number;
  shortVolume: number;
  longCount: number;
  shortCount: number;
  liquidationsCount: number;
}

/**
 * Regroupe les liquidations en 48 buckets de 30 min alignés sur l'instant
 * courant — le dernier bucket finit à `now`, le premier commence à `now-24h`.
 */
function bucketizeRecent(liquidations: Liquidation[]): HistBucket[] {
  const now = Date.now();
  const startMs = now - HIST_BUCKET_COUNT * HIST_BUCKET_MS;
  const buckets: HistBucket[] = Array.from({ length: HIST_BUCKET_COUNT }, (_, i) => {
    const tMs = startMs + i * HIST_BUCKET_MS;
    return {
      timestamp: new Date(tMs).toISOString(),
      timestampMs: tMs,
      totalVolume: 0,
      longVolume: 0,
      shortVolume: 0,
      longCount: 0,
      shortCount: 0,
      liquidationsCount: 0,
    };
  });

  for (const liq of liquidations) {
    const ms = getLiqTimeMs(liq);
    const idx = Math.floor((ms - startMs) / HIST_BUCKET_MS);
    if (idx < 0 || idx >= HIST_BUCKET_COUNT) continue;
    const b = buckets[idx];
    b.totalVolume += liq.notional_total;
    b.liquidationsCount += 1;
    if (liq.liq_dir === "Long") {
      b.longVolume += liq.notional_total;
      b.longCount += 1;
    } else {
      b.shortVolume += liq.notional_total;
      b.shortCount += 1;
    }
  }

  return buckets;
}

/** Heure courte "HH:mm" d'un bucket. */
function bucketHour(timestamp: string): string {
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Renvoie un timestamp ms fiable pour une liquidation.
 *
 * L'API `/liquidations/recent` retourne des `time_ms` corrompus pour environ
 * 20 % des rows (valeurs ~3.5e12 = année 2082) tandis que l'ISO `time` reste
 * correct. On parse l'ISO en UTC ; on retombe sur `time_ms` uniquement si
 * l'ISO est inparsable.
 */
function getLiqTimeMs(liq: Liquidation): number {
  const iso = liq.time.endsWith("Z") ? liq.time : `${liq.time}Z`;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : liq.time_ms;
}

/**
 * LiquidationsHistogram — barres long/short stackées par bucket, interactives.
 *
 * Hover sur une barre → crosshair vertical, barres voisines en `opacity-40` et
 * tooltip flottant centré au-dessus du bucket survolé qui affiche Long / Short
 * (volumes + counts) et le total du bucket.
 */
function LiquidationsHistogram({
  buckets,
  maxVolume,
}: {
  buckets: HistBucket[];
  maxVolume: number;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const hovered = hoveredIdx != null ? buckets[hoveredIdx] : null;

  const leftPct = useMemo(() => {
    if (hoveredIdx == null || buckets.length === 0) return 50;
    return ((hoveredIdx + 0.5) / buckets.length) * 100;
  }, [hoveredIdx, buckets.length]);

  return (
    <div className="relative flex-1 flex flex-col">
      {/* Tooltip flottant */}
      <div
        className={`pointer-events-none absolute -top-1 z-20 transition-all duration-150 ease-out ${
          hovered ? "opacity-100" : "opacity-0 translate-y-1"
        }`}
        style={{
          left: `${leftPct}%`,
          transform: "translateX(-50%) translateY(-100%)",
        }}
      >
        {hovered && (
          <div className="bg-surface-2 border border-border-default rounded px-2.5 py-1.5 min-w-[148px] shadow-xl">
            <div className="mono text-[9px] text-text-tertiary">
              {bucketHour(hovered.timestamp)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-success mono font-semibold">Long</span>
              <span className="ml-auto mono text-text-primary">
                {compactUsd(hovered.longVolume)}
              </span>
              <span className="mono text-text-tertiary text-[9px]">
                · {hovered.longCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-danger" />
              <span className="text-danger mono font-semibold">Short</span>
              <span className="ml-auto mono text-text-primary">
                {compactUsd(hovered.shortVolume)}
              </span>
              <span className="mono text-text-tertiary text-[9px]">
                · {hovered.shortCount}
              </span>
            </div>
            <div className="border-t border-border-subtle mt-1 pt-1 text-[9px] mono text-text-tertiary flex justify-between">
              <span>Total</span>
              <span className="text-text-primary">
                {compactUsd(hovered.totalVolume)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div
        onMouseLeave={() => setHoveredIdx(null)}
        className="flex items-end gap-px flex-1 min-h-[96px] cursor-crosshair"
      >
        {buckets.map((b, i) => {
          const isHovered = i === hoveredIdx;
          const dim = hoveredIdx != null && !isHovered;
          const longPct = (b.longVolume / maxVolume) * 100;
          const shortPct = (b.shortVolume / maxVolume) * 100;
          // Bars proportionnels — mais on garantit 2px minimum sur tout volume
          // non-nul pour rester visible quand la dynamique est énorme
          // (un bucket à 10 M$ vs un autre à 200 $).
          const shortH =
            b.shortVolume > 0 ? `max(2px, ${shortPct}%)` : "0";
          const longH =
            b.longVolume > 0 ? `max(2px, ${longPct}%)` : "0";
          return (
            <div
              key={b.timestampMs}
              onMouseEnter={() => setHoveredIdx(i)}
              className={`flex-1 h-full flex flex-col justify-end gap-px transition-opacity duration-150 ease-out ${
                dim ? "opacity-35" : "opacity-100"
              }`}
            >
              <span
                className={`block rounded-sm transition-colors duration-150 ease-out ${
                  isHovered ? "bg-danger" : "bg-danger/75"
                }`}
                style={{ height: shortH }}
              />
              <span
                className={`block rounded-sm transition-colors duration-150 ease-out ${
                  isHovered ? "bg-success" : "bg-success/75"
                }`}
                style={{ height: longH }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const LiquidationsPanel = memo(function LiquidationsPanel() {
  // Stats 24h (totaux, ratio long/short, top coin) — endpoint agrégé.
  const { stats } = useLiquidationsData("24h", 30000);
  // /recent — alimente l'histogramme. Limit max 1000 pour reconstituer les
  // buckets côté client sur 24 h.
  const {
    liquidations: restLiquidations,
    isLoading: feedLoading,
  } = useRecentLiquidations({
    limit: HIST_FETCH_LIMIT,
    hours: HIST_WINDOW_HOURS,
    refreshInterval: 30000,
  });

  const longPct = useMemo(() => {
    const total = stats.longCount + stats.shortCount;
    return total > 0 ? (stats.longCount / total) * 100 : 50;
  }, [stats.longCount, stats.shortCount]);

  const shortPct = 100 - longPct;

  /** Buckets bruts (48 × 30 min sur 24 h) reconstruits depuis le flux /recent. */
  const rawBuckets = useMemo(
    () => bucketizeRecent(restLiquidations),
    [restLiquidations]
  );

  /**
   * Buckets visibles — on rogne les buckets vides en tête : avec un flux
   * `/recent` plafonné à 1000 rows, la fenêtre réelle couverte est souvent
   * de 4-8 h, le reste à gauche serait juste des espaces vides → on remplit
   * la largeur de la card avec la data dispo.
   */
  const histBuckets = useMemo(() => {
    let start = 0;
    while (start < rawBuckets.length && rawBuckets[start].totalVolume === 0) {
      start++;
    }
    if (start >= rawBuckets.length) return rawBuckets;
    return rawBuckets.slice(start);
  }, [rawBuckets]);

  /** Volume max d'un bucket — sert d'échelle à l'histogramme. */
  const maxBucketVolume = useMemo(
    () => histBuckets.reduce((m, b) => Math.max(m, b.totalVolume), 0),
    [histBuckets]
  );

  /** Bornes de temps de l'histogramme (premier / milieu / dernier bucket). */
  const timeAxis = useMemo(() => {
    if (histBuckets.length === 0) return null;
    return {
      start: bucketHour(histBuckets[0].timestamp),
      mid: bucketHour(histBuckets[Math.floor(histBuckets.length / 2)].timestamp),
      end: bucketHour(histBuckets[histBuckets.length - 1].timestamp),
    };
  }, [histBuckets]);

  /** Heures de couverture réelles affichées par la chart. */
  const visibleHours = useMemo(() => {
    if (histBuckets.length === 0) return 0;
    const spanMs =
      histBuckets[histBuckets.length - 1].timestampMs -
      histBuckets[0].timestampMs +
      HIST_BUCKET_MS;
    return Math.max(1, Math.round(spanMs / (60 * 60 * 1000)));
  }, [histBuckets]);

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

      {/* Niveau 2 — Chart : volume liquidé par bucket de 30 min */}
      <div className="flex-1 flex flex-col border-t border-border-subtle px-3.5 pt-2.5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            Liquidated volume
          </span>
          <span className="text-[10px] text-text-tertiary">
            {visibleHours > 0 ? `last ${visibleHours}h · 30m buckets` : "30m buckets"}
          </span>
        </div>

        {!hasChart ? (
          <div className="flex-1 grid place-items-center py-5 text-[11px] text-text-tertiary">
            {feedLoading ? "Loading…" : "No liquidations in the last 24h"}
          </div>
        ) : (
          <>
            <LiquidationsHistogram
              buckets={histBuckets}
              maxVolume={maxBucketVolume}
            />
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
