import {
  getAddress,
  bytesToHex,
  hexToBigInt,
  hexToBytes,
  keccak256,
  parseAbi,
  toFunctionSelector,
  toHex,
  zeroAddress,
  type Address,
  type Hex,
} from "viem";
import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { useDataFetching } from "@/hooks/useDataFetching";
import { elysiumClient } from "./rpc";

// ── Backend context (deployment, deployer, usage) ──────────────────────────────

export interface ContractContext {
  address: string;
  deployment: { deployer: string; tx: string; at: string | null; block: number } | null;
  deployer: {
    address: string;
    contracts: number;
    firstDeploy: string | null;
    others: { address: string; deployedAt: string | null; name: string | null; symbol: string | null; standard: string | null }[];
  } | null;
  token: { standard: string; name: string | null; symbol: string | null; decimals: number | null; origin: string | null; transfers: number } | null;
  usage: {
    txs7d: number;
    callers7d: number;
    failed7d: number;
    firstCall: string | null;
    lastCall: string | null;
    topMethods: { methodId: string; signature: string | null; name: string | null; txs: number }[];
  };
  dex: {
    pool: { factory: string; version: string; token0: string; token1: string; fee: number | null } | null;
    factory: { pools: number; version: string | null } | null;
    pools: { pool: string; version: string; pairedWith: string }[];
  };
}

/** Deployment, deployer and usage of a contract, from our indexed tables. */
export const fetchContractContext = async (address: string): Promise<ContractContext> =>
  withErrorHandling(async () => {
    const res = await get<{ data: ContractContext }>(`/elysium/analytics/contract/${address.toLowerCase()}`, undefined, { retryOnError: false });
    return res.data;
  }, "fetching elysium contract context");

// ── Bytecode analysis ─────────────────────────────────────────────────────────

/** Signatures we classify on. Selectors are derived, never typed by hand. */
const KNOWN_SIGS = [
  // ERC-20
  "totalSupply()", "balanceOf(address)", "transfer(address,uint256)", "transferFrom(address,address,uint256)",
  "approve(address,uint256)", "allowance(address,address)", "decimals()", "symbol()", "name()",
  // ERC-721 / ERC-1155
  "ownerOf(uint256)", "safeTransferFrom(address,address,uint256)", "tokenURI(uint256)", "setApprovalForAll(address,bool)",
  "getApproved(uint256)", "balanceOfBatch(address[],uint256[])", "safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)", "uri(uint256)",
  "supportsInterface(bytes4)",
  // Admin
  "owner()", "transferOwnership(address)", "renounceOwnership()", "hasRole(bytes32,address)", "grantRole(bytes32,address)",
  "pause()", "unpause()", "paused()", "mint(address,uint256)", "mint(uint256)", "burn(uint256)", "burnFrom(address,uint256)",
  "upgradeTo(address)", "upgradeToAndCall(address,bytes)", "proxiableUUID()",
  // Wrapped native
  "deposit()", "withdraw(uint256)",
  // Uniswap V2
  "getReserves()", "token0()", "token1()", "swap(uint256,uint256,address,bytes)", "factory()",
  "createPair(address,address)", "getPair(address,address)", "allPairsLength()",
  "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)", "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)", "WETH()",
  // Uniswap V3
  "slot0()", "fee()", "liquidity()", "tickSpacing()", "createPool(address,address,uint24)", "getPool(address,address,uint24)",
  // Safe, ERC-4337, ERC-4626, Multicall3
  "getOwners()", "getThreshold()", "execTransaction(address,uint256,bytes,uint8,uint256,uint256,uint256,address,address,bytes)",
  "validateUserOp((address,uint256,bytes,bytes,bytes32,uint256,bytes32,bytes,bytes),bytes32,uint256)",
  "validateUserOp((address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes),bytes32,uint256)",
  "asset()", "convertToShares(uint256)", "aggregate3((address,bool,bytes)[])",
  // Arbitrum token bridge (tokens bridged from the parent chain and their gateways)
  "bridgeMint(address,uint256)", "bridgeBurn(address,uint256)", "l1Address()", "l2Gateway()",
  "l1Router()", "l1Gateway()", "counterpartGateway()", "finalizeInboundTransfer(address,address,address,uint256,bytes)",
  "outboundTransfer(address,address,uint256,bytes)",
] as const;

const SIG_BY_SELECTOR: Record<string, string> = Object.fromEntries(KNOWN_SIGS.map((s) => [toFunctionSelector(`function ${s}`), s]));
const has = (set: Set<string>, sig: string) => set.has(toFunctionSelector(`function ${sig}`));

