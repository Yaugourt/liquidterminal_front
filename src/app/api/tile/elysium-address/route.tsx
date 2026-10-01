import { isAddress } from "viem";
import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, RankList, StatRow, agoText, clip, elysiumTileResponse, loadElysium, pctText, shortAddr } from "@/lib/og/elysium";

/**
 * One Elysium address: transactions, active days, contracts deployed, swaps,
 * bridged HYPE, behaviour tags and its most used functions. Without
 * `?address=`, the busiest sender of the last 24h.
 *
 * `GET /api/tile/elysium-address?address=0x…` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

const C = tileColors;

interface Profile {
  address: string;
  firstSeen: string | null;
  activity: { userTxs: number; activeDays: number; txs24h: number; share24h: number };
  deployer: { contracts: number };
  dex: { swaps: number };
  bridge: { hypeIn: number; hypeOut: number };
  topMethods: { methodId: string; name: string | null; txs: number }[];
  tags: { id: string; label: string }[];
}

export async function GET(req: Request) {
  let address = new URL(req.url).searchParams.get("address")?.toLowerCase() ?? "";
  let busiest = false;
  if (!address) {
    const users = await loadElysium<{ topSenders24h: { address: string }[] }>("/elysium/analytics/users?days=14", revalidate);
    address = users?.topSenders24h[0]?.address ?? "";
    busiest = true;
  }
  if (!isAddress(address)) return new Response("not an address", { status: 400 });
  const p = await loadElysium<Profile>(`/elysium/analytics/address/${address}`, revalidate);
  if (!p) return new Response("elysium address unavailable", { status: 503 });
  if (!p.activity.userTxs && !p.deployer.contracts) return new Response("no activity for this address", { status: 404 });
  const methods = p.topMethods.slice(0, 3);
  const total = p.topMethods.reduce((s, m) => s + m.txs, 0) || 1;

  return elysiumTileResponse(
    <TileFrame
      title={busiest ? "Busiest address, 24h" : "Address on Elysium"}
      pill={shortAddr(p.address)}
      badge={<ElysiumBadge />}
      eyebrow={`Elysium testnet · ${p.tags.length ? p.tags.map((t) => t.label).join(" · ") : "address profile"}`}
      hero={compactCount(p.activity.userTxs, { fallback: "-" })}
      heroSub={`transactions sent · ${p.firstSeen ? `first seen ${agoText(p.firstSeen)}` : "first seen unknown"} · ${pctText(p.activity.share24h, 1)} of network txs in 24h`}
      footLeft="Indexed transactions sent by this address; tags from its deploys, swaps, bridge use and send rate"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <StatRow
        marginTop={18}
        cells={[
          { label: "Active days", value: compactCount(p.activity.activeDays, { fallback: "-" }) },
          { label: "Contracts deployed", value: compactCount(p.deployer.contracts, { fallback: "-" }) },
          { label: "Swaps", value: compactCount(p.dex.swaps, { fallback: "-" }) },
          { label: "HYPE bridged in", value: compactCount(p.bridge.hypeIn, { fallback: "-" }), color: C.brand },
        ]}
      />
      {methods.length ? (
        <RankList
          marginTop={22}
          columns={[
            { label: "Most used", width: 3, mono: true },
            { label: "Txs", width: 1, align: "right", mono: true },
            { label: "Share", width: 1, align: "right", mono: true },
          ]}
          rows={methods.map((m) => ({
            key: m.methodId || m.name || "x",
            cells: [
              { text: clip(m.name ?? m.methodId, 30), color: m.name ? C.textPrimary : C.textSecondary },
              { text: compactCount(m.txs, { fallback: "-" }) },
              { text: m.txs / total < 0.005 ? "<1%" : m.txs < total && m.txs / total > 0.995 ? ">99%" : pctText(m.txs / total, 0) },
            ],
          }))}
        />
      ) : null}
    </TileFrame>,
    revalidate
  );
}
