# CODEMAP — Liquid Terminal Frontend

> Compact map for AI sessions: where things live, what feeds each route, what's fragile.
> Pointers, not explanations — read the files. Regenerate after big refactors
> (last full sweep: 2026-06-11, post dead-code purge −9.9k lines;
> routes + share-tiles section refreshed 2026-09-10).

## Cross-cutting infrastructure

| Layer | Where | Contract in one line |
|---|---|---|
| HTTP | `src/services/api/http/axios-config.ts` | `apiClient` (LT backend, JWT auto-injected, 401→refresh w/ circuit-breaker) + `externalApiClient`; helpers `get/post/put/del/patch/getExternal/postExternal` · identical GETs / HL info POSTs in flight share one request · transport retries 5xx/network ×3 (backoff), 429 once (honours `Retry-After` ≤10s) · `RequestOptions.signal` cancels (a shared read only once all its callers cancelled) |
| Errors | `src/services/api/http/error-handler.ts` | every api.ts call wrapped in `withErrorHandling(fn, 'context')` |
| Upstreams | `src/services/api/constants.ts` | `API_URLS`: LT backend (`:3002` local), Hyperliquid RPC/API/UI-API, Hypurrscan, DefiLlama; `ENDPOINTS` dict |
| Cache | `src/services/api/cache/cache.service.ts` | key-based GET cache (30s TTL) used by axios-config; per-fetch max age via `http/request-policy.ts` (set by `useDataFetching`: poll = interval/2, manual refetch = 0) |
| Auth | `src/contexts/auth.context.tsx` + `src/services/auth/` | Privy OAuth → POST `/auth/login` → JWT in interceptor; roles USER < MODERATOR < ADMIN (`src/lib/roleHelpers.ts`, `<ProtectedAction>`) |
| Data fetching | `src/hooks/useDataFetching.ts` | `{fetchFn(signal), refreshInterval, dependencies, maxRetries}` → `{data, isLoading, error, refetch}`; forward `signal` to the api call to cancel it · polls pause while the tab is hidden (catch-up on return, `lib/visibility.ts`) · `refetch` (stable) bypasses the cache · `dataUpdatedAt` = age of the data shown (cache entry time on a hit) · hook retries are single-shot at the transport. `useStaticJson` for /public JSON |
| Refresh tiers | `src/services/api/constants.ts` | REALTIME 5s · FAST 10s · DEFAULT 30s · STATIC 60s |
| WebSockets | `src/lib/websocket-client.ts` (canonical client) | used by every store · perpDex / token / liquidations stores are ref-counted (`connect`/`disconnect` in pairs) · `pauseWhenHidden` (opt-in, lossless streams only: perpDex, HYPE price, explorer blocks/txs) closes after 60s hidden and resubscribes on return |
| Zustand | `src/store/` | `use-wallets`, `use-wallet-lists`, `use-readlists` (persisted), `use-sidebar-preferences`, `date-format.store`, `number-format.store`, `use-page-title` |
| Shell | `src/app/(app)/layout.tsx` + `src/components/Providers.tsx` | Privy → Auth → Xp → XpNotification → Sidebar(dynamic) → Toaster · Cmd+K palette mounted once in the root layout (`components/search/GlobalSearch.tsx`, lazy palette) |
| Design system | `src/components/common` barrel only (ESLint-enforced) | `TypedDataTable`, `KpiRibbon`, `OverviewModule/ModuleTable`, `Num`, `DeleteConfirmDialog`, `PageHeader/PageSection`, charts (`AuroraAreaChart`, `chartPalette`) — full list in `DESIGN_SYSTEM.md`, visual kit in `dash-mockups/kit.html` |
| Formatters | `src/lib/formatters/numberFormatting.ts` + `dateFormatting.ts` | canonical: `compactUsd/compactHype/compactCount/fullUsd/formatNumber/formatPrice/formatMetricValue/truncateAddress/timeAgo` — **never redeclare locally** |
| Share tiles (OG) | `src/app/api/tile/*` + `src/lib/og/` | 12 `nodejs`-runtime routes returning branded PNG 1200x630 via `next/og`; `TileFrame` is the shared chrome, `fonts.ts`/`hypurr.ts` load assets, `chart.ts` draws series as raw SVG paths (Satori cannot run a chart lib), `customCatalog.ts` drives `/share`. **Always build backend URLs with `backendUrl()` from `lib/og/backend.ts`** — these routes use raw `fetch`, which (unlike axios) does not normalise the trailing slash in `NEXT_PUBLIC_API`. Every route degrades to a 503 with a plain-text reason rather than a broken image. |
| ESLint guardrails | `eslint.config.mjs` | hex ban (use tokens/chartPalette), raw `<Table>` ban (use TypedDataTable), grid-cols-px table ban, common-barrel-only imports, `<Checkbox>` over raw input |

