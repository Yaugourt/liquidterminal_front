import { ImageResponse } from "next/og";
import { env } from "@/lib/env";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { tileColors } from "@/lib/og/tileTheme";
import { TileFrame } from "@/lib/og/TileFrame";
import { loadTileFonts } from "@/lib/og/fonts";

/**
 * Stablecoin supply on Hyperliquid as a standalone image: the total parked in
 * stables on spot, the per-stable split, and USDC dominance.
 *
 * `GET /api/tile/stablecoins` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

const C = tileColors;

interface Stables {
  totalSpotUSDC: number;
  totalSpotUSDT0: number;
  totalSpotUSDE: number;
  totalSpotUSDH: number;
  totalStablecoins: number;
  USDC_holdersCount: number;
  totalStablecoins_changePct24h?: number;
}

async function load(): Promise<Stables | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API}/market/stablecoins`, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as Stables;
  } catch {
    return null;
  }
}

export async function GET() {
  const s = await load();
  if (!s || s.totalStablecoins <= 0) {
    return new Response("stablecoins unavailable", { status: 503 });
  }

  const usdcShare = (s.totalSpotUSDC / s.totalStablecoins) * 100;
  const changePct = s.totalStablecoins_changePct24h ?? 0;

  const cells = [
    { label: "USDC", value: compactUsd(s.totalSpotUSDC) },
    { label: "USDT0", value: compactUsd(s.totalSpotUSDT0) },
    { label: "USDe", value: compactUsd(s.totalSpotUSDE) },
    { label: "USDH", value: compactUsd(s.totalSpotUSDH) },
  ];

  const fonts = await loadTileFonts();

  return new ImageResponse(
    (
      <TileFrame
        title="Stablecoins on Hyperliquid"
        pill="spot"
        eyebrow="Stablecoin supply"
        hero={compactUsd(s.totalStablecoins)}
        heroSub={`${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}% · 24h · USDC ${usdcShare.toFixed(
          1
        )}% (${compactCount(s.USDC_holdersCount)} holders)`}
        footLeft="Circulating stablecoins held on Hyperliquid spot"
        footNote="Source: Hypurrscan · Hyperliquid"
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
                  fontSize: 28,
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
        "Cache-Control": "public, max-age=600, s-maxage=1800, stale-while-revalidate=3600",
      },
    }
  );
}
