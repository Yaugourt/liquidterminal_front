import {
  decodeFunctionResult,
  encodeFunctionData,
  getAddress,
  isAddressEqual,
  parseAbi,
  zeroAddress,
  type Address,
  type Hex,
} from "viem";
import { useDataFetching } from "@/hooks/useDataFetching";
import { TRANSFER_TOPIC } from "@/lib/elysium/balance-changes";
import { elysiumClient } from "./rpc";
import { decodeContract, fetchContractContext, type ContractContext, type Decoded } from "./decode";
import { fetchElysiumTokenDetail, fetchElysiumTokenHolders } from "./api";

/**
 * Token checker: what an Elysium ERC-20 lets its owner do, and whether it
 * moves like a normal token. Everything is read live (bytecode, view
 * functions, recent Transfer logs) or simulated against the latest state
 * with eth_simulateV1; nothing is signed or sent.
 *
 * The transfer test takes a real holder found in recent Transfer logs and,
 * inside one simulated block, sends a tenth of their balance to a fresh
 * wallet, then from that wallet to a second fresh wallet, then into the
 * token's DEX pool (what a sell does first). Received vs sent gives the tax
 * of each leg; a revert or a `false` return means the move is blocked.
 */

const ERC20 = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
]);

/** Two fresh wallets, never used on chain, so no allowlist or exemption applies to them. */
export const FRESH_A = getAddress("0x7e57c0de00000000000000000000000000000a01");
export const FRESH_B = getAddress("0x7e57c0de00000000000000000000000000000b02");

/** Block spans tried in turn for recent Transfer logs; the RPC refuses ranges over 10,000 logs. */
const LOG_SPANS = [20_000, 200_000, 2_000_000];
const ENOUGH_RECIPIENTS = 25;
const MAX_CANDIDATES = 40;

export type Level = "ok" | "info" | "warn" | "bad";

export interface Finding {
  id: string;
  level: Level;
  title: string;
  detail: string;
}

export interface TransferLeg {
  id: "wallet" | "fresh" | "pool";
  label: string;
  from: Address;
  to: Address;
  sent: bigint;
  received: bigint | null;
  ok: boolean;
  /** Share kept by the token on this leg, percent; null when the leg failed. */
  taxPct: number | null;
  revert: string | null;
}

/** Who holds the token, from the provider's holder index (any token, not only launches). */
export interface HolderSpread {
  holders: number | null;
  /** Share of supply held by the 10 largest holders, percent. */
  top10Pct: number | null;
  top: { address: Address; pct: number; isContract: boolean | null }[];
}

export interface TokenCheck {
  address: Address;
  decoded: Decoded;
  context: ContractContext | null;
  spread: HolderSpread | null;
  holder: { address: Address; balance: bigint; scannedBlocks: number; transfersSeen: number } | null;
  pool: Address | null;
  legs: TransferLeg[];
  ownerIsContract: boolean | null;
  findings: Finding[];
  block: number | null;
}

interface RawSimCall {
  status: Hex;
  returnData: Hex;
  error?: { message?: string; data?: Hex };
}

const lower = (a: string) => a.toLowerCase();
const topicAddress = (t: Hex) => getAddress(`0x${t.slice(-40)}`);

