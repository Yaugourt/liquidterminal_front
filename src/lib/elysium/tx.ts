import {
  decodeFunctionData,
  formatUnits,
  parseAbi,
  parseAbiItem,
  type AbiFunction,
  type Address,
  type Hex,
  type PublicClient,
} from "viem";
import { decodeLog, type DecodedLog } from "./sim-abi";

/**
 * Elysium transaction inspection, from public RPC data only (no React, so the
 * page and the share tile both use it).
 *
 * Raw JSON-RPC on purpose: Elysium is an Arbitrum Nitro chain and its
 * receipts carry `gasUsedForL1` (gas paid to post the tx to HyperEVM, the
 * parent chain) and `l1BlockNumber`, which generic clients drop.
 *
 * Not available: internal calls and internal HYPE transfers. They need
 * `debug_traceTransaction`, which no public Elysium RPC exposes; the page
 * says so instead of guessing.
 */

export const TX_HASH_RE = /^0x[0-9a-fA-F]{64}$/;

/** Ethereum types plus the Arbitrum Nitro system types. */
const TX_TYPES: Record<number, { label: string; system: boolean; hint: string }> = {
  0: { label: "Legacy", system: false, hint: "Pre-EIP-1559 transaction" },
  1: { label: "Access list (EIP-2930)", system: false, hint: "Legacy pricing with an access list" },
  2: { label: "EIP-1559", system: false, hint: "Base fee + priority fee" },
  4: { label: "Set code (EIP-7702)", system: false, hint: "An account delegating to contract code" },
  100: { label: "Deposit", system: true, hint: "HYPE bridged in from HyperEVM" },
  101: { label: "Unsigned (from parent)", system: true, hint: "Call sent from HyperEVM without a signature" },
  102: { label: "Contract (from parent)", system: true, hint: "Call made by a HyperEVM contract" },
  104: { label: "Retryable redeem", system: true, hint: "Execution of a retryable ticket" },
  105: { label: "Retryable submit", system: true, hint: "A retryable ticket created from HyperEVM" },
  106: { label: "Internal (ArbOS)", system: true, hint: "Block-start bookkeeping by ArbOS, no user behind it" },
};

const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const ERC20_META = parseAbi([
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
]);

interface RawTx {
  hash: Hex;
  type: Hex;
  from: Address;
  to: Address | null;
  value: Hex;
  nonce: Hex;
  input: Hex;
  gas: Hex;
  maxFeePerGas?: Hex;
  maxPriorityFeePerGas?: Hex;
  blockNumber: Hex | null;
}
interface RawReceipt {
  status: Hex;
  gasUsed: Hex;
  gasUsedForL1?: Hex;
  l1BlockNumber?: Hex;
  effectiveGasPrice: Hex;
  contractAddress: Address | null;
  logs: { address: Address; topics: Hex[]; data: Hex; logIndex: Hex }[];
}

export interface TokenMove {
  token: Address;
  symbol: string | null;
  decimals: number | null;
  kind: "erc20" | "erc721";
  from: Address;
  to: Address;
  /** ERC-20 amount (raw) or ERC-721 token id. */
  amount: bigint;
}

export interface BalanceChange {
  address: Address;
  /** "HYPE" for native value, else the token address. */
  asset: "HYPE" | Address;
  symbol: string;
  decimals: number | null;
  delta: bigint;
}

export interface TxInspection {
  hash: Hex;
  pending: boolean;
  status: "success" | "reverted" | "pending";
  type: number;
  typeLabel: string;
  typeHint: string;
  system: boolean;
  from: Address;
  to: Address | null;
  createdContract: Address | null;
  value: bigint;
  nonce: number;
  input: Hex;
  block: number | null;
  /** HyperEVM block the sequencer referenced (Arbitrum `l1BlockNumber`). */
  parentBlock: number | null;
  timestamp: number | null;
  gasLimit: bigint;
  gasUsed: bigint;
  /** Part of gasUsed that pays for posting the tx to HyperEVM. */
  gasUsedForL1: bigint;
  gasPrice: bigint;
  baseFee: bigint | null;
  fee: bigint;
  feeExecution: bigint;
  feePosting: bigint;
  call: DecodedCall | null;
  /** Decoded logs; `sigName` names events outside our ABI set when the public database knows them. */
  logs: (DecodedLog & { sigName: string | null })[];
  tokenMoves: TokenMove[];
  balanceChanges: BalanceChange[];
}

export interface DecodedCall {
  selector: Hex;
  name: string | null;
  args: [string, string][];
  /** Inner calls of a multicall(bytes[]), decoded the same way. */
  inner: DecodedCall[];
}

const ZERO = "0x0000000000000000000000000000000000000000";
const big = (h: Hex | null | undefined) => (h ? BigInt(h) : 0n);
const num = (h: Hex | null | undefined) => (h ? Number(BigInt(h)) : null);

async function rpc<T>(client: PublicClient, method: string, params: unknown[]): Promise<T> {
  return (await client.request({ method, params } as never)) as T;
}

