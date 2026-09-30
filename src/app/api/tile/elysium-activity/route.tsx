import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileSeries } from "@/lib/og/tileTheme";
import { DailyChart, ELYSIUM_FOOTNOTE, ElysiumBadge, StatRow, completeDays, elysiumTileResponse, fmtDay, loadElysium } from "@/lib/og/elysium";

/**
 * Elysium daily active and new addresses (complete UTC days), plus how
 * concentrated the last 24h of activity is.
 *
 * `GET /api/tile/elysium-activity` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Users {
  daily: { day: string; partial?: boolean; active: number; new: number; returning: number }[];
  concentration24h: { senders: number; txs: number; top10Share: number };
}

export async function GET() {
  const u = await loadElysium<Users>("/elysium/analytics/users?days=14", revalidate);
  const days = completeDays(u?.daily);
  if (!u || days.length < 2) return new Response("elysium users unavailable", { status: 503 });
  const last = days[days.length - 1];

  return elysiumTileResponse(
    <TileFrame
      title="Active addresses"
      pill={`${days.length}d`}
      badge={<ElysiumBadge />}
      eyebrow={`Elysium testnet · ${fmtDay(last.day)}`}
      hero={compactCount(last.active, { fallback: "-" })}
      heroSub="addresses sent a transaction"
      footLeft="Active = sent at least one non-spam tx that UTC day · new = first tx ever"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <StatRow
        marginTop={24}
        cells={[
          { label: "New that day", value: compactCount(last.new, { fallback: "-" }) },
          { label: "Returning", value: compactCount(last.returning, { fallback: "-" }) },
          { label: "Top 10 senders, 24h", value: `${(u.concentration24h.top10Share * 100).toFixed(1)}% of txs` },
        ]}
      />
      <DailyChart
        days={days.map((d) => d.day)}
        height={110}
        series={[
          { values: days.map((d) => d.active), color: tileSeries.cyan, fill: "rgba(131, 233, 255, 0.10)", label: "Active" },
          { values: days.map((d) => d.new), color: tileSeries.gold, fill: "rgba(249, 227, 112, 0.08)", label: "New" },
        ]}
      />
    </TileFrame>,
    revalidate
  );
}
