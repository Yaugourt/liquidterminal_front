## Learned User Preferences

- Use English for code comments, JSDoc, and developer-facing strings in the repo; avoid French in those surfaces unless the user explicitly asks for French user-facing copy.
- When the user asks for git operations, they often want scoped commits (e.g. only HIP-4 or only perpdex files), not the whole dirty working tree.
- For extrapolated metrics (e.g. annualized priority-fee run-rates), prefer **honest framing**: show the **real observation window** (dates or day count) and avoid implying “all history” unless storage actually spans it; keep recommendations direct and low-fluff.

## Learned Workspace Facts

- `npm run build` does not run ESLint; run `npm run lint` before ship. ESLint ignores vendored `.agents/**` and `.cursor/**` (e.g. gstack) so lint targets app source only.
- HIP-4 exploratory documentation lives under `src/app/(app)/hip4/`, `src/components/hip4/`, `src/lib/hip4/`, and markdown under `public/hip4/`; slugs and navigation come from `hip4-chapters.ts` and `hip4-chapter-registry.tsx`. L1 trading fees: chapter slug `fees`, canonical `public/hip4/HIP4-fees.md`, structured data in `src/lib/hip4/fees-research-data.ts`. L1 operator cluster (testnet): eight linked system addresses and mapped roles live in `HIP4_SYSTEM_WALLETS` in `src/lib/hip4/core-reference-data.ts`, surfaced in Core/Reference chapters and `public/hip4/HIP4-research-complete.md`.
- Staking holder stats from the backend include `distributionByRange` (holder counts per stake bucket), usable to approximate median stake; averages are skewed upward by validators and large delegators, while median stays comparatively low because outsized stakes sit at the top of a sorted list, not at the midpoint.
- Cursor/agent environments often lack GitHub HTTPS credentials; `git push` to `origin` may need to be run locally with SSH, `gh auth login`, or a credential helper.
- Spot and perp auction UI price: when the API returns `currentGas`, that value is shown; otherwise hooks fall back to linear decay from `startGas` to `BASE_PRICE` (500) over the auction window (`useAuctionTiming`, `usePerpAuctionTiming`).
- `DESIGN_SYSTEM.md` was moved from the repo root to `docs/DESIGN_SYSTEM.md`; reference that path for design system documentation.
- HypeDexer `GET /analytics/priority-fees/stats` documents window-level aggregates plus `time_range` only (no per-hour buckets in the repo OpenAPI export and Mintlify fragments checked for this flow). In `docs/hypedexer_endpoints.json`, `GET /analytics/fills/stats` likewise leaves `data` as an untyped object—do not assume hourly time series without a real JSON sample or another documented endpoint.
- Priority fee and similar micro-amount fields (`priorityGas`, etc.): UI formatters need enough decimal precision for very small positives; a fixed low `maximumFractionDigits` can round values like `0.00002` to `0` and look like missing data.
- HypeDexer `GET /analytics/priority-fees/stats`: for rates or “annualized” style math, derive the window from **`data.time_range` (start → end)**, not from the `hours` query alone—live responses can **truncate** history (e.g. large `hours` with a short effective span) when indexer coverage is limited.
- `GET /hip3/priority-fees/gossip/history` may return **empty** `data` in some environments; do not assume read/gossip totals exist without a non-empty sample or another source.
- Competitor-style **annualized HYPE** figures often use **linear run-rate**: `(total in window / calendar days covered) × 365`; early after a launch that is **high-variance** unless the window is long enough to label confidently.
