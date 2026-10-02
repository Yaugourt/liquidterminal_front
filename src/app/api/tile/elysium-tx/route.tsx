import type { Hex } from "viem";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ElysiumBadge, RankList, StatRow, clip, elysiumTileResponse, shortAddr, untrusted } from "@/lib/og/elysium";
import { elysiumTxClient } from "@/lib/og/elysium-rpc";
import { TX_HASH_RE, fmtAmount, inspectTx } from "@/lib/elysium/tx";

/**
 * One Elysium transaction: what it called, its status, the fee split between
 * execution and posting to HyperEVM, and the biggest balance changes.
 *
 * `GET /api/tile/elysium-tx?hash=0x…` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 3600;

const C = tileColors;

export async function GET(req: Request) {
  const hash = new URL(req.url).searchParams.get("hash")?.toLowerCase() ?? "";
  if (!TX_HASH_RE.test(hash)) return new Response("not a transaction hash", { status: 400 });
  const tx = await inspectTx(elysiumTxClient as never, hash as Hex).catch(() => null);
  if (!tx) return new Response("transaction not found on Elysium", { status: 404 });

  const fn = tx.call?.name
    ? untrusted(tx.call.name.split("(")[0], 28)
    : tx.to
      ? tx.input === "0x" ? "HYPE transfer" : tx.call?.selector ?? "call"
      : "Contract creation";
  const inner = tx.call?.inner.length ? ` → ${tx.call.inner.map((c) => untrusted(c.name?.split("(")[0] ?? c.selector, 18)).join(", ")}` : "";
  const posting = tx.fee > 0n ? Number((tx.feePosting * 10_000n) / tx.fee) / 100 : 0;
  const status = tx.status === "success" ? "Success" : tx.status === "reverted" ? "Reverted" : "Pending";
  const changes = [...tx.balanceChanges]
    .sort((a, b) => (b.delta < 0n ? -b.delta : b.delta) > (a.delta < 0n ? -a.delta : a.delta) ? 1 : -1)
    .slice(0, 4);

  return elysiumTileResponse(
    <TileFrame
      title="Transaction on Elysium"
      pill={`${hash.slice(0, 10)}…${hash.slice(-6)}`}
      badge={<ElysiumBadge />}
      eyebrow={`Elysium testnet · ${tx.typeLabel} · ${status}`}
      hero={clip(fn, 22)}
      heroSub={clip(`${shortAddr(tx.from)} → ${tx.to ? shortAddr(tx.to) : "new contract"}${inner}`, 90)}
      footLeft="Decoded from public Elysium RPC data · signatures from the public signature database"
      footNote={`liquidterminal.xyz/elysium/tx · block ${tx.block?.toLocaleString("en-US") ?? "pending"}`}
    >
      <StatRow
        marginTop={18}
        cells={[
          { label: "Status", value: status, color: tx.status === "success" ? C.success : tx.status === "reverted" ? C.danger : C.warn },
          { label: "Fee", value: tx.system ? "none" : `${fmtAmount(tx.fee, 18, 9)} HYPE` },
          { label: "Posting to HyperEVM", value: tx.system ? "-" : `${posting.toFixed(posting < 1 ? 2 : 1)}%`, color: C.warn },
          { label: "Events", value: String(tx.logs.length) },
        ]}
      />
      {changes.length ? (
        <RankList
          marginTop={22}
          columns={[
            { label: "Balance change", width: 2, mono: true },
            { label: "Asset", width: 1, mono: true },
            { label: "Amount", width: 2, align: "right", mono: true },
          ]}
          rows={changes.map((c) => ({
            key: `${c.address}-${c.asset}`,
            cells: [
              { text: shortAddr(c.address) },
              { text: untrusted(c.symbol, 10) || "token", color: C.textSecondary },
              { text: `${c.delta > 0n ? "+" : ""}${clip(fmtAmount(c.delta, c.decimals, 4), 22)}`, color: c.delta > 0n ? C.success : C.danger },
            ],
          }))}
        />
      ) : null}
    </TileFrame>,
    tx.pending ? 30 : 86_400
  );
}
