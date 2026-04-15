# Liquid Terminal — Chart & Data Visualization Audit Report

**Date:** 2026-04-14
**Scope:** Full frontend chart audit — inventory, competitive benchmark, architecture, P0–P2 plan
**Branch:** `main`
**Status:** REPORT ONLY — no code changes applied

---

## Executive Summary

Liquid Terminal ships **15+ chart surfaces** across 7 domain areas using two libraries (Lightweight Charts v5 + Recharts v3). The visual quality is **above average for HL ecosystem dashboards** but **below institutional grade** on several axes: inconsistent chart chrome, scattered color definitions, missing error states, duplicate tooltip implementations, no shared chart theme, and unused abstractions that add dead code.

**What's working well:**
- `LightweightChart.tsx` wrapper is solid: ResizeObserver, crosshair, memo, clean API
- `TradingViewChart` candlestick with live WebSocket updates is well-built
- Good use of `useMemo` for chart data transforms
- Loading states present on most charts
- Design system tokens (brand-accent, brand-gold, etc.) used in some places

**What needs work:**
- No single chart theme — colors are hardcoded hex across 15+ files
- 5+ different CustomTooltip implementations with the same visual language
- 3 unused abstractions (`base/Chart.tsx`, `MultiSeriesLightweightChart`, `base/Period.tsx`)
- Missing error states on dashboard charts and auctions
- Inconsistent axis styling between Recharts and Lightweight Charts components
- No chart-specific Tailwind tokens (no `chart-1`, `chart-2`, etc.)
- Mobile chart experience lacks responsive polish
- No data source attribution or freshness indicators
- Liquidation chart doesn't refresh — WS only updates the table, not chart buckets

**Verdict:** Solid foundation, needs a unification pass to reach institutional quality. The gap is ~2 weeks of focused work (P0 + P1 items).

---

## 1. Complete Chart Inventory

### 1.1 By Library

| Library | Version | Files | Chart Types | Bundle Impact |
|---------|---------|-------|-------------|---------------|
| `lightweight-charts` | ^5.0.8 (resolved 5.1.0) | 4 source files | Area, Candlestick, Histogram | ~45KB gzipped (canvas) |
| `recharts` | ^3.8.1 | 6 source files | Line, Bar, Pie (donut) | ~120KB gzipped (SVG + d3) |

### 1.2 By Domain

#### Dashboard (`/dashboard`)
| Component | Library | Type | Data Source | Refresh | Error State |
|-----------|---------|------|-------------|---------|-------------|
| `ChartDisplay` → `LightweightChart` | LW Charts | Area | Bridge TVL (`useHLBridge` → LlamaFi) | 60s | **MISSING** |
| `ChartDisplay` → `LightweightChart` | LW Charts | Area | Auction gas (`useAuctions` → `/market/auction`) | 30s | **MISSING** |
| `FeesChartSection` → `ChartDisplay` | LW Charts | Area | Fee history (`useFeesHistory` → `/market/fees/raw`) | 300s | **MISSING** |

#### Market — Token Pages (`/market/spot/[token]`, `/market/perp/[token]`)
| Component | Library | Type | Data Source | Refresh | Error State |
|-----------|---------|------|-------------|---------|-------------|
| `TradingViewChart` | LW Charts | Candlestick | `useTokenCandles` → HL `/info` + `useTokenWebSocket` | Real-time WS | **Present** |

#### Market — Auctions (`/market/spot/auction`, `/market/perp/auction`)
| Component | Library | Type | Data Source | Refresh | Error State |
|-----------|---------|------|-------------|---------|-------------|
| `AuctionChart` → `LightweightChart` | LW Charts | Area (gold) | `useAuctionChart` → `/market/auction` | 30s | **Swallowed** (returns `error: null`) |
| `AuctionChart` → `LightweightChart` | LW Charts | Area (gold) | `usePerpAuctionChart` → Hypurrscan | 60s | **Swallowed** |

#### Market — Wallet Tracker (`/market/tracker/wallet/[address]`)
| Component | Library | Type | Data Source | Refresh | Error State |
|-----------|---------|------|-------------|---------|-------------|
| `PerformanceSection` | Recharts | Line | `usePortfolio` → HL `/info` | 30s | **Present** (empty only) |
| `DistributionSection` | Recharts | Donut | `useSpotTokens` + spot balances | Token refresh | **Present** |

