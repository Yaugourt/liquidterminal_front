import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, RankList, clip, elysiumTileResponse, loadElysium } from "@/lib/og/elysium";

/**
 * Assets moved over the HyperEVM to Elysium bridge in 14 days, per token and
 * route. Rows without a symbol carry raw unscaled amounts upstream: left out.
 *
 * `GET /api/tile/elysium-bridged-assets` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Tok { symbol: string; route: string; deposits: number; withdrawals: number; amountIn: number; amountOut: number }

export async function GET() {
  const d = await loadElysium<{ tokens: Tok[] }>("/elysium/analytics/bridge?days=14", revalidate);
  const all = (d?.tokens ?? []).filter((t) => t.symbol);
  const rows = [...all].sort((a, b) => b.deposits + b.withdrawals - (a.deposits + a.withdrawals)).slice(0, 6);
  if (rows.length < 3) return new Response("elysium bridged assets unavailable", { status: 503 });
  const transfers = all.reduce((s, t) => s + t.deposits + t.withdrawals, 0);

  return elysiumTileResponse(
    <TileFrame
      title="Bridged assets"
      pill="14d"
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · HyperEVM bridge, by token"
      hero={compactCount(transfers, { fallback: "-" })}
      heroSub={`bridge transfers across ${all.length} tokens`}
      footLeft="Amounts in token units (testnet, no prices). Routes: native HYPE, canonical, mirror"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <RankList
        columns={[
          { label: "Token", width: 1.8 },
          { label: "Route", width: 1.2, mono: true },
          { label: "In", width: 1.2, align: "right", mono: true },
          { label: "Out", width: 1.2, align: "right", mono: true },
          { label: "Transfers", width: 1.1, align: "right", mono: true },
        ]}
        rows={rows.map((t) => ({
          key: `${t.route}-${t.symbol}`,
          cells: [
            { text: clip(t.symbol, 12) },
            { text: t.route, color: tileColors.textSecondary },
            { text: compactCount(t.amountIn, { fallback: "-" }), color: t.amountIn > 0 ? tileColors.success : tileColors.textTertiary },
            { text: compactCount(t.amountOut, { fallback: "-" }), color: t.amountOut > 0 ? tileColors.danger : tileColors.textTertiary },
            { text: compactCount(t.deposits + t.withdrawals, { fallback: "-" }) },
          ],
        }))}
      />
    </TileFrame>,
    revalidate
  );
}
