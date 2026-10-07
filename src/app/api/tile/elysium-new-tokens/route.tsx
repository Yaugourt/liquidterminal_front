import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, RankList, agoText, clip, elysiumTileResponse, loadElysium } from "@/lib/og/elysium";

/**
 * New ERC-20 tokens first seen on Elysium in the last 24h, ranked by
 * transfers, with their holder count.
 *
 * `GET /api/tile/elysium-new-tokens` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Token { address: string; name: string | null; symbol: string | null; origin: string | null; firstSeen: string; transfers: number; holders: number | null }

export async function GET() {
  const d = await loadElysium<{ totals: { launched24h: number; named24h: number }; newTokens24h: Token[] }>("/elysium/analytics/tokens", revalidate);
  const rows = (d?.newTokens24h ?? []).filter((t) => t.symbol).slice(0, 6);
  if (!d || rows.length < 3) return new Response("elysium new tokens unavailable", { status: 503 });

  return elysiumTileResponse(
    <TileFrame
      title="New tokens"
      pill="24h"
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · first seen in the last 24h"
      hero={compactCount(d.totals.launched24h, { fallback: "-" })}
      heroSub={`ERC-20 tokens launched · ${compactCount(d.totals.named24h, { fallback: "-" })} with a symbol`}
      footLeft="Most transferred of the new tokens. Testnet tokens, no market value"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <RankList
        columns={[
          { label: "Token", width: 3.4 },
          { label: "Transfers", width: 1.1, align: "right", mono: true },
          { label: "Holders", width: 1, align: "right", mono: true },
          { label: "First seen", width: 1.1, align: "right", mono: true },
        ]}
        rows={rows.map((t) => ({
          key: t.address,
          cells: [
            { text: clip(t.symbol, 14), sub: t.name && t.name !== t.symbol ? clip(t.name, 26) : undefined },
            { text: compactCount(t.transfers, { fallback: "-" }) },
            { text: compactCount(t.holders, { fallback: "-" }) },
            { text: agoText(t.firstSeen), color: tileColors.textSecondary },
          ],
        }))}
      />
    </TileFrame>,
    revalidate
  );
}
