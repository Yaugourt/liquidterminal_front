import { useDataFetching } from "@/hooks/useDataFetching";
import { ELYSIUM_RPC_URL } from "./api";
import { SNAPSHOT_BASE, SNAPSHOT_POINTER } from "./snapshot-config";

// Kept here so existing imports of the constants keep working.
export { SNAPSHOT_BASE, SNAPSHOT_POINTER };

export interface ElysiumSnapshotFile {
  name: string;
  block: number;
  sizeBytes: number;
  publishedMs: number;
}

export interface ElysiumSnapshots {
  /** Archives currently in the bucket, newest first. */
  files: ElysiumSnapshotFile[];
  latest: ElysiumSnapshotFile | null;
  latestSha256: string | null;
  /** Timestamp of the block the latest archive was taken at. */
  latestBlockMs: number | null;
}

const ARCHIVE_RE = /^elysium-archive_(\d+)\.tar$/;

async function text(url: string): Promise<string> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.text();
}

/** Parses the S3-style bucket listing into archive entries. */
function parseListing(xml: string): ElysiumSnapshotFile[] {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const out: ElysiumSnapshotFile[] = [];
  doc.querySelectorAll("Contents").forEach((c) => {
    const name = c.querySelector("Key")?.textContent ?? "";
    const m = ARCHIVE_RE.exec(name);
    if (!m) return;
    out.push({
      name,
      block: Number(m[1]),
      sizeBytes: Number(c.querySelector("Size")?.textContent ?? 0),
      publishedMs: Date.parse(c.querySelector("LastModified")?.textContent ?? ""),
    });
  });
  return out.sort((a, b) => b.block - a.block);
}

async function blockTimeMs(block: number): Promise<number | null> {
  try {
    const res = await fetch(ELYSIUM_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber", params: [`0x${block.toString(16)}`, false] }),
    });
    const json = (await res.json()) as { result?: { timestamp?: string } };
    const ts = json.result?.timestamp ? parseInt(json.result.timestamp, 16) : NaN;
    return Number.isFinite(ts) ? ts * 1000 : null;
  } catch {
    return null;
  }
}

export async function fetchElysiumSnapshots(): Promise<ElysiumSnapshots> {
  const [listing, pointer] = await Promise.all([text(`${SNAPSHOT_BASE}/`), text(SNAPSHOT_POINTER)]);
  const files = parseListing(listing);
  // The pointer file is what Nitro follows, so it wins over "highest block in the listing".
  const latestName = pointer.trim();
  const latest = files.find((f) => f.name === latestName) ?? files[0] ?? null;
  const [latestSha256, latestBlockMs] = latest
    ? await Promise.all([
        text(`${SNAPSHOT_BASE}/${latest.name}.sha256`).then((t) => t.trim().split(/\s+/)[0] || null).catch(() => null),
        blockTimeMs(latest.block),
      ])
    : [null, null];
  return { files, latest, latestSha256, latestBlockMs };
}

/** Snapshots are published once a day: a 10 min poll is plenty. */
export const useElysiumSnapshots = () =>
  useDataFetching<ElysiumSnapshots>({ fetchFn: fetchElysiumSnapshots, refreshInterval: 600_000, maxRetries: 1 });