/** Function names for a selector from the public openchain signature database. */
async function lookupFunction(selector: string): Promise<string[]> {
  try {
    const res = await fetch(`https://api.openchain.xyz/signature-database/v1/lookup?function=${selector}&filter=true`);
    if (!res.ok) return [];
    const json = (await res.json()) as { result?: { function?: Record<string, { name: string; hasVerifiedContract: boolean }[] | null> } };
    const cands = json.result?.function?.[selector] ?? [];
    return [...cands].sort((a, b) => Number(b.hasVerifiedContract) - Number(a.hasVerifiedContract)).map((c) => c.name);
  } catch {
    return [];
  }
}

/** Event names for topic hashes (names only: the database doesn't say which fields are indexed). */
async function lookupEvents(topics: string[]): Promise<Record<string, string>> {
  if (!topics.length) return {};
  try {
    const res = await fetch(`https://api.openchain.xyz/signature-database/v1/lookup?event=${topics.join(",")}&filter=true`);
    if (!res.ok) return {};
    const json = (await res.json()) as { result?: { event?: Record<string, { name: string }[] | null> } };
    const out: Record<string, string> = {};
    for (const [t, c] of Object.entries(json.result?.event ?? {})) if (c?.[0]) out[t.toLowerCase()] = c[0].name;
    return out;
  } catch {
    return {};
  }
}

const isCallBytes = (v: unknown): v is Hex => typeof v === "string" && /^0x[0-9a-fA-F]{8,}$/.test(v);

/**
 * Name the call and decode its arguments with the first candidate signature
 * that fits; for multicall(bytes[]) and friends, decode each inner call too.
 */
async function decodeCall(input: Hex, depth = 0): Promise<DecodedCall | null> {
  if (input.length < 10) return null;
  const selector = input.slice(0, 10) as Hex;
  for (const sig of await lookupFunction(selector)) {
    try {
      const item = parseAbiItem(`function ${sig}`) as AbiFunction;
      const { args } = decodeFunctionData({ abi: [item], data: input });
      const values = (args ?? []) as unknown[];
      const inner: DecodedCall[] = [];
      if (depth === 0 && /multicall/i.test(item.name)) {
        for (const v of values) {
          if (!Array.isArray(v)) continue;
          for (const data of v.filter(isCallBytes).slice(0, 12)) {
            const d = await decodeCall(data, depth + 1);
            if (d) inner.push(d);
          }
        }
      }
      return {
        selector,
        name: sig,
        args: inner.length ? [] : item.inputs.map((p, i) => [p.name || `arg${i}`, fmt(values[i])] as [string, string]),
        inner,
      };
    } catch {
      // Collision or wrong guess: try the next candidate.
    }
  }
  return { selector, name: null, args: [], inner: [] };
}

function fmt(v: unknown): string {
  if (typeof v === "bigint") return v.toString();
  if (Array.isArray(v)) return `[${v.map(fmt).join(", ")}]`;
  if (v && typeof v === "object") return JSON.stringify(v, (_k, x) => (typeof x === "bigint" ? x.toString() : x));
  return String(v);
}

async function tokenMeta(client: PublicClient, tokens: Address[]) {
  const out = new Map<string, { symbol: string | null; decimals: number | null }>();
  if (!tokens.length) return out;
  const calls = tokens.flatMap((t) => [
    { address: t, abi: ERC20_META, functionName: "symbol" as const },
    { address: t, abi: ERC20_META, functionName: "decimals" as const },
  ]);
  try {
    const res = await client.multicall({ contracts: calls, allowFailure: true });
    tokens.forEach((t, i) => {
      const s = res[i * 2];
      const d = res[i * 2 + 1];
      out.set(t.toLowerCase(), {
        symbol: s.status === "success" ? String(s.result).slice(0, 16) : null,
        decimals: d.status === "success" ? Number(d.result) : null,
      });
    });
  } catch {
    // No metadata: amounts stay raw.
  }
  return out;
}

