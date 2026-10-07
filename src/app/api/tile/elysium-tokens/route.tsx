import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileSeries } from "@/lib/og/tileTheme";
import { DailyChart, ELYSIUM_FOOTNOTE, ElysiumBadge, StatRow, completeDays, elysiumTileResponse, loadElysium } from "@/lib/og/elysium";

/**
 * ERC-20 tokens seen on Elysium: total, with a name, launched in the last 24h,
 * and launches per complete UTC day.
 *
 * `GET /api/tile/elysium-tokens` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Tokens {
  totals: { tokens: number; named: number; launched24h: number; named24h: number };
  daily: { day: string; partial?: boolean; launched: number; named: number }[];
}

export async function GET() {
  const t = await loadElysium<Tokens>("/elysium/analytics/tokens", revalidate);
  const days = completeDays(t?.daily);
  if (!t || days.length < 2) return new Response("elysium tokens unavailable", { status: 503 });

  return elysiumTileResponse(
    <TileFrame
      title="Token launches"
      pill="since genesis"
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · ERC-20 tokens"
      hero={compactCount(t.totals.tokens, { fallback: "-" })}
      heroSub="tokens seen on chain"
      footLeft="Testnet tokens: no market value"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <StatRow
        marginTop={24}
        cells={[
          { label: "With a symbol", value: compactCount(t.totals.named, { fallback: "-" }) },
          { label: "Launched, 24h", value: compactCount(t.totals.launched24h, { fallback: "-" }) },
          { label: "With a symbol, 24h", value: compactCount(t.totals.named24h, { fallback: "-" }) },
        ]}
      />
      <DailyChart
        days={days.map((r) => r.day)}
        height={100}
        series={[
          { values: days.map((r) => r.launched), color: tileSeries.cyan, fill: "rgba(131, 233, 255, 0.10)", label: "Launched" },
          { values: days.map((r) => r.named), color: tileSeries.gold, fill: "rgba(249, 227, 112, 0.06)", label: "With a symbol" },
        ]}
      />
    </TileFrame>,
    revalidate
  );
}
