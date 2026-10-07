import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, RankList, agoText, clip, elysiumTileResponse, loadElysium, shortAddr } from "@/lib/og/elysium";

/**
 * Newest DEX pools created on Elysium (PairCreated / PoolCreated events).
 *
 * `GET /api/tile/elysium-new-pools` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Pool {
  pool: string;
  factory: string;
  version: string;
  fee: number | null;
  token0: string;
  token1: string;
  token0Symbol: string | null;
  token1Symbol: string | null;
  createdAt: string;
  swaps24h: number;
}

export async function GET() {
  const d = await loadElysium<{ totals: { pools: number; pools24h: number }; newPools: Pool[] }>("/elysium/analytics/dex", revalidate);
  const rows = (d?.newPools ?? []).slice(0, 6);
  if (!d || rows.length < 3) return new Response("elysium new pools unavailable", { status: 503 });

  return elysiumTileResponse(
    <TileFrame
      title="Newest pools"
      pill="latest"
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · pools created"
      hero={compactCount(d.totals.pools24h, { fallback: "-" })}
      heroSub={`new pools in 24h · ${compactCount(d.totals.pools, { fallback: "-" })} since genesis`}
      footLeft="Pools decoded from Uniswap V2 PairCreated and V3 PoolCreated events"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <RankList
        columns={[
          { label: "Pair", width: 3.2 },
          { label: "Type", width: 1.3, mono: true },
          { label: "Factory", width: 1.6, mono: true },
          { label: "Created", width: 1.1, align: "right", mono: true },
        ]}
        rows={rows.map((p) => ({
          key: p.pool,
          cells: [
            { text: `${clip(p.token0Symbol, 14) || shortAddr(p.token0)} / ${clip(p.token1Symbol, 14) || shortAddr(p.token1)}` },
            { text: p.fee != null ? `${p.version.toUpperCase()} ${(p.fee / 10_000).toFixed(2)}%` : p.version.toUpperCase(), color: tileColors.textSecondary },
            { text: shortAddr(p.factory), color: tileColors.textSecondary },
            { text: agoText(p.createdAt) },
          ],
        }))}
      />
    </TileFrame>,
    revalidate
  );
}