/** Inspect one Elysium transaction. Returns null when the RPC doesn't know the hash. */
export async function inspectTx(client: PublicClient, hash: Hex): Promise<TxInspection | null> {
  const [tx, receipt] = await Promise.all([
    rpc<RawTx | null>(client, "eth_getTransactionByHash", [hash]),
    rpc<RawReceipt | null>(client, "eth_getTransactionReceipt", [hash]),
  ]);
  if (!tx) return null;

  const type = Number(BigInt(tx.type));
  const t = TX_TYPES[type] ?? { label: `Type ${type}`, system: false, hint: "Unknown transaction type" };
  const blockNo = num(tx.blockNumber);
  const block = blockNo !== null
    ? await rpc<{ timestamp: Hex; baseFeePerGas?: Hex } | null>(client, "eth_getBlockByNumber", [tx.blockNumber, false]).catch(() => null)
    : null;

  const gasUsed = big(receipt?.gasUsed);
  const gasUsedForL1 = big(receipt?.gasUsedForL1);
  const gasPrice = big(receipt?.effectiveGasPrice);
  const fee = gasUsed * gasPrice;
  const feePosting = gasUsedForL1 * gasPrice;

  const rawLogs = receipt?.logs ?? [];
  const decoded = rawLogs.map((l) => decodeLog({ address: l.address, topics: l.topics, data: l.data }));
  // Events our ABI set doesn't know: ask the public database for a name.
  const unknownTopics = [...new Set(decoded.filter((d) => d.name.endsWith("…")).map((d) => d.log.topics[0]?.toLowerCase()).filter(Boolean))] as string[];
  const eventNames = await lookupEvents(unknownTopics);
  const logs = decoded.map((d) => ({ ...d, sigName: d.name.endsWith("…") ? eventNames[d.log.topics[0]?.toLowerCase() ?? ""] ?? null : null }));

  // Token movements from Transfer logs: 3 topics = ERC-20, 4 topics = ERC-721.
  const transfers = rawLogs.filter((l) => l.topics[0]?.toLowerCase() === TRANSFER_TOPIC && (l.topics.length === 3 || l.topics.length === 4));
  const meta = await tokenMeta(client, [...new Set(transfers.map((l) => l.address.toLowerCase() as Address))]);
  const topicAddr = (t: Hex) => `0x${t.slice(26)}` as Address;
  const tokenMoves: TokenMove[] = transfers.map((l) => {
    const m = meta.get(l.address.toLowerCase()) ?? { symbol: null, decimals: null };
    const erc721 = l.topics.length === 4;
    return {
      token: l.address,
      symbol: m.symbol,
      decimals: erc721 ? null : m.decimals,
      kind: erc721 ? "erc721" : "erc20",
      from: topicAddr(l.topics[1]),
      to: topicAddr(l.topics[2]),
      amount: erc721 ? BigInt(l.topics[3]) : l.data.length >= 66 ? BigInt(l.data.slice(0, 66)) : 0n,
    };
  });

  // Net balance changes: top-level HYPE value plus ERC-20 moves (NFTs are listed as moves only).
  const deltas = new Map<string, BalanceChange>();
  const bump = (address: Address, asset: "HYPE" | Address, symbol: string, decimals: number | null, delta: bigint) => {
    const key = `${address.toLowerCase()}|${asset.toLowerCase()}`;
    const cur = deltas.get(key) ?? { address: address.toLowerCase() as Address, asset, symbol, decimals, delta: 0n };
    cur.delta += delta;
    deltas.set(key, cur);
  };
  const value = big(tx.value);
  const status = !receipt ? "pending" : receipt.status === "0x1" ? "success" : "reverted";
  if (status === "success" && value > 0n && tx.to) {
    bump(tx.from, "HYPE", "HYPE", 18, -value);
    bump(tx.to, "HYPE", "HYPE", 18, value);
  }
  if (receipt && fee > 0n && !t.system) bump(tx.from, "HYPE", "HYPE", 18, -fee);
  for (const mv of tokenMoves) {
    if (mv.kind !== "erc20") continue;
    const sym = mv.symbol ?? `${mv.token.slice(0, 6)}…`;
    // The zero address is the mint source / burn sink, not a holder.
    if (mv.from.toLowerCase() !== ZERO) bump(mv.from, mv.token, sym, mv.decimals, -mv.amount);
    if (mv.to.toLowerCase() !== ZERO) bump(mv.to, mv.token, sym, mv.decimals, mv.amount);
  }
  const balanceChanges = [...deltas.values()].filter((d) => d.delta !== 0n);

  return {
    hash,
    pending: !receipt,
    status,
    type,
    typeLabel: t.label,
    typeHint: t.hint,
    system: t.system,
    from: tx.from,
    to: tx.to,
    createdContract: receipt?.contractAddress ?? null,
    value,
    nonce: Number(BigInt(tx.nonce)),
    input: tx.input,
    block: blockNo,
    parentBlock: num(receipt?.l1BlockNumber),
    timestamp: block ? Number(BigInt(block.timestamp)) : null,
    gasLimit: big(tx.gas),
    gasUsed,
    gasUsedForL1,
    gasPrice,
    baseFee: block?.baseFeePerGas ? BigInt(block.baseFeePerGas) : null,
    fee,
    feeExecution: fee - feePosting,
    feePosting,
    call: tx.to ? await decodeCall(tx.input) : null,
    logs,
    tokenMoves,
    balanceChanges,
  };
}

/**
 * Human amount for a raw integer and decimals (raw when decimals are unknown).
 * Keeps at least 3 significant digits, so tiny fees never print as 0.
 */
export function fmtAmount(raw: bigint, decimals: number | null, maxFrac = 6): string {
  if (decimals === null) return raw.toString();
  const neg = raw < 0n;
  const s = formatUnits(neg ? -raw : raw, decimals);
  const [i, f = ""] = s.split(".");
  let frac = f.slice(0, maxFrac);
  if (i === "0" && /^0*$/.test(frac) && /[1-9]/.test(f)) {
    const lead = f.search(/[1-9]/);
    frac = f.slice(0, lead + 3);
  }
  frac = frac.replace(/0+$/, "");
  const int = i.length > 15 ? i : Number(i).toLocaleString("en-US");
  return `${neg ? "-" : ""}${int}${frac ? `.${frac}` : ""}`;
}
