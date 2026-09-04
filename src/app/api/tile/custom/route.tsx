import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { tileColors } from "@/lib/og/tileTheme";
import { TileFrame } from "@/lib/og/TileFrame";
import { loadTileFonts } from "@/lib/og/fonts";
import { loadHypurr } from "@/lib/og/hypurr";
import { seriesPaths } from "@/lib/og/chart";
import { CUSTOM_METRIC_KEYS, CUSTOM_MAX, SERIES_KEYS, CHART_STATS_MAX } from "@/lib/og/customCatalog";

/**
 * A visitor-composed share-tile. The share studio lets a visitor choose a
 * layout (a stat grid or a chart), which data goes where, and a title; this
 * renders it as one branded card. Every metric key is an allowlist, so the
 * query can only request known values from known endpoints.
 *
 * Grid:  `?layout=grid&title=&metrics=volume_24h,open_interest,...`
 * Chart: `?layout=chart&title=&chart=total_oi&metrics=<supporting stats>`
 */
export const runtime = "nodejs";
export const revalidate = 120;

const C = tileColors;

interface Sources {
  fills24: { total_fills: number; total_volume: number; total_fees: number; unique_users: number; unique_coins: number } | null;
  perp: { totalOpenInterest: number; hlpTvl: number } | null;
  hype: { price: number; marketCap: number } | null;
  stables: { totalStablecoins: number } | null;
  liq: { totalVolume_USD: number } | null;
  hip3: { total_volume_24h: number; total_open_interest: number } | null;
  global: { numberOfUsers: number; bridgedUsdc: number; totalHypeStake: number; vaultsTvl: number } | null;
  builders: { totalBuilderFees: number; uniqueBuilders: number } | null;
  /** Summed HIP-4 volume over the last 24 hourly buckets. */
  hip4Vol: number | null;
}

async function wrapped<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T };
    return json.data ?? null;
  } catch {
    return null;
  }
}
async function raw<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function loadSources(): Promise<Sources> {
  const [fills24, perp, spot, stables, liqWrap, hip3, global, buildersWrap, hip4Rows] = await Promise.all([
    wrapped<Sources["fills24"]>("/indexer/analytics/fills/stats?hours=24"),
    raw<Sources["perp"]>("/market/perp/globalstats"),
    wrapped<{ name: string; price: number; marketCap: number }[]>("/market/spot"),
    raw<Sources["stables"]>("/market/stablecoins"),
    raw<{ stats?: Sources["liq"] }>("/liquidations/historical/stats"),
    wrapped<Sources["hip3"]>("/indexer/hip3/overview"),
    raw<Sources["global"]>("/home/globalstats"),
    wrapped<{ current: Sources["builders"] }>("/indexer/builders/stats"),
    wrapped<{ volume: number }[]>("/indexer/hip4/analytics"),
  ]);
  const hype = (spot ?? []).find((t) => t.name?.toUpperCase() === "HYPE") ?? null;
  const hip4Vol = hip4Rows
    ? hip4Rows.slice(0, 24).reduce((a, r) => a + (Number(r.volume) || 0), 0)
    : null;
  return { fills24, perp, hype, stables, liq: liqWrap?.stats ?? null, hip3, global, builders: buildersWrap?.current ?? null, hip4Vol };
}

type Fmt = "usd" | "count" | "price";
interface Resolver {
  label: string;
  fmt: Fmt;
  get: (s: Sources) => number | null;
}