## Routes → data

Format: route · key components · data sources · gotchas. Components live in `src/components/<domain>/`, services in `src/services/<domain>/` (api.ts + types.ts + hooks/).

### Dashboard & landing
- `/` — static editorial landing (`LandingViewport`), no backend.
- `/dashboard` — PulseBar + overview; the panels now live in three sub-tabs, so the root page is no longer the monolith it was.
- `/dashboard/market` — MoversCard, AuctionsPanel, LiquidationsPanel, TwapPanel, BuildersConcentrationCard, Hip3MarketsPanel, Hip4OutcomesCard, TraderPnlCard, MarketVolumeCard, NetworkGrowthSection · backend `/home/globalstats`, liquidations WS, Hypurrscan deploys · heaviest page of the app.
- `/dashboard/capital` — FeesRevenuePanel, StablecoinsCard, Vaults/ValidatorsModule · backend revenue breakdown + `/market/vaults` + `/staking/*`.
- `/dashboard/ecosystem` — ProjectsRecap, WikiRecap · backend `/project` + `/educational/*`.

### Explorer
- `/explorer` — NetworkPulse, LiveActivity, TokenDeploys, BridgeTransfers, CapitalEvolution, modules · WS `rpc.hyperliquid.xyz/ws` (explorerBlock/Txs via `useExplorerStore`), Hypurrscan transfers/deploys, DefiLlama bridge.
- `/explorer/address/[address]` — `AddressAnalyticsLayout` (also reused by `/market/tracker/wallet/[address]`) · both variants = `AddressDigest` (`components/address/digest`): one `KpiRibbon` + `WalletProfileCard` (balances / markets / edge / risk + a collapsible by-market table, multi-market wallets only) fed by `useAddressDigest(address, variant)`, which opens every feed once — HL `portfolio` (`pnlHistory`, deposits excluded; `perpAllTime` for the perp/spot split; `vlm` per window), `clearinghouseState` (liq distance, exposure, withdrawable), HL `userNonFundingLedgerUpdates` (`useLedgerUpdates` → capital flows, linked accounts, ledger liquidations; HL system addresses filtered), Hypedexer `/indexer/users/:user/*` (lifetime via `start_time`, the default is 7d), `/indexer/completed-trades/` (last 100 → cadence / style / recent form), `/indexer/funding/userFunding/summary`, `/top-traders/positioning` (smart-money alignment per open coin), HL `predictedFundings` (daily carry of the open book), local DB `/liquidations?user=`; `classifyWallet` = heuristic archetype pill, `deriveWalletInsights` = rule-derived one-liners (tooltip = feeds crossed) · page order (both variants): ribbon → `WalletInsightsCard` (tracker: beside `PerformanceChart`) → 4-up `WalletProfileCard` → tab bar + panels at the bottom (passed as `children` to `AddressDigest`) · Risk column "all N positions →" switches to Holdings on its perp view (`AssetsSection focusView`) · tracker folds HyperEVM balances in (`includeEvm`), HyperEVM detail = its own tab (`HyperEvmCard`) · by-market rows resolve spot pairs (`@107` → HYPE spot) and show `—` where the indexer reports 0 realized PnL (spot, still-open) · per-tab sources (RPC, indexer, backend staking) · identical HL info / explorer POSTs and GETs fired together share one in-flight request (`axiosWithConfig`), so the digest and the tabs no longer each open the ledger / fills / userDetails.
- `/explorer/block/[number]`, `/explorer/transaction/[hash]` — RPC POST `/explorer` (blockDetails/txDetails).
- `/explorer/liquidations` — LiquidationsProvider + stats/chart/table · WS `env.NEXT_PUBLIC_API/ws` type:liquidation (`websocket.store.ts`, max 100 buffered) + backend unified `/liquidations` (multi-window stats from one call).
- `/explorer/priority-fees` — Ribbon, BurnChart, PayersCard, FillsCard, MechanismsCard · backend `/market/priority-fees/series` (rebuilt there by differencing cumulative rollups, because the indexer's pre-aggregated daily chart stopped advancing on 2026-07-11) + Hypedexer `/indexer/users/leaderboard?by=priority_fees` and `/indexer/fills/recent?has_priority_gas=true` (payload-shape unwrappers — fragile on schema drift). Covers order priority only: the gossip auction feed is frozen, so the read-path burn cannot be sized.
- `/explorer/validator` — stats/chart/table tabs · backend `/staking/*` + HL API.
- `/explorer/vaults` (+`[address]`) — directory + detail · backend `/market/vaults` + Hypedexer `/indexer/vaults/*` with fallback chain indexer → summaries → address-only.

### Market
- `/market` — venue hub: KpiRibbon, VenueSplitBar, SpotVenueCard/PerpVenueCard · backend spot+perp globalstats, `/market/stablecoins`, Hypedexer `/indexer/overview/*` (volume/traders/fees 24h) and `/indexer/hip3/overview`.
- `/market/trades` — `TradeExplorer`: market-wide round-trip explorer, filter by coin, server-side sort · Hypedexer `/indexer/completed-trades/` + `/summary` (`services/market/trade-explorer`) · unstable source, degrades to empty.
> **Order books (all market types)** — `OrderBook` (spot/perp/HIP-3) and `Hip4OrderBook` read the **L4 per-order book** over backend WS `env.NEXT_PUBLIC_API/ws` type:`l4book` (`services/market/orderbook/`, snapshot + 250 ms deltas, 100 levels/side, order + maker counts per level, whole-book totals). HL's public `l2Book` stays subscribed: it supplies the exact top 20 levels the merge trusts over L4 (whose delta stream drops some departing orders) and carries the panel alone if L4 is down — badge in the card header says which is live.

- `/market/spot` — SpotKpiStrip, SpotMarketShape, SpotAuctionBand, SpotDirectoryTable, SpotLeaderboards · backend `/market/spot`, Hypurrscan `/spotUSDC`, fees raw, HL candleSnapshot.
- `/market/spot/[token]` — TokenCard, TradingViewChart (lazy), OrderBook, TokenDetailsBand, TWAP/Holders tabs · HL `/tokenDetails`, Hypurrscan holders · bridged tokens hide market cap.
- `/market/spot/auction`, `/market/perp/auction` — auction timing backend + HL `perpDeployAuctionStatus` + Hypurrscan past auctions.
- `/market/perp` (+`[token]`) — MarketStatsStrip, TokensSection, AuctionCard · backend `/market/perp/globalstats` · perp token page metadata partly hardcoded from URL (TODO in code).
- `/market/perpdex` (+`[dex]`, `[dex]/[asset]`) — tables + stats cards + `Hip3MarketsExplorer` (ecosystem-wide HIP-3 markets with mark-vs-oracle basis, filterable) · HL `/perpDexs` + live WS market data (`usePerpDexMarketDataStore`).
- `/market/hip4` (+`[coin]`) — market grid, analytics chart, fills, settlements; detail = KPI ribbon, outcomes, order book, probability/TradingView toggle · Hypedexer hip4 endpoints + HL outcomeMeta/allMids merge · outcome coins encoded `#NNN` (`parseCoinOutcomeId`).
- `/market/builders` (+`[address]`, `intelligence`) — builders tables/charts · Hypedexer `/builders/*` · 4 tables share ~70% column logic (refactor candidate).
- `/market/tracker` (+`my-wallets`, `public-lists`, `wallet/[address]`) — wallet tracking + `SmartMoneyPositioning` board with net-bias trend · Zustand stores + backend tracker endpoints + `/top-traders/positioning(/history)` (`services/market/positioning`) + HL balances via `hyperliquid.service.ts`; my-wallets is auth-gated (Privy popup + blur).

### HYPE (asset deep-dive)
- `/hype` — HypeHeroRibbon, HypePriceChart, HypeRelativePerformanceCard, RevenueFlywheelCard · backend revenue breakdown + HL API (`services/market/hype`, fills via `HYPERLIQUID_API/info`).
- `/hype/financials` — protocol fundamentals + FeeRankCard (Hyperliquid's rank by 24h fees across the whole DefiLlama field, `services/market/feeRank`, external `api.llama.fi/overview/fees`) · backend `/defillama/*` proxies.
- `/hype/capital` — AF buybacks (`useAfBuybacks`) + WhalesVsRetailCard (holder cohorts whale→retail derived from Hypurrscan holders, `useHypeHolderCohorts`).
- `/hype/operations` — FeeRunRateCard, OperatingMetricsCard, TvlHistoryCard · perp globalstats + DefiLlama.
- `/hype/valuation` — ValuationMultiplesCard, MultipleHistoryCard · `useFeeRevenueHistory`.

### EVM / Export / Share
- `/evm` — `EvmOverview` · Hypedexer `/indexer/evm/{stats,stats/daily,blocks}` — unstable source, degrades.
- `/export` — `ExportWorkbench` · backend `/export/datasets` + `/export/quota`.
- `/share` — share studio: live preview + template gallery + custom tile composer (grid or chart), catalog in `lib/og/customCatalog.ts`. Consumes the tile routes below; `<ShareTile>` also drops a share button onto ~8 cards across dashboard/liquidations/perpDex/tracker.

### Ecosystem / Wiki / User
- `/ecosystem/project` (+`[id]`) — ProjectsDirectory + EcosystemBanner · backend `/project` + `useChainStats` · public (the older ProjectsGrid/ProjectCard/CategoryTabs are rewrite leftovers, now dead).
- `/ecosystem/publicgoods` (+`[id]`, `my-submissions`, `pending`) — grids + lazy modals · backend `/publicgoods*` (multipart uploads) · review = MODERATOR+, pending page MODERATOR-gated.
- `/wiki` — EducationContent + category sidebar + resources · backend `/educational/*`, static JSON via `useStaticJson` · submit = USER (rate-limited), moderate = MODERATOR.
- `/wiki/readlist` (+`public-readlists`), `/wiki/readlists` (+`[slug]`) — readlist CRUD + atlas index · `use-readlists` store + backend `/readlists/*`.
- `/wiki/topics`, `/wiki/c/[slug]`, `/wiki/learn/[chapter]/[[...sub]]` — atlas surfaces (`components/wiki/atlas/`: TopicsIndex, CommunityView, ChapterView).
- `/wiki/contributions` — ContributionsPanel + UserSubmissionModal · backend `/educational/*`, USER-gated.
- `/profile` — XP hub (stats/history/leaderboard/missions tabs via `?tab=`), referral, Telegram link · `src/services/xp/` (api+context+hooks; daily login idempotent via localStorage) · task→route mapping in `xp/taskRoutes.ts`.
- `/user` — admin panel + wiki moderation · ADMIN only.
- `/hip4` (+`[slug]`) — static educational chapters from `lib/hip4-chapters` snapshot (stale by design, dated).
- `/usdh` — swap widget (Privy wallet, HyperCore vs HyperEVM routing).
- `/labs/*` — design sandboxes, excluded from DS lint rules; **do not delete or refactor without asking**.

## Data source reliability

- **Robust:** LT backend (local DB) `/liquidations/*`, `/staking/*`, `/market/*`; Hypurrscan (fees, spotUSDC, holders, deploys); DefiLlama bridge; HL official API/RPC.
- **Unstable:** Hypedexer `/indexer/*` (402s) — vaults detail, priority-fees, hip4, builders depend on it; every dependent chart must degrade gracefully (fallbacks exist in vaults; priority-fees has schema-drift unwrappers).
- Backend dev runs on `:3002` (`/home/yanis/LiquidTerminal_Back`), CORS hardcoded to `localhost:3000`. Without it, most values render `$0.00`/`—` but layouts still render (useful for visual-check).
- `pnpm run start` on the backend serves the compiled `dist/`, **not** the source. After pulling backend commits, `pnpm run build` first — otherwise new routes 404 and the symptom looks like a frontend path bug (cost a debugging round on 2026-09-10).
- Locally, self-sampled series (`/market/metrics/history`, positioning history) return `[]` until the backend has been up for hours — tiles/charts that gate on history will read as "unavailable" on a fresh start. Not a defect.

## Known quirks (verified in code or memory)

- Spot data: "liquidity" is actually mid-price mislabeled; market caps garbage for bridged + pre-mint stables; duplicate token names → match by `tokenId`; fees window ≈ 10 days.
- HIP-4 backend: stale live status, null settlement names — frontend merges/falls back (see `buildMergedQuestions`).
- HIP-4 `/indexer/hip4/analytics`: the backend caps `coin` at 256 chars (zod) and `limit` counts rows across **all** coins of a request. Live-market volumes (~450 coins) are therefore batched in `fetchHip4OutcomeVolumes` and cached 5 min in `useHip4LiveMarkets` (coin-filtered calls skip the backend cache). HypeDexer lists both sides of an ungrouped binary under one `outcome_id` (`[141 Yes, 141 No]`), and `question_id` / `singleton_outcome_id` share one number space: key cards with `hip4QuestionKey`, never with a raw id.
- HL `perpDexs` no longer returns `deployerFeeScale`: it is per asset in `allPerpMetas` (`universe[].deployerFeeScale`), aggregated into `feeScaleRange` by `usePerpDexMarketData`.
- Hypedexer's `l4Book` delta stream is lossy: resting orders can leave the book with no `remove` diff (measured 2026-08-07 on HYPE — 10 of 10 asks the price traded through went unannounced). The backend rebuilds each book from a fresh snapshot every 8 s and prunes levels better than HL's touch; the frontend additionally overlays HL `l2Book` for the top 20. Never treat a purely incremental L4 book as accurate.
- `/explorer` and `/wiki` have pre-existing visual-check clip failures (mobile/1024) — predate the 2026-06 cleanup.
- `visual-check` needs the dev server + Playwright from gstack (`GSTACK_NODE_MODULES` env or `~/gstack`/`~/.claude/skills/gstack`).
- Wallet analytics (Hypedexer `/indexer/users/:user/performance`): defaults to a **7-day** window (`"window":"7d"`) — pass `start_time` (the `{ lifetime: true }` option) for all-time, otherwise it will not reconcile with `/overview` and `/coins`. `avg_trade_size` is not USD (unit undocumented) and `avg_holding_time_s` is inflated — neither is displayed. `total_fees` is positive for a market maker whose HL fills are rebates (sign ambiguous), so no PnL-minus-fees "net" is derived from it. The exchange-level number is HL `portfolio.pnlHistory` (deposits excluded), which is what the address ribbon shows; `accountValueHistory` deltas are polluted by transfers and must not be labelled PnL.
- HL RPC `userDetails` returns only the last ~300 signed actions (16 s of activity for an HFT wallet) and `userFills` the last 2 000 fills — "recent activity" ratios (wallet archetype) are computed over intents and fills separately.
- HL stamps system rows (TWAP slices, liquidation-engine fills, some `cStakingTransfer`s) with an all-zero hash — `isNullHash` keeps them out of every hash merge / lookup in `services/explorer/address` (they used to collapse into one bogus fill and hide null-hash ledger rows); table rows key on `withRowIds` ids, never on `hash`. Pre-2024-05 `userDetails` actions are tuples (`["withdraw2", …]`), not objects — `actionType()` reads both.
- Digest insights (`walletInsights.ts`): `completed-trades` timestamps are naive UTC (suffix `Z` before parsing); the cadence sample is the last 100 round-trips, so "recent form" compares that sample to the lifetime `win_rate`; the ledger's `subAccountTransfer` / `spotTransfer` / `send` carry `user` = sender and `destination` — direction is resolved against the page address; `0x0…`/`0xf…` are ignored, the HyperEVM bridge addresses (`0x2222…` HYPE, `0x20 00…00 <token idx>`) count as `toEvm`/`fromEvm` and come out of `netCapitalIn` — every flow insight compares PnL with that NET figure (deposits alone mislead when a linked account funds the wallet); liquidation insight takes max(DB, ledger) since the indexer win rate excludes liquidations; Hypedexer `last_activity` is `1970-01-01` for a never-traded wallet and HL answers a zero-filled `portfolio` for any address — both treated as no history; predicted funding is HL `HlPerp` APR, longs pay when positive.
- knip is configured (`knip.json`); `components/common/**` and `components/ui/**` are entry points — their exports are never "dead" (DS primitives kept for future pages).

## Refactor backlog (identified 2026-06, not yet applied)

- `<Num>` sweep: ~27 files hand-style numbers (`mono text-gold`…).
- TwapPanel / Hip4OutcomesCard / XpLeaderboard → ModuleTable/OverviewModule.
- Builders column factory (4 tables ~70% identical) · shared `<Skeleton>` primitive (27+ copies).
- Market websocket services → `lib/websocket-client.ts` (dedicated PR, medium-high risk).
- Deliberately rejected: generic form-modal base, unified Card — over-abstraction.
