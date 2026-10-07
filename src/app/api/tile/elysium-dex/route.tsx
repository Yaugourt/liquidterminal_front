import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileSeries } from "@/lib/og/tileTheme";
import { DailyChart, ELYSIUM_FOOTNOTE, ElysiumBadge, StatRow, completeDays, elysiumTileResponse, loadElysium } from "@/lib/og/elysium";

/**
 * DEX activity on Elysium, decoded from Uniswap V2/V3 style pool events:
 * pools created, swaps, and the last 24h.
 *
 * `GET /api/tile/elysium-dex` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Dex {
  totals: { pools: number; swaps: number; pools24h: number; swaps24h: number; traders24h: number };
  daily: { day: string; partial?: boolean; poolsCreated: number; swaps: number }[];
}

export async function GET() {
  const d = await loadElysium<Dex>("/elysium/analytics/dex", revalidate);
  const days = completeDays(d?.daily);
  if (!d || days.length < 2) return new Response("elysium dex unavailable", { status: 503 });

  return elysiumTileResponse(
    <TileFrame
      title="DEX on Elysium"
      pill="since genesis"
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · liquidity pools"
      hero={compactCount(d.totals.pools, { fallback: "-" })}
      heroSub={`pools · ${compactCount(d.totals.swaps, { fallback: "-" })} swaps`}
      footLeft="Pools and swaps decoded from Uniswap V2 and V3 style events"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <StatRow
        marginTop={24}
        cells={[
          { label: "New pools, 24h", value: compactCount(d.totals.pools24h, { fallback: "-" }) },
          { label: "Swaps, 24h", value: compactCount(d.totals.swaps24h, { fallback: "-" }) },
          { label: "Traders, 24h", value: compactCount(d.totals.traders24h, { fallback: "-" }) },
        ]}
      />
      <DailyChart
        days={days.map((r) => r.day)}
        height={100}
        series={[
          { values: days.map((r) => r.swaps), color: tileSeries.cyan, fill: "rgba(131, 233, 255, 0.10)", label: "Swaps" },
          { values: days.map((r) => r.poolsCreated), color: tileSeries.gold, fill: "rgba(249, 227, 112, 0.06)", label: "Pools created" },
        ]}
      />
    </TileFrame>,
    revalidate
  );
}
