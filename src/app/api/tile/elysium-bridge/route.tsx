import { compactCount, compactHype } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { DailyChart, ELYSIUM_FOOTNOTE, ElysiumBadge, StatRow, completeDays, elysiumTileResponse, loadElysium } from "@/lib/og/elysium";

/**
 * HYPE bridged between HyperEVM and Elysium over complete UTC days: net flow,
 * both directions, and the measured finality of each.
 *
 * `GET /api/tile/elysium-bridge` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

const C = tileColors;

interface Bridge {
  daily: { day: string; partial?: boolean; deposits: number; withdrawals: number; hypeIn: number; hypeOut: number }[];
  finality: { direction: "deposit" | "withdrawal"; completed: number; medianS: number; p90S: number }[];
}

function dur(s: number | undefined): string {
  if (s == null || !Number.isFinite(s)) return "-";
  if (s < 120) return `${Math.round(s)}s`;
  if (s < 7200) return `${Math.round(s / 60)} min`;
  if (s < 172800) return `${(s / 3600).toFixed(1)}h`;
  return `${(s / 86400).toFixed(1)}d`;
}

export async function GET() {
  const b = await loadElysium<Bridge>("/elysium/analytics/bridge?days=14", revalidate);
  const days = completeDays(b?.daily);
  if (!b || days.length < 2) return new Response("elysium bridge unavailable", { status: 503 });
  const hin = days.reduce((s, r) => s + r.hypeIn, 0);
  const hout = days.reduce((s, r) => s + r.hypeOut, 0);
  const net = hin - hout;
  const dep = b.finality.find((f) => f.direction === "deposit");
  const wd = b.finality.find((f) => f.direction === "withdrawal");

  return elysiumTileResponse(
    <TileFrame
      title="Bridge flows"
      pill={`${days.length}d`}
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · net HYPE into Elysium"
      hero={`${net >= 0 ? "+" : "-"}${compactHype(Math.abs(net), { fallback: "-" })} HYPE`}
      heroColor={net >= 0 ? C.success : C.danger}
      heroSub={`over ${days.length} complete days`}
      footLeft={`Median finality: deposits ${dur(dep?.medianS)}, withdrawals ${dur(wd?.medianS)} (testnet challenge period)`}
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <StatRow
        marginTop={24}
        cells={[
          { label: "HYPE in", value: compactHype(hin, { fallback: "-" }), color: C.success },
          { label: "HYPE out", value: compactHype(hout, { fallback: "-" }), color: C.danger },
          { label: "Deposits", value: compactCount(days.reduce((s, r) => s + r.deposits, 0), { fallback: "-" }) },
          { label: "Withdrawals", value: compactCount(days.reduce((s, r) => s + r.withdrawals, 0), { fallback: "-" }) },
        ]}
      />
      <DailyChart
        days={days.map((r) => r.day)}
        height={100}
        series={[
          { values: days.map((r) => r.hypeIn), color: C.success, fill: "rgba(31, 168, 91, 0.10)", label: "In" },
          { values: days.map((r) => r.hypeOut), color: C.danger, fill: "rgba(229, 62, 62, 0.08)", label: "Out" },
        ]}
      />
    </TileFrame>,
    revalidate
  );
}
