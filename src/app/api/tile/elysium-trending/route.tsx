import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, RankList, agoText, clip, elysiumTileResponse, loadElysium, shortAddr } from "@/lib/og/elysium";

/**
 * New contracts gaining users: contracts deployed recently, ranked by the
 * distinct addresses that called them in the last 24h.
 *
 * `GET /api/tile/elysium-trending` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Trending { address: string; deployer: string; deployedAt: string; callers24h: number; txs24h: number; symbol: string | null }

export async function GET() {
  const d = await loadElysium<{ trending: Trending[] }>("/elysium/analytics/deployments?days=14", revalidate);
  const rows = (d?.trending ?? []).slice(0, 6);
  if (rows.length < 3) return new Response("elysium trending unavailable", { status: 503 });

  return elysiumTileResponse(
    <TileFrame
      title="New contracts gaining users"
      pill="24h"
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · recently deployed, most callers"
      hero={compactCount(rows[0].callers24h, { fallback: "-" })}
      heroSub={`callers in 24h for the top new contract, deployed ${agoText(rows[0].deployedAt)}`}
      footLeft="Distinct addresses calling each new contract over the last 24h"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <RankList
        columns={[
          { label: "Contract", width: 2.4 },
          { label: "Deployer", width: 1.8, mono: true },
          { label: "Callers", width: 1, align: "right", mono: true },
          { label: "Calls", width: 1, align: "right", mono: true },
          { label: "Deployed", width: 1.1, align: "right", mono: true },
        ]}
        rows={rows.map((r) => ({
          key: r.address,
          cells: [
            r.symbol ? { text: clip(r.symbol, 12), sub: shortAddr(r.address) } : { text: shortAddr(r.address) },
            { text: shortAddr(r.deployer), color: tileColors.textSecondary },
            { text: compactCount(r.callers24h, { fallback: "-" }) },
            { text: compactCount(r.txs24h, { fallback: "-" }) },
            { text: agoText(r.deployedAt), color: tileColors.textSecondary },
          ],
        }))}
      />
    </TileFrame>,
    revalidate
  );
}
