import { ImageResponse } from "next/og";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { tileColors } from "@/lib/og/tileTheme";
import { TileFrame } from "@/lib/og/TileFrame";
import { loadTileFonts } from "@/lib/og/fonts";
import { loadHypurr } from "@/lib/og/hypurr";
import { getReserveYieldSnapshot, type ReserveYieldSnapshot } from "@/lib/reserve-yield";

/**
 * USDC reserve yield (AQAv2) as a citable image: what the protocol has been
 * paid, the rate the last payment implies and where the money sits, with the
 * schedule of the interval accruing now.
 *
 * `GET /api/tile/reserve-yield` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;
export const maxDuration = 120;

const C = tileColors;
const DAY_MS = 86_400_000;

const day = (t: number) =>
  new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const shortDay = (t: number) =>
  new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function Box({ label, value, sub, gold }: { label: string; value: string; sub: string; gold?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        flexBasis: 0,
        padding: "14px 18px",
        borderRadius: 10,
        border: `1px solid ${gold ? "rgba(249,227,112,0.45)" : C.borderSubtle}`,
        background: gold ? "rgba(249,227,112,0.06)" : C.surface2,
        marginRight: 14,
      }}
    >
      <div style={{ display: "flex", fontSize: 14, letterSpacing: 1.2, color: C.textTertiary, fontWeight: 600 }}>
        {label.toUpperCase()}
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "JetBrains Mono",
          fontSize: 28,
          fontWeight: 600,
          marginTop: 6,
          color: gold ? C.warn : C.textPrimary,
        }}
      >
        {value}
      </div>
      <div style={{ display: "flex", fontSize: 15, color: C.textTertiary, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

export async function GET() {
  let data: ReserveYieldSnapshot;
  try {
    data = await getReserveYieldSnapshot();
  } catch {
    return new Response("reserve yield unavailable", { status: 503 });
  }
  const paid = data.intervals.filter((i) => i.status === "paid");
  const last = paid[paid.length - 1];
  // Nothing paid yet means nothing to claim.
  if (!last || last.paidUsdc == null) return new Response("no payment yet", { status: 503 });

  const cur = data.intervals[data.intervals.length - 1];
  const today = Math.floor(data.asOf / DAY_MS) * DAY_MS;
  const [fonts, mascot] = await Promise.all([loadTileFonts(), loadHypurr("cash")]);
  const stamp = new Date(data.asOf).toISOString().slice(0, 16).replace("T", " ");

  const cells: string[] = [];
  for (let k = 0; k < 30; k++) cells.push(cur.start + k * DAY_MS <= today ? C.brand : C.borderSubtle);
  for (let k = 1; k <= 8; k++) cells.push(k === 8 ? C.warn : "rgba(249,227,112,0.3)");

  return new ImageResponse(
    (
      <TileFrame
        title="USDC reserve yield"
        pill="AQAv2"
        eyebrow="Paid to the Hyperliquid protocol"
        hero={compactUsd(data.totalPaidUsdc)}
        heroColor={C.warn}
        heroSub={`${paid.length === 1 ? "First payment" : `${paid.length} payments, last`} ${day(last.paidAt ?? last.payoutDate)} · implied ${last.impliedRatePct?.toFixed(2)}% a year on ${compactUsd(last.avgBalance)}`}
        footLeft="Implied rate = payment / sum of 30 daily treasury balances x 365"
        footNote={`Sources: HyperEVM RPC · Hyperliquid info API, read on-chain · ${stamp} UTC`}
        mascot={mascot}
      >
        <div style={{ display: "flex", width: "100%", marginTop: 22 }}>
          <Box label="Treasury · HyperEVM" value={compactUsd(data.treasuryUsdc)} sub="balance the yield is charged on" />
          <Box
            label="Interest address"
            value={compactUsd(data.interestUsdc)}
            sub={data.interestUsdc > 1 ? "waiting to go to the fund" : "sent on to the fund"}
            gold={data.interestUsdc > 1}
          />
          <Box label="Assistance Fund" value={compactUsd(data.forwardedToFundUsdc)} sub="received, buys HYPE" />
        </div>

        <div style={{ display: "flex", width: "100%", marginTop: 20, fontSize: 16, color: C.textSecondary }}>
          {`Interval ${cur.index} · ${data.current.dateNumber} of 30 dates read · next payment ${shortDay(cur.payoutDate)}${cur.projectedUsdc != null ? `, ~${compactUsd(cur.projectedUsdc)} at the same rate` : ""}`}
        </div>
        <div style={{ display: "flex", width: "100%", marginTop: 10 }}>
          {cells.map((c, i) => (
            <div
              key={i}
              style={{ display: "flex", flexGrow: 1, height: 14, marginRight: 4, borderRadius: 3, background: c }}
            />
          ))}
        </div>
      </TileFrame>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length > 0 ? fonts : undefined,
      headers: { "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=3600" },
    },
  );
}