/** Recipients of recent transfers, most recent first, with the span that was read. */
async function recentRecipients(token: Address): Promise<{ recipients: Address[]; blocks: number; transfers: number }> {
  const head = Number(await elysiumClient.getBlockNumber());
  let best: { recipients: Address[]; blocks: number; transfers: number } = { recipients: [], blocks: 0, transfers: 0 };
  for (const span of LOG_SPANS) {
    const from = Math.max(1, head - span);
    let logs: { topics: Hex[] }[];
    try {
      logs = (await elysiumClient.request({
        method: "eth_getLogs" as never,
        params: [{ address: token, fromBlock: `0x${from.toString(16)}`, toBlock: `0x${head.toString(16)}`, topics: [TRANSFER_TOPIC] }] as never,
      })) as { topics: Hex[] }[];
    } catch {
      break; // Too many logs in the wider range: keep what the narrower one found.
    }
    const seen = new Set<string>();
    const recipients: Address[] = [];
    for (let i = logs.length - 1; i >= 0 && recipients.length < MAX_CANDIDATES; i--) {
      const t = logs[i].topics;
      if (t.length !== 3) continue;
      const to = topicAddress(t[2]);
      if (isAddressEqual(to, zeroAddress) || isAddressEqual(to, token) || seen.has(lower(to))) continue;
      seen.add(lower(to));
      recipients.push(to);
    }
    best = { recipients, blocks: head - from, transfers: logs.length };
    if (recipients.length >= ENOUGH_RECIPIENTS || from === 1) break;
  }
  return best;
}

/**
 * The wallet (no code) with the largest balance: the provider's top holders
 * first, then recent recipients from the logs, then the creator.
 */
async function pickHolder(token: Address, fallbacks: Address[], topHolders: Address[]) {
  const { recipients, blocks, transfers } = topHolders.length >= 5 ? { recipients: [] as Address[], blocks: 0, transfers: 0 } : await recentRecipients(token);
  const candidates: Address[] = [];
  for (const a of [...topHolders, ...recipients, ...fallbacks]) {
    if (!candidates.some((c) => isAddressEqual(c, a))) candidates.push(a);
  }
  if (!candidates.length) return null;
  const balances = await Promise.all(
    candidates.map((c) =>
      elysiumClient.readContract({ address: token, abi: ERC20, functionName: "balanceOf", args: [c] }).catch(() => 0n)
    )
  );
  const ranked = candidates.map((c, i) => ({ address: c, balance: balances[i] })).filter((c) => c.balance > 0n).sort((a, b) => (b.balance > a.balance ? 1 : -1));
  // Pools, routers and vaults hold the most; a plain wallet is what a buyer would be.
  for (const c of ranked.slice(0, 8)) {
    const code = await elysiumClient.getCode({ address: c.address }).catch(() => undefined);
    if (!code || code === "0x") return { ...c, scannedBlocks: blocks, transfersSeen: transfers };
  }
  return ranked[0] ? { ...ranked[0], scannedBlocks: blocks, transfersSeen: transfers } : null;
}

const revertOf = (c: RawSimCall | undefined): string | null => {
  if (!c) return "not run";
  if (c.status === "0x1") return null;
  return c.error?.message?.replace(/^execution reverted:?\s*/i, "") || "reverted without a reason";
};

/** A transfer that did not revert but returned false is refused too. */
const returnedFalse = (c: RawSimCall | undefined) => !!c && c.status === "0x1" && c.returnData.length === 66 && BigInt(c.returnData) === 0n;

const readBalance = (c: RawSimCall | undefined): bigint | null => {
  if (!c || c.status !== "0x1" || c.returnData === "0x") return null;
  try {
    return decodeFunctionResult({ abi: ERC20, functionName: "balanceOf", data: c.returnData });
  } catch {
    return null;
  }
};

const taxOf = (sent: bigint, received: bigint | null): number | null => {
  if (received === null || sent === 0n) return null;
  if (received >= sent) return 0;
  return Number(((sent - received) * 1_000_000n) / sent) / 10_000;
};

