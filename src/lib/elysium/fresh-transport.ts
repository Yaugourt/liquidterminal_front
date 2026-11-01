import { custom, fallback, http, type Transport } from "viem";

/**
 * A viem transport over the two public Elysium RPCs that reads from the one
 * whose chain head is current.
 *
 * The alternate RPC has no rate limit, so it used to be read first. On
 * 2026-11-01 it was parked at block 15.6M (state of 25 Oct) while the chain
 * was at 20.85M: every simulation and read ran against week-old state. Heads
 * are now compared every minute, and the alternate RPC is only read first
 * while it keeps up. Either one still backs the other up on errors.
 */

/** Blocks the alternate RPC may trail by and still be read first (~30 s of blocks). */
const LAG_TOLERANCE_BLOCKS = 120;
const PROBE_EVERY_MS = 60_000;
const PROBE_TIMEOUT_MS = 5_000;

export interface RpcFreshness {
  primaryHead: number | null;
  altHead: number | null;
  /** True when reads go to the alternate RPC first. */
  altFirst: boolean;
  probedAt: number;
}

async function headOf(url: string): Promise<number> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
    signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
  });
  const body = (await res.json()) as { result?: string };
  if (!body.result) throw new Error("no head");
  return parseInt(body.result, 16);
}

export function freshElysiumTransport(primaryUrl: string, altUrl: string): { transport: Transport; freshness: () => RpcFreshness } {
  const altFirst = fallback([http(altUrl, { retryCount: 1 }), http(primaryUrl, { retryCount: 2, retryDelay: 800 })]);
  const primaryFirst = fallback([http(primaryUrl, { retryCount: 2, retryDelay: 800 }), http(altUrl, { retryCount: 1 })]);
  const state: RpcFreshness = { primaryHead: null, altHead: null, altFirst: false, probedAt: 0 };
  let probing: Promise<void> | null = null;

  const probe = (): Promise<void> => {
    if (!probing) {
      probing = Promise.allSettled([headOf(primaryUrl), headOf(altUrl)])
        .then(([p, a]) => {
          state.primaryHead = p.status === "fulfilled" ? p.value : null;
          state.altHead = a.status === "fulfilled" ? a.value : null;
          if (state.altHead === null) state.altFirst = false;
          else if (state.primaryHead === null) state.altFirst = true;
          else state.altFirst = state.altHead >= state.primaryHead - LAG_TOLERANCE_BLOCKS;
        })
        .finally(() => {
          state.probedAt = Date.now();
          probing = null;
        });
    }
    return probing;
  };

  const transport: Transport = (params) => {
    const viaAlt = altFirst(params);
    const viaPrimary = primaryFirst(params);
    return custom({
      async request(args) {
        if (Date.now() - state.probedAt > PROBE_EVERY_MS) await probe();
        return (state.altFirst ? viaAlt : viaPrimary).request(args as never);
      },
    })(params);
  };

  return { transport, freshness: () => ({ ...state }) };
}
