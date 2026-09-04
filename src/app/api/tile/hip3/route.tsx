import { ImageResponse } from "next/og";
import { env } from "@/lib/env";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { tileColors } from "@/lib/og/tileTheme";
import { TileFrame } from "@/lib/og/TileFrame";
import { loadTileFonts } from "@/lib/og/fonts";

/**
 * HIP-3 ecosystem snapshot as a standalone image: how big the builder-deployed
 * perp DEX layer is (DEXs, markets, volume, OI) plus the top markets by open
 * interest. One branded card for the "HIP-3 is now $Xb" story.
 *
 * `GET /api/tile/hip3` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 300;

const C = tileColors;

interface Overview {
  total_dexs: number;
  total_assets: number;
  total_volume_24h: number;
  total_open_interest: number;
  total_fees_24h: number;
}
interface Snapshot {
  coin: string;
  current_mark_price: number;
  open_interest: number;
  volume_24h: number;
  is_halted: boolean;
}

async function loadJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T };
    return json.data ?? null;
  } catch {
    return null;
  }
}

/** Strip the DEX prefix from a HIP-3 coin id, e.g. "xyz:CL" -> "CL". */
const ticker = (coin: string) => coin.split(":").pop() ?? coin;

export async function GET() {
  const [overview, snapshots] = await Promise.all([
    loadJson<Overview>("/indexer/hip3/overview"),
    loadJson<Snapshot[]>("/indexer/hip3/snapshots?limit=500"),
  ]);

  if (!overview) {
    return new Response("hip3 overview unavailable", { status: 503 });
  }

  // OI in the snapshots is in base units; USD notional is size x mark price.
  const top = (snapshots ?? [])
    .filter((s) => !s.is_halted && s.current_mark_price > 0)
    .map((s) => ({
      coin: ticker(s.coin),
      oiUsd: s.open_interest * s.current_mark_price,
      vol: s.volume_24h,
    }))
    .sort((a, b) => b.oiUsd - a.oiUsd)
    .slice(0, 4);

  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const fonts = await loadTileFonts();

  return new ImageResponse(
    (
      <TileFrame
        title="HIP-3 ecosystem"
        pill="24h"
        eyebrow="Builder-deployed perp DEXs"
        hero={compactUsd(overview.total_volume_24h)}
        heroSub={`24h volume · ${overview.total_dexs} DEXs · ${overview.total_assets} markets · ${compactUsd(
          overview.total_open_interest
        )} OI`}
        footLeft="Permissionless perp markets deployed on Hyperliquid"
        footNote={`Source: Hyperliquid · on-chain indexing — ${stamp} UTC`}
      >
        {/* top markets by open interest */}
        <div style={{ display: "flex", width: "100%", marginTop: 30 }}>
          {top.map((m) => (
            <div
              key={m.coin}
              style={{ display: "flex", flexDirection: "column", flexGrow: 1, marginRight: 24 }}
            >
              <div style={{ display: "flex", fontSize: 17, color: C.textSecondary }}>{m.coin}</div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "JetBrains Mono",
                  fontSize: 25,
                  fontWeight: 600,
                  marginTop: 6,
                }}
              >
                {compactUsd(m.oiUsd)}
              </div>
              <div style={{ display: "flex", fontSize: 15, color: C.textTertiary, marginTop: 2 }}>
                {`${compactUsd(m.vol)} 24h vol`}
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
