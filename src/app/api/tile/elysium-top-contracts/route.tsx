import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, RankList, clip, elysiumTileResponse, loadElysium, shortAddr } from "@/lib/og/elysium";

/**
 * Most used contracts on Elysium over 24h or 7d (non-spam calls), with the
 * change against the previous window of the same length.
 *
 * `GET /api/tile/elysium-top-contracts?window=24h|7d` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Row {
  address: string;
  kind: string;
  label: string | null;
  symbol: string | null;
  txs: number;
  callers: number;
  txsPrev: number;
  topMethods: { name: string | null }[];
}

export async function GET(req: Request) {
  const window = new URL(req.url).searchParams.get("window") === "7d" ? "7d" : "24h";
  const d = await loadElysium<{ rows: Row[] }>(`/elysium/analytics/contracts?window=${window}`, revalidate);
  const rows = (d?.rows ?? []).slice(0, 6);
  if (rows.length < 3) return new Response("elysium contracts unavailable", { status: 503 });
  const total = rows.reduce((s, r) => s + r.txs, 0);
  const change = (r: Row) => {
    if (!r.txsPrev) return { text: "new", color: tileColors.brand };
    const ratio = r.txs / r.txsPrev;
    // Past 10x a percentage stops being readable; show the multiple instead.
    if (ratio >= 10) return { text: `${compactCount(Math.round(ratio), { fallback: "-" })}x`, color: tileColors.success };
    const p = ratio - 1;
    return { text: `${p >= 0 ? "+" : ""}${Math.round(p * 100)}%`, color: p >= 0 ? tileColors.success : tileColors.danger };
  };

  return elysiumTileResponse(
    <TileFrame
      title="Most used contracts"
      pill={window}
      badge={<ElysiumBadge />}
      eyebrow={`Elysium testnet · calls, last ${window}`}
      hero={compactCount(total, { fallback: "-" })}
      heroSub={`calls to the top ${rows.length} contracts`}
      footLeft="Non-spam transactions sent to each contract, vs the previous window"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <RankList
        columns={[
          { label: "Contract", width: 3 },
          { label: "Top function", width: 2.2 },
          { label: "Calls", width: 1.2, align: "right", mono: true },
          { label: "Callers", width: 1.1, align: "right", mono: true },
          { label: "Change", width: 1, align: "right", mono: true },
        ]}
        rows={rows.map((r) => ({
          key: r.address,
          cells: [
            r.label || r.symbol ? { text: clip(r.label ?? r.symbol, 22), sub: shortAddr(r.address) } : { text: shortAddr(r.address) },
            { text: clip(r.topMethods[0]?.name ?? "-", 18), color: tileColors.textSecondary },
            { text: compactCount(r.txs, { fallback: "-" }) },
            { text: compactCount(r.callers, { fallback: "-" }) },
            change(r),
          ],
        }))}
      />
    </TileFrame>,
    revalidate
  );
}
