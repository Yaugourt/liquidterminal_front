import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { tileColors } from "@/lib/og/tileTheme";
import { TileFrame } from "@/lib/og/TileFrame";
import { loadTileFonts } from "@/lib/og/fonts";
import { loadHypurr } from "@/lib/og/hypurr";
import { seriesPaths } from "@/lib/og/chart";

/**
 * Self-sampled headline trend (open interest, active users, protocol fees) as a
 * standalone image. These have no upstream history: the backend stores one
 * hourly point, and this renders the accrued series as a branded card so the
 * growth curve nobody else self-hosts can be posted on its own.
 *
 * `GET /api/tile/metric?metric=total_oi|active_users_24h|total_fees_24h`
 */
export const runtime = "nodejs";
export const revalidate = 300;

const C = tileColors;

type MetricKey = "total_oi" | "active_users_24h" | "total_fees_24h";
interface MetricConf {
  title: string;
  eyebrow: string;
  unit: "usd" | "count";
}
const METRICS: Record<MetricKey, MetricConf> = {
  total_oi: { title: "Open interest", eyebrow: "Total perp open interest", unit: "usd" },
  active_users_24h: { title: "Active users", eyebrow: "Active traders · 24h rolling", unit: "count" },
  total_fees_24h: { title: "Protocol fees", eyebrow: "Protocol fees · 24h", unit: "usd" },
};

interface Point {
  time: number;
  value: number;
}

function parseMetric(raw: string | null): MetricKey {
  return raw && raw in METRICS ? (raw as MetricKey) : "total_oi";
}

async function load(metric: MetricKey): Promise<Point[]> {
  try {
    const res = await fetch(
      `${env.NEXT_PUBLIC_API}/market/metrics/history?metric=${metric}&hours=168`,
      { next: { revalidate } }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: Point[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const metric = parseMetric(request.nextUrl.searchParams.get("metric"));
  const conf = METRICS[metric];
  const series = await load(metric);

  // A trend needs at least two points; below that there is nothing to chart.
  if (series.length < 2) {
    return new Response("not enough history yet", { status: 503 });
  }

  const fmt = (v: number) => (conf.unit === "usd" ? compactUsd(v) : compactCount(v));
  const values = series.map((p) => p.value);
  const first = values[0];
  const latest = values[values.length - 1];
  const changePct = first > 0 ? ((latest - first) / first) * 100 : 0;
  const days = Math.max(1, Math.round((series[series.length - 1].time - series[0].time) / 86_400_000));
  const { line, area } = seriesPaths(values);

  const stamp = new Date(series[series.length - 1].time).toISOString().slice(0, 16).replace("T", " ");
  const mascotMood = metric === "total_oi" ? "crystalball" : metric === "active_users_24h" ? "happy" : "cash";
  const [fonts, mascot] = await Promise.all([loadTileFonts(), loadHypurr(mascotMood)]);

  return new ImageResponse(
    (
      <TileFrame
        title={conf.title}
        pill={`${days}d · hourly`}
        eyebrow={conf.eyebrow}
        hero={fmt(latest)}
        heroSub={`${changePct >= 0 ? "+" : ""}${changePct.toFixed(1)}% over the window`}
        footLeft="Sampled hourly by Liquid Terminal · no upstream history"
        footNote={`Source: Hyperliquid · on-chain indexing — ${stamp} UTC`}
        mascot={mascot}
      >
        {/* self-built trend line + faint fill */}
        <div style={{ display: "flex", width: "100%", height: 170, marginTop: 26 }}>
          <svg
            width="100%"
            height="150"
            viewBox="0 0 1000 150"
            preserveAspectRatio="none"
            style={{ display: "flex" }}
          >
            <path d={area} fill="rgba(131, 233, 255, 0.12)" />
            <path d={line} fill="none" stroke={C.brand} strokeWidth="3" strokeLinejoin="round" />
          </svg>
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
