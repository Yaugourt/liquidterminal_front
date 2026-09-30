import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors, tileSeries } from "@/lib/og/tileTheme";
import { BarChart, ELYSIUM_FOOTNOTE, ElysiumBadge, StatRow, elysiumTileResponse, fmtDay, loadElysium, pctText } from "@/lib/og/elysium";

/**
 * Retention by first-seen day: the share of each day's new addresses that
 * sent a transaction again the next day (D+1) and 7 days later (D+7).
 *
 * `GET /api/tile/elysium-retention` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 900;

interface Cohort { cohortDay: string; size: number; d1: number | null; d7: number | null }

export async function GET() {
  const d = await loadElysium<{ retention: Cohort[] }>("/elysium/analytics/users?days=14", revalidate);
  // Only cohorts whose D+1 is measured (the next day is complete) carry signal.
  const cohorts = (d?.retention ?? []).filter((c) => c.size > 0 && c.d1 != null).sort((a, b) => a.cohortDay.localeCompare(b.cohortDay)).slice(-8);
  if (cohorts.length < 3) return new Response("elysium retention unavailable", { status: 503 });
  const last = cohorts[cohorts.length - 1];
  const withD7 = cohorts.filter((c) => c.d7 != null);
  const newTotal = cohorts.reduce((s, c) => s + c.size, 0);
  const d1Weighted = cohorts.reduce((s, c) => s + (c.d1 ?? 0) * c.size, 0) / Math.max(1, newTotal);

  return elysiumTileResponse(
    <TileFrame
      title="Retention"
      pill="D+1 / D+7"
      badge={<ElysiumBadge />}
      eyebrow={`Elysium testnet · cohort of ${fmtDay(last.cohortDay)}`}
      hero={pctText(last.d1)}
      heroSub={`of ${compactCount(last.size, { fallback: "-" })} new addresses came back the next day`}
      footLeft="An address counts as retained when it sends a non-spam transaction again"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <StatRow
        marginTop={18}
        cells={[
          { label: `D+1, ${cohorts.length} cohorts weighted`, value: pctText(d1Weighted), color: tileColors.brand },
          { label: "New addresses in them", value: compactCount(newTotal, { fallback: "-" }) },
          { label: "Latest D+7", value: withD7.length ? pctText(withD7[withD7.length - 1].d7) : "-", color: tileColors.warn },
        ]}
      />
      <BarChart
        height={92}
        marginTop={14}
        bars={cohorts.map((c) => ({ label: fmtDay(c.cohortDay), value: c.d1 ?? 0, color: tileSeries.cyan, valueText: pctText(c.d1) }))}
      />
    </TileFrame>,
    revalidate
  );
}