#### Explorer — Liquidations (`/explorer/liquidations`)
| Component | Library | Type | Data Source | Refresh | Error State |
|-----------|---------|------|-------------|---------|-------------|
| `LiquidationsBarChart` | LW Charts | Histogram | `LiquidationsContext` → `/liquidations/data` | **None** (load once) | **Present** |

#### Explorer — Vaults (`/explorer/vaults`, `/explorer/vaults/[address]`)
| Component | Library | Type | Data Source | Refresh | Error State |
|-----------|---------|------|-------------|---------|-------------|
| `VaultEcosystemChart` | LW Charts | Area + CSS bars | `useVaultDetails` (HL) + `useVaults` | 30s | **Present** |
| `VaultDetailCharts` | LW Charts | Area | `useVaultEquitySnapshots` + `useVaultDailySnapshots` (indexer) | 60s | **Present** |
| `VaultChartSection` | LW Charts | Area | `useVaultDetails` | 30s | **Present** (but component is **unused/orphan**) |

#### Explorer — Validators (`/explorer/validator`)
| Component | Library | Type | Data Source | Refresh | Error State |
|-----------|---------|------|-------------|---------|-------------|
| `HoldersDistributionChart` | Recharts | Bar | `useHoldersStats` → `/staking/holders/stats` | 30s | **Present** (LoadingState/ErrorState/EmptyState) |
| `UnstakingScheduleChart` | Recharts | Bar | `useUnstakingStatsForChartWithDays` → `/staking/unstaking-queue/stats` | 30s | **Present** |
| `StakingLineChart` | Recharts | Line | `useUnstakingStatsForChartWithPeriod` | 30s | **Present** |

#### Explorer — Priority Fees (`/explorer/priority-fees`)
| Component | Library | Type | Data Source | Notes |
|-----------|---------|------|-------------|-------|
| `PriorityFeesOverviewChart` | **None** (stats grid) | KPI panel | `usePriorityFeesGossipHistory` | Named "Chart" but no actual charting — API lacks hourly buckets |

### 1.3 Unused / Orphan Components

| Component | Path | Reason |
|-----------|------|--------|
| `base/Chart.tsx` | `common/charts/base/Chart.tsx` | Generic Recharts LineChart wrapper — **zero consumers** |
| `base/Period.tsx` | `common/charts/base/Period.tsx` | Period selector — **zero consumers** |
| `base/Tooltip.tsx` | `common/charts/base/Tooltip.tsx` | BaseTooltip — **zero consumers** (everyone writes inline) |
| `MultiSeriesLightweightChart` | `common/charts/MultiSeriesLightweightChart.tsx` | Multi-line wrapper — **zero consumers** |
| `FeesChartDemo` | `dashboard/chart/FeesChartDemo.tsx` | Demo wrapper — **zero consumers** |
| `VaultChartSection` | `explorer/vault/VaultChartSection.tsx` | Vault chart — **no page import** |

---

## 2. Competitive Benchmark

### 2.1 Benchmark Targets

| Platform | Category | Why chosen |
|----------|----------|------------|
| **ASXN HyperScreener** | HL ecosystem dashboard | Direct competitor — same data domain |
| **Artemis Terminal** | Institutional crypto analytics | Gold standard for institutional-grade charts |
| **HyperStats** | HL trader analytics | Whale tracking + charts on same chain |
| **perp.wiki Stats** | HL aggregated stats | Community analytics dashboard |

### 2.2 Dimension-by-Dimension Comparison

