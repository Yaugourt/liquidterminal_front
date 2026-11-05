import { PHASE_PRODUCTION_BUILD } from "next/constants";

/**
 * `fetch` for the share tiles (`src/app/api/tile/*` and the loaders in `lib/og/`).
 *
 * The tiles export `revalidate`, so `next build` prerenders them, and Next fails
 * the whole build when one prerender runs past 60 s three times
 * (`staticPageGenerationTimeout`). Their data comes from upstreams that can be slow
 * right then: on 2026-11-05 the backend's 7-day Elysium methods took 77 s cold and
 * the build failed on `/api/tile/elysium-tx-mix`.
 *
 * During the build each request here is cut at 10 s. The loaders already read a
 * failed request as missing data, so the tile answers its 503, and Next does not
 * prerender a route that answers an error: that tile is rendered on request instead,
 * cached by its `Cache-Control` header and the data cache. A tile chains at most its
 * data and the two font requests, so 3 × 10 s stays well under the 60 s limit.
 *
 * At request time nothing changes: no limit, and ISR keeps serving the previous image
 * while it regenerates.
 */
const BUILD_FETCH_TIMEOUT_MS = 10_000;

export function tileFetch(input: string, init?: RequestInit): Promise<Response> {
  if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) return fetch(input, init);
  return fetch(input, { ...init, signal: AbortSignal.timeout(BUILD_FETCH_TIMEOUT_MS) });
}