// EIP-1967 slots: keccak256(label) - 1.
const slot = (label: string) => toHex(hexToBigInt(keccak256(toHex(label))) - 1n, { size: 32 });
const SLOT_IMPL = slot("eip1967.proxy.implementation");
const SLOT_BEACON = slot("eip1967.proxy.beacon");
const SLOT_ADMIN = slot("eip1967.proxy.admin");
const MINIMAL_PROXY = /^0x363d3d373d3d3d363d73([0-9a-f]{40})5af43d82803e903d91602b57fd5bf3$/i;

/**
 * 4-byte selectors a Solidity/Vyper dispatcher compares calldata against:
 * PUSH4 (or PUSH3 for a leading zero byte) values consumed by EQ (directly,
 * or after DUP2), or by GT/LT in binary-search dispatchers.
 */
export function extractSelectors(code: Hex): string[] {
  const b = hexToBytes(code);
  const out = new Set<string>();
  for (let i = 0; i < b.length; i++) {
    const op = b[i];
    if (op >= 0x60 && op <= 0x7f) {
      const n = op - 0x5f;
      // Selectors with a leading zero byte are pushed as PUSH3.
      if ((op === 0x63 || op === 0x62) && i + n + 1 < b.length) {
        const raw = b.subarray(i + 1, i + 1 + n);
        const sel = bytesToHex(n === 4 ? raw : Uint8Array.from([0, ...raw]));
        const next = b[i + n + 1];
        const after = b[i + n + 2];
        const dispatch = next === 0x14 || next === 0x11 || next === 0x10 || (next === 0x81 && after === 0x14);
        if (dispatch && sel !== "0xffffffff" && sel !== "0x00000000") out.add(sel);
      }
      i += n;
    }
  }
  return [...out];
}

/** Compiler version from the CBOR metadata Solidity appends to runtime code. */
export function solcVersion(code: Hex): string | null {
  const hex = code.slice(2).toLowerCase();
  const i = hex.lastIndexOf("64736f6c6343"); // "solc" key + 3-byte version marker
  if (i < 0) return null;
  const v = hex.slice(i + 12, i + 18);
  if (v.length < 6) return null;
  return `${parseInt(v.slice(0, 2), 16)}.${parseInt(v.slice(2, 4), 16)}.${parseInt(v.slice(4, 6), 16)}`;
}

interface SigLookup { ok: boolean; result: { function: Record<string, { name: string; filtered: boolean; hasVerifiedContract: boolean }[] | null> } }

/**
 * Names for selectors not in our list, from the public openchain signature
 * database. A name backed by a verified contract wins; spam collisions lose.
 */
async function lookupSelectors(selectors: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (let i = 0; i < selectors.length; i += 50) {
    const chunk = selectors.slice(i, i + 50);
    try {
      const res = await fetch(`https://api.openchain.xyz/signature-database/v1/lookup?function=${chunk.join(",")}&filter=true`);
      if (!res.ok) continue;
      const json = (await res.json()) as SigLookup;
      for (const [sel, cands] of Object.entries(json.result?.function ?? {})) {
        const pick = cands?.find((c) => c.hasVerifiedContract && !c.filtered) ?? cands?.find((c) => !c.filtered);
        if (pick) out[sel] = pick.name;
      }
    } catch {
      // Unresolved selectors stay as hex.
    }
  }
  return out;
}

export type ContractKind =
  | "ERC-20 token" | "ERC-721 NFT" | "ERC-1155 multi-token" | "Wrapped native token" | "ERC-4626 vault"
  | "Uniswap V2 pair" | "Uniswap V2 factory" | "Uniswap V2 router" | "Uniswap V3 pool" | "Uniswap V3 factory"
  | "Safe multisig" | "Smart account (ERC-4337)" | "Multicall"
  | "Bridged token (from HyperEVM)" | "Token bridge gateway";

export interface AdminPower { id: string; label: string; evidence: string[] }

export interface Decoded {
  address: Address;
  isContract: boolean;
  codeSize: number;
  compiler: string | null;
  proxy: { type: "EIP-1967" | "EIP-1967 beacon" | "Minimal proxy (EIP-1167)" | "UUPS"; implementation: Address | null; admin: Address | null } | null;
  functions: { selector: string; signature: string | null }[];
  kinds: ContractKind[];
  powers: AdminPower[];
  identity: {
    name: string | null; symbol: string | null; decimals: number | null; totalSupply: bigint | null;
    owner: Address | null; token0: Address | null; token1: Address | null; factory: Address | null;
  };
}

