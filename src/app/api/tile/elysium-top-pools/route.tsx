import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, RankList, clip, elysiumTileResponse, loadElysium, shortAddr } from "@/lib/og/elysium";

/**
 * Most traded DEX pools on Elysium over the last 24h (Uniswap V2/V3 style
 * pools decoded from their Swap events).
 *
 * `GET /api/tile/elysium-top-pools` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Pool {
  pool: string;
  version: string;
  fee: number | null;
  token0: string;
  token1: string;
  token0Symbol: string | null;
  token1Symbol: string | null;
  swaps24h: number;
  traders24h: number;
}

export async function GET() {
  const d = await loadElysium<{ totals: { swaps24h: number; traders24h: number }; topPools24h: Pool[] }>("/elysium/analytics/dex", revalidate);
  const rows = (d?.topPools24h ?? []).filter((p) => p.swaps24h > 0).slice(0, 6);
  if (!d || rows.length === 0) return new Response("elysium pools unavailable", { status: 503 });

  return elysiumTileResponse(
    <TileFrame
      title="Most traded pools"
      pill="24h"
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · DEX swaps, last 24h"
      hero={compactCount(d.totals.swaps24h, { fallback: "-" })}
      heroSub={`swaps by ${compactCount(d.totals.traders24h, { fallback: "-" })} traders`}
      footLeft="Pools and swaps decoded from Uniswap V2 and V3 style events"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <RankList
        columns={[
          { label: "Pair", width: 3.4 },
          { label: "Type", width: 1.4, mono: true },
          { label: "Swaps", width: 1, align: "right", mono: true },
          { label: "Traders", width: 1, align: "right", mono: true },
        ]}
        rows={rows.map((p) => ({
          key: p.pool,
          cells: [
            { text: `${clip(p.token0Symbol, 14) || shortAddr(p.token0)} / ${clip(p.token1Symbol, 14) || shortAddr(p.token1)}`, sub: shortAddr(p.pool) },
            { text: p.fee != null ? `${p.version.toUpperCase()} ${(p.fee / 10_000).toFixed(2)}%` : p.version.toUpperCase(), color: tileColors.textSecondary },
            { text: compactCount(p.swaps24h, { fallback: "-" }) },
            { text: compactCount(p.traders24h, { fallback: "-" }) },
          ],
        }))}
      />
    </TileFrame>,
    revalidate
  );
}
