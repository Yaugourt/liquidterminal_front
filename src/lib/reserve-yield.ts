/**
 * USDC reserve yield (AQAv2), read from the chain.
 *
 * Under the aligned quote asset v2 spec, the deployers of USDC on Hyperliquid
 * pay the protocol its share of the reserve yield earned on the USDC held for
 * Hyperliquid. The charge is computed on the treasury address balance on
 * HyperEVM, sampled once per UTC date, over 30-date intervals; the total lands
 * in the system interest address for USDC (0x50..00 + token index 0) 8 days
 * after the interval ends, and the protocol forwards it to the Assistance Fund.
 *
 * Everything here is read from public endpoints: HyperEVM RPC for the treasury
 * and linked contract balances (current and at past blocks), the info API for
 * the interest address and its ledger. The settled AQA rate has no public read
 * path, so the only rate shown is the one implied by a payment that actually
 * landed: amount / sum of the sampled daily balances x 365.
 *
 * Server only: a cold run reads ~60 historical balances. Past dates never
 * change, so they are memoized for the life of the instance.
 */

const EVM_RPC = "https://rpc.hyperliquid.xyz/evm";
const INFO_URL = "https://api.hyperliquid.xyz/info";
const DAY_MS = 86_400_000;

export const RESERVE_YIELD_ADDRESSES = {
  /** USDC ERC-20 on HyperEVM (6 decimals). */
  usdcEvm: "0xb88339cb7199b77e23db6e890353e22632ba630f",
  /**
   * Treasury address designated by the treasury deployer. No public endpoint
   * names it; the live 9:1 ratio against the linked contract (the split the
   * docs require) is shown on the page as the check that it is the right one.
   */
  treasury: "0xc20699185c15d0a2fd65779bb5d69f5b0b113c00",
  /** System interest address for USDC: 0x50..00 + token index 0. */
  interest: "0x5000000000000000000000000000000000000000",
  assistanceFund: "0xfefefefefefefefefefefefefefefefefefefefe",
} as const;

/**
 * First funding of the interest address (27 Aug 2026, 18:34 UTC), the only
 * onchain trace of the activation vote. Counting 30 dates from this day and
 * paying 8 days later lands on 3 Oct 2026, the day the first payment arrived,
 * which is what pins the schedule below.
 */
const FIRST_INTERVAL_START = Date.UTC(2026, 7, 27);
const INTERVAL_DATES = 30;
const PAYOUT_LAG_DAYS = 8;
/** Inflows below this are activation or test transfers, not interval payments. */
const MIN_PAYMENT_USDC = 1_000;

export type IntervalStatus = "paid" | "due" | "accruing";

export interface ReserveYieldInterval {
  index: number;
  /** First and last sampled dates (UTC midnight, ms). */
  start: number;
  end: number;
  /** Scheduled payout date (UTC midnight, ms). */
  payoutDate: number;
  status: IntervalStatus;
  sampledDates: number;
  /** Sum of the sampled daily treasury balances (USDC). */
  balanceSum: number;
  avgBalance: number;
  paidUsdc: number | null;
  paidAt: number | null;
  paidHash: string | null;
  /** Annual rate implied by the payment: paid / balanceSum x 365, in %. */
  impliedRatePct: number | null;
  /** For the accruing interval: the full interval at the last implied rate, balance held flat. */
  projectedUsdc: number | null;
}

export interface ReserveYieldFlow {
  time: number;
  hash: string;
  from: string;
  to: string;
  amount: number;
  kind: "payment" | "transfer" | "forward";
}

export interface ReserveYieldSnapshot {
  asOf: number;
  addresses: typeof RESERVE_YIELD_ADDRESSES & { linkedContract: string | null };
  treasuryUsdc: number;
  linkedUsdc: number | null;
  /** Treasury : linked contract, expected 9 under the docs. */
  treasuryToLinkedRatio: number | null;
  interestUsdc: number;
  /** USDC the fund received from the interest address. */
  forwardedToFundUsdc: number;
  totalPaidUsdc: number;
  flows: ReserveYieldFlow[];
  intervals: ReserveYieldInterval[];
  current: { index: number; dateNumber: number; of: number; nextPayoutDate: number };
  hypeUsd: number | null;
  dailyBalances: { date: number; usdc: number }[];
}

// ── transport ─────────────────────────────────────────────────────────────

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(EVM_RPC, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        cache: "no-store",
      });
      const json = (await res.json()) as { result?: T; error?: { message: string } };
      if (json.error || json.result === undefined) throw new Error(json.error?.message ?? `${method} failed`);
      return json.result;
    } catch (err) {
      if (attempt >= 2) throw err;
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
}

