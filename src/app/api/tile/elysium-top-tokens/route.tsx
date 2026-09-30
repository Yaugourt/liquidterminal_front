import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, RankList, clip, elysiumTileResponse, loadElysium } from "@/lib/og/elysium";

/**
 * Most transferred ERC-20 tokens on Elysium since genesis, with holders.
 *
 * `GET /api/tile/elysium-top-tokens` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Token { address: string; name: string | null; symbol: string | null; origin: string | null; transfers: number; holders: number | null }

export async function GET() {
  const d = await loadElysium<{ totals: { tokens: number; named: number }; topTokens: Token[] }>("/elysium/analytics/tokens", revalidate);
  const rows = (d?.topTokens ?? []).filter((t) => t.symbol).slice(0, 6);
  if (!d || rows.length < 3) return new Response("elysium top tokens unavailable", { status: 503 });

  return elysiumTileResponse(
    <TileFrame
      title="Most transferred tokens"
      pill="since genesis"
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · ERC-20 transfers"
      hero={compactCount(d.totals.tokens, { fallback: "-" })}
      heroSub={`ERC-20 tokens seen · ${compactCount(d.totals.named, { fallback: "-" })} with a symbol`}
      footLeft="Transfers and holders since genesis. Testnet tokens, no market value"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <RankList
        columns={[
          { label: "Token", width: 3.2 },
          { label: "Origin", width: 1.2, mono: true },
          { label: "Transfers", width: 1.1, align: "right", mono: true },
          { label: "Holders", width: 1, align: "right", mono: true },
        ]}
        rows={rows.map((t) => ({
          key: t.address,
          cells: [
            { text: clip(t.symbol, 14), sub: t.name && t.name !== t.symbol ? clip(t.name, 24) : undefined },
            { text: t.origin ?? "-", color: tileColors.textSecondary },
            { text: compactCount(t.transfers, { fallback: "-" }) },
            { text: compactCount(t.holders, { fallback: "-" }) },
          ],
        }))}
      />
    </TileFrame>,
    revalidate
  );
}
