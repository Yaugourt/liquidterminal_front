## Learned User Preferences

- Use English for code comments, JSDoc, and developer-facing strings in the repo; avoid French in those surfaces unless the user explicitly asks for French user-facing copy.
- When the user asks for git operations, they often want scoped commits (e.g. only HIP-4 or only perpdex files), not the whole dirty working tree.

## Learned Workspace Facts

- `npm run build` does not run ESLint; run `npm run lint` before ship. ESLint ignores vendored `.agents/**` and `.cursor/**` (e.g. gstack) so lint targets app source only.
- HIP-4 exploratory documentation lives under `src/app/(app)/hip4/`, `src/components/hip4/`, `src/lib/hip4/`, and markdown under `public/hip4/`; slugs and navigation come from `hip4-chapters.ts` and `hip4-chapter-registry.tsx`. L1 trading fees: chapter slug `fees`, canonical `public/hip4/HIP4-fees.md`, structured data in `src/lib/hip4/fees-research-data.ts`. L1 operator cluster (testnet): eight linked system addresses and mapped roles live in `HIP4_SYSTEM_WALLETS` in `src/lib/hip4/core-reference-data.ts`, surfaced in Core/Reference chapters and `public/hip4/HIP4-research-complete.md`.
- Staking holder stats from the backend include `distributionByRange` (holder counts per stake bucket), usable to approximate median stake; averages are skewed upward by validators and large delegators, while median stays comparatively low because outsized stakes sit at the top of a sorted list, not at the midpoint.
- Cursor/agent environments often lack GitHub HTTPS credentials; `git push` to `origin` may need to be run locally with SSH, `gh auth login`, or a credential helper.
- Spot and perp auction UI price: when the API returns `currentGas`, that value is shown; otherwise hooks fall back to linear decay from `startGas` to `BASE_PRICE` (500) over the auction window (`useAuctionTiming`, `usePerpAuctionTiming`).
- `DESIGN_SYSTEM.md` was moved from the repo root to `docs/DESIGN_SYSTEM.md`; reference that path for design system documentation.