/** The three transfers, in one simulated block, each leg reading the balances it needs. */
async function transferTest(token: Address, holder: Address, balance: bigint, pool: Address | null) {
  const amount = balance / 10n > 0n ? balance / 10n : balance;
  const bal = (who: Address) => ({ from: FRESH_B, to: token, data: encodeFunctionData({ abi: ERC20, functionName: "balanceOf", args: [who] }) });
  const send = (from: Address, to: Address, value: bigint) => ({
    from,
    to: token,
    data: encodeFunctionData({ abi: ERC20, functionName: "transfer", args: [to, value] }),
  });

  // Leg 1 first: legs 2 and 3 send what the fresh wallet actually received.
  const first = await simulate([bal(FRESH_A), send(holder, FRESH_A, amount), bal(FRESH_A)]);
  const aBefore = readBalance(first.calls[0]) ?? 0n;
  const aAfter = readBalance(first.calls[2]);
  const leg1Fail = revertOf(first.calls[1]) ?? (returnedFalse(first.calls[1]) ? "transfer returned false" : null);
  const recvA = aAfter !== null ? aAfter - aBefore : null;
  const legs: TransferLeg[] = [
    {
      id: "wallet",
      label: "Holder to a new wallet",
      from: holder,
      to: FRESH_A,
      sent: amount,
      received: leg1Fail ? null : recvA,
      ok: !leg1Fail,
      taxPct: leg1Fail ? null : taxOf(amount, recvA),
      revert: leg1Fail,
    },
  ];
  if (leg1Fail || !recvA || recvA <= 0n) return { legs, block: first.block };

  const half = recvA / 2n;
  const rest = recvA - half;
  const calls = [send(holder, FRESH_A, amount), bal(FRESH_B), send(FRESH_A, FRESH_B, half), bal(FRESH_B)];
  if (pool) calls.push(bal(pool), send(FRESH_A, pool, rest), bal(pool));
  const second = await simulate(calls);
  const c = second.calls;
  const leg2Fail = revertOf(c[2]) ?? (returnedFalse(c[2]) ? "transfer returned false" : null);
  const bBefore = readBalance(c[1]) ?? 0n;
  const bAfter = readBalance(c[3]);
  const recvB = bAfter !== null ? bAfter - bBefore : null;
  legs.push({
    id: "fresh",
    label: "New wallet to another new wallet",
    from: FRESH_A,
    to: FRESH_B,
    sent: half,
    received: leg2Fail ? null : recvB,
    ok: !leg2Fail,
    taxPct: leg2Fail ? null : taxOf(half, recvB),
    revert: leg2Fail,
  });
  if (pool) {
    const leg3Fail = revertOf(c[5]) ?? (returnedFalse(c[5]) ? "transfer returned false" : null);
    const pBefore = readBalance(c[4]);
    const pAfter = readBalance(c[6]);
    const recvP = pBefore !== null && pAfter !== null ? pAfter - pBefore : null;
    legs.push({
      id: "pool",
      label: "New wallet into the DEX pool (first step of a sell)",
      from: FRESH_A,
      to: pool,
      sent: rest,
      received: leg3Fail ? null : recvP,
      ok: !leg3Fail,
      taxPct: leg3Fail ? null : taxOf(rest, recvP),
      revert: leg3Fail,
    });
  }
  return { legs, block: second.block };
}

async function simulate(calls: { from: Address; to: Address; data: Hex }[]) {
  const blocks = (await elysiumClient.request({
    method: "eth_simulateV1" as never,
    params: [{ blockStateCalls: [{ calls }], validation: false }, "latest"] as never,
  })) as { number: Hex; calls: RawSimCall[] }[];
  return { block: Number(BigInt(blocks[0].number)), calls: blocks[0].calls };
}

const pct = (n: number) => `${n < 0.01 && n > 0 ? "<0.01" : n.toFixed(n < 10 ? 2 : 1)}%`;