const RESOLVERS: Record<string, Resolver> = {
  volume_24h: { label: "24h volume", fmt: "usd", get: (s) => s.fills24?.total_volume ?? null },
  trades_24h: { label: "Trades (24h)", fmt: "count", get: (s) => s.fills24?.total_fills ?? null },
  active_users: { label: "Active traders (24h)", fmt: "count", get: (s) => s.fills24?.unique_users ?? null },
  markets_24h: { label: "Markets traded (24h)", fmt: "count", get: (s) => s.fills24?.unique_coins ?? null },
  open_interest: { label: "Open interest", fmt: "usd", get: (s) => s.perp?.totalOpenInterest ?? null },
  fees_24h: { label: "Fees (24h)", fmt: "usd", get: (s) => s.fills24?.total_fees ?? null },
  liquidations_24h: { label: "Liquidations (24h)", fmt: "usd", get: (s) => s.liq?.totalVolume_USD ?? null },
  hip3_volume: { label: "HIP-3 24h volume", fmt: "usd", get: (s) => s.hip3?.total_volume_24h ?? null },
  hip3_oi: { label: "HIP-3 open interest", fmt: "usd", get: (s) => s.hip3?.total_open_interest ?? null },
  hype_price: { label: "HYPE price", fmt: "price", get: (s) => s.hype?.price ?? null },
  hype_mcap: { label: "HYPE market cap", fmt: "usd", get: (s) => s.hype?.marketCap ?? null },
  hlp_tvl: { label: "HLP TVL", fmt: "usd", get: (s) => s.perp?.hlpTvl ?? null },
  stablecoins: { label: "Stablecoin supply", fmt: "usd", get: (s) => s.stables?.totalStablecoins ?? null },
  total_users: { label: "Total users", fmt: "count", get: (s) => s.global?.numberOfUsers ?? null },
  bridged_usdc: { label: "Bridged USDC", fmt: "usd", get: (s) => s.global?.bridgedUsdc ?? null },
  total_staked: { label: "HYPE staked", fmt: "count", get: (s) => s.global?.totalHypeStake ?? null },
  vaults_tvl: { label: "Vaults TVL", fmt: "usd", get: (s) => s.global?.vaultsTvl ?? null },
  builder_fees: { label: "Builder fees (24h)", fmt: "usd", get: (s) => s.builders?.totalBuilderFees ?? null },
  active_builders: { label: "Active builders", fmt: "count", get: (s) => s.builders?.uniqueBuilders ?? null },
  hip4_volume: { label: "HIP-4 24h volume", fmt: "usd", get: (s) => s.hip4Vol },
};

/** Charteable series: label, value formatter, and how to fetch its points. */
const SERIES_CONF: Record<string, { label: string; fmt: Fmt; load: () => Promise<number[]> }> = {
  total_oi: { label: "Open interest", fmt: "usd", load: () => loadMetricSeries("total_oi") },
  active_users_24h: { label: "Active users", fmt: "count", load: () => loadMetricSeries("active_users_24h") },
  total_fees_24h: { label: "Protocol fees", fmt: "usd", load: () => loadMetricSeries("total_fees_24h") },
  volume: { label: "Daily volume", fmt: "usd", load: loadVolumeSeries },
  revenue: { label: "Daily revenue", fmt: "usd", load: loadRevenueSeries },
};

async function loadMetricSeries(metric: string): Promise<number[]> {
  const rows = await wrapped<{ value: number }[]>(`/market/metrics/history?metric=${metric}&hours=168`);
  return (rows ?? []).map((r) => r.value).filter((v) => Number.isFinite(v));
}
async function loadVolumeSeries(): Promise<number[]> {
  const rows = await wrapped<{ date: string; volume: number }[]>("/indexer/overview/daily-volume-10d");
  const today = new Date().toISOString().slice(0, 10);
  return (rows ?? []).filter((d) => d.date !== today && Number.isFinite(d.volume)).map((d) => d.volume);
}
async function loadRevenueSeries(): Promise<number[]> {
  const data = await wrapped<{ days: { total: number }[] }>("/market/revenue/history?window=30d");
  return (data?.days ?? []).map((d) => Number(d.total)).filter((v) => Number.isFinite(v));
}

