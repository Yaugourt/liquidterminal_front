import { createPublicClient, http, isAddress, isHash, parseAbi, parseAbiItem, type Address, type Hex } from "viem";
import { ELYSIUM_TRUST_CONTRACTS as T, HYPEREVM_TESTNET_LOGS_RPC_URL } from "@/lib/elysium-chain";
import { fetchElysiumUserBridge } from "./api";
import { hyperEvmTestnet, parentClient } from "./parent";
import { elysiumClient } from "./rpc";
import type { ElysiumBridgeTransfer } from "./types";

/**
 * Bridge transfer tracking: the indexer knows when a transfer started, the
 * chains know where it is now. A withdrawal is claimable on HyperEVM once a
 * confirmed outbox root covers its Elysium block, and claimed once the outbox
 * marks its index spent. Both are read live here.
 */

const logsClient = createPublicClient({
  chain: hyperEvmTestnet,
  transport: http(HYPEREVM_TESTNET_LOGS_RPC_URL, { retryCount: 1, retryDelay: 800 }),
});

const SEND_ROOT = parseAbiItem("event SendRootUpdated(bytes32 indexed outputRoot, bytes32 indexed l2BlockHash)");
const OUTBOX = parseAbi(["function isSpent(uint256 index) view returns (bool)"]);

/** The logs RPC accepts 100-block windows; roots land every ~15 min (~900 blocks). */
const WINDOW = 100n;
const MAX_WINDOWS = 40;

export interface ConfirmedRoot {
  /** Last Elysium block whose withdrawals can be claimed. */
  l2Block: number;
  /** HyperEVM block that confirmed it. */
  parentBlock: number;
  parentTime: number;
}

let rootCache: { at: number; value: ConfirmedRoot | null } | null = null;
const ROOT_TTL_MS = 120_000;

/** Latest confirmed outbox root, walking HyperEVM back in small log windows. */
export async function fetchConfirmedRoot(): Promise<ConfirmedRoot | null> {
  if (rootCache && Date.now() - rootCache.at < ROOT_TTL_MS) return rootCache.value;
  const head = await parentClient.getBlockNumber();
  let value: ConfirmedRoot | null = null;
  for (let i = 0; i < MAX_WINDOWS && !value; i++) {
    const toBlock = head - BigInt(i) * WINDOW;
    const logs = await logsClient.getLogs({ address: T.outbox, event: SEND_ROOT, fromBlock: toBlock - WINDOW + 1n, toBlock });
    const last = logs[logs.length - 1];
    if (last?.args.l2BlockHash) {
      const [child, parent] = await Promise.all([
        elysiumClient.getBlock({ blockHash: last.args.l2BlockHash }),
        parentClient.getBlock({ blockNumber: last.blockNumber }),
      ]);
      value = { l2Block: Number(child.number), parentBlock: Number(last.blockNumber), parentTime: Number(parent.timestamp) };
    }
  }
  rootCache = { at: Date.now(), value };
  return value;
}

export type TrackStatus =
  | "arrived"
  | "waiting-elysium"
  | "redeem-failed"
  | "expired"
  | "claimed"
  | "ready-to-claim"
  | "waiting-confirmation"
  | "unknown";

export interface TrackedTransfer extends ElysiumBridgeTransfer {
  track: TrackStatus;
}

export interface TrackResult {
  address: Address;
  /** The hash the user searched for, when they searched by hash. */
  focusHash: Hex | null;
  transfers: TrackedTransfer[];
  root: ConfirmedRoot | null;
}

/** The sender of a hash: Elysium first (withdrawals start there), then HyperEVM (deposits). */
async function senderOf(hash: Hex): Promise<Address | null> {
  for (const client of [elysiumClient, parentClient]) {
    try {
      const tx = await client.getTransaction({ hash });
      return tx.from;
    } catch {
      // Not on this chain.
    }
  }
  return null;
}

function depositStatus(t: ElysiumBridgeTransfer): TrackStatus {
  switch (t.status) {
    case "completed":
    case "executed":
      return "arrived";
    case "redeem_failed":
      return "redeem-failed";
    case "expired":
      return "expired";
    default:
      return "waiting-elysium";
  }
}

/** Look up an address or a transaction hash and place each transfer on its path. */
export async function trackBridge(query: string, limit = 25): Promise<TrackResult> {
  const q = query.trim();
  let address: Address | null = null;
  let focusHash: Hex | null = null;
  if (isAddress(q, { strict: false })) {
    address = q as Address;
  } else if (isHash(q)) {
    focusHash = q.toLowerCase() as Hex;
    address = await senderOf(focusHash);
    if (!address) throw new Error("This hash is not on Elysium or HyperEVM testnet.");
  } else {
    throw new Error("Paste an address (0x + 40 hex) or a transaction hash (0x + 64 hex).");
  }

  const rows = await fetchElysiumUserBridge(address, limit);
  const withdrawals = rows.filter((r) => r.direction === "withdrawal" && r.position != null);
  const [root, spent] = await Promise.all([
    withdrawals.length ? fetchConfirmedRoot().catch(() => null) : Promise.resolve(null),
    Promise.all(
      withdrawals.map((w) =>
        parentClient
          .readContract({ address: T.outbox, abi: OUTBOX, functionName: "isSpent", args: [BigInt(w.position as number)] })
          .catch(() => null)
      )
    ),
  ]);
  const spentBy = new Map(withdrawals.map((w, i) => [w.transfer_id, spent[i]]));

  const transfers: TrackedTransfer[] = rows.map((r) => {
    if (r.direction !== "withdrawal") return { ...r, track: depositStatus(r) };
    const isSpent = spentBy.get(r.transfer_id);
    if (isSpent || r.status === "completed" || r.status === "executed") return { ...r, track: "claimed" };
    if (isSpent == null || !root || r.l2_block == null) return { ...r, track: "unknown" };
    return { ...r, track: r.l2_block <= root.l2Block ? "ready-to-claim" : "waiting-confirmation" };
  });

  return { address, focusHash, transfers, root };
}
