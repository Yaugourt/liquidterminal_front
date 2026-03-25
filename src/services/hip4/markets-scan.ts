import { HIP4_CONFIG } from "@/lib/hip4/config";

const CHUNK = 1000;
const MAX_CHUNKS = 80;
const BETWEEN_MS = 120;

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function padUint(n: string | bigint) {
  const h = BigInt(n).toString(16);
  return "0".repeat(64 - h.length) + h;
}

function contestIdFromCreatedLog(log: { topics?: string[]; data?: string }) {
  if (log.topics && log.topics.length >= 2) {
    return BigInt(log.topics[1]!);
  }
  const d = (log.data && log.data.slice(2)) || "";
  if (d.length < 64) return null;
  return BigInt("0x" + d.slice(0, 64));
}

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(HIP4_CONFIG.rpc, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = (await res.json()) as { error?: { message?: string }; result?: unknown };
  if (j.error) throw new Error(j.error.message || "RPC error");
  return j.result;
}

async function latestBlockHex() {
  const h = (await rpc("eth_blockNumber", [])) as string;
  return parseInt(h, 16);
}

async function getLogsChunk(address: string, fromBlock: number, toBlock: number) {
  return rpc("eth_getLogs", [
    {
      address,
      topics: [HIP4_CONFIG.contestCreatedTopic],
      fromBlock: "0x" + fromBlock.toString(16),
      toBlock: "0x" + toBlock.toString(16),
    },
  ]) as Promise<Array<{ topics?: string[]; data?: string }>>;
}

async function ethCall(to: string, data: string) {
  return rpc("eth_call", [{ to, data }, "latest"]) as Promise<string>;
}

function decodeMerkleRoot(result: string) {
  if (!result || result.length < 66) return null;
  const v = BigInt(result);
  return v === 0n ? null : result;
}

function decodePoolWei(result: string) {
  if (!result || result === "0x") return 0n;
  return BigInt(result);
}

export function formatHypeWei(wei: bigint) {
  const w = Number(wei) / 1e18;
  if (!Number.isFinite(w)) return "—";
  return `${w.toFixed(4)} HYPE`;
}

export interface Hip4ContestRow {
  id: string;
  pool: bigint;
  root: boolean;
  status: string;
}

export interface Hip4ScanDeploymentResult {
  key: string;
  label: string;
  address: string;
  rows: Hip4ContestRow[];
  error: string | null;
}

async function collectContestIds(address: string) {
  const latest = await latestBlockHex();
  const ids = new Set<string>();
  let end = latest;
  let chunks = 0;
  while (chunks < MAX_CHUNKS && end >= 0) {
    const start = Math.max(0, end - CHUNK + 1);
    let logs: Array<{ topics?: string[]; data?: string }>;
    try {
      logs = await getLogsChunk(address, start, end);
    } catch {
      break;
    }
    for (const log of logs) {
      const id = contestIdFromCreatedLog(log);
      if (id != null) ids.add(id.toString());
    }
    end = start - 1;
    chunks++;
    await sleep(BETWEEN_MS);
  }
  return ids;
}

async function enrichRow(
  address: string,
  getPoolSel: string,
  contestIdStr: string
): Promise<Hip4ContestRow> {
  const idHex = padUint(contestIdStr);
  const pool = decodePoolWei(await ethCall(address, getPoolSel + idHex));
  const root = decodeMerkleRoot(await ethCall(address, HIP4_CONFIG.merkleRootSelector + idHex));
  let status: string;
  if (root) status = "Merkle root published";
  else if (pool > 0n) status = "Active (no root yet)";
  else status = "Created / empty pool";
  return { id: contestIdStr, pool, root: !!root, status };
}

export async function scanHip4Deployment(
  key: "v1" | "v2"
): Promise<Hip4ScanDeploymentResult> {
  const d = HIP4_CONFIG.contracts[key];
  try {
    const ids = await collectContestIds(d.address);
    const sorted = Array.from(ids).sort((a, b) => Number(BigInt(a) - BigInt(b)));
    const rows: Hip4ContestRow[] = [];
    for (const id of sorted) {
      rows.push(await enrichRow(d.address, d.getPoolSelector, id));
      await sleep(BETWEEN_MS);
    }
    rows.sort((a, b) => Number(b.pool - a.pool));
    return {
      key,
      label: d.label,
      address: d.address,
      rows,
      error: null,
    };
  } catch (e: unknown) {
    return {
      key,
      label: d.label,
      address: d.address,
      rows: [],
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export function scanFootnote() {
  return `Live scan: ContestCreated logs over the last ~${CHUNK * MAX_CHUNKS} blocks per contract (chunk size ${CHUNK}, HyperEVM RPC). Same owner (genesis): ${HIP4_CONFIG.sameOwner}.`;
}
