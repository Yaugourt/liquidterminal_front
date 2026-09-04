import { ImageResponse } from "next/og";
import { env } from "@/lib/env";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { tileColors } from "@/lib/og/tileTheme";
import { TileFrame } from "@/lib/og/TileFrame";
import { loadTileFonts } from "@/lib/og/fonts";

/**
 * HYPE spot price + fundamentals as a standalone image. One branded card for
 * the routine "HYPE at $X, up Y%" post.
 *
 * `GET /api/tile/hype` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 120;

const C = tileColors;

interface SpotToken {
  name: string;
  price: number;
  marketCap: number;
  volume: number;
  change24h: number;
  supply: number;
}

async function loadHype(): Promise<SpotToken | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API}/market/spot`, { next: { revalidate } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: SpotToken[] };
    return (json.data ?? []).find((t) => t.name?.toUpperCase() === "HYPE") ?? null;
  } catch {
    return null;
  }
}

const price2 = (v: number) =>
  `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export async function GET() {
  const h = await loadHype();
  if (!h) {
    return new Response("HYPE unavailable", { status: 503 });
  }

  const up = h.change24h >= 0;
  const cells = [
    { label: "Market cap", value: compactUsd(h.marketCap) },
    { label: "24h volume", value: compactUsd(h.volume) },
    { label: "Circulating supply", value: `${compactCount(h.supply)} HYPE` },
  ];

  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const fonts = await loadTileFonts();

  return new ImageResponse(
    (
      <TileFrame
        title="HYPE"
        pill="spot"
        eyebrow="HYPE · spot price"
        hero={price2(h.price)}
        heroColor={up ? C.success : C.danger}
        heroSub={`${up ? "+" : ""}${h.change24h.toFixed(2)}% · 24h`}
        footLeft="Hyperliquid spot, HYPE/USDC"
        footNote={`Source: Hyperliquid — ${stamp} UTC`}
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
        "Cache-Control": "public, max-age=120, s-maxage=600, stale-while-revalidate=3600",
      },
    }
  );
}