function classify(sels: Set<string>): ContractKind[] {
  const k: ContractKind[] = [];
  const erc20 = has(sels, "transfer(address,uint256)") && has(sels, "balanceOf(address)") && has(sels, "totalSupply()") && has(sels, "allowance(address,address)");
  if (has(sels, "ownerOf(uint256)") && has(sels, "setApprovalForAll(address,bool)")) k.push("ERC-721 NFT");
  else if (has(sels, "balanceOfBatch(address[],uint256[])")) k.push("ERC-1155 multi-token");
  else if (erc20 && has(sels, "deposit()") && has(sels, "withdraw(uint256)")) k.push("Wrapped native token");
  else if (erc20 && has(sels, "asset()") && has(sels, "convertToShares(uint256)")) k.push("ERC-4626 vault");
  else if (erc20 && has(sels, "getReserves()") && has(sels, "swap(uint256,uint256,address,bytes)")) k.push("Uniswap V2 pair");
  else if (erc20) k.push("ERC-20 token");
  if (has(sels, "createPair(address,address)") && has(sels, "allPairsLength()")) k.push("Uniswap V2 factory");
  if (has(sels, "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)")) k.push("Uniswap V2 router");
  if (has(sels, "slot0()") && has(sels, "tickSpacing()") && has(sels, "liquidity()")) k.push("Uniswap V3 pool");
  if (has(sels, "createPool(address,address,uint24)")) k.push("Uniswap V3 factory");
  if (has(sels, "getOwners()") && has(sels, "getThreshold()")) k.push("Safe multisig");
  if (
    has(sels, "validateUserOp((address,uint256,bytes,bytes,bytes32,uint256,bytes32,bytes,bytes),bytes32,uint256)") ||
    has(sels, "validateUserOp((address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes),bytes32,uint256)")
  ) k.push("Smart account (ERC-4337)");
  if (has(sels, "aggregate3((address,bool,bytes)[])")) k.push("Multicall");
  // Arbitrum standard bridge: the gateway mints and burns the L2 copy of a parent chain token.
  if (has(sels, "bridgeMint(address,uint256)") && has(sels, "bridgeBurn(address,uint256)") && has(sels, "l1Address()")) {
    k.unshift("Bridged token (from HyperEVM)");
  }
  // Gateways and routers of the token bridge point back to their parent chain side.
  if (has(sels, "finalizeInboundTransfer(address,address,address,uint256,bytes)") || has(sels, "l1Router()") || has(sels, "l1Gateway()")) {
    k.push("Token bridge gateway");
  }
  return k;
}

