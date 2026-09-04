import { ImageResponse } from "next/og";
import { env } from "@/lib/env";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { tileColors } from "@/lib/og/tileTheme";
import { TileFrame } from "@/lib/og/TileFrame";
import { loadTileFonts } from "@/lib/og/fonts";

/**
 * Hyperliquid market pulse (last 24h) as a standalone image: the routine daily
 * recap of volume, traders, trades, fees and open interest in one branded card.
 *
 * `GET /api/tile/market-pulse` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 300;

const C = tileColors;

interface FillsStats {
  total_fills: number;
  total_volume: number;
  total_fees: number;
  unique_users: number;
  unique_coins: number;
}
interface PerpStats {
  totalOpenInterest: number;
}

/** `/indexer/*` responses wrap the payload in `{ data }`. */
async function loadWrapped<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T };
    return json.data ?? null;
  } catch {
    return null;
  }
}

/** `/market/perp/globalstats` returns the stats object directly (no envelope). */
async function loadRaw<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function GET() {
  const [stats, perp] = await Promise.all([
    loadWrapped<FillsStats>("/indexer/analytics/fills/stats?hours=24"),
    loadRaw<PerpStats>("/market/perp/globalstats"),
  ]);
  if (!stats) {
    return new Response("market pulse unavailable", { status: 503 });
  }

  const cells = [
    { label: "Active traders", value: compactCount(stats.unique_users) },
    { label: "Trades", value: compactCount(stats.total_fills) },
    { label: "Fees", value: compactUsd(stats.total_fees) },
    { label: "Open interest", value: perp ? compactUsd(perp.totalOpenInterest) : "-" },
  ];

  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const fonts = await loadTileFonts();

  return new ImageResponse(
    (
      <TileFrame
        title="Market pulse"
        pill="24h"
        eyebrow="Hyperliquid · last 24h"
        hero={compactUsd(stats.total_volume)}
        heroSub={`24h traded volume · ${compactCount(stats.unique_coins)} markets`}
        footLeft="Perp + spot activity across all markets"
        footNote={`Source: Hyperliquid · on-chain indexing — ${stamp} UTC`}
      >
        <div style={{ display: "flex", width: "100%", marginTop: 34 }}>
          {cells.map((c) => (
            <div
              key={c.label}
              style={{ display: "flex", flexDirection: "column", flexGrow: 1, marginRight: 28 }}
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
      </TileFrame>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length > 0 ? fonts : undefined,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=3600",
      },
    }
  );
}