| Dimension | Liquid Terminal | ASXN | Artemis | Target Principle |
|-----------|---------------|------|---------|-----------------|
| **Chart defaults** | Good area fill, but no gradient sophistication. Crosshair present but basic. | Gradient fills, multi-series overlays | Professional defaults: gridlines, proper tick density, no-code chart builder | Defaults should look polished with zero user config |
| **Tooltips** | 5+ different inline implementations, inconsistent padding/border/bg. Useful data shown. | Consistent tooltip with data density | Unified tooltip system across all charts with multi-metric display | ONE tooltip component. Consistent visual. Data-dense. |
| **Legends** | Missing on most charts (implicit via tabs/labels). No multi-series legends. | Present with toggle | Rich interactive legends with click-to-hide | Add legends for multi-metric views, keep simple for single-series |
| **Empty states** | Text-only "No data available" | Basic placeholder | Warm message + action suggestion | Empty state = opportunity for guidance, not dead-end |
| **Loading states** | Loader2 spinner (functional) | Skeleton shimmer | Skeleton matching layout shape | Skeleton > spinner for perceived performance |
| **Error states** | Missing on 5 of 15 chart surfaces | Basic error | Retry button + explanation | EVERY chart must show errors with retry action |
| **Axis readability** | Inconsistent: LW Charts `#525252` text, Recharts `#FFFFFF` text | Consistent muted | Adaptive tick formatting by viewport + period | Unified axis color: `text-muted` equivalent, auto-density |
| **Data freshness** | No indicators | Timestamp shown | "Last updated X ago" + live indicator | Show freshness. Build trust. |
| **Mobile** | Charts work but no responsive polish. `TradingViewChart` has mobile dropdown. | Responsive redesign | Full mobile parity | Charts must be touch-first on mobile. Minimum 44px touch targets. |
| **Period selectors** | 4+ different selector implementations (same visual, different code) | Consistent tabs | Unified filter bar | ONE `PeriodSelector` component used everywhere |
| **Performance** | Good `memo` usage. No virtualization needed (bounded datasets). Some charts load 10K+ auctions client-side. | Efficient | Server-side aggregation, lazy loading | Move aggregation server-side for auctions. Keep client transforms bounded. |
| **Accessibility** | No `role`, no `aria-label`, no keyboard nav on charts, no `tabular-nums` on axes | Basic | WCAG AA compliance on charts | Add `aria-label`, keyboard nav, `tabular-nums`, contrast check |
| **Theming** | No chart theme file. Colors inline. Two different text colors between libs. | Theme file | Design tokens drive chart config | Create `chartTheme.ts` as single source of truth |

### 2.3 Derived Target Principles

1. **ONE source of truth** for chart colors, axis styles, and grid config
2. **Tooltip unification** — single `ChartTooltip` with slots for different data shapes
3. **Error/empty/loading trifecta** — every chart surface must handle all three states
4. **Data freshness signal** — subtle "Updated Xs ago" on charts or sections
5. **Skeleton loading** over spinner for chart areas
6. **Consistent period selector** — one component, used by all
7. **Mobile-first chart chrome** — touch targets, responsive period selectors
8. **Progressive disclosure** — hero metric prominent, drill-down on interaction
9. **Source attribution** — small "via Hyperliquid" / "via HypeDexer" where appropriate
10. **`tabular-nums`** on all numeric displays in charts

---

## 3. Architecture Analysis

### 3.1 Current State

```
CHART ARCHITECTURE (current)
=======================================================

[Lightweight Charts]         [Recharts]
   │                            │
   ├─ LightweightChart.tsx ◀─── shared area wrapper
   │   ├─ ChartDisplay ◀──── dashboard-specific chrome
   │   ├─ AuctionChart
   │   ├─ VaultDetailCharts
   │   ├─ VaultEcosystemChart
   │   └─ VaultChartSection (UNUSED)
   │
   ├─ TradingViewChart.tsx ◀── standalone candlestick
   │
   ├─ LiquidationsBarChart ◀── inline histogram (not extracted)
   │
   └─ MultiSeriesLightweightChart (UNUSED)

                              ├─ PerformanceSection (LineChart)
                              ├─ DistributionSection (PieChart)
                              ├─ HoldersDistributionChart (BarChart)
                              ├─ UnstakingScheduleChart (BarChart)
                              ├─ StakingLineChart (LineChart)
                              └─ base/Chart.tsx (UNUSED wrapper)

[Shared hooks]
   ├─ useChartData → sort, normalize, derive stats
   ├─ useChartFormat → formatValue, formatTime, formatPercent
   └─ useChartPeriod → period state + labels

[PROBLEMS]
   ❌ No chart theme (colors inline in 15+ files)
   ❌ 5 duplicate CustomTooltip implementations
   ❌ 4 duplicate AnimatedPeriodSelector implementations
   ❌ 2 conflicting ChartDataPoint types (time vs timestamp)
   ❌ 3 unused wrapper components
   ❌ Axis text colors differ: #525252 (LW) vs #FFFFFF (Recharts)
   ❌ No error state on dashboard/auction charts
```

