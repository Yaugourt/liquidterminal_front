# CODEMAP — Liquid Terminal Frontend

> Compact map for AI sessions: where things live, what feeds each route, what's fragile.
> Pointers, not explanations — read the files. Regenerate after big refactors
> (last full sweep: 2026-06-11, post dead-code purge −9.9k lines).

## Cross-cutting infrastructure

| Layer | Where | Contract in one line |
|---|---|---|
| HTTP | `src/services/api/http/axios-config.ts` | `apiClient` (LT backend, JWT auto-injected, 401→refresh w/ circuit-breaker) + `externalApiClient`; helpers `get/post/put/del/patch/getExternal/postExternal` |
| Errors | `src/services/api/http/error-handler.ts` | every api.ts call wrapped in `withErrorHandling(fn, 'context')` |
| Upstreams | `src/services/api/constants.ts` | `API_URLS`: LT backend (`:3002` local), Hyperliquid RPC/API/UI-API, Hypurrscan, DefiLlama; `ENDPOINTS` dict |
| Cache | `src/services/api/cache/cache.service.ts` | key-based GET cache used by axios-config |
| Auth | `src/contexts/auth.context.tsx` + `src/services/auth/` | Privy OAuth → POST `/auth/login` → JWT in interceptor; roles USER < MODERATOR < ADMIN (`src/lib/roleHelpers.ts`, `<ProtectedAction>`) |
| Data fetching | `src/hooks/useDataFetching.ts` | `{fetchFn(signal), refreshInterval, dependencies, maxRetries}` → `{data, isLoading, error, refetch}`; AbortController built in. `useStaticJson` for /public JSON |
| Refresh tiers | `src/services/api/constants.ts` | REALTIME 5s · FAST 10s · DEFAULT 30s · STATIC 60s |
| WebSockets | `src/lib/websocket-client.ts` (canonical client) | used by `services/explorer/websocket.service.ts`; **debt:** `market/{token,perpDex,hype}/websocket.service.ts` hand-roll reconnect (~540 dup lines, refactor = dedicated PR, medium-high risk) |
| Zustand | `src/store/` | `use-wallets`, `use-wallet-lists`, `use-readlists` (persisted), `use-sidebar-preferences`, `date-format.store`, `number-format.store`, `use-page-title` |
| Shell | `src/app/(app)/layout.tsx` + `src/components/Providers.tsx` | Privy → Auth → Xp → XpNotification → Sidebar(dynamic) → Toaster |
| Design system | `src/components/common` barrel only (ESLint-enforced) | `TypedDataTable`, `KpiRibbon`, `OverviewModule/ModuleTable`, `Num`, `DeleteConfirmDialog`, `PageHeader/PageSection`, charts (`AuroraAreaChart`, `chartPalette`) — full list in `DESIGN_SYSTEM.md`, visual kit in `dash-mockups/kit.html` |
| Formatters | `src/lib/formatters/numberFormatting.ts` + `dateFormatting.ts` | canonical: `compactUsd/compactHype/compactCount/fullUsd/formatNumber/formatPrice/formatMetricValue/truncateAddress/timeAgo` — **never redeclare locally** |
| ESLint guardrails | `eslint.config.mjs` | hex ban (use tokens/chartPalette), raw `<Table>` ban (use TypedDataTable), grid-cols-px table ban, common-barrel-only imports, `<Checkbox>` over raw input |

## Routes → data

Format: route · key components · data sources · gotchas. Components live in `src/components/<domain>/`, services in `src/services/<domain>/` (api.ts + types.ts + hooks/).

### Dashboard & landing
- `/` — static editorial landing (`LandingViewport`), no backend.
- `/dashboard` — PulseBar, MoversCard, AuctionsPanel, LiquidationsPanel, TwapPanel, Vaults/ValidatorsModule, Hip4OutcomesCard, FeesRevenuePanel, StablecoinsCard, Hip3 cards, BuildersConcentrationCard · backend `/home/globalstats`, revenue breakdown, liquidations WS, Hypurrscan deploys · heaviest page of the app.

### Explorer
- `/explorer` — NetworkPulse, LiveActivity, TokenDeploys, BridgeTransfers, CapitalEvolution, modules · WS `rpc.hyperliquid.xyz/ws` (explorerBlock/Txs via `useExplorerStore`), Hypurrscan transfers/deploys, DefiLlama bridge.
- `/explorer/address/[address]` — `AddressAnalyticsLayout` (also reused by `/market/tracker/wallet/[address]`) · per-tab sources (RPC, indexer, backend staking).
- `/explorer/block/[number]`, `/explorer/transaction/[hash]` — RPC POST `/explorer` (blockDetails/txDetails).
- `/explorer/liquidations` — LiquidationsProvider + stats/chart/table · WS `env.NEXT_PUBLIC_API/ws` type:liquidation (`websocket.store.ts`, max 100 buffered) + backend unified `/liquidations` (multi-window stats from one call).
- `/explorer/priority-fees` — KpiRow, Leaderboard, HistoryTable · all Hypedexer `/indexer/...` (multiple payload-shape unwrappers — fragile on schema drift).
- `/explorer/validator` — stats/chart/table tabs · backend `/staking/*` + HL API.
- `/explorer/vaults` (+`[address]`) — directory + detail · backend `/market/vaults` + Hypedexer `/indexer/vaults/*` with fallback chain indexer → summaries → address-only.

