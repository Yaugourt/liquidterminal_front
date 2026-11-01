import { hexToBigInt, type Hex } from "viem";
import { NATIVE_TRANSFER_ADDRESS, type SimLog } from "./simulate";

/**
 * Net balance changes of a simulated call, per address and per asset, read
 * from its Transfer events: ERC-20 and ERC-721 Transfer logs, plus the native
 * HYPE movements eth_simulateV1 traces as Transfer logs from the ERC-7528
 * address. What a wallet would show before signing ("you send / you get").
 */

/** keccak256("Transfer(address,address,uint256)"), shared by ERC-20 and ERC-721. */
export const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export interface AssetChange {
  /** Token contract, or NATIVE_TRANSFER_ADDRESS for HYPE. */
  asset: string;
  /** ERC-20 / HYPE: signed raw amount. ERC-721: signed count of tokens. */
  delta: bigint;
  kind: "native" | "erc20" | "nft";
  /** ERC-721 token ids received (+) or sent (-). */
  nftIds?: string[];
}

export interface AddressChanges {
  address: string;
  changes: AssetChange[];
}

const ZERO = "0x0000000000000000000000000000000000000000";
const topicAddress = (t: Hex) => `0x${t.slice(-40)}`.toLowerCase();

/**
 * Net changes per address, assets that net to zero dropped, mint and burn
 * counterparties (the zero address) left out. Addresses are lower case.
 */
export function balanceChanges(logs: SimLog[]): AddressChanges[] {
  const book = new Map<string, Map<string, AssetChange>>();
  const bump = (addr: string, asset: string, kind: AssetChange["kind"], delta: bigint, nftId?: string) => {
    if (addr === ZERO) return;
    let assets = book.get(addr);
    if (!assets) book.set(addr, (assets = new Map()));
    const cur = assets.get(asset) ?? { asset, delta: 0n, kind };
    cur.delta += delta;
    if (nftId !== undefined) cur.nftIds = [...(cur.nftIds ?? []), `${delta > 0n ? "+" : "-"}${nftId}`];
    assets.set(asset, cur);
  };

  for (const l of logs) {
    if (l.topics[0]?.toLowerCase() !== TRANSFER_TOPIC || l.topics.length < 3) continue;
    const asset = l.address.toLowerCase();
    const from = topicAddress(l.topics[1]);
    const to = topicAddress(l.topics[2]);
    if (l.topics.length === 4) {
      // ERC-721: the token id is the third indexed argument.
      const id = hexToBigInt(l.topics[3]).toString();
      bump(from, asset, "nft", -1n, id);
      bump(to, asset, "nft", 1n, id);
      continue;
    }
    if (l.data === "0x" || l.data.length < 66) continue;
    const value = hexToBigInt(l.data.slice(0, 66) as Hex);
    const kind = asset === NATIVE_TRANSFER_ADDRESS ? "native" : "erc20";
    bump(from, asset, kind, -value);
    bump(to, asset, kind, value);
  }

  const out: AddressChanges[] = [];
  for (const [address, assets] of book) {
    const changes = [...assets.values()].filter((c) => c.delta !== 0n || (c.nftIds?.length ?? 0) > 0);
    if (changes.length) out.push({ address, changes });
  }
  return out;
}

/** The sender first, then the called contract, then everyone else by number of assets moved. */
export function orderChanges(rows: AddressChanges[], sender: string, target: string): AddressChanges[] {
  const rank = (a: string) => (a === sender.toLowerCase() ? 0 : a === target.toLowerCase() ? 1 : 2);
  return [...rows].sort((a, b) => rank(a.address) - rank(b.address) || b.changes.length - a.changes.length);
}