### 3.2 Library Stack Assessment

**Should we unify to one library?** No. The current dual-stack is correct:

| Use Case | Best Library | Why |
|----------|-------------|-----|
| Financial time-series (area, candlestick) | Lightweight Charts | Canvas rendering, 60fps scroll/zoom, built for OHLC, smaller bundle |
| Categorical charts (bar, pie, distribution) | Recharts | SVG declarative API, better for bar/pie/donut, animation support, easier to customize |
| Multi-series overlay | Lightweight Charts | Better performance with large datasets |

**Trade-offs of unification:**
- Moving bars/pie to LW Charts: no native Pie support, would need custom rendering
- Moving time-series to Recharts: SVG is slower at scale, no built-in crosshair magnet, no native OHLC

**Recommendation:** Keep the dual stack. Unify the **chrome** (themes, tooltips, selectors, states), not the rendering engine.

### 3.3 Target Architecture

```
CHART ARCHITECTURE (target)
=======================================================

src/components/common/charts/
├── theme/
│   └── chartTheme.ts          ← NEW: Single source of truth
│       ├── CHART_COLORS        (accent, gold, success, danger, series[])
│       ├── LW_CHART_OPTIONS    (layout, grid, crosshair, axis defaults)
│       ├── RECHARTS_THEME      (grid stroke, axis tick, tooltip style)
│       └── PERIOD_OPTIONS      (standardized period definitions)
│
├── components/
│   ├── ChartTooltip.tsx        ← NEW: Unified tooltip (slots for content)
│   ├── PeriodSelector.tsx      ← NEW: One selector, used everywhere
│   ├── ChartStates.tsx         ← NEW: Loading/Error/Empty with skeleton
│   ├── ChartWrapper.tsx        ← NEW: Wraps any chart with states + header
│   └── DataFreshness.tsx       ← NEW: "Updated Xs ago" indicator
│
├── lightweight/
│   ├── LightweightChart.tsx    (existing, refactored to use theme)
│   ├── HistogramChart.tsx      ← EXTRACTED from LiquidationsChartSection
│   └── CandlestickChart.tsx    ← EXTRACTED from TradingViewChart
│
├── recharts/
│   └── RechartsDefaults.tsx    ← NEW: HOC/provider applying theme to Recharts
│
├── hooks/
│   ├── useChartData.ts         (existing)
│   ├── useChartFormat.ts       (existing)
│   └── useChartPeriod.ts       (existing)
│
├── types/
│   └── chart.ts                (existing, cleaned: ONE ChartDataPoint)
│
└── index.ts                    (re-exports)
```

### 3.4 Key Duplications to Eliminate

| Duplication | Instances | Target |
|------------|-----------|--------|
| `AnimatedPeriodSelector` | `ChartDisplay.tsx`, `PerformanceSection.tsx`, `LiquidationsChartSection.tsx`, `AuctionChart.tsx` | `PeriodSelector.tsx` — one component |
| `CustomTooltip` | `PerformanceSection`, `DistributionSection`, `HoldersDistributionChart`, `UnstakingScheduleChart`, `StakingLineChart` | `ChartTooltip` — unified with slots |
| `COLORS` array | `DistributionSection` (10 colors), `MultiSeriesLightweightChart` (separate set) | `chartTheme.CHART_COLORS.series` |
| `formatValue` inline | `VaultEcosystemChart`, `LiquidationsChartSection`, `ChartDisplay`, `VaultDetailCharts` | `useChartFormat().formatValue` |
| Chart init config (LW) | `LightweightChart.tsx`, `LiquidationsChartSection.tsx`, `TradingViewChart.tsx` | `LW_CHART_OPTIONS` from theme |
| `ChartDataPoint` type | `LightweightChart.tsx` (`time` field), `types/chart.ts` (`timestamp` field) | One canonical type with adapter |

---

## 4. Gstack Review Passes

### 4.1 Plan Eng Review (Architecture & Edge Cases)

**Classification:** APP UI — data-dense, task-focused dashboard.

**Scope challenge (Step 0):**
- Complexity: 15+ chart files touched, but changes are incremental (theme extraction, not rewrite)
- Existing code that solves sub-problems: `useChartFormat`, `useChartData`, `useChartPeriod` — keep and extend
- Minimum viable: Theme file + tooltip unification + error states = 80% of the institutional gap closed

