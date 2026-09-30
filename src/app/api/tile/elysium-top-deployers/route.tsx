import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, RankList, agoText, completeDays, elysiumTileResponse, loadElysium, shortAddr } from "@/lib/og/elysium";

/**
 * Addresses that deployed the most contracts on Elysium over 14 days.
 *
 * `GET /api/tile/elysium-top-deployers` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Deployments {
  daily: { day: string; partial?: boolean; deployments: number; deployers: number }[];
  topDeployers: { address: string; deployments: number; firstDeploy: string; lastDeploy: string }[];
}

export async function GET() {
  const d = await loadElysium<Deployments>("/elysium/analytics/deployments?days=14", revalidate);
  const rows = (d?.topDeployers ?? []).slice(0, 6);
  const days = completeDays(d?.daily);
  if (!d || rows.length < 3) return new Response("elysium deployers unavailable", { status: 503 });
  const total = days.reduce((s, r) => s + r.deployments, 0);

  return elysiumTileResponse(
    <TileFrame
      title="Top deployers"
      pill="14d"
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · contracts deployed per address"
      hero={compactCount(rows[0].deployments, { fallback: "-" })}
      heroSub={`contracts from the busiest deployer · ${compactCount(total, { fallback: "-" })} deployed over ${days.length} days`}
      footLeft="Contract creations by deployer address, 14 days"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <RankList
        columns={[
          { label: "Deployer", width: 2.4, mono: true },
          { label: "Contracts", width: 1.2, align: "right", mono: true },
          { label: "First deploy", width: 1.3, align: "right", mono: true },
          { label: "Last deploy", width: 1.3, align: "right", mono: true },
        ]}
        rows={rows.map((r) => ({
          key: r.address,
          cells: [
            { text: shortAddr(r.address) },
            { text: compactCount(r.deployments, { fallback: "-" }) },
            { text: agoText(r.firstDeploy), color: tileColors.textSecondary },
            { text: agoText(r.lastDeploy), color: tileColors.textSecondary },
          ],
        }))}
      />
    </TileFrame>,
    revalidate
  );
}
