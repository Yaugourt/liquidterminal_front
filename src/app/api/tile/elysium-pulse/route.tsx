import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, StatRow, elysiumTileResponse, loadElysium } from "@/lib/og/elysium";

/**
 * Elysium since genesis: blocks, transactions, senders, contracts and the
 * last batch settled on HyperEVM.
 *
 * `GET /api/tile/elysium-pulse` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 300;

interface Stats {
  total_blocks: number;
  total_transactions: number;
  unique_senders: number;
  contracts_created: number;
  first_block_time: string;
  last_block_time: string;
  last_batch_number: number;
}

export async function GET() {
  const s = await loadElysium<Stats>("/indexer/elysium/stats", revalidate);
  if (!s) return new Response("elysium stats unavailable", { status: 503 });

  // Upstream times are UTC without a zone suffix.
  const days = Math.floor((Date.parse(`${s.last_block_time}Z`) - Date.parse(`${s.first_block_time}Z`)) / 864e5);
  const genesis = new Date(`${s.first_block_time}Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

  return elysiumTileResponse(
    <TileFrame
      title="Elysium pulse"
      pill="since genesis"
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · blocks produced"
      hero={s.total_blocks.toLocaleString("en-US")}
      heroSub={`in ${days} days`}
      footLeft={`Genesis ${genesis} · chain 99801 · L2 on HyperEVM`}
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <StatRow
        marginTop={40}
        cells={[
          { label: "Transactions", value: compactCount(s.total_transactions, { fallback: "-" }) },
          { label: "Unique senders", value: compactCount(s.unique_senders, { fallback: "-" }) },
          { label: "Contracts created", value: compactCount(s.contracts_created, { fallback: "-" }) },
          { label: "Last batch on HyperEVM", value: `#${s.last_batch_number}` },
        ]}
      />
    </TileFrame>,
    revalidate
  );
}
