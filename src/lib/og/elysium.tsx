import type React from "react";
import { ImageResponse } from "next/og";
import { env } from "@/lib/env";
import { loadTileFonts } from "./fonts";
import { tileColors } from "./tileTheme";

/**
 * Shared pieces for the Elysium share-tiles: backend loader, complete-day
 * filter, a shared-scale multi-series path builder and the network badge.
 */

const C = tileColors;

/** Elysium endpoints wrap their payload in `{ success, data }`. */
export async function loadElysium<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T };
    return json.data ?? null;
  } catch {
    return null;
  }
}

/** Drop the still-accumulating UTC day: a partial day reads as a collapse. */
export function completeDays<T extends { day: string; partial?: boolean }>(rows: T[] | null | undefined): T[] {
  return (rows ?? []).filter((r) => !r.partial).sort((a, b) => a.day.localeCompare(b.day));
}

export function fmtDay(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function utcStamp(): string {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

export const ELYSIUM_FOOTNOTE = () => `Source: Elysium testnet · on-chain indexing, ${utcStamp()} UTC`;

/**
 * Several series drawn on ONE scale (0 to the max of all), so "in" and "out"
 * can be compared by height. Same 1000x150 viewBox as `seriesPaths`.
 */
export function sharedSeriesPaths(series: number[][], width = 1000, height = 150): { line: string; area: string }[] {
  const max = Math.max(1e-9, ...series.flat()) * 1.12;
  return series.map((values) => {
    const n = values.length;
    const x = (i: number) => (n === 1 ? width : (i / (n - 1)) * width);
    const y = (v: number) => height - (v / max) * height;
    const pts = values.map((v, i) => `${x(i).toFixed(1)} ${y(v).toFixed(1)}`);
    const line = `M ${pts.join(" L ")}`;
    return { line, area: `${line} L ${width} ${height} L 0 ${height} Z` };
  });
}

const ELYSIUM_PATH =
  "M364 195.5c0 100.516-81.484 182-182 182S0 296.016 0 195.5s81.484-182 182-182 182 81.484 182 182M181.878 28.411 81.105 86.593l34.443 19.885 66.33-38.295 66.013 38.112 34.443-19.886zm-.158 56.544-51.506 29.737 11.992 6.924 39.513-22.814 39.795 22.976 11.992-6.924zm-19.18 48.399-7.652-4.417 26.832-15.491 27.112 15.653-8.015 4.617-19.472-11.225zM59.56 83.831l-5.94 3.43c-14.761 17.031-26.19 37.029-33.271 58.98l39.212-22.639 60.864 35.14 34.446-19.884zm0 56.546-44.277 25.564q-.3 1.542-.57 3.094l9.601 5.539 35.246-20.349 34.353 19.833 11.934-6.958zm0 38.433 13.057 7.538 8.606-4.973-21.662-12.507-22.565 13.028 8.608 4.972zm244.88-94.98 5.941 3.43c14.761 17.032 26.19 37.03 33.271 58.981l-39.212-22.639-60.864 35.14-34.446-19.884zm0 56.547 44.278 25.564q.299 1.542.57 3.094l-9.602 5.539-35.245-20.349-34.353 19.833-11.934-6.958zm0 38.433-13.056 7.538-8.606-4.973 21.662-12.507 22.565 13.028-8.608 4.972zm-123.074-46.385L76.899 192.739l34.443 19.886 70.024-40.428 70.587 40.754 34.502-19.852zm.016 56.544-55.506 32.046 11.992 6.924 43.513-25.122 44.032 25.421 12.008-6.915zm0 28.491-30.832 17.801 8.61 4.971 22.222-12.83 22.712 13.113 8.621-4.965zm170.426-17.911.014-2.194c0-6.848-.405-13.6-1.193-20.236l-27.052 15.619 27.864 16.084q.308-4.604.367-9.273m-339.616 0-.014-2.194c0-6.848.405-13.601 1.193-20.236l27.052 15.619-27.864 16.084a172 172 0 0 1-.367-9.273m9.11 53.94 37.356-21.567 64.595 37.294 34.438-19.889-99.033-57.177-45.327 26.17a169 169 0 0 0 7.972 35.169m37.373-4.795-32.008 18.479a169 169 0 0 0 5.26 10.812l26.747-15.443 38.062 21.975 11.993-6.924zm0 28.491L38.29 288.954a170 170 0 0 0 4.789 7.177l15.595-9.004 16.768 9.681 8.61-4.97zm284.023-23.696-37.356-21.567-64.594 37.294-34.438-19.889 99.032-57.177 45.328 26.17a169 169 0 0 1-7.972 35.169m-37.372-4.795 32.007 18.479a169 169 0 0 1-5.259 10.812l-26.747-15.443-38.062 21.975-11.994-6.924zm0 28.491 20.384 11.769a170 170 0 0 1-4.789 7.177l-15.595-9.004-16.768 9.681-8.611-4.97zm-123.96-32.663-121.92 70.391a170.7 170.7 0 0 0 28.063 23.569l93.857-54.188 94.537 54.581a170.7 170.7 0 0 0 28.198-23.491zm.016 56.544-79.645 45.983a169 169 0 0 0 13.057 6.31l66.587-38.445 67.117 38.749c4.476-1.907 8.854-4 13.123-6.271zm0 28.491-51.209 29.565a169 169 0 0 0 11.582 3.257l39.627-22.88 39.99 23.09a169 169 0 0 0 11.657-3.213z";

/** Head badge: the Elysium network mark with an explicit testnet label. */
export function ElysiumBadge() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: `1px solid ${C.borderSubtle}`,
        borderRadius: 8,
        padding: "4px 12px 4px 8px",
        background: C.surface2,
        marginLeft: 16,
      }}
    >
      <svg width={20} height={20} viewBox="0 13 364 365" style={{ display: "flex" }}>
        <path fillRule="evenodd" d={ELYSIUM_PATH} fill={C.textPrimary} />
      </svg>
      <div style={{ display: "flex", marginLeft: 8, fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 600, letterSpacing: 1, color: C.textSecondary }}>
        ELYSIUM
      </div>
      <div style={{ display: "flex", marginLeft: 8, fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 600, letterSpacing: 1, color: C.warn }}>
        TESTNET
      </div>
    </div>
  );
}

