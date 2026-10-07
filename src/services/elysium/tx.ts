import type { Hex } from "viem";
import { useDataFetching } from "@/hooks/useDataFetching";
import { inspectTx, TX_HASH_RE, type TxInspection } from "@/lib/elysium/tx";
import { elysiumClient } from "./rpc";

/**
 * One Elysium transaction, inspected from public RPC data. Re-polls every 4s
 * while the transaction is pending, then stops (a mined tx doesn't change).
 */
export function useTxInspection(hash: string) {
  const valid = TX_HASH_RE.test(hash);
  const result = useDataFetching<TxInspection | null>({
    fetchFn: () => (valid ? inspectTx(elysiumClient, hash as Hex) : Promise.resolve(null)),
    refreshInterval: 0,
    maxRetries: 2,
    dependencies: [hash],
  });
  const pending = result.data?.pending ?? false;
  return { ...result, valid, pending };
}

export interface RecentTx {
  hash: Hex;
  from: string;
  to: string | null;
  selector: string;
  block: number;
}

/** The latest non-system transactions from the newest blocks (examples for the search page). */
export async function fetchRecentTxs(limit = 8, maxBlocks = 40): Promise<RecentTx[]> {
  const head = Number(await elysiumClient.getBlockNumber());
  const out: RecentTx[] = [];
  for (let n = head; n > head - maxBlocks && out.length < limit; n--) {
    const block = (await elysiumClient.request({ method: "eth_getBlockByNumber", params: [`0x${n.toString(16)}`, true] } as never)) as {
      transactions: { hash: Hex; type: Hex; from: string; to: string | null; input: string }[];
    } | null;
    for (const t of block?.transactions ?? []) {
      if (Number(BigInt(t.type)) >= 100) continue; // Arbitrum system transactions
      out.push({ hash: t.hash, from: t.from, to: t.to, selector: t.input.slice(0, 10), block: n });
      if (out.length >= limit) break;
    }
  }
  return out;
}

export function useRecentTxs() {
  return useDataFetching<RecentTx[]>({ fetchFn: () => fetchRecentTxs(), refreshInterval: 15_000, maxRetries: 1 });
}
