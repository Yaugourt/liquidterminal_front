import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileSeries } from "@/lib/og/tileTheme";
import { BarChart, ELYSIUM_FOOTNOTE, ElysiumBadge, StatRow, elysiumTileResponse, loadElysium } from "@/lib/og/elysium";

/**
 * Settlement on HyperEVM: the batches the sequencer posts to the parent
 * chain, how many Elysium blocks each carries and how fast it lands.
 *
 * `GET /api/tile/elysium-settlement` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Batch { batch_number: number; parent_block: number; block_count: number; posting_delay_s: number; parent_time: string }

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
};
const dur = (s: number | null) => (s == null ? "-" : s < 90 ? `${Math.round(s)}s` : `${Math.round(s / 60)}m`);

export async function GET() {
  const batches = await loadElysium<Batch[]>("/indexer/elysium/batches?limit=50", revalidate);
  const list = (batches ?? []).filter((b) => Number.isFinite(b.posting_delay_s));
  if (list.length < 5) return new Response("elysium settlement unavailable", { status: 503 });
  const last = list[0];
  const recent = list.slice(0, 12).reverse();

  return elysiumTileResponse(
    <TileFrame
      title="Settlement on HyperEVM"
      pill={`last ${list.length} batches`}
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · batches posted to the parent chain"
      hero={dur(median(list.map((b) => b.posting_delay_s)))}
      heroSub="median delay from a batch's last block to its posting on HyperEVM"
      footLeft="Each batch carries a run of Elysium blocks; bars show blocks per batch"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <StatRow
        marginTop={18}
        cells={[
          { label: "Latest batch", value: `#${last.batch_number}` },
          { label: "Blocks per batch, median", value: compactCount(median(list.map((b) => b.block_count)), { fallback: "-" }) },
          { label: "HyperEVM block", value: `#${last.parent_block.toLocaleString("en-US")}` },
        ]}
      />
      <BarChart
        height={72}
        marginTop={12}
        bars={recent.map((b) => ({ label: `#${b.batch_number}`, value: b.block_count, color: tileSeries.cyan, valueText: compactCount(b.block_count, { fallback: "-" }) }))}
      />
    </TileFrame>,
    revalidate
  );
}
