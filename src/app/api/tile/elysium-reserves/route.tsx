import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, RankList, agoText, clip, elysiumTileResponse, loadElysium } from "@/lib/og/elysium";

/**
 * Bridge backing: what the HyperEVM escrow holds against what circulates on
 * Elysium, for native HYPE and the canonical token bridge. Mirror assets are
 * left out: their listing is truncated upstream.
 *
 * `GET /api/tile/elysium-reserves` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 900;

interface Reserve { snapshot_time: string; route: string; symbol: string; locked: number; supply: number; backed: boolean }

export async function GET() {
  const [native, canonical] = await Promise.all([
    loadElysium<Reserve[]>("/indexer/elysium/bridge/reserves?route=native", revalidate),
    loadElysium<Reserve[]>("/indexer/elysium/bridge/reserves?route=canonical", revalidate),
  ]);
  const hype = (native ?? []).find((r) => r.symbol === "HYPE");
  // Rows without a symbol report raw, unscaled amounts: not comparable, left out.
  const tokens = (canonical ?? []).filter((r) => r.symbol).sort((a, b) => b.locked - a.locked);
  if (!hype || tokens.length === 0) return new Response("elysium reserves unavailable", { status: 503 });
  const all = [hype, ...tokens];
  const backed = all.filter((r) => r.backed).length;
  const rows = all.slice(0, 5);

  return elysiumTileResponse(
    <TileFrame
      title="Bridge reserves"
      pill={`snapshot ${agoText(hype.snapshot_time)}`}
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · HyperEVM escrow vs Elysium supply"
      hero={`${backed} / ${all.length}`}
      heroColor={backed === all.length ? tileColors.success : tileColors.danger}
      heroSub={backed === all.length ? "assets fully backed (native HYPE and canonical bridge)" : "assets backed (native HYPE and canonical bridge)"}
      footLeft="Locked in the parent chain escrow vs circulating on Elysium, in token units"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <RankList
        columns={[
          { label: "Asset", width: 1.6 },
          { label: "Route", width: 1.3, mono: true },
          { label: "Locked", width: 1.3, align: "right", mono: true },
          { label: "On Elysium", width: 1.3, align: "right", mono: true },
          { label: "Backed", width: 1, align: "right", mono: true },
        ]}
        rows={rows.map((r) => ({
          key: `${r.route}-${r.symbol}`,
          cells: [
            { text: clip(r.symbol, 12) },
            { text: r.route, color: tileColors.textSecondary },
            { text: compactCount(r.locked, { fallback: "-" }) },
            { text: compactCount(r.supply, { fallback: "-" }) },
            r.backed ? { text: "yes", color: tileColors.success } : { text: "no", color: tileColors.danger },
          ],
        }))}
      />
    </TileFrame>,
    revalidate
  );
}
