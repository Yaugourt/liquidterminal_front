import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors, tileSeries } from "@/lib/og/tileTheme";
import { BarChart, ELYSIUM_FOOTNOTE, ElysiumBadge, StatRow, elysiumTileResponse, loadElysium } from "@/lib/og/elysium";

/**
 * Bridge finality: time from initiation to completion on the other side, for
 * completed deposits (HyperEVM to Elysium) and withdrawals (back), 14 days.
 *
 * `GET /api/tile/elysium-finality` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 900;

interface Fin { direction: "deposit" | "withdrawal"; completed: number; medianS: number | null; p90S: number | null }

function dur(s: number | null): string {
  if (s == null) return "-";
  if (s < 90) return `${Math.round(s)}s`;
  if (s < 5400) return `${Math.round(s / 60)}m`;
  if (s < 172800) return `${(s / 3600).toFixed(1)}h`;
  return `${(s / 86400).toFixed(1)}d`;
}

export async function GET() {
  const d = await loadElysium<{ finality: Fin[] }>("/elysium/analytics/bridge?days=14", revalidate);
  const dep = (d?.finality ?? []).find((f) => f.direction === "deposit");
  const wd = (d?.finality ?? []).find((f) => f.direction === "withdrawal");
  if (!dep || !wd || dep.medianS == null) return new Response("elysium finality unavailable", { status: 503 });

  return elysiumTileResponse(
    <TileFrame
      title="Bridge finality"
      pill="14d"
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · HyperEVM bridge, completed transfers"
      hero={dur(dep.medianS)}
      heroSub={`median deposit, HyperEVM to Elysium · ${compactCount(dep.completed, { fallback: "-" })} deposits`}
      footLeft="Bars on a log scale. Withdrawals wait out the rollup challenge period"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <StatRow
        marginTop={18}
        cells={[
          { label: "Deposit, p90", value: dur(dep.p90S), color: tileColors.success },
          { label: "Withdrawal, median", value: dur(wd.medianS), color: tileColors.danger },
          { label: "Withdrawal, p90", value: dur(wd.p90S), color: tileColors.danger },
          { label: "Withdrawals done", value: compactCount(wd.completed, { fallback: "-" }) },
        ]}
      />
      <BarChart
        height={80}
        marginTop={14}
        bars={[
          { label: "deposit median", value: Math.log10(1 + (dep.medianS ?? 0)), color: tileSeries.cyan, valueText: dur(dep.medianS) },
          { label: "deposit p90", value: Math.log10(1 + (dep.p90S ?? 0)), color: tileSeries.cyan, valueText: dur(dep.p90S) },
          { label: "withdrawal median", value: Math.log10(1 + (wd.medianS ?? 0)), color: tileSeries.gold, valueText: dur(wd.medianS) },
          { label: "withdrawal p90", value: Math.log10(1 + (wd.p90S ?? 0)), color: tileSeries.gold, valueText: dur(wd.p90S) },
        ]}
      />
    </TileFrame>,
    revalidate
  );
}