/** Findings in reading order: what the code allows, how it moves, who holds it. */
export function buildFindings(c: Omit<TokenCheck, "findings">): Finding[] {
  const spread = c.spread;
  const f: Finding[] = [];
  const { decoded, context, legs } = c;
  const owner = decoded.identity.owner;
  const renounced = owner !== null && isAddressEqual(owner, zeroAddress);
  const hasOwnerFns = decoded.powers.some((p) => p.id === "owner");
  const roles = decoded.powers.some((p) => p.id === "roles");
  // Owner powers stop mattering once ownership is renounced, unless roles or a proxy admin remain.
  const controlled = !renounced || roles || !!decoded.proxy;

  if (renounced) f.push({ id: "owner", level: "ok", title: "Ownership renounced", detail: "owner() is the zero address: owner-only functions can no longer be called." });
  else if (owner) {
    f.push({
      id: "owner",
      level: "warn",
      title: `Owned by ${c.ownerIsContract ? "a contract" : "a wallet"}`,
      detail: `owner() is ${owner}. ${c.ownerIsContract ? "It may be a multisig or a timelock: open it in the decoder." : "One key controls the owner-only functions listed below."}`,
    });
  } else if (!hasOwnerFns && !roles) f.push({ id: "owner", level: "ok", title: "No owner", detail: "The bytecode has no owner or role functions." });

  if (decoded.proxy) {
    f.push({
      id: "proxy",
      level: "warn",
      title: "Upgradeable",
      detail: `${decoded.proxy.type} proxy${decoded.proxy.admin ? `, admin ${decoded.proxy.admin}` : ""}: the code behind this address can be replaced.`,
    });
  }

  const powerLevel: Record<string, Level> = { mint: "warn", blacklist: "bad", pause: "warn", fees: "warn", sweep: "warn", upgrade: "warn" };
  for (const p of decoded.powers) {
    if (p.id === "owner" || p.id === "roles") continue;
    const level = controlled ? (powerLevel[p.id] ?? "info") : "info";
    f.push({
      id: `power-${p.id}`,
      level,
      title: p.label,
      detail: `${p.evidence.join(", ")}${controlled ? "" : " (owner renounced: no one can call it)"}`,
    });
  }
  if (roles) f.push({ id: "roles", level: "warn", title: "Role-based admin", detail: "grantRole / revokeRole: holders of an admin role keep their powers even without an owner." });

  if (!c.holder) {
    f.push({ id: "transfer", level: "info", title: "Transfer test not run", detail: "No wallet holding this token was found in recent transfers." });
  } else {
    for (const leg of legs) {
      if (!leg.ok) {
        const lockedLaunch = context?.launch && !context.launch.graduated;
        f.push({
          id: `leg-${leg.id}`,
          level: "bad",
          title: `${leg.label}: blocked`,
          detail: `${leg.revert ?? "reverted"}${lockedLaunch ? `. Tokens still on their ${context?.launch?.launchpad} curve can be locked until they graduate.` : ""}`,
        });
      } else if (leg.taxPct !== null && leg.taxPct > 0.001) {
        f.push({ id: `leg-${leg.id}`, level: leg.taxPct >= 10 ? "bad" : "warn", title: `${leg.label}: ${pct(leg.taxPct)} taken`, detail: "The receiver got less than was sent: a transfer tax." });
      }
    }
    if (legs.every((l) => l.ok && (l.taxPct ?? 0) <= 0.001)) {
      f.push({
        id: "transfer",
        level: "ok",
        title: legs.some((l) => l.id === "pool") ? "Moves freely, into the pool too" : "Moves freely between wallets",
        detail: `${legs.length} simulated transfers went through in full.${legs.some((l) => l.id === "pool") ? "" : " No DEX pool in our index, so the sell side was not tested."}`,
      });
    }
  }

  const launch = context?.launch;
  // Live holder index first (any token), the launchpad snapshot as a fallback.
  const top10 = spread?.top10Pct ?? launch?.top10Pct ?? null;
  if (top10 !== null && top10 >= 50) {
    const top = spread?.top[0];
    const lead = top ? ` The largest, ${top.address.slice(0, 6)}…${top.address.slice(-4)}${top.isContract ? " (a contract: pool, curve or vault)" : " (a wallet)"}, holds ${pct(top.pct)}.` : "";
    f.push({ id: "top10", level: "warn", title: `Top 10 holders own ${pct(top10)}`, detail: `Pools, curves and vaults count as holders here.${lead}` });
  }
  const creator = launch?.creator ?? context?.deployment?.deployer ?? null;
  const fromSpread = creator ? spread?.top.find((h) => isAddressEqual(h.address, getAddress(creator)))?.pct : undefined;
  const devPct = fromSpread ?? launch?.devPct ?? null;
  if (devPct !== null && devPct >= 5) {
    f.push({ id: "dev", level: devPct >= 20 ? "bad" : "warn", title: `Creator holds ${pct(devPct)}`, detail: `Creator ${creator ?? "unknown"}.` });
  }
  const dep = context?.deployer;
  if (dep && dep.contracts >= 25) {
    f.push({ id: "deployer", level: "info", title: `Deployer has ${dep.contracts.toLocaleString("en-US")} contracts`, detail: "A factory or a serial deployer: see its other tokens below." });
  }
  if (context && context.dex.pools.length === 0 && !launch) {
    f.push({ id: "pool", level: "info", title: "No DEX pool in our index", detail: "No V2, V3 or V4 pool pairs this token among the pools we decode." });
  }

  const order: Record<Level, number> = { bad: 0, warn: 1, info: 2, ok: 3 };
  return f.sort((a, b) => order[a.level] - order[b.level]);
}