function format(v: number | null, fmt: Fmt): string {
  if (v == null || !Number.isFinite(v)) return "-";
  if (fmt === "count") return compactCount(v);
  if (fmt === "price") return `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return compactUsd(v);
}

function parseStats(raw: string | null, max: number, fallback: string[]): string[] {
  const keys = (raw ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => CUSTOM_METRIC_KEYS.includes(k));
  const deduped = [...new Set(keys)].slice(0, max);
  return deduped.length > 0 ? deduped : fallback;
}

function cleanTitle(raw: string | null): string {
  const t = (raw ?? "").replace(/[^\w\s.,%&/+-]/g, "").trim().slice(0, 48);
  return t || "Hyperliquid snapshot";
}

/** A supporting stat cell. */
function StatCell({ label, value, width }: { label: string; value: string; width: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width, marginBottom: 26 }}>
      <div style={{ display: "flex", fontSize: 16, color: C.textSecondary }}>{label}</div>
      <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 30, fontWeight: 600, marginTop: 8 }}>
        {value}
      </div>
    </div>
  );
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const layout = sp.get("layout") === "chart" ? "chart" : "grid";
  const title = cleanTitle(sp.get("title"));
  const [fonts, mascot] = await Promise.all([loadTileFonts(), loadHypurr("gm")]);
  const imageOpts = {
    width: 1200,
    height: 630,
    fonts: fonts.length > 0 ? fonts : undefined,
    headers: { "Cache-Control": "public, max-age=120, s-maxage=600, stale-while-revalidate=3600" },
  } as const;
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const footNote = `Source: Hyperliquid · on-chain indexing — ${stamp} UTC`;

  if (layout === "chart") {
    const chartKey = SERIES_KEYS.includes(sp.get("chart") ?? "") ? (sp.get("chart") as string) : "total_oi";
    const conf = SERIES_CONF[chartKey];
    const values = await conf.load();
    if (values.length < 2) {
      return new Response("not enough history for this series", { status: 503 });
    }
    const first = values[0];
    const latest = values[values.length - 1];
    const changePct = first > 0 ? ((latest - first) / first) * 100 : 0;
    const { line, area } = seriesPaths(values);

    // Optional supporting stats under the chart (kept short so nothing overflows).
    const statKeys = parseStats(sp.get("metrics"), CHART_STATS_MAX, []);
    const sources = statKeys.length > 0 ? await loadSources() : null;
    const stats = sources
      ? statKeys.map((k) => ({ label: RESOLVERS[k].label, value: format(RESOLVERS[k].get(sources), RESOLVERS[k].fmt) }))
      : [];

    return new ImageResponse(
      (
        <TileFrame
          title={title}
          pill="custom"
          eyebrow={conf.label}
          hero={format(latest, conf.fmt)}
          heroSub={`${changePct >= 0 ? "+" : ""}${changePct.toFixed(1)}% over the window`}
          footLeft="Composed on liquidterminal.xyz/share"
          footNote={footNote}
          mascot={mascot}
        >
          <div style={{ display: "flex", width: "100%", height: stats.length > 0 ? 140 : 180, marginTop: 22 }}>
            <svg width="100%" height={stats.length > 0 ? "120" : "160"} viewBox="0 0 1000 150" preserveAspectRatio="none" style={{ display: "flex" }}>
              <path d={area} fill="rgba(131, 233, 255, 0.12)" />
              <path d={line} fill="none" stroke={C.brand} strokeWidth="3" strokeLinejoin="round" />
            </svg>
          </div>
          {stats.length > 0 ? (
            <div style={{ display: "flex", width: "100%", marginTop: 6 }}>
              {stats.map((s) => (
                <StatCell key={s.label} label={s.label} value={s.value} width="33%" />
              ))}
            </div>
          ) : null}
        </TileFrame>
      ),
      imageOpts
    );
  }

  // Grid layout: a hero stat plus up to five supporting stats.
  const metrics = parseStats(sp.get("metrics"), CUSTOM_MAX, ["volume_24h", "open_interest", "active_users", "fees_24h"]);
  const sources = await loadSources();
  const resolved = metrics.map((k) => ({ label: RESOLVERS[k].label, value: format(RESOLVERS[k].get(sources), RESOLVERS[k].fmt) }));
  const [hero, ...rest] = resolved;

  return new ImageResponse(
    (
      <TileFrame
        title={title}
        pill="custom"
        eyebrow={hero.label}
        hero={hero.value}
        footLeft="Composed on liquidterminal.xyz/share"
        footNote={footNote}
        mascot={mascot}
      >
        {rest.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", width: "100%", marginTop: 30 }}>
            {rest.map((c) => (
              <StatCell key={c.label} label={c.label} value={c.value} width="33%" />
            ))}
          </div>
        ) : null}
      </TileFrame>
    ),
    imageOpts
  );
}
