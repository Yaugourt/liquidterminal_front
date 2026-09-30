import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileSeries } from "@/lib/og/tileTheme";
import { DailyChart, ELYSIUM_FOOTNOTE, ElysiumBadge, StatRow, completeDays, elysiumTileResponse, fmtDay, loadElysium } from "@/lib/og/elysium";

/**
 * What Elysium users paid in fees (gas used x effective gas price) per
 * complete UTC day, with the failure rate.
 *
 * `GET /api/tile/elysium-fees` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Economics {
  daily: { day: string; partial?: boolean; txs: number; failedTxs: number; feesHype: number; avgFeeHype: number }[];
}

export async function GET() {
  const e = await loadElysium<Economics>("/elysium/analytics/economics?days=14", revalidate);
  const days = completeDays(e?.daily);
  if (days.length < 2) return new Response("elysium economics unavailable", { status: 503 });
  const total = days.reduce((s, r) => s + r.feesHype, 0);
  const last = days[days.length - 1];

  return elysiumTileResponse(
    <TileFrame
      title="Fees paid"
      pill={`${days.length}d`}
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · fees in HYPE"
      hero={`${total.toFixed(3)} HYPE`}
      heroSub={`over ${days.length} complete days`}
      footLeft="Fee = gas used x effective gas price, every indexed transaction"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <StatRow
        marginTop={24}
        cells={[
          { label: `Fees, ${fmtDay(last.day)}`, value: `${last.feesHype.toFixed(3)} HYPE` },
          // 1 gwei = 1e-9 HYPE: testnet fees are far below a readable HYPE decimal.
          { label: "Avg fee per tx", value: `${Math.round(last.avgFeeHype * 1e9).toLocaleString("en-US")} gwei` },
          { label: "Failed txs", value: `${last.txs ? ((last.failedTxs / last.txs) * 100).toFixed(1) : "0"}%` },
          { label: "Non-spam txs", value: compactCount(last.txs, { fallback: "-" }) },
        ]}
      />
      <DailyChart
        days={days.map((r) => r.day)}
        height={100}
        series={[{ values: days.map((r) => r.feesHype), color: tileSeries.gold, fill: "rgba(249, 227, 112, 0.10)", label: "Fees (HYPE)" }]}
      />
    </TileFrame>,
    revalidate
  );
}