### Market
- `/market/spot` — SpotKpiStrip, SpotMarketShape, SpotAuctionBand, SpotDirectoryTable, SpotLeaderboards · backend `/market/spot`, Hypurrscan `/spotUSDC`, fees raw, HL candleSnapshot.
- `/market/spot/[token]` — TokenCard, TradingViewChart (lazy), OrderBook, TokenDetailsBand, TWAP/Holders tabs · HL `/tokenDetails`, Hypurrscan holders · bridged tokens hide market cap.
- `/market/spot/auction`, `/market/perp/auction` — auction timing backend + HL `perpDeployAuctionStatus` + Hypurrscan past auctions.
- `/market/perp` (+`[token]`) — MarketStatsStrip, TokensSection, AuctionCard · backend `/market/perp/globalstats` · perp token page metadata partly hardcoded from URL (TODO in code).
- `/market/perpdex` (+`[dex]`) — tables + stats cards · HL `/perpDexs` + live WS market data (`usePerpDexMarketDataStore`).
- `/market/hip4` (+`[coin]`) — market grid, analytics chart, fills, settlements; detail = KPI ribbon, outcomes, order book, probability/TradingView toggle · Hypedexer hip4 endpoints + HL outcomeMeta/allMids merge · outcome coins encoded `#NNN` (`parseCoinOutcomeId`).
- `/market/builders` (+`[address]`, `intelligence`) — builders tables/charts · Hypedexer `/builders/*` · 4 tables share ~70% column logic (refactor candidate).
- `/market/tracker` (+`my-wallets`, `public-lists`, `wallet/[address]`) — wallet tracking · Zustand stores + backend tracker endpoints + HL balances via `hyperliquid.service.ts`; my-wallets is auth-gated (Privy popup + blur).

### Ecosystem / Wiki / User
- `/ecosystem/project` — ProjectsGrid · backend `/project` · public.
- `/ecosystem/publicgoods` (+`[id]`, `my-submissions`, `pending`) — grids + lazy modals · backend `/publicgoods*` (multipart uploads) · review = MODERATOR+, pending page MODERATOR-gated.
- `/wiki` — EducationContent + category sidebar + resources · backend `/educational/*`, static JSON via `useStaticJson` · submit = USER (rate-limited), moderate = MODERATOR.
- `/wiki/readlist` (+`public-readlists`) — readlist CRUD · `use-readlists` store + backend `/readlists/*`.
- `/profile` — XP hub (stats/history/leaderboard/missions tabs via `?tab=`), referral, Telegram link · `src/services/xp/` (api+context+hooks; daily login idempotent via localStorage) · task→route mapping in `xp/taskRoutes.ts`.
- `/user` — admin panel + wiki moderation · ADMIN only.
- `/hip4` (+`[slug]`) — static educational chapters from `lib/hip4-chapters` snapshot (stale by design, dated).
- `/usdh` — swap widget (Privy wallet, HyperCore vs HyperEVM routing).
- `/labs/*` — design sandboxes, excluded from DS lint rules; **do not delete or refactor without asking**.

## Data source reliability

- **Robust:** LT backend (local DB) `/liquidations/*`, `/staking/*`, `/market/*`; Hypurrscan (fees, spotUSDC, holders, deploys); DefiLlama bridge; HL official API/RPC.
- **Unstable:** Hypedexer `/indexer/*` (402s) — vaults detail, priority-fees, hip4, builders depend on it; every dependent chart must degrade gracefully (fallbacks exist in vaults; priority-fees has schema-drift unwrappers).
- Backend dev runs on `:3002` (`/home/yanis/LiquidTerminal_Back`), CORS hardcoded to `localhost:3000`. Without it, most values render `$0.00`/`—` but layouts still render (useful for visual-check).

## Known quirks (verified in code or memory)

- Spot data: "liquidity" is actually mid-price mislabeled; market caps garbage for bridged + pre-mint stables; duplicate token names → match by `tokenId`; fees window ≈ 10 days.
- HIP-4 backend: stale live status, null settlement names — frontend merges/falls back (see `buildMergedQuestions`).
- `/explorer` and `/wiki` have pre-existing visual-check clip failures (mobile/1024) — predate the 2026-06 cleanup.
- `visual-check` needs the dev server + Playwright from gstack (`GSTACK_NODE_MODULES` env or `~/gstack`/`~/.claude/skills/gstack`).
- knip is configured (`knip.json`); `components/common/**` and `components/ui/**` are entry points — their exports are never "dead" (DS primitives kept for future pages).

## Refactor backlog (identified 2026-06, not yet applied)

- `<Num>` sweep: ~27 files hand-style numbers (`mono text-gold`…).
- TwapPanel / Hip4OutcomesCard / XpLeaderboard → ModuleTable/OverviewModule.
- Builders column factory (4 tables ~70% identical) · shared `<Skeleton>` primitive (27+ copies).
- Market websocket services → `lib/websocket-client.ts` (dedicated PR, medium-high risk).
- Deliberately rejected: generic form-modal base, unified Card — over-abstraction.
