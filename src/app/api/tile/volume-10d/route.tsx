import { ImageResponse } from "next/og";
import { env } from "@/lib/env";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { tileColors } from "@/lib/og/tileTheme";
import { TileFrame } from "@/lib/og/TileFrame";
import { loadTileFonts } from "@/lib/og/fonts";
import { loadHypurr } from "@/lib/og/hypurr";
import { seriesPaths } from "@/lib/og/chart";

/**
 * Market-wide daily traded volume over the trailing window, as a standalone
 * image. The current UTC day is still accumulating, so it is excluded from the
 * curve and the totals rather than plotted as a false collapse.
 *
 * `GET /api/tile/volume-10d` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

const C = tileColors;

interface Day {
  date: string;
  volume: number;
}

async function load(): Promise<Day[]> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API}/indexer/overview/daily-volume-10d`, {
      next: { revalidate },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: Day[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

function fmtDay(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export async function GET() {
  const days = await load();
  const todayUtc = new Date().toISOString().slice(0, 10);
  // Drop the still-accumulating current UTC day: a partial bar reads as a crash.
  const complete = days.filter((d) => d.date !== todayUtc && Number.isFinite(d.volume));

  if (complete.length < 2) {
    return new Response("not enough volume history", { status: 503 });
  }

  const total = complete.reduce((s, d) => s + d.volume, 0);
  const avg = total / complete.length;
  const latest = complete[complete.length - 1];
  const { line, area } = seriesPaths(complete.map((d) => d.volume));

  const [fonts, mascot] = await Promise.all([loadTileFonts(), loadHypurr("notes")]);

  return new ImageResponse(
    (
      <TileFrame
        title="Market volume"
        pill={`${complete.length}d`}
        eyebrow="Daily traded volume"
        hero={compactUsd(total)}
        heroSub={`over ${complete.length} full days · avg ${compactUsd(avg)}/day`}
        footLeft={`Complete UTC days only · last full day ${fmtDay(latest.date)} ${compactUsd(
          latest.volume
        )}`}
        footNote="Source: Hyperliquid · on-chain indexing"
        mascot={mascot}
      >
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
        "Cache-Control": "public, max-age=600, s-maxage=1800, stale-while-revalidate=3600",
      },
    }
  );
}
