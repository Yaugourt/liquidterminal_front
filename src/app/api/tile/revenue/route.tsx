import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { compactUsd, fullUsd } from "@/lib/formatters/numberFormatting";
import { tileColors, tileHalo, tileSeries } from "@/lib/og/tileTheme";
import type { RevenueBreakdown, RevenueWindow } from "@/services/market/revenue";

/**
 * Protocol Revenue as a standalone, citable image.
 *
 * The competitive gap is not data, it is distribution: our numbers live inside
 * a dashboard, which cannot be screenshotted without losing what it claims.
 * This renders the same figures as `FeesRevenuePanel` into one self-contained
 * frame that carries its own headline, method and source, so a reader who only
 * ever sees the image still knows what they are looking at and where it came
 * from.
 *
 * `GET /api/tile/revenue?window=30d` → PNG 1200x630 (the aspect X unfurls).
 */
export const runtime = "nodejs";

/** Matches the dashboard card's own cadence — the tile is never fresher than it. */
export const revalidate = 300;

const WINDOWS: RevenueWindow[] = ["7d", "30d", "90d", "1y", "all"];
const WINDOW_COPY: Record<RevenueWindow, string> = {
  "7d": "last 7 days",
  "30d": "last 30 days",
  "90d": "last 90 days",
  "1y": "last 12 months",
  all: "all time",
};

const C = tileColors;

/**
 * Source split, identical to `RevenueChart`: HIP-1 and HIP-3 are merged into
 * one "Auctions" band because both are slot-pricing Dutch auctions.
 */
const SOURCES = [
  { key: "perp", label: "Perp", color: tileSeries.cyan },
  { key: "spot", label: "Spot", color: tileSeries.gold },
  { key: "auction", label: "Auctions", color: tileSeries.violet },
  { key: "priority", label: "Priority", color: tileSeries.pink },
  { key: "hip4", label: "HIP-4", color: tileSeries.orange },
] as const;

interface Slice {
  label: string;
  color: string;
  value: number;
  share: number;
}

function parseWindow(raw: string | null): RevenueWindow {
  return WINDOWS.includes(raw as RevenueWindow) ? (raw as RevenueWindow) : "30d";
}