/** Runs every check on a token address. */
export async function checkToken(input: string): Promise<TokenCheck> {
  const address = getAddress(input);
  const [decoded, context] = await Promise.all([decodeContract(address), fetchContractContext(address).catch(() => null)]);
  if (!decoded.isContract) throw new Error("No contract at this address");
  const isToken = decoded.identity.totalSupply !== null && decoded.functions.some((f) => f.signature === "transfer(address,uint256)");
  if (!isToken) throw new Error("This contract is not an ERC-20 token. Try the decoder for other contracts.");

  const owner = decoded.identity.owner;
  const ownerCheck =
    owner && !isAddressEqual(owner, zeroAddress)
      ? elysiumClient.getCode({ address: owner }).then((c) => !!c && c !== "0x").catch(() => null)
      : Promise.resolve(null);

  // The first pool our index pairs it with; launchpad tokens graduate into one.
  const pool = context?.dex.pools[0]?.pool ? getAddress(context.dex.pools[0].pool) : null;
  const fallbacks = [context?.launch?.creator, context?.deployment?.deployer].filter((a): a is string => !!a).map((a) => getAddress(a));
  // The tool simulates on testnet, so the holder index is read on testnet too.
  const [detail, holderRows] = await Promise.all([
    fetchElysiumTokenDetail(address, "testnet").catch(() => null),
    fetchElysiumTokenHolders(address, 20, "testnet").catch(() => null),
  ]);
  const topAddrs = (holderRows ?? []).map((h) => getAddress(h.address));
  const codes = await Promise.all(
    topAddrs.slice(0, 10).map((a) => elysiumClient.getCode({ address: a }).then((c) => !!c && c !== "0x").catch(() => null))
  );
  const spread: HolderSpread | null = holderRows
    ? {
        holders: detail?.holders ?? null,
        top10Pct: holderRows.length ? holderRows.slice(0, 10).reduce((s, h) => s + h.share, 0) * 100 : null,
        top: holderRows.slice(0, 10).map((h, i) => ({ address: topAddrs[i], pct: h.share * 100, isContract: codes[i] ?? null })),
      }
    : null;
  const walletsFirst = [...topAddrs.filter((_, i) => codes[i] === false), ...topAddrs.filter((_, i) => codes[i] !== false)];
  const [holder, ownerIsContract] = await Promise.all([pickHolder(address, fallbacks, walletsFirst), ownerCheck]);
  const test = holder ? await transferTest(address, holder.address, holder.balance, pool).catch(() => null) : null;

  const base = { address, decoded, context, spread, holder, pool, legs: test?.legs ?? [], ownerIsContract, block: test?.block ?? null };
  return { ...base, findings: buildFindings(base) };
}

export const useTokenCheck = (address: string | null) =>
  useDataFetching<TokenCheck | null>({
    fetchFn: () => (address ? checkToken(address) : Promise.resolve(null)),
    refreshInterval: 0,
    dependencies: [address],
    maxRetries: 0,
  });
