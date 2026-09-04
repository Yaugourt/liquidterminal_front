import { ImageResponse } from "next/og";
import { env } from "@/lib/env";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { tileColors } from "@/lib/og/tileTheme";
import { TileFrame } from "@/lib/og/TileFrame";
import { loadTileFonts } from "@/lib/og/fonts";

/**
 * Liquidations over the last 24h as a standalone image: the flush total, the
 * long-vs-short split by liquidated notional, and the biggest single liq. A
 * high-engagement "money shot" for a volatile day.
 *
 * `GET /api/tile/liquidations` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 120;

const C = tileColors;

interface LiqStats {
  totalVolume_USD: number;
  liquidationsCount: number;
  longVolume_USD: number;
  shortVolume_USD: number;
  topCoin: string;
  topCoinVolume_USD: number;
  maxLiq_USD: number;
}

async function load(): Promise<LiqStats | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API}/liquidations/historical/stats`, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { stats?: LiqStats } };
    return json.data?.stats ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const s = await load();
  if (!s || s.totalVolume_USD <= 0) {
    return new Response("liquidations unavailable", { status: 503 });
  }

  const gross = s.longVolume_USD + s.shortVolume_USD;
  const longPct = gross > 0 ? (s.longVolume_USD / gross) * 100 : 0;
  const shortPct = 100 - longPct;

  const cells = [
    { label: "Longs liquidated", value: compactUsd(s.longVolume_USD), color: C.success },
    { label: "Shorts liquidated", value: compactUsd(s.shortVolume_USD), color: C.danger },
    { label: `Top market · ${s.topCoin}`, value: compactUsd(s.topCoinVolume_USD), color: C.textPrimary },
    { label: "Biggest single liq", value: compactUsd(s.maxLiq_USD), color: C.textPrimary },
  ];

  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const fonts = await loadTileFonts();

  return new ImageResponse(
    (
      <TileFrame
        title="Liquidations"
        pill="24h"
        eyebrow="Liquidated notional · last 24h"
        hero={compactUsd(s.totalVolume_USD)}
        heroSub={`${compactCount(s.liquidationsCount)} liquidations · ${longPct.toFixed(
          0
        )}% longs / ${shortPct.toFixed(0)}% shorts`}
        footLeft="Forced-close notional across all perp markets"
        footNote={`Source: Hyperliquid · on-chain indexing — ${stamp} UTC`}
      >
        {/* long / short flush split by notional */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 26,
            marginTop: 30,
            borderRadius: 8,
            overflow: "hidden",
            background: C.surface2,
          }}
        >
          <div style={{ display: "flex", width: `${Math.max(longPct, 0.6)}%`, background: C.success }} />
          <div style={{ display: "flex", width: `${Math.max(shortPct, 0.6)}%`, background: C.danger }} />
        </div>

        <div style={{ display: "flex", width: "100%", marginTop: 22 }}>
          {cells.map((c) => (
            <div
              key={c.label}
              style={{ display: "flex", flexDirection: "column", flexGrow: 1, marginRight: 24 }}
            >
              <div style={{ display: "flex", fontSize: 15, color: C.textSecondary }}>{c.label}</div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "JetBrains Mono",
                  fontSize: 25,
                  fontWeight: 600,
                  marginTop: 6,
                  color: c.color,
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
        "Cache-Control": "public, max-age=120, s-maxage=600, stale-while-revalidate=3600",
      },
    }
  );
}
