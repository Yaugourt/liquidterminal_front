import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors } from "@/lib/og/tileTheme";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, StatRow, agoText, elysiumTileResponse } from "@/lib/og/elysium";
import { elysiumHead } from "@/lib/og/elysium-rpc";
import { SNAPSHOT_BASE, SNAPSHOT_POINTER } from "@/services/elysium/snapshot-config";

/**
 * Node bootstrap snapshots: the daily archive of the Elysium testnet state a
 * new node can start from, and how many blocks it still has to sync.
 *
 * `GET /api/tile/elysium-snapshot` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 1800;

interface Archive { name: string; block: number; size: number; published: string }

/** The bucket listing is S3 XML; a regex is enough server-side (no DOMParser). */
function parseListing(xml: string): Archive[] {
  const out: Archive[] = [];
  for (const m of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
    const key = /<Key>([^<]+)<\/Key>/.exec(m[1])?.[1] ?? "";
    const b = /^elysium-archive_(\d+)\.tar$/.exec(key);
    if (!b) continue;
    out.push({
      name: key,
      block: Number(b[1]),
      size: Number(/<Size>(\d+)<\/Size>/.exec(m[1])?.[1] ?? 0),
      published: /<LastModified>([^<]+)<\/LastModified>/.exec(m[1])?.[1] ?? "",
    });
  }
  return out.sort((a, b) => b.block - a.block);
}

export async function GET() {
  try {
    const [listing, pointer, head] = await Promise.all([
      fetch(`${SNAPSHOT_BASE}/`, { next: { revalidate } }).then((r) => (r.ok ? r.text() : "")),
      fetch(SNAPSHOT_POINTER, { next: { revalidate } }).then((r) => (r.ok ? r.text() : "")),
      elysiumHead(),
    ]);
    const files = parseListing(listing);
    const latest = files.find((f) => f.name === pointer.trim()) ?? files[0];
    if (!latest) return new Response("elysium snapshot unavailable", { status: 503 });
    const behind = Math.max(0, Number(head) - latest.block);

    return elysiumTileResponse(
      <TileFrame
        title="Run an Elysium node"
        pill="daily archive"
        badge={<ElysiumBadge />}
        eyebrow="Elysium testnet · bootstrap from a snapshot"
        hero={`#${latest.block.toLocaleString("en-US")}`}
        heroSub={`latest archive snapshot, published ${agoText(latest.published)}`}
        footLeft="Full archive state, SHA-256 verified, works with Nitro --init.latest"
        footNote={ELYSIUM_FOOTNOTE()}
      >
        <StatRow
          marginTop={24}
          cells={[
            { label: "Archive size", value: `${(latest.size / 1e9).toFixed(1)} GB` },
            { label: "Left to sync", value: `${compactCount(behind, { fallback: "-" })} blocks`, color: tileColors.brand },
            { label: "Archives kept", value: String(files.length) },
            { label: "Nitro", value: "v3.9.x" },
          ]}
        />
      </TileFrame>,
      revalidate
    );
  } catch {
    return new Response("elysium snapshot unavailable", { status: 503 });
  }
}