**Architecture findings:**

| # | Finding | Severity | Confidence |
|---|---------|----------|------------|
| 1 | Dashboard charts (`ChartDisplay`) have no error state — if API fails, user sees empty spinner forever | P0 | 9/10 |
| 2 | `useAuctionChart` swallows errors (`error: null` hardcoded) — user has no feedback on data failure | P0 | 10/10 |
| 3 | Liquidation chart doesn't refresh — WS updates table but chart stays stale until page reload | P1 | 9/10 |
| 4 | Auction data fetches 10,000 rows client-side then filters — should aggregate server-side | P1 | 8/10 |
| 5 | No shared chart theme — colors drift as each dev hardcodes hex values | P1 | 10/10 |
| 6 | Two conflicting `ChartDataPoint` types cause confusion for new contributors | P2 | 9/10 |
| 7 | 3 unused components add ~300 lines of dead code and confuse API surface | P2 | 10/10 |

**Performance findings:**

| # | Finding | Impact |
|---|---------|--------|
| 1 | `fetchAllAuctions` downloads full auction history (10K+ rows) for chart display — O(n) client memory | Medium: ~200ms parse on mobile |
| 2 | No `next.config` optimization for recharts/d3 tree-shaking (`optimizePackageImports`) | Low: ~15KB extra bundle |
| 3 | `LightweightChart` re-creates chart on `showGrid` change (dependency array issue) | Low: rare prop change |

### 4.2 Design Review (Visual Quality)

**Chart design score: C+ / B-**

Functional but generic. Good data coverage, inconsistent visual system.

| Category | Grade | Notes |
|----------|-------|-------|
| Visual hierarchy | B | Hero metrics present but inconsistent sizing across pages |
| Color consistency | C | 3+ different text colors for axes, no theme-driven palette |
| Tooltip quality | C | 5 implementations, varying padding/border/bg/text styles |
| Loading states | B- | Spinner present but no skeletons — perceived performance hit |
| Empty states | C- | Text-only "No data available" everywhere — no warmth, no guidance |
| Error handling | D | Missing on dashboard + auction charts (5 surfaces) |
| Mobile | C | Charts render but chrome (selectors, headers) not optimized for touch |
| Data density | B+ | Good info-to-pixel ratio on most charts |
| Axis readability | C | Different text colors/sizes between the two libraries |
| Typography in charts | B- | `font-inter` used but no `tabular-nums` on numeric values |

**AI slop risk:** Low. Design is custom-built, not template-driven. No purple gradients, no 3-column grids.

### 4.3 QA-Only (Chart-Specific Issues)

| # | Issue | Page | Severity |
|---|-------|------|----------|
| 1 | Dashboard fee chart: API error shows infinite spinner, no error message | `/dashboard` | High |
| 2 | Liquidation chart: switching period doesn't refresh chart data from API | `/explorer/liquidations` | High |
| 3 | Auction chart error: `useAuctionChart` returns `error: null` always | `/market/spot/auction` | High |
| 4 | Vault ecosystem "Top 5" bars: no loading state for bars tab, vault names truncated at 180px | `/explorer/vaults` | Medium |
| 5 | Performance chart: PnL % uses hardcoded `#4ADE80` / `#FF5757` instead of design tokens | `/market/tracker/wallet/[address]` | Low |
| 6 | Distribution pie: inner/outer radius hardcoded (50/100), breaks on small containers | same | Medium |
| 7 | Validator bar charts: white axis text (`#FFFFFF`) is harsh on dark background, should be `text-secondary` | `/explorer/validator` | Low |
| 8 | TradingViewChart: loading overlay uses custom spinner instead of `Loader2` used elsewhere | `/market/spot/[token]` | Low (consistency) |
| 9 | `PerformanceSection` uses `absolute inset-0` positioning — fragile layout if parent changes | `/market/tracker` | Low |
| 10 | Period selector on liquidation chart uses rose-500 accent instead of brand-accent | `/explorer/liquidations` | Low (by design for liquidation context) |

### 4.4 Performance / Benchmark