async function info<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(INFO_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`info ${body.type} ${res.status}`);
  return (await res.json()) as T;
}

const hex = (n: number) => `0x${n.toString(16)}`;

async function blockTimestamp(n: number): Promise<number> {
  const b = await rpc<{ timestamp: string } | null>("eth_getBlockByNumber", [hex(n), false]);
  if (!b) throw new Error(`block ${n} not found`);
  return parseInt(b.timestamp, 16);
}

async function usdcBalance(holder: string, block: number | "latest"): Promise<number> {
  const data = `0x70a08231${holder.slice(2).toLowerCase().padStart(64, "0")}`;
  const raw = await rpc<string>("eth_call", [
    { to: RESERVE_YIELD_ADDRESSES.usdcEvm, data },
    block === "latest" ? "latest" : hex(block),
  ]);
  return Number(BigInt(raw)) / 1e6;
}

// ── historical sampling ───────────────────────────────────────────────────

const blockAtCache = new Map<number, number>();
const balanceAtDateCache = new Map<number, number>();

/** First block with timestamp >= `tSec`, found by secant search from the head. */
async function firstBlockAtOrAfter(tSec: number, head: { n: number; ts: number }): Promise<number> {
  const cached = blockAtCache.get(tSec);
  if (cached !== undefined) return cached;
  // lo has ts < t, hi has ts >= t.
  let hi = head.n;
  let tHi = head.ts;
  let lo = Math.max(1, hi - Math.ceil((tHi - tSec) * 1.2) - 10_000);
  let tLo = await blockTimestamp(lo);
  while (tLo >= tSec) {
    hi = lo;
    tHi = tLo;
    lo = Math.max(1, lo - 200_000);
    tLo = await blockTimestamp(lo);
  }
  while (hi - lo > 1) {
    let mid = Math.round(lo + ((tSec - tLo) * (hi - lo)) / Math.max(1, tHi - tLo));
    mid = Math.min(hi - 1, Math.max(lo + 1, mid));
    const tMid = await blockTimestamp(mid);
    if (tMid < tSec) {
      lo = mid;
      tLo = tMid;
    } else {
      hi = mid;
      tHi = tMid;
    }
  }
  blockAtCache.set(tSec, hi);
  return hi;
}

