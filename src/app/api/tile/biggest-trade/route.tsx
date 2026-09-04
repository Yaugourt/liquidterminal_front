import { ImageResponse } from "next/og";
import { env } from "@/lib/env";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { tileColors } from "@/lib/og/tileTheme";
import { TileFrame } from "@/lib/og/TileFrame";
import { loadTileFonts } from "@/lib/og/fonts";

/**
 * The biggest closed trades market-wide (top realized win and loss) as a
 * standalone image. High-engagement "money shot": one branded card contrasting
 * the largest realized win against the largest realized loss.
 *
 * `GET /api/tile/biggest-trade` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 300;

const C = tileColors;

interface Trade {
  coin: string;
  direction: string;
  pnl_realized: number;
  duration_s: number;
  user: string;
}

async function loadExtreme(dir: "DESC" | "ASC"): Promise<Trade | null> {
  try {
    const res = await fetch(
      `${env.NEXT_PUBLIC_API}/indexer/completed-trades/?sort_by=pnl_realized&sort_dir=${dir}&limit=1`,
      { next: { revalidate } }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Trade[] };
    return json.data?.[0] ?? null;
  } catch {
    return null;
  }
}

const signed = (v: number) => `${v >= 0 ? "+" : "-"}$${compactUsd(Math.abs(v)).replace(/^\$/, "")}`;
const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const held = (s: number) => (s >= 86400 ? `${(s / 86400).toFixed(1)}d` : `${Math.round(s / 3600)}h`);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export async function GET() {
  const [win, loss] = await Promise.all([loadExtreme("DESC"), loadExtreme("ASC")]);
  if (!win) {
    return new Response("trades unavailable", { status: 503 });
  }

  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const fonts = await loadTileFonts();

  const Extreme = ({ label, t, color }: { label: string; t: Trade; color: string }) => (
    <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, marginRight: 32 }}>
      <div
        style={{
          display: "flex",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 1.5,
          color: C.textTertiary,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", fontSize: 19, color: C.textSecondary, marginTop: 8 }}>
        {`${t.coin} · ${cap(t.direction)}`}
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "JetBrains Mono",
          fontSize: 34,
          fontWeight: 600,
          color,
          marginTop: 6,
        }}
      >
        {signed(t.pnl_realized)}
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "JetBrains Mono",
          fontSize: 15,
          color: C.textTertiary,
          marginTop: 8,
        }}
      >
        {`${shortAddr(t.user)} · held ${held(t.duration_s)}`}
      </div>
    </div>
  );

  return new ImageResponse(
    (
      <TileFrame
        title="Biggest closed trades"
        pill="market-wide"
        eyebrow="Top realized PnL"
        hero={signed(win.pnl_realized)}
        heroColor={C.success}
        heroSub={`Largest realized win · ${win.coin} ${cap(win.direction)}`}
        footLeft="Realized PnL on closed round-trip positions"
        footNote={`Source: Hyperliquid · on-chain indexing — ${stamp} UTC`}
      >
        <div style={{ display: "flex", width: "100%", marginTop: 34 }}>
          <Extreme label="BIGGEST WIN" t={win} color={C.success} />
          {loss ? <Extreme label="BIGGEST LOSS" t={loss} color={C.danger} /> : null}
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