| Metric | Current | Target | Risk |
|--------|---------|--------|------|
| LW Charts bundle | ~45KB gz | ~45KB | OK — canvas-based, already efficient |
| Recharts bundle | ~120KB gz | ~90KB with tree-shaking | Add `optimizePackageImports: ['recharts']` to next.config |
| Auction data payload | ~10K rows fetched client-side | Server-side aggregation | P1: reduces initial load by ~1-2s on slow connections |
| Chart re-render on period change | Full chart destroy/recreate | Update data only, keep chart instance | Some charts already do this; standardize |
| Liquidation chart refresh | Never (load once) | Poll every 60s or re-aggregate from WS data | P1 |
| `LightweightChart` dependency array | `[showGrid]` causes full recreate | Add stable deps, separate chart init from data | P2 |

---

## 5. Prioritized Plan (P0 / P1 / P2)

### P0 — Critical Fixes (1-3 days)

These are bugs or trust-breaking gaps. Ship before anything else.

| # | Task | Files | Risk | Effort |
|---|------|-------|------|--------|
| 1 | **Add error states to dashboard charts** — wire `error` from `useFeesChartData` / `useChartTimeSeriesData` into `ChartDisplay` + `ChartSection` | `ChartDisplay.tsx`, `ChartSection.tsx`, `FeesChartSection.tsx` | Low | 2h |
| 2 | **Fix auction chart error swallowing** — surface `error` from `useAuctions` / `usePastAuctionsPerp` in `useAuctionChart` / `usePerpAuctionChart` | `useAuctionChart.ts`, `usePerpAuctionChart.ts`, `AuctionChart.tsx` | Low | 1h |
| 3 | **Add error state to AuctionChart component** — show retry-able error when data fails | `AuctionChart.tsx` | Low | 1h |
| 4 | **Refresh liquidation chart buckets** — add `refreshInterval` to context fetch OR re-aggregate from WS data | `LiquidationsContext.tsx`, `LiquidationsChartSection.tsx` | Medium (WS re-aggregation is complex) | 3h |

### P1 — Institutional Quality (1-2 weeks)

The unification pass that closes the gap with top-tier platforms.

| # | Task | Impact | Effort |
|---|------|--------|--------|
| 5 | **Create `chartTheme.ts`** — single source for all chart colors, axis styles, grid config, text sizes | Eliminates color drift, enables theming | 3h |
| 6 | **Unified `PeriodSelector`** — replace 4 duplicate implementations with one configurable component | DRY, consistent UX | 2h |
| 7 | **Unified `ChartTooltip`** — replace 5 inline CustomTooltip with one component accepting render slots | DRY, consistent visual | 3h |
| 8 | **Chart loading skeletons** — replace `Loader2` spinners with layout-matching skeleton shapes on chart areas | Perceived performance, institutional feel | 3h |
| 9 | **Consistent empty states** — add icon + message + suggested action to all "No data" states | User trust, engagement | 2h |
| 10 | **Extract `HistogramChart`** — move the inline histogram from `LiquidationsChartSection` into `common/charts/lightweight/` | Reusability, maintainability | 2h |
| 11 | **Unify axis styling** — use theme tokens for LW Charts `textColor` and Recharts tick `fill`, same `text-muted` equivalent | Visual consistency | 1h |
| 12 | **Add `tabular-nums`** — to all chart value displays, axes, and numeric KPIs | Professional numeric alignment | 30min |
| 13 | **Mobile chart polish** — responsive period selectors, minimum 44px touch targets, mobile-optimized headers | Mobile parity | 4h |
| 14 | **Add data freshness indicator** — subtle "Updated Xs ago" on chart sections | User trust, transparency | 2h |
| 15 | **Server-side auction aggregation** — backend endpoint that returns chart-ready bucketed data instead of 10K raw rows | Performance, UX on mobile | 4h (backend + frontend) |
| 16 | **Delete unused components** — remove `base/Chart.tsx`, `base/Period.tsx`, `base/Tooltip.tsx`, `MultiSeriesLightweightChart.tsx`, `FeesChartDemo.tsx`, `VaultChartSection.tsx` | Reduce confusion, dead code | 30min |

### P2 — Polish & Future (2-4 weeks, can defer)

