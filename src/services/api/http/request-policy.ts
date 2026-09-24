/**
 * Ambient request policy that `useDataFetching` sets around the synchronous
 * part of a `fetchFn` call.
 *
 * The standard chain (`fetchX → withErrorHandling → get/post/…`) reaches
 * `axiosWithConfig` synchronously, so the requests a fetchFn *starts* before
 * its first `await` inherit the hook's policy without threading options
 * through every API function. A request started after an `await` simply runs
 * with the defaults: the slot is reset before `runWithRequestPolicy` returns,
 * so a policy can never leak onto another hook's request.
 *
 * Deliberately NOT carried here: the AbortSignal. A request started inside a
 * fetchFn can be memoized and shared above the HTTP layer (module-level promise
 * caches), so cancelling it on one hook's behalf could fail another consumer.
 * Signals are passed explicitly (`RequestOptions.signal`).
 */
export interface RequestPolicy {
  /**
   * Max age (ms) of a cached GET response this fetch accepts. Polls use half
   * their interval so they never read back their own previous response.
   */
  maxCacheAgeMs?: number;
  /**
   * `false` → one attempt per request at the transport layer. Set on the
   * hook's own retries, which would otherwise multiply the transport retries.
   */
  transportRetries?: boolean;
  /**
   * Written by the HTTP layer: oldest timestamp (epoch ms) of the responses
   * this fetch consumed — the entry time for cache hits, the arrival time for
   * network responses. Lets the hook report an honest `dataUpdatedAt`.
   */
  dataTimestamp?: number;
}

let active: RequestPolicy | null = null;

/** Runs `fn` with `policy` visible to every request it starts synchronously. */
export function runWithRequestPolicy<T>(policy: RequestPolicy, fn: () => T): T {
  const previous = active;
  active = policy;
  try {
    return fn();
  } finally {
    active = previous;
  }
}

/** Policy of the fetch currently starting requests, if any (read synchronously). */
export function currentRequestPolicy(): RequestPolicy | null {
  return active;
}

/** Keeps the oldest data timestamp seen by `policy`. */
export function recordDataTimestamp(policy: RequestPolicy | null, timestamp: number): void {
  if (!policy) return;
  policy.dataTimestamp =
    policy.dataTimestamp === undefined ? timestamp : Math.min(policy.dataTimestamp, timestamp);
}
