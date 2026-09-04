import { ImageResponse } from "next/og";
import { env } from "@/lib/env";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { tileColors } from "@/lib/og/tileTheme";
import { TileFrame } from "@/lib/og/TileFrame";
import { loadTileFonts } from "@/lib/og/fonts";

/**
 * Smart-money positioning as a standalone, citable image.
 *
 * The collective open positioning of the top-trader cohort (net long vs short)
 * has no upstream history and lives inside `/market/tracker`; this renders the
 * same server-computed snapshot into one branded card so the "top traders are
 * X% short" story can be posted on its own.
 *
 * `GET /api/tile/positioning` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 120;

const C = tileColors;

interface CoinPositioning {
  coin: string;
  longNotional: number;
  shortNotional: number;
  netNotional: number;
}
interface Positioning {
  coins: CoinPositioning[];
  totals: { longNotional: number; shortNotional: number; netNotional: number; longShare: number };
  tradersScanned: number;
  updatedAt: string;
}

async function load(): Promise<Positioning | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API}/top-traders/positioning`, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Positioning };
    return json.data ?? null;
  } catch {
    return null;
  }
}

/** Signed compact USD, e.g. `+$1.2M` / `-$1.2M`. */
const signed = (v: number) => `${v >= 0 ? "+" : "-"}$${compactUsd(Math.abs(v)).replace(/^\$/, "")}`;

export async function GET() {
  const p = await load();
  if (!p || p.coins.length === 0) {
    return new Response("positioning unavailable", { status: 503 });
  }

  const { netNotional, longShare } = p.totals;
  const longPct = Math.round(longShare * 100);
  const shortPct = 100 - longPct;
  const netLong = netNotional >= 0;

  // Top markets by gross exposure (backend already sorts, but be defensive).
  const coins = [...p.coins]
    .sort((a, b) => b.longNotional + b.shortNotional - (a.longNotional + a.shortNotional))
    .slice(0, 4);

  const stamp = new Date(p.updatedAt ?? Date.now()).toISOString().slice(0, 16).replace("T", " ");
  const fonts = await loadTileFonts();

  return new ImageResponse(
    (
      <TileFrame
        title="Smart money positioning"
        pill={`top ${p.tradersScanned} traders`}
        eyebrow="Cohort net bias · 24h"
        hero={netLong ? "Net long" : "Net short"}
        heroSub={`${signed(netNotional)} · ${longPct}% long / ${shortPct}% short`}
        footLeft="Open positions of the top traders by volume and PnL"
        footNote={`Source: Hyperliquid clearinghouse — ${stamp} UTC`}
      >
        {/* long / short split bar */}
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
          <div style={{ display: "flex", width: `${longPct}%`, background: C.success }} />
          <div style={{ display: "flex", width: `${shortPct}%`, background: C.danger }} />
        </div>

        {/* top markets by exposure, net colored */}
        <div style={{ display: "flex", width: "100%", marginTop: 22 }}>
          {coins.map((c) => {
            const cNet = c.netNotional >= 0;
            return (
              <div
                key={c.coin}
                style={{ display: "flex", flexDirection: "column", flexGrow: 1, marginRight: 24 }}
              >
                <div style={{ display: "flex", fontSize: 17, color: C.textSecondary }}>{c.coin}</div>
                <div
                  style={{
                    display: "flex",
                    fontFamily: "JetBrains Mono",
                    fontSize: 25,
                    fontWeight: 600,
                    marginTop: 6,
                    color: cNet ? C.success : C.danger,
                  }}
                >
                  {signed(c.netNotional)}
                </div>
                <div style={{ display: "flex", fontSize: 15, color: C.textTertiary, marginTop: 2 }}>
                  {cNet ? "net long" : "net short"}
                </div>
              </div>
            );
          })}
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
