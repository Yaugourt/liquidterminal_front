import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, StatRow, elysiumTileResponse } from "@/lib/og/elysium";
import { readElysiumSpecs } from "@/lib/og/elysium-rpc";

/**
 * Elysium network specs read live from the RPC and the Arbitrum precompiles:
 * ArbOS and Stylus versions, block time, gas price, speed limit, posting cost.
 *
 * `GET /api/tile/elysium-network` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 900;

const gwei = (v: number) => `${v.toLocaleString("en-US", { maximumFractionDigits: 6 })} gwei`;

export async function GET() {
  const n = await readElysiumSpecs().catch(() => null);
  if (!n) return new Response("elysium network unavailable", { status: 503 });

  return elysiumTileResponse(
    <TileFrame
      title="Network specs"
      pill="live"
      badge={<ElysiumBadge />}
      eyebrow={`Elysium testnet · chain ${n.chainId}, settled on HyperEVM`}
      hero={`${n.blockTimeS.toFixed(2)}s`}
      heroSub={`mean block time over the last ${n.sampleBlocks} blocks · block #${n.head.toLocaleString("en-US")}`}
      footLeft="Read from the RPC and the Arbitrum precompiles (ArbSys, ArbGasInfo, ArbWasm)"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <StatRow
        marginTop={20}
        cells={[
          { label: "ArbOS", value: String(n.arbOS) },
          { label: "Stylus", value: n.stylus != null ? `v${n.stylus}` : "-" },
          { label: "Gas price", value: gwei(n.gasPriceGwei), color: tileColors.warn },
          { label: "Speed limit", value: `${compactCount(n.speedLimit, { fallback: "-" })} gas/s` },
        ]}
      />
      <StatRow
        marginTop={22}
        cells={[
          { label: "Max gas per tx", value: compactCount(n.txGasLimit, { fallback: "-" }) },
          { label: "Per byte posted", value: gwei(n.perByteGwei) },
          { label: "Transfer cost (HYPE)", value: n.transferHype.toLocaleString("en-US", { maximumSignificantDigits: 3 }) },
          { label: "Retryables expire", value: `${n.retryableDays} days` },
        ]}
      />
    </TileFrame>,
    revalidate
  );
}
