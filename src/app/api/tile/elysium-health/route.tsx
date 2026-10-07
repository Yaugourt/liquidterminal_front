import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors, tileSeries } from "@/lib/og/tileTheme";
import { DailyChart, ELYSIUM_FOOTNOTE, ElysiumBadge, StatRow, completeDays, elysiumTileResponse, fmtDay, loadElysium, pctText } from "@/lib/og/elysium";

/**
 * Network health per day: the share of transactions flagged as spam and the
 * share of non-spam transactions that failed.
 *
 * `GET /api/tile/elysium-health` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 900;

interface Econ { daily: { day: string; partial?: boolean; txs: number; spamTxs: number; failedTxs: number; bridgeTxs: number }[] }

export async function GET() {
  const d = await loadElysium<Econ>("/elysium/analytics/economics?days=14", revalidate);
  const days = completeDays(d?.daily).filter((r) => r.txs + r.spamTxs > 0);
  if (days.length < 3) return new Response("elysium health unavailable", { status: 503 });
  const spam = (r: Econ["daily"][number]) => r.spamTxs / (r.txs + r.spamTxs);
  const failed = (r: Econ["daily"][number]) => (r.txs ? r.failedTxs / r.txs : 0);
  const last = days[days.length - 1];

  return elysiumTileResponse(
    <TileFrame
      title="Spam and failures"
      pill={fmtDay(last.day)}
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · transaction quality per day"
      hero={pctText(spam(last), 1)}
      heroSub={`of ${compactCount(last.txs + last.spamTxs, { fallback: "-" })} transactions flagged as spam`}
      footLeft="Spam share over all transactions, failure share over non-spam ones"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <StatRow
        marginTop={16}
        cells={[
          { label: "Failed, last day", value: pctText(failed(last), 1), color: tileColors.danger },
          { label: "Non-spam txs", value: compactCount(last.txs, { fallback: "-" }) },
          { label: "Bridge-driven txs", value: compactCount(last.bridgeTxs, { fallback: "-" }) },
        ]}
      />
      <DailyChart
        days={days.map((r) => r.day)}
        height={88}
        series={[
          { values: days.map(spam), color: tileSeries.gold, fill: "rgba(249, 227, 112, 0.08)", label: "Spam share" },
          { values: days.map(failed), color: tileSeries.pink, fill: "rgba(244, 114, 182, 0.06)", label: "Failed share" },
        ]}
      />
    </TileFrame>,
    revalidate
  );
}
