import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, RankList, elysiumTileResponse, loadElysium, pctText, shortAddr } from "@/lib/og/elysium";

/**
 * Busiest senders of the last 24h and how concentrated activity is: the share
 * of all non-spam transactions sent by the top 10 addresses.
 *
 * `GET /api/tile/elysium-top-senders` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Users {
  concentration24h: { senders: number; txs: number; top1Share: number; top10Share: number };
  topSenders24h: { address: string; txs: number; share: number; distinctTargets: number }[];
}

export async function GET() {
  const d = await loadElysium<Users>("/elysium/analytics/users?days=14", revalidate);
  const rows = (d?.topSenders24h ?? []).slice(0, 6);
  if (!d || rows.length < 3) return new Response("elysium senders unavailable", { status: 503 });
  const c = d.concentration24h;

  return elysiumTileResponse(
    <TileFrame
      title="Busiest senders"
      pill="24h"
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · who sends the transactions"
      hero={pctText(c.top10Share, 1)}
      heroColor={c.top10Share > 0.5 ? tileColors.danger : undefined}
      heroSub={`of ${compactCount(c.txs, { fallback: "-" })} txs sent by the top 10 of ${compactCount(c.senders, { fallback: "-" })} senders`}
      footLeft="Non-spam transactions in the last 24h, and how many distinct addresses each sender targeted"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <RankList
        columns={[
          { label: "Sender", width: 2.4, mono: true },
          { label: "Txs", width: 1.1, align: "right", mono: true },
          { label: "Share", width: 1, align: "right", mono: true },
          { label: "Distinct targets", width: 1.6, align: "right", mono: true },
        ]}
        rows={rows.map((s) => ({
          key: s.address,
          cells: [
            { text: shortAddr(s.address) },
            { text: compactCount(s.txs, { fallback: "-" }) },
            { text: pctText(s.share, 1) },
            { text: compactCount(s.distinctTargets, { fallback: "-" }), color: tileColors.textSecondary },
          ],
        }))}
      />
    </TileFrame>,
    revalidate
  );
}
