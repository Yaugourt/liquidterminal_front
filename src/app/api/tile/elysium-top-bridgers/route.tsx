import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, RankList, elysiumTileResponse, loadElysium, shortAddr } from "@/lib/og/elysium";

/**
 * Most active bridgers over 14 days, by number of transfers, with their HYPE
 * moved in and out.
 *
 * `GET /api/tile/elysium-top-bridgers` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Bridger { address: string; transfers: number; hypeIn: number; hypeOut: number }

const hype = (v: number) => (v === 0 ? "0" : v < 10 ? v.toFixed(2) : compactCount(v, { fallback: "-" }));

export async function GET() {
  const d = await loadElysium<{ topBridgers: Bridger[] }>("/elysium/analytics/bridge?days=14", revalidate);
  const rows = (d?.topBridgers ?? []).slice(0, 6);
  if (rows.length < 3) return new Response("elysium bridgers unavailable", { status: 503 });

  return elysiumTileResponse(
    <TileFrame
      title="Most active bridgers"
      pill="14d"
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · HyperEVM bridge, by address"
      hero={compactCount(rows[0].transfers, { fallback: "-" })}
      heroSub="bridge transfers from the most active address"
      footLeft="Transfers of any token; HYPE columns count native HYPE only"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <RankList
        columns={[
          { label: "Address", width: 2.4, mono: true },
          { label: "Transfers", width: 1.2, align: "right", mono: true },
          { label: "HYPE in", width: 1.2, align: "right", mono: true },
          { label: "HYPE out", width: 1.2, align: "right", mono: true },
        ]}
        rows={rows.map((b) => ({
          key: b.address,
          cells: [
            { text: shortAddr(b.address) },
            { text: compactCount(b.transfers, { fallback: "-" }) },
            { text: hype(b.hypeIn), color: b.hypeIn > 0 ? tileColors.success : tileColors.textTertiary },
            { text: hype(b.hypeOut), color: b.hypeOut > 0 ? tileColors.danger : tileColors.textTertiary },
          ],
        }))}
      />
    </TileFrame>,
    revalidate
  );
}
