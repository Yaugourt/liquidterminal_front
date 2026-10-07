import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, RankList, clip, elysiumTileResponse, loadElysium, shortAddr } from "@/lib/og/elysium";
import { fmtHypeFee } from "@/components/elysium/fee-format";
import type { ElysiumFeesAnalytics } from "@/services/elysium/types";

/**
 * Who pays for Elysium blockspace: gas fees by called contract over 24h, 7d
 * or 30d (non-spam txs, full receipt fee), with each one's share of all fees.
 *
 * `GET /api/tile/elysium-app-fees?window=24h|7d|30d` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("window");
  const window = raw === "24h" || raw === "30d" ? raw : "7d";
  const d = await loadElysium<ElysiumFeesAnalytics>(`/elysium/analytics/fees?window=${window}`, revalidate);
  const rows = (d?.contracts ?? []).slice(0, 6);
  if (!d || rows.length < 3) return new Response("elysium fees unavailable", { status: 503 });
  const t = d.totals;
  const pct = (v: number) => `${(v * 100).toFixed(v >= 0.1 ? 0 : 1)}%`;

  return elysiumTileResponse(
    <TileFrame
      title="Fees by app"
      pill={window}
      badge={<ElysiumBadge />}
      eyebrow={`Elysium testnet · gas fees, last ${window}`}
      hero={`${fmtHypeFee(t.feesHype)} HYPE`}
      heroSub={`${pct(t.appShare)} paid calling apps · ${pct(t.systemShare)} system · ${t.txs.toLocaleString("en-US")} txs`}
      footLeft="Full fee of each non-spam tx, grouped by the contract it called"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <RankList
        columns={[
          { label: "Contract", width: 3 },
          { label: "Deployer", width: 2 },
          { label: "Fees (HYPE)", width: 1.4, align: "right", mono: true },
          { label: "Share", width: 1, align: "right", mono: true },
          { label: "Txs", width: 1, align: "right", mono: true },
        ]}
        rows={rows.map((r) => ({
          key: r.address,
          cells: [
            r.label || r.symbol ? { text: clip(r.label ?? r.symbol, 22), sub: shortAddr(r.address) } : { text: shortAddr(r.address) },
            { text: r.kind === "precompile" ? "system" : r.deployer ? shortAddr(r.deployer) : "-", color: tileColors.textSecondary },
            { text: fmtHypeFee(r.feesHype), color: tileColors.warn },
            { text: pct(r.share) },
            { text: r.txs.toLocaleString("en-US") },
          ],
        }))}
      />
    </TileFrame>,
    revalidate
  );
}
