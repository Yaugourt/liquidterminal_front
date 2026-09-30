import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileSeries } from "@/lib/og/tileTheme";
import { DailyChart, ELYSIUM_FOOTNOTE, ElysiumBadge, completeDays, elysiumTileResponse, fmtDay, loadElysium } from "@/lib/og/elysium";

/**
 * Contracts deployed on Elysium per complete UTC day, and by how many
 * distinct deployers.
 *
 * `GET /api/tile/elysium-deployments` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Deployments {
  daily: { day: string; partial?: boolean; deployments: number; deployers: number }[];
}

export async function GET() {
  const d = await loadElysium<Deployments>("/elysium/analytics/deployments?days=14", revalidate);
  const days = completeDays(d?.daily);
  if (days.length < 2) return new Response("elysium deployments unavailable", { status: 503 });
  const last = days[days.length - 1];
  const total = days.reduce((s, r) => s + r.deployments, 0);

  return elysiumTileResponse(
    <TileFrame
      title="Contract deployments"
      pill={`${days.length}d`}
      badge={<ElysiumBadge />}
      eyebrow={`Elysium testnet · ${fmtDay(last.day)}`}
      hero={compactCount(last.deployments, { fallback: "-" })}
      heroSub={`contracts deployed by ${compactCount(last.deployers, { fallback: "-" })} deployers`}
      footLeft={`${compactCount(total, { fallback: "-" })} contracts over the last ${days.length} complete UTC days`}
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <DailyChart
        days={days.map((r) => r.day)}
        height={150}
        series={[
          { values: days.map((r) => r.deployments), color: tileSeries.cyan, fill: "rgba(131, 233, 255, 0.12)", label: "Deployments" },
          { values: days.map((r) => r.deployers), color: tileSeries.gold, fill: "rgba(249, 227, 112, 0.06)", label: "Deployers" },
        ]}
      />
    </TileFrame>,
    revalidate
  );
}