| # | Task | Impact | Effort |
|---|------|--------|--------|
| 17 | **Unify `ChartDataPoint`** — one canonical type (`time: number` in ms), adapter for LW Charts (ms→s) | Developer experience | 1h |
| 18 | **Chart accessibility** — `aria-label` on chart containers, keyboard navigation for crosshair, screen reader summary | a11y compliance | 4h |
| 19 | **Source attribution** — "Data via Hyperliquid" / "Data via HypeDexer" in chart footers | Credibility, transparency | 1h |
| 20 | **Priority fees chart** — when API adds hourly buckets, implement a real time-series chart for `PriorityFeesOverviewChart` | Feature completeness | 3h |
| 21 | **Multi-series charts** — activate `MultiSeriesLightweightChart` for overlay views (e.g., TVL + fees, price + volume) | Data density, power users | 4h |
| 22 | **Chart export** — screenshot/PNG export button on charts | User sharing, social proof | 3h |
| 23 | **Recharts tree-shaking** — add `optimizePackageImports: ['recharts']` to next.config.mjs | ~30KB bundle reduction | 15min |
| 24 | **`LightweightChart` dependency array** — fix `[showGrid]` causing full chart re-init; separate chart creation from data updates | Performance edge case | 1h |
| 25 | **Chart annotations** — event markers (large liquidations, HL announcements) on time-series | Editorial value, context | 6h |

---

## 6. Quick Wins (< 30 min each, high impact)

1. **`tabular-nums`** on all chart numeric displays — one Tailwind class per component
2. **Delete 6 unused components** — ~300 lines removed, cleaner API surface
3. **`optimizePackageImports`** in next.config — ~30KB bundle savings, one line
4. **Consistent axis text color** — change Recharts charts from `#FFFFFF` to `#71717a` (text-muted)
5. **Consistent spinner** — `TradingViewChart` custom spinner → `Loader2` used everywhere else

---

## 7. Regression Risks

| Change | Risk | Mitigation |
|--------|------|------------|
| Extracting chart theme | Low — additive change | Apply theme to one chart at a time, visual regression check |
| Replacing period selectors | Medium — 4 files touched | One-at-a-time replacement, compare screenshots before/after |
| Replacing tooltips | Medium — 5 custom implementations | Keep old tooltip as fallback until new one verified per chart |
| Deleting unused components | Zero — no consumers | Verify zero imports via `grep` before deletion |
| Server-side aggregation | Medium — API contract change | Ship new endpoint alongside existing, migrate frontend then deprecate |
| LW Charts dependency array fix | Low — chart behavior change | Test all LW Charts surfaces after fix |

---

## 8. Summary: Position vs. Competition

### Where we are NOW:
- **vs. ASXN HyperScreener:** Roughly comparable on data coverage. Behind on visual consistency and error handling. Ahead on chart variety (candlestick, liquidation histogram).
- **vs. Artemis Terminal:** Behind on institutional polish (no chart theme, no legends, no data source attribution). The gap is in presentation, not in data depth.
- **vs. HyperStats:** Comparable on functionality. Behind on loading state polish.
- **vs. perp.wiki:** Ahead on interactivity and chart types. Behind on data freshness indicators.

### Where we'll be AFTER P0 + P1:
- Error handling parity with institutional platforms
- Unified visual language across all charts (one theme, one tooltip, one selector)
- Skeleton loading matching Artemis quality
- Mobile experience competitive with ASXN
- Data freshness signals building user trust
- Clean codebase: 6 dead components removed, 14 duplications eliminated

### Remaining debt after P1:
- Accessibility (P2 — keyboard nav, ARIA labels, screen reader)
- Multi-series overlays (P2 — activate dormant `MultiSeriesLightweightChart`)
- Chart export (P2 — screenshot/share)
- Event annotations (P2 — editorial value layer)

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Status | Findings |
|--------|---------|-----|--------|----------|
| Eng Review | Manual (plan-eng-review equivalent) | Architecture & edge cases | COMPLETE | 7 architecture issues, 3 performance issues |
| Design Review | Manual (design-review equivalent) | Visual quality, consistency | COMPLETE | Score C+/B-, 10 categories graded |
| QA-Only | Manual (qa-only equivalent) | Chart-specific bugs | COMPLETE | 10 issues found (3 high, 3 medium, 4 low) |
| Benchmark | Manual (benchmark equivalent) | Performance metrics | COMPLETE | 6 metrics documented, 2 need action |

**VERDICT:** Audit complete. P0 items are trust-breaking bugs that should ship this week. P1 is the institutional quality pass, ~2 weeks focused work. The chart foundation is solid — the gap is in unification, not fundamentals.
