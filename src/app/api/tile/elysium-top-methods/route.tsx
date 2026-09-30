import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, RankList, clip, elysiumTileResponse, loadElysium, pctText } from "@/lib/og/elysium";

/**
 * Most called functions on Elysium (non-spam calls to a contract), named from
 * a public signature database; unresolved selectors stay as hex.
 *
 * `GET /api/tile/elysium-top-methods?window=24h|7d` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Methods {
  totals: { calls: number; plainTransfers: number; contractCreations: number };
  rows: { methodId: string; name: string | null; txs: number; share: number; senders: number; contracts: number }[];
}

export async function GET(req: Request) {
  const window = new URL(req.url).searchParams.get("window") === "7d" ? "7d" : "24h";
  const d = await loadElysium<Methods>(`/elysium/analytics/methods?window=${window}`, revalidate);
  const rows = (d?.rows ?? []).slice(0, 6);
  if (!d || rows.length < 3) return new Response("elysium methods unavailable", { status: 503 });

  return elysiumTileResponse(
    <TileFrame
      title="Most called functions"
      pill={window}
      badge={<ElysiumBadge />}
      eyebrow={`Elysium testnet · contract calls, last ${window}`}
      hero={compactCount(d.totals.calls, { fallback: "-" })}
      heroSub={`contract calls · ${compactCount(d.totals.contractCreations, { fallback: "-" })} deployments · ${compactCount(d.totals.plainTransfers, { fallback: "-" })} plain transfers`}
      footLeft="Function names resolved from their 4-byte selector"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <RankList
        columns={[
          { label: "Function", width: 3, mono: true },
          { label: "Calls", width: 1.2, align: "right", mono: true },
          { label: "Share", width: 1, align: "right", mono: true },
          { label: "Senders", width: 1.2, align: "right", mono: true },
          { label: "Contracts", width: 1.2, align: "right", mono: true },
        ]}
        rows={rows.map((r) => ({
          key: r.methodId,
          cells: [
            { text: clip(r.name ?? r.methodId, 26), color: r.name ? tileColors.textPrimary : tileColors.textSecondary },
            { text: compactCount(r.txs, { fallback: "-" }) },
            { text: pctText(r.share, 1) },
            { text: compactCount(r.senders, { fallback: "-" }) },
            { text: compactCount(r.contracts, { fallback: "-" }) },
          ],
        }))}
      />
    </TileFrame>,
    revalidate
  );
}