async function treasuryBalanceOnDate(dateMs: number, head: { n: number; ts: number }): Promise<number> {
  const cached = balanceAtDateCache.get(dateMs);
  if (cached !== undefined) return cached;
  const block = await firstBlockAtOrAfter(dateMs / 1000, head);
  const v = await usdcBalance(RESERVE_YIELD_ADDRESSES.treasury, block);
  balanceAtDateCache.set(dateMs, v);
  return v;
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

// ── snapshot ──────────────────────────────────────────────────────────────

interface LedgerSend {
  time: number;
  hash: string;
  delta: { type: string; user?: string; destination?: string; token?: string; amount?: string };
}

const intervalStart = (i: number) => FIRST_INTERVAL_START + i * INTERVAL_DATES * DAY_MS;

export async function getReserveYieldSnapshot(): Promise<ReserveYieldSnapshot> {
  const A = RESERVE_YIELD_ADDRESSES;
  const now = Date.now();
  const today = Math.floor(now / DAY_MS) * DAY_MS;

  const [headHex, spotMeta, interestState, ledger, mids] = await Promise.all([
    rpc<string>("eth_blockNumber", []),
    info<{ tokens: { index: number; evmContract: { address: string } | null }[] }>({ type: "spotMeta" }),
    info<{ balances: { coin: string; total: string }[] }>({ type: "spotClearinghouseState", user: A.interest }),
    info<LedgerSend[]>({ type: "userNonFundingLedgerUpdates", user: A.interest, startTime: FIRST_INTERVAL_START }),
    info<Record<string, string>>({ type: "allMids" }).catch(() => ({}) as Record<string, string>),
  ]);
  const headN = parseInt(headHex, 16);
  const head = { n: headN, ts: await blockTimestamp(headN) };

  // The linked contract comes from Hyperliquid's own spot metadata, not a constant.
  const linkedContract = spotMeta.tokens.find((t) => t.index === 0)?.evmContract?.address?.toLowerCase() ?? null;
  const [treasuryUsdc, linkedUsdc] = await Promise.all([
    usdcBalance(A.treasury, "latest"),
    linkedContract ? usdcBalance(linkedContract, "latest") : Promise.resolve(null),
  ]);

  const interestUsdc = Number(interestState.balances.find((b) => b.coin === "USDC")?.total ?? 0);

  const flows: ReserveYieldFlow[] = ledger
    .filter((l) => l.delta.type === "send" && l.delta.token === "USDC")
    .map((l) => {
      const from = (l.delta.user ?? "").toLowerCase();
      const to = (l.delta.destination ?? "").toLowerCase();
      const amount = Number(l.delta.amount ?? 0);
      const kind: ReserveYieldFlow["kind"] =
        from === A.interest ? "forward" : amount >= MIN_PAYMENT_USDC ? "payment" : "transfer";
      return { time: l.time, hash: l.hash, from, to, amount, kind };
    })
    .sort((a, b) => b.time - a.time);

  const forwardedToFundUsdc = flows
    .filter((f) => f.kind === "forward" && f.to === A.assistanceFund)
    .reduce((s, f) => s + f.amount, 0);
  const payments = flows.filter((f) => f.kind === "payment");

  // Intervals from the first one through the one accruing today.
  const currentIndex = Math.max(0, Math.floor((today - FIRST_INTERVAL_START) / (INTERVAL_DATES * DAY_MS)));
  const dates: number[] = [];
  for (let d = FIRST_INTERVAL_START; d <= today; d += DAY_MS) dates.push(d);
  const balances = await mapLimit(dates, 6, (d) => treasuryBalanceOnDate(d, head));
  const balanceByDate = new Map(dates.map((d, i) => [d, balances[i]]));

  const intervals: ReserveYieldInterval[] = [];
  for (let i = 0; i <= currentIndex; i++) {
    const start = intervalStart(i);
    const end = start + (INTERVAL_DATES - 1) * DAY_MS;
    const payoutDate = end + PAYOUT_LAG_DAYS * DAY_MS;
    let balanceSum = 0;
    let sampledDates = 0;
    for (let d = start; d <= Math.min(end, today); d += DAY_MS) {
      const b = balanceByDate.get(d);
      if (b !== undefined) {
        balanceSum += b;
        sampledDates++;
      }
    }
    // A payment belongs to the interval whose payout date it lands on (or just after).
    const paid = payments.find((p) => p.time >= payoutDate && p.time < payoutDate + 7 * DAY_MS) ?? null;
    const complete = today > end;
    const status: IntervalStatus = paid ? "paid" : complete ? "due" : "accruing";
    intervals.push({
      index: i + 1,
      start,
      end,
      payoutDate,
      status,
      sampledDates,
      balanceSum,
      avgBalance: sampledDates ? balanceSum / sampledDates : 0,
      paidUsdc: paid?.amount ?? null,
      paidAt: paid?.time ?? null,
      paidHash: paid?.hash ?? null,
      impliedRatePct: paid && sampledDates === INTERVAL_DATES ? (paid.amount / balanceSum) * 365 * 100 : null,
      projectedUsdc: null,
    });
  }

  // Project unpaid intervals at the last rate a real payment implied, holding today's balance flat.
  const lastRate = [...intervals].reverse().find((iv) => iv.impliedRatePct != null)?.impliedRatePct ?? null;
  if (lastRate != null) {
    for (const iv of intervals) {
      if (iv.status === "paid") continue;
      const remaining = INTERVAL_DATES - iv.sampledDates;
      iv.projectedUsdc = ((iv.balanceSum + remaining * treasuryUsdc) * lastRate) / 100 / 365;
    }
  }

  const cur = intervals[intervals.length - 1];
  const hype = Number((mids as Record<string, string>).HYPE);

  return {
    asOf: now,
    addresses: { ...A, linkedContract },
    treasuryUsdc,
    linkedUsdc,
    treasuryToLinkedRatio: linkedUsdc ? treasuryUsdc / linkedUsdc : null,
    interestUsdc,
    forwardedToFundUsdc,
    totalPaidUsdc: payments.reduce((s, p) => s + p.amount, 0),
    flows,
    intervals,
    current: {
      index: cur.index,
      dateNumber: Math.min(INTERVAL_DATES, Math.round((today - cur.start) / DAY_MS) + 1),
      of: INTERVAL_DATES,
      nextPayoutDate: cur.payoutDate,
    },
    hypeUsd: Number.isFinite(hype) && hype > 0 ? hype : null,
    dailyBalances: dates.map((d, i) => ({ date: d, usdc: balances[i] })),
  };
}