/** Row of small labelled figures under the hero. */
export function StatRow({ cells, marginTop = 30 }: { cells: { label: string; value: string; color?: string }[]; marginTop?: number }) {
  return (
    <div style={{ display: "flex", width: "100%", marginTop }}>
      {cells.map((c) => (
        <div key={c.label} style={{ display: "flex", flexDirection: "column", flexGrow: 1, flexBasis: 0, marginRight: 24 }}>
          <div style={{ display: "flex", fontSize: 16, color: C.textSecondary }}>{c.label}</div>
          <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 28, fontWeight: 600, marginTop: 8, color: c.color ?? C.textPrimary }}>
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Trend area chart with first/last day labels, for daily Elysium series. */
export function DailyChart({
  series,
  days,
  height = 130,
}: {
  series: { values: number[]; color: string; fill: string; label?: string }[];
  days: string[];
  height?: number;
}) {
  const paths = sharedSeriesPaths(series.map((s) => s.values));
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", marginTop: 22 }}>
      <svg width="100%" height={height} viewBox="0 0 1000 150" preserveAspectRatio="none" style={{ display: "flex" }}>
        {paths.map((p, i) => (
          <path key={`a${i}`} d={p.area} fill={series[i].fill} />
        ))}
        {paths.map((p, i) => (
          <path key={`l${i}`} d={p.line} fill="none" stroke={series[i].color} strokeWidth="3" strokeLinejoin="round" />
        ))}
      </svg>
      <div style={{ display: "flex", width: "100%", marginTop: 8, fontSize: 13, color: C.textTertiary, fontFamily: "JetBrains Mono" }}>
        <div style={{ display: "flex" }}>{days.length ? fmtDay(days[0]) : ""}</div>
        <div style={{ display: "flex", marginLeft: "auto", alignItems: "center" }}>
          {series.filter((s) => s.label).map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", marginRight: 18 }}>
              <div style={{ display: "flex", width: 10, height: 10, borderRadius: 5, background: s.color, marginRight: 6 }} />
              {s.label}
            </div>
          ))}
          <div style={{ display: "flex" }}>{days.length ? fmtDay(days[days.length - 1]) : ""}</div>
        </div>
      </div>
    </div>
  );
}

