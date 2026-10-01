import { encodeDeployData, parseAbiItem } from "viem";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ElysiumBadge, RankList, elysiumTileResponse, utcStamp } from "@/lib/og/elysium";
import { readElysiumActionCosts } from "@/lib/og/elysium-rpc";
import { GREETER_BYTECODE, GREETER_CONSTRUCTOR } from "@/components/elysium/sim-samples";

/**
 * What everyday actions cost on Elysium right now: gas estimates of real
 * transactions (posting cost to HyperEVM included) at the live gas price.
 *
 * `GET /api/tile/elysium-costs` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

const fmtHype = (v: number) => v.toLocaleString("en-US", { maximumSignificantDigits: 3, maximumFractionDigits: 12 });

export async function GET() {
  const ctor = parseAbiItem(GREETER_CONSTRUCTOR);
  const deployData = encodeDeployData({ abi: [ctor], bytecode: GREETER_BYTECODE, args: ["gm Elysium"] });
  const c = await readElysiumActionCosts(deployData).catch(() => null);
  if (!c) return new Response("elysium costs unavailable", { status: 503 });
  const send = c.actions[0];

  return elysiumTileResponse(
    <TileFrame
      title="What it costs"
      pill="live"
      badge={<ElysiumBadge />}
      eyebrow={`Elysium testnet · fees at block ${c.head.toLocaleString("en-US")}`}
      hero={`${fmtHype(send.feeHype)} HYPE`}
      heroSub={`to send HYPE · gas price ${c.gasPriceGwei.toLocaleString("en-US", { maximumFractionDigits: 6 })} gwei`}
      footLeft="eth_estimateGas of each transaction (posting to HyperEVM included) x live gas price"
      footNote={`Source: Elysium testnet RPC, ${utcStamp()} UTC`}
    >
      <RankList
        marginTop={18}
        columns={[
          { label: "Action", width: 1.6 },
          { label: "Transaction", width: 2.4 },
          { label: "Gas", width: 1, align: "right", mono: true },
          { label: "Fee (HYPE)", width: 1.3, align: "right", mono: true },
        ]}
        rows={c.actions.map((a) => ({
          key: a.label,
          cells: [
            { text: a.label },
            { text: a.detail, color: tileColors.textSecondary },
            { text: a.gas.toLocaleString("en-US") },
            { text: fmtHype(a.feeHype), color: tileColors.warn },
          ],
        }))}
      />
    </TileFrame>,
    revalidate
  );
}
