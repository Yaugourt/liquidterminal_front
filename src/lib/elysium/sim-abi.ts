import { decodeErrorResult, decodeEventLog, isAddress, parseAbi, parseAbiItem, type Abi, type AbiFunction, type AbiParameter, type Hex } from "viem";
import type { SimLog } from "./simulate";

/**
 * Pure ABI helpers for simulations (no React): signature parsing, argument
 * coercion, event and revert decoding. Shared by the Simulator page and the
 * server-rendered simulation tile.
 */

// Events a builder meets most on Elysium: tokens, wrapped HYPE, Uniswap V2/V3 pools.
export const EVENTS = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Deposit(address indexed dst, uint256 wad)",
  "event Withdrawal(address indexed src, uint256 wad)",
  "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)",
  "event Sync(uint112 reserve0, uint112 reserve1)",
  "event PairCreated(address indexed token0, address indexed token1, address pair, uint256)",
  "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
  "event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
]);
// ERC-721 Transfer carries the id as a third indexed topic.
export const NFT_TRANSFER = parseAbi(["event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"]);

export function parseSig(sig: string): AbiFunction | null {
  const s = sig.trim();
  if (!s) return null;
  try {
    const item = parseAbiItem(s.startsWith("function ") ? s : `function ${s}`);
    return item.type === "function" ? item : null;
  } catch {
    return null;
  }
}

/** "1e18" and "1.5e6" are accepted for integers, so amounts need no zero counting. */
export function toBigInt(raw: string): bigint {
  const v = raw.trim().replace(/_/g, "");
  const m = /^(-?\d+)(?:\.(\d+))?e(\d+)$/i.exec(v);
  if (m) {
    const frac = m[2] ?? "";
    const exp = Number(m[3]);
    if (frac.length > exp) throw new Error(`${raw} is not an integer`);
    return BigInt(m[1] + frac + "0".repeat(exp - frac.length));
  }
  return BigInt(v);
}

export function parseArg(p: AbiParameter, raw: string): unknown {
  const t = p.type;
  if (t.endsWith("]")) {
    const arr = JSON.parse(raw) as unknown[];
    const inner = { ...p, type: t.slice(0, t.lastIndexOf("[")) } as AbiParameter;
    return arr.map((x) => parseArg(inner, typeof x === "string" ? x : JSON.stringify(x)));
  }
  if (t.startsWith("uint") || t.startsWith("int")) return toBigInt(raw);
  if (t === "bool") return raw.trim() === "true";
  if (t === "address" && !isAddress(raw.trim())) throw new Error(`${p.name || "address"}: not an address`);
  if (t.startsWith("tuple")) throw new Error("Tuples are not supported in this form: use raw calldata");
  return raw.trim();
}

export const fmtArg = (v: unknown): string =>
  typeof v === "bigint" ? v.toString() : Array.isArray(v) ? `[${v.map(fmtArg).join(", ")}]` : typeof v === "object" && v ? JSON.stringify(v, (_, x) => (typeof x === "bigint" ? x.toString() : x)) : String(v);

export interface DecodedLog { name: string; args: [string, unknown][]; log: SimLog }

/** Decodes with the contract's own ABI first (when known), then the common events. */
export function decodeLog(log: SimLog, extraAbi?: Abi): DecodedLog {
  for (const abi of [...(extraAbi ? [extraAbi] : []), EVENTS, NFT_TRANSFER] as Abi[]) {
    try {
      const d = decodeEventLog({ abi, topics: log.topics as [Hex, ...Hex[]], data: log.data });
      return { name: d.eventName ?? "event", args: Object.entries((d.args ?? {}) as Record<string, unknown>), log };
    } catch {
      // Try the next ABI.
    }
  }
  return { name: log.topics[0] ? `${log.topics[0].slice(0, 10)}…` : "anonymous", args: [["data", log.data]], log };
}

/** Revert reason: a decoded custom error, `Error(string)`, or the node message. */
export function revertText(revertData: Hex | null, revertMessage: string | null, abi?: Abi): string | null {
  if (!revertData || revertData === "0x") return revertMessage;
  try {
    const d = decodeErrorResult({ abi, data: revertData });
    return `${d.errorName}(${(d.args ?? []).map(fmtArg).join(", ")})`;
  } catch {
    return revertMessage ?? `custom error ${revertData.slice(0, 10)}`;
  }
}