/** Wraps a tile element in the standard 1200x630 PNG response. */
export async function elysiumTileResponse(node: React.ReactElement, maxAge: number): Promise<Response> {
  const fonts = await loadTileFonts();
  return new ImageResponse(node, {
    width: 1200,
    height: 630,
    fonts: fonts.length > 0 ? fonts : undefined,
    headers: { "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge * 3}, stale-while-revalidate=3600` },
  });
}

// ── List and bar layouts for leaderboard and cohort tiles ────────────────────

/** 0x1234…abcd, for addresses that have no label. */
export function shortAddr(a: string | null | undefined): string {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "-";
}

/** Percent with fixed decimals; "-" when missing. */
export function pctText(v: number | null | undefined, digits = 0): string {
  return v == null || !Number.isFinite(v) ? "-" : `${(v * 100).toFixed(digits)}%`;
}

/**
 * Text a third party controls (token symbols, revert reasons, returned
 * strings): printable characters only, and anything that reads as a link or
 * a domain is replaced, so a branded tile cannot carry "claim at scam.xyz".
 */
export function untrusted(s: string | null | undefined, max = 60): string {
  if (!s) return "";
  const clean = s
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/(https?:\/\/|www\.)\S*/gi, "[link]")
    .replace(/\b[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}\b/gi, "[link]")
    .replace(/\s+/g, " ")
    .trim();
  return clip(clean, max);
}

/** Truncates long symbols and names so a row never overflows its column. */
export function clip(s: string | null | undefined, max: number): string {
  if (!s) return "";
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

export interface RankColumn {
  label: string;
  /** Flex weight of the column. */
  width: number;
  align?: "left" | "right";
  mono?: boolean;
}
export interface RankRow {
  key: string;
  cells: { text: string; color?: string; sub?: string }[];
}

/**
 * Ranked table: numbered rows under a muted header. Every cell is one line
 * (callers clip text first), so the tile height is fixed by `rows.length`.
 */
export function RankList({ columns, rows, marginTop = 12 }: { columns: RankColumn[]; rows: RankRow[]; marginTop?: number }) {
  const cell = (col: RankColumn, i: number): React.CSSProperties => ({
    display: "flex",
    flexGrow: col.width,
    flexBasis: 0,
    justifyContent: col.align === "right" ? "flex-end" : "flex-start",
    marginLeft: i === 0 ? 0 : 16,
    overflow: "hidden",
    whiteSpace: "nowrap",
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", marginTop }}>
      <div style={{ display: "flex", width: "100%", fontSize: 12, letterSpacing: 1, color: C.textTertiary, paddingBottom: 6, borderBottom: `1px solid ${C.borderSubtle}` }}>
        <div style={{ display: "flex", width: 34 }}>#</div>
        {columns.map((c, i) => (
          <div key={c.label} style={cell(c, i)}>
            {c.label.toUpperCase()}
          </div>
        ))}
      </div>
      {rows.map((r, ri) => (
        <div key={r.key} style={{ display: "flex", width: "100%", alignItems: "center", height: 33, borderBottom: ri === rows.length - 1 ? "none" : `1px solid ${C.borderSubtle}` }}>
          <div style={{ display: "flex", width: 34, fontFamily: "JetBrains Mono", fontSize: 15, color: C.textTertiary }}>{ri + 1}</div>
          {columns.map((c, i) => {
            const v = r.cells[i];
            return (
              <div key={c.label} style={{ ...cell(c, i), alignItems: "baseline" }}>
                <div style={{ display: "flex", fontFamily: c.mono ? "JetBrains Mono" : "Inter", fontSize: 17, fontWeight: c.mono ? 600 : 500, color: v?.color ?? C.textPrimary }}>
                  {v?.text ?? "-"}
                </div>
                {v?.sub ? (
                  <div style={{ display: "flex", marginLeft: 10, fontSize: 14, color: C.textTertiary, fontFamily: "JetBrains Mono" }}>{v.sub}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Vertical bars with a label under each, one scale for all bars. */
export function BarChart({
  bars,
  height = 150,
  marginTop = 22,
}: {
  bars: { label: string; value: number; color: string; valueText?: string }[];
  height?: number;
  marginTop?: number;
}) {
  const max = Math.max(1e-9, ...bars.map((b) => b.value));
  return (
    <div style={{ display: "flex", width: "100%", alignItems: "flex-end", marginTop }}>
      {bars.map((b) => (
        <div key={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1, flexBasis: 0, marginRight: 10 }}>
          <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 14, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>
            {b.valueText ?? ""}
          </div>
          <div style={{ display: "flex", width: "70%", height: Math.max(2, Math.round((b.value / max) * height)), background: b.color, borderRadius: 4 }} />
          <div style={{ display: "flex", marginTop: 8, fontSize: 13, color: C.textTertiary, fontFamily: "JetBrains Mono" }}>{b.label}</div>
        </div>
      ))}
    </div>
  );
}

/** "3h ago" from an ISO time, at render time (UTC, no zone suffix assumed UTC). */
export function agoText(iso: string | null | undefined): string {
  if (!iso) return "-";
  const t = Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
  if (!Number.isFinite(t)) return "-";
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400 * 2) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}
