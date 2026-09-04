import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { tileColors } from "@/lib/og/tileTheme";
import { TileFrame } from "@/lib/og/TileFrame";
import { loadTileFonts } from "@/lib/og/fonts";
import { CUSTOM_METRIC_KEYS, CUSTOM_MAX } from "@/lib/og/customCatalog";

/**
 * A visitor-composed share-tile: pick a title and up to six metrics on the
 * share studio, and this renders them as one branded card. The metric keys are
 * an allowlist (CUSTOM_METRIC_KEYS), so the query can only ever request known
 * values from known endpoints.
 *
 * `GET /api/tile/custom?title=...&metrics=volume_24h,open_interest,...`
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
  const [fills24, perp, spot, stables, liqWrap, hip3] = await Promise.all([
    wrapped<Sources["fills24"]>("/indexer/analytics/fills/stats?hours=24"),
    raw<Sources["perp"]>("/market/perp/globalstats"),
    wrapped<{ name: string; price: number; marketCap: number }[]>("/market/spot"),
    raw<Sources["stables"]>("/market/stablecoins"),
    raw<{ stats?: Sources["liq"] }>("/liquidations/historical/stats"),
    wrapped<Sources["hip3"]>("/indexer/hip3/overview"),
  ]);
  const hype = (spot ?? []).find((t) => t.name?.toUpperCase() === "HYPE") ?? null;
  return { fills24, perp, hype, stables, liq: liqWrap?.stats ?? null, hip3 };
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
};

function format(v: number | null, fmt: Fmt): string {
  if (v == null || !Number.isFinite(v)) return "-";
  if (fmt === "count") return compactCount(v);
  if (fmt === "price") return `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return compactUsd(v);
}

function parseMetrics(raw: string | null): string[] {
  const keys = (raw ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => CUSTOM_METRIC_KEYS.includes(k));
  const deduped = [...new Set(keys)].slice(0, CUSTOM_MAX);
  return deduped.length > 0 ? deduped : ["volume_24h", "open_interest", "active_users", "fees_24h"];
}

function cleanTitle(raw: string | null): string {
  const t = (raw ?? "").replace(/[^\w\s.,%&/+-]/g, "").trim().slice(0, 48);
  return t || "Hyperliquid snapshot";
}

export async function GET(request: NextRequest) {
  const metrics = parseMetrics(request.nextUrl.searchParams.get("metrics"));
  const title = cleanTitle(request.nextUrl.searchParams.get("title"));
  const sources = await loadSources();

  const resolved = metrics.map((k) => {
    const r = RESOLVERS[k];
    return { label: r.label, value: format(r.get(sources), r.fmt) };
  });
  const [hero, ...rest] = resolved;

  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const fonts = await loadTileFonts();

  return new ImageResponse(
    (
      <TileFrame
        title={title}
        pill="custom"
        eyebrow={hero.label}
        hero={hero.value}
        footLeft="Composed on liquidterminal.xyz/share"
        footNote={`Source: Hyperliquid · on-chain indexing — ${stamp} UTC`}
      >
        {rest.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", width: "100%", marginTop: 30 }}>
            {rest.map((c) => (
              <div
                key={c.label}
                style={{ display: "flex", flexDirection: "column", width: "33%", marginBottom: 26 }}
              >
                <div style={{ display: "flex", fontSize: 16, color: C.textSecondary }}>{c.label}</div>
                <div
                  style={{
                    display: "flex",
                    fontFamily: "JetBrains Mono",
                    fontSize: 30,
                    fontWeight: 600,
                    marginTop: 8,
                  }}
                >
                  {c.value}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </TileFrame>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length > 0 ? fonts : undefined,
      headers: {
        "Cache-Control": "public, max-age=120, s-maxage=600, stale-while-revalidate=3600",
      },
    }
  );
}