/** Privileged functions the bytecode exposes, found by function name. */
function adminPowers(functions: { signature: string | null }[]): AdminPower[] {
  const names = functions.map((f) => f.signature).filter((s): s is string => !!s);
  const rules: { id: string; label: string; re: RegExp }[] = [
    { id: "mint", label: "Can mint new supply", re: /^(mint\w*|bridgeMint)\(/i },
    { id: "pause", label: "Can pause transfers", re: /^(pause|unpause|setPaused)\(/i },
    { id: "blacklist", label: "Can block addresses", re: /(blacklist|blocklist|denylist|ban|freeze)\w*\(/i },
    { id: "fees", label: "Can change fees or limits", re: /^(set\w*(fee|tax|maxtx|maxwallet|limit)|exclude\w*from\w*fee)\w*\(/i },
    { id: "upgrade", label: "Can be upgraded", re: /^upgrade\w*\(/i },
    { id: "roles", label: "Role-based admin", re: /^(grantRole|revokeRole)\(/ },
    { id: "owner", label: "Has an owner", re: /^(transferOwnership|renounceOwnership)\(/ },
    { id: "sweep", label: "Can pull tokens or HYPE out", re: /^(withdraw(All|Tokens?|ETH|Native|Stuck)|rescue\w*|sweep\w*|emergencyWithdraw)\w*\(/i },
  ];
  return rules
    .map((r) => ({ id: r.id, label: r.label, evidence: names.filter((n) => r.re.test(n)).map((n) => n.split("(")[0]) }))
    .filter((p) => p.evidence.length > 0)
    .map((p) => ({ ...p, evidence: [...new Set(p.evidence)] }));
}

const IDENTITY = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function owner() view returns (address)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function factory() view returns (address)",
]);
const BEACON = parseAbi(["function implementation() view returns (address)"]);

const slotAddress = (v: Hex | undefined): Address | null => {
  if (!v || /^0x0*$/.test(v)) return null;
  return getAddress(`0x${v.slice(-40)}`);
};

/** What a contract is, from its bytecode and its own view functions. */
export async function decodeContract(input: string): Promise<Decoded> {
  const address = getAddress(input);
  const c = elysiumClient;
  const code = (await c.getCode({ address })) ?? "0x";
  const empty: Decoded["identity"] = { name: null, symbol: null, decimals: null, totalSupply: null, owner: null, token0: null, token1: null, factory: null };
  if (code === "0x") return { address, isContract: false, codeSize: 0, compiler: null, proxy: null, functions: [], kinds: [], powers: [], identity: empty };

  // Proxies: the logic lives in the implementation, analyse that code.
  let proxy: Decoded["proxy"] = null;
  let logic: Hex = code;
  const minimal = MINIMAL_PROXY.exec(code);
  if (minimal) {
    const impl = getAddress(`0x${minimal[1]}`);
    proxy = { type: "Minimal proxy (EIP-1167)", implementation: impl, admin: null };
  } else {
    const [impl, beacon, admin] = await Promise.all([
      c.getStorageAt({ address, slot: SLOT_IMPL }),
      c.getStorageAt({ address, slot: SLOT_BEACON }),
      c.getStorageAt({ address, slot: SLOT_ADMIN }),
    ]);
    const implAddr = slotAddress(impl);
    const beaconAddr = slotAddress(beacon);
    if (implAddr) proxy = { type: "EIP-1967", implementation: implAddr, admin: slotAddress(admin) };
    else if (beaconAddr) {
      const bi = await c.readContract({ address: beaconAddr, abi: BEACON, functionName: "implementation" }).catch(() => null);
      proxy = { type: "EIP-1967 beacon", implementation: bi, admin: slotAddress(admin) };
    }
  }
  if (proxy?.implementation) logic = (await c.getCode({ address: proxy.implementation })) ?? code;

  const selectors = extractSelectors(logic);
  const unknown = selectors.filter((s) => !SIG_BY_SELECTOR[s]);
  const looked = unknown.length ? await lookupSelectors(unknown) : {};
  const functions = selectors
    .map((s) => ({ selector: s, signature: SIG_BY_SELECTOR[s] ?? looked[s] ?? null }))
    .sort((a, b) => (a.signature ?? "~").localeCompare(b.signature ?? "~"));
  const set = new Set(selectors);
  if (proxy?.type === "EIP-1967" && has(set, "upgradeTo(address)") && has(set, "proxiableUUID()")) proxy = { ...proxy, type: "UUPS" };

  // View functions, read through the proxy address (that is where the state is).
  const want = (sig: string) => has(set, sig);
  const read = <T,>(fn: "name" | "symbol" | "decimals" | "totalSupply" | "owner" | "token0" | "token1" | "factory", sig: string): Promise<T | null> =>
    want(sig) ? (c.readContract({ address, abi: IDENTITY, functionName: fn }) as Promise<T>).catch(() => null) : Promise.resolve(null);
  const [name, symbol, decimals, totalSupply, owner, token0, token1, factory] = await Promise.all([
    read<string>("name", "name()"),
    read<string>("symbol", "symbol()"),
    read<number>("decimals", "decimals()"),
    read<bigint>("totalSupply", "totalSupply()"),
    read<Address>("owner", "owner()"),
    read<Address>("token0", "token0()"),
    read<Address>("token1", "token1()"),
    read<Address>("factory", "factory()"),
  ]);

  return {
    address,
    isContract: true,
    codeSize: (code.length - 2) / 2,
    compiler: solcVersion(logic),
    proxy,
    functions,
    kinds: classify(set),
    powers: adminPowers(functions),
    identity: { name, symbol, decimals: decimals == null ? null : Number(decimals), totalSupply, owner, token0, token1, factory },
  };
}

export const OWNER_RENOUNCED = zeroAddress;

export const useDecodedContract = (address: string | null) =>
  useDataFetching<Decoded | null>({
    fetchFn: () => (address ? decodeContract(address) : Promise.resolve(null)),
    refreshInterval: 0,
    dependencies: [address],
    maxRetries: 1,
  });

export const useContractContext = (address: string | null) =>
  useDataFetching<ContractContext | null>({
    fetchFn: () => (address ? fetchContractContext(address) : Promise.resolve(null)),
    refreshInterval: 60_000,
    dependencies: [address],
    maxRetries: 1,
  });