async function loadBreakdown(window: RevenueWindow): Promise<RevenueBreakdown | null> {
  try {
    const res = await fetch(
      `${env.NEXT_PUBLIC_API}/market/revenue/history?window=${encodeURIComponent(window)}`,
      { next: { revalidate } }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: RevenueBreakdown };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const window = parseWindow(request.nextUrl.searchParams.get("window"));
  const breakdown = await loadBreakdown(window);

  // No data means no tile. Publishing an empty frame would be worse than
  // publishing nothing: it would still read as a claim about the protocol.
  if (!breakdown || breakdown.days.length === 0) {
    return new Response("revenue breakdown unavailable", { status: 503 });
  }

  const totals = breakdown.days.reduce(
    (acc, d) => ({
      perp: acc.perp + (d.perp ?? 0),
      spot: acc.spot + (d.spot ?? 0),
      auction: acc.auction + (d.hip1 ?? 0) + (d.hip3 ?? 0),
      priority: acc.priority + (d.priority ?? 0),
      hip4: acc.hip4 + (d.hip4 ?? 0),
    }),
    { perp: 0, spot: 0, auction: 0, priority: 0, hip4: 0 }
  );
  const windowTotal = Object.values(totals).reduce((a, b) => a + b, 0);

  const slices: Slice[] = SOURCES.map((s) => {
    const value = totals[s.key];
    return { label: s.label, color: s.color, value, share: windowTotal ? value / windowTotal : 0 };
  })
    // A band that rounds to nothing still steals a legend row; drop it rather
    // than print "0.0%" five times when a source has not gone live.
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);

  const hypeUsd = breakdown.meta?.hypeUsd ?? null;
  const spotMultiplier = breakdown.meta?.spotMultiplier ?? 2;

  /**
   * A total is only as complete as the feeds behind it. When a source is down,
   * its rows come back as zero and the headline silently understates revenue —
   * so the tile has to say which sources are missing, not just print the sum.
   * Naming them in the formula while they contribute nothing would be worse
   * than leaving them out: it claims coverage the number does not have.
   */
  const SOURCE_LABELS: Record<string, string> = {
    perpSpot: "perp/spot",
    hip1: "HIP-1 auctions",
    hip3: "HIP-3 auctions",
    hip4: "HIP-4",
    priority: "priority fees",
  };
  const status = breakdown.meta?.sourceStatus ?? {};
  const missing = Object.entries(status)
    .filter(([, s]) => s === "error" || s === "stale")
    .map(([k]) => SOURCE_LABELS[k] ?? k);
  const pending = Object.entries(status)
    .filter(([, s]) => s === "not_yet_live")
    .map(([k]) => SOURCE_LABELS[k] ?? k);
  const included = Object.entries(status)
    .filter(([, s]) => s === "ok")
    .map(([k]) => SOURCE_LABELS[k] ?? k);
  const stamp = new Date(breakdown.meta?.lastUpdate ?? Date.now()).toISOString().slice(0, 16).replace("T", " ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: C.base,
          backgroundImage: tileHalo,
          padding: "48px 56px",
          color: C.textPrimary,
          fontFamily: "sans-serif",
        }}
      >
        {/* masthead */}
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                background: C.brand,
                marginRight: 12,
                display: "flex",
              }}
            />
            <div style={{ fontSize: 15, letterSpacing: 3, color: C.brand, display: "flex" }}>
              LIQUID TERMINAL
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              fontSize: 15,
              color: C.textSecondary,
              border: `1px solid ${C.borderSubtle}`,
              borderRadius: 999,
              padding: "6px 16px",
              background: C.surface,
            }}
          >
            {WINDOW_COPY[window]}
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 34 }}>
          <div style={{ display: "flex", fontSize: 26, color: C.textSecondary }}>
            Hyperliquid protocol revenue
          </div>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 700, letterSpacing: -2, marginTop: 6 }}>
            {compactUsd(windowTotal)}
          </div>
          <div style={{ display: "flex", fontSize: 20, color: C.textTertiary, marginTop: 4 }}>
            {`over the ${WINDOW_COPY[window]} · ${fullUsd(breakdown.lifetime?.total ?? 0)} lifetime`}
          </div>
        </div>

        {/* one bar, five sources, in the same colours as the app */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 26,
            marginTop: 32,
            borderRadius: 8,
            overflow: "hidden",
            background: C.surface2,
          }}
        >
          {slices.map((s) => (
            <div
              key={s.label}
              style={{ display: "flex", width: `${Math.max(s.share * 100, 0.6)}%`, background: s.color }}
            />
          ))}
        </div>

        {/* legend */}
        <div style={{ display: "flex", width: "100%", marginTop: 22 }}>
          {slices.map((s) => (
            <div
              key={s.label}
              style={{ display: "flex", flexDirection: "column", flexGrow: 1, marginRight: 24 }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: s.color,
                    marginRight: 8,
                    display: "flex",
                  }}
                />
                <div style={{ display: "flex", fontSize: 17, color: C.textSecondary }}>{s.label}</div>
              </div>
              <div style={{ display: "flex", fontSize: 25, fontWeight: 600, marginTop: 6 }}>
                {compactUsd(s.value)}
              </div>
              <div style={{ display: "flex", fontSize: 16, color: C.textTertiary, marginTop: 2 }}>
                {`${(s.share * 100).toFixed(1)}%`}
              </div>
            </div>
          ))}
        </div>

        {/* method and provenance — what makes the number checkable */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            marginTop: "auto",
            paddingTop: 20,
            borderTop: `1px solid ${C.borderSubtle}`,
            fontSize: 15,
            color: C.textTertiary,
          }}
        >
          {/* Two short lines rather than one long one: a single row wraps at the
              first long method string and breaks the alignment. */}
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <div style={{ display: "flex" }}>
              {`Covers ${included.join(", ") || "no source"} · spot ×${spotMultiplier}`}
              {hypeUsd ? ` · HYPE @ $${hypeUsd.toFixed(2)}` : ""}
            </div>
            <div style={{ display: "flex", marginLeft: "auto", color: C.brand, letterSpacing: 1 }}>
              liquidterminal.xyz
            </div>
          </div>
          <div style={{ display: "flex", marginTop: 6 }}>
            {`Sources: Hypurrscan · HypeDexer · Hyperliquid — ${stamp} UTC`}
          </div>
          {missing.length > 0 && (
            <div style={{ display: "flex", marginTop: 6, color: C.warn }}>
              {`Understated: ${missing.join(", ")} unavailable at capture time`}
            </div>
          )}
          {pending.length > 0 && (
            <div style={{ display: "flex", marginTop: 6 }}>
              {`${pending.join(", ")} not yet live on mainnet`}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      // The route is unauthenticated and re-renders a 1200×630 PNG on every
      // hit. `window` is a 5-value allowlist, so cache each rendered image at
      // the CDN: an attacker looping requests then hits the cache instead of
      // burning render/Fluid-Compute time on every call.
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=3600",
      },
    }
  );
}
