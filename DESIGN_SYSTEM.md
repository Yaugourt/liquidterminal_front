# Liquid Terminal — Design System V4

> Single source of truth for the design system. Every new screen or component composes from here; no style value is re-invented.

## 1. Philosophy

- **Analytics-first** — aim for DefiLlama / Token Terminal level: info density, scannable hierarchy, restraint.
- **Real data only** — no fake sparkline / delta / point. If the source doesn't expose history, don't display it.
- **Flat background with subtle depth** — `bg-base` plus a discreet halo at the top of the page. No loud gradients.
- **One primitive, many domains** — all tables go through `TypedDataTable`, charts through `chartPalette`, cards through `<Card>` + card-head. Pages compose, they don't re-style.

## 2. Tokens

### Colors

| Tailwind token | Hex | Usage |
|---|---|---|
| `bg-base` | `#08101A` | App background |
| `bg-surface` | `#0F1421` | Card / sidebar background |
| `bg-surface-2` | `#141B2A` | Table header, hover, pills |
| `bg-surface-3` | `#1C2436` | Deeper hover, dropdown items |
| `border-subtle` | `#1E2535` | Internal borders, separators |
| `border-default` | `#2C354A` | Card borders, inputs |
| `text-primary` | `#E8EAED` | Primary text |
| `text-secondary` | `#9CA3AF` | Labels, subtitles |
| `text-tertiary` | `#6B7280` | Muted text, captions |
| `brand` | `#83E9FF` | Cyan accent — links, focus, active state |
| `brand-deep` | `#1692AD` | Darker brand variant (gradients) |
| `gold` | `#F9E370` | Fees, secondary accent |
| `success` | `#1FA85B` | Positive, long, buy |
| `danger` | `#E53E3E` | Negative, short, sell |

**Charts** — dedicated palette in `@/components/common` (`chartPalette`): `accent`, `gold`, `violet` (`#A78BFA`), `down` (rose), `roseLight`, `roseSoft`.

### Typography

- Single stack **Inter** — `font-sans` and `font-mono` both resolve to Inter.
- `.mono` class for tabular numbers (`font-feature-settings: "tnum"`). Prefer `.mono` over `tabular-nums`.
- Common sizes:
  - Card hero: `text-[20px]` to `text-[23px]`, `font-semibold`, `tracking-[-0.02em]`.
  - Card title (card-head): `text-[13px] font-semibold`.
  - Stat label: `text-[10.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold`.
  - Table column header: `text-[9px]–[10px] uppercase tracking-wide text-text-tertiary`.
  - Table row: `text-[11.5px]`–`text-[12.5px]`.

### Radii

- `rounded-md` (6px) — pills, buttons, small cells.
- `rounded-lg` (8px) — cards, inputs.

### Spacing

- Main gap: `gap-4` (16px).
- Card-head: `px-3.5 py-2.5`.
- Card body: `px-3.5 py-3` or `px-3` depending on density.

## 3. Layout shell

### Page background

```tsx
<div className="min-h-screen bg-base text-text-primary font-inter">
  {/* Subtle halo — gives depth to the flat background */}
  <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[340px]
                  bg-gradient-to-b from-surface/60 to-transparent" />
  <Sidebar … />
  <div className="relative z-10 lg:pl-[232px]">
    <Header />
    <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
      {children}
    </main>
  </div>
</div>
```

**z-index rule**: the halo is `z-0`, the content **must** be `relative z-10`. Otherwise the halo paints over and washes out the text.

### Sidebar

- Width **`232px`** at `lg+`, `208px` on mobile.
- `bg-surface` + `border-r border-border-subtle`.
- Brand block (logo + "Liquid Terminal" + subtitle `HYPERLIQUID DATA`).
- Group labels: `text-[10px] uppercase tracking-[0.1em] text-text-tertiary font-semibold`.
- Active item: `bg-brand/10 text-text-primary` + cyan icon + side rail `w-[2px] h-4 bg-brand`.

### Header

- **Sticky**: `sticky top-0 z-30 bg-base/80 backdrop-blur-xl`.
- **No bottom border** (`border-b` removed for a clean transition).
- Search bar: `bg-surface border border-border-default rounded-lg`, magnifier icon left in `text-text-tertiary`, focus `border-brand`. Suggestions dropdown in `bg-surface-2 border-border-default`.

## 4. Card (central pattern)

### Container

```tsx
<Card className="overflow-hidden flex flex-col">…</Card>
```
- `<Card>` from `@/components/ui/card` — encodes `bg-surface` + `border border-border-subtle` + `rounded-lg`.
- Default padding: **none**. The content manages its own padding.

### V4 card-head (apply everywhere)

```tsx
<div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
  <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
    <Icon size={13} className="text-brand" />
  </span>
  <h3 className="text-[13px] font-semibold text-text-primary">{title}</h3>
  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded
                   bg-surface-2 text-text-tertiary border border-border-subtle">
    {tag}
  </span>
  <Link href={…} className="ml-auto flex items-center gap-1 text-[11px]
                            font-medium text-brand hover:text-brand-hover">
    View all <ArrowRight size={12} />
  </Link>
</div>
```

### `tag` pills

- Sober: `text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle`.
- **LIVE / FEED** variant: `bg-success/10 text-success border-success/25` + pulsing dot `<span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />`.

### Section sub-head (above grids)

```tsx
<SectionHead title="Network Pulse" subtitle="Real-time ecosystem metrics" href="/…" />
```
- `flex items-baseline gap-3 mb-1`.
- h2 `text-[14px] font-semibold text-text-primary`, subtitle `text-[11px] text-text-tertiary`, optional link `ml-auto`.

## 5. Tables

**Hard rule**: raw `<Table>` from `@/components/ui/table` is **forbidden outside `src/components/common/`** (ESLint). Two patterns depending on context:

### 5.a — Page tables (market, explorer, …)

For a standalone table inside a page, use `<TypedDataTable<Row>>` from `@/components/common`:

```tsx
<TypedDataTable<Row>
  title={…}
  icon={…}
  columns={[
    { key: "name",   header: "Token",  accessor: (r) => <TokenCell … /> },
    { key: "price",  header: "Price",  type: "numeric",  accessor: (r) => fmtPrice(r.price) },
    { key: "fees",   header: "Fees",   type: "fees",     accessor: (r) => compactUsd(r.fees) },
    { key: "chg",    header: "24h",    type: "change",   accessor: (r) => r.change24h },
  ]}
  data={rows}
  getRowKey={(r, i) => `${r.name}-${i}`}
  isLoading={…} error={…}
  density="compact"
  onRowClick={…}
  rowMotion
/>
```

`Column.type` automatically applies `.mono` + right alignment + signed color depending on the type.

### 5.b — Compact table cards (`ModuleTable`)

**`ModuleTable` is THE primitive for any compact table rendered inside a card.** Use cases all share the same visual contract: card-head + dense rows + per-column alignment + hover. It covers, but is not limited to:

| Use case | Density | Example |
|---|---|---|
| Leaderboard (top N) | `comfortable` | Top Vaults / Top Validators / Top Builders |
| Live feed (streaming) | `compact` | Latest blocks, latest transactions, live fills |
| Recent activity | `compact` | Token deploys, bridge events, recent liquidations |

Source: `src/components/common/OverviewModule.tsx`. App-wide primitive — consumed by `dashboard/`, `explorer/`, and any future leaderboard surface.

#### Hard rules

- **Never** write `<div className="grid grid-cols-[Npx_…]">` to build a table inside a card. Blocked by ESLint (`no-restricted-syntax`, regex on `grid-cols-[…_…_…]` with a `px` track).
- **Never** put `TypedDataTable` inside a card — `TypedDataTable` is reserved for **standalone** page tables (§5.a).
- Column widths live **once** on `columns[].width`. Header and rows stay aligned automatically through `<colgroup>` — no chance of header/row mismatch.

#### API

```tsx
<ModuleTable
  density="compact"            // optional, default "comfortable"
  columns={[
    { header: "Block",    align: "left",  width: 90 },   // fixed px
    { header: "Age",      align: "left",  width: 60 },
    { header: "Txs",      align: "left",  width: 56 },
    { header: "Proposer", align: "left"               },  // omit width → flex
  ]}
>
  {rows.map((b) => (
    <ModuleTableRow
      key={b.height}
      href={`/explorer/block/${b.height}`}   // optional, makes the row clickable
      cells={[
        <span key="block"    className="mono font-semibold text-brand">{b.height}</span>,
        <span key="age"      className="mono text-text-tertiary">{timeAgo(b.blockTime)}</span>,
        <span key="txs"      className="mono text-text-primary">{b.numTxs}</span>,
        <span key="proposer" className="mono text-text-secondary">{truncateAddr(b.proposer)}</span>,
      ]}
    />
  ))}
</ModuleTable>
```

#### Leaderboard example (`OverviewModule` wrapper)

When the card-head is the standard "icon + title + tag + View all" with a single `href`, wrap `ModuleTable` in `<OverviewModule>` to factor it out:

```tsx
<OverviewModule
  title="Top Vaults"
  icon={<Vault size={13} className="text-brand" />}
  tag={`${compactUsd(totalTvl)} TVL`}
  viewAllLabel="All vaults"
  href="/explorer/vaults"
>
  <ModuleTable
    columns={[
      { header: "Vault" },
      { header: "APR" },
      { header: "TVL" },
      { header: "Leader" },
    ]}
  >
    {rows.map((v) => (
      <ModuleTableRow
        key={v.address}
        href={`/explorer/vaults/${v.address}`}
        cells={[
          <ModuleAsset key="vault" assetName={`xyz:${v.symbol}`} name={v.name} />,
          <span key="apr"    className="mono text-success">{v.apr.toFixed(1)}%</span>,
          <span key="tvl"    className="mono text-text-primary">{compactUsd(v.tvl)}</span>,
          <span key="leader" className="mono text-text-secondary">{truncateAddress(v.leader)}</span>,
        ]}
      />
    ))}
  </ModuleTable>
</OverviewModule>
```

#### Live feed example (custom card-head)

When the card-head needs more than one pill, a `LIVE` indicator, or a custom layout, render `<Card>` + the V4 card-head markup inline (§4) and put `ModuleTable` inside:

```tsx
<Card className="overflow-hidden flex flex-col">
  <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
    <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
      <Boxes size={13} className="text-brand" />
    </span>
    <h3 className="text-[13px] font-semibold text-text-primary">Latest blocks</h3>
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
      10 newest
    </span>
    <LivePill connected={isConnected} />
    <Link href="/explorer" className="ml-auto …">View all <ArrowRight size={12} /></Link>
  </div>
  <ModuleTable density="compact" columns={…}>{…}</ModuleTable>
</Card>
```

### 5.c — Token avatars (HL CDN)

Two primitives, one source of truth (`getTokenIconUrl`).

#### `<TokenAvatar>` — inline coin badge (use everywhere)

The standalone "small coin badge" for tables, feeds, modal headers, anywhere outside the leaderboard cell pattern.

```tsx
<TokenAvatar assetName="BTC"          size="md" />   /* perp     */
<TokenAvatar assetName="HYPE_spot"    size="lg" />   /* spot     */
<TokenAvatar assetName="xyz:BRENTOIL" size="sm" />   /* HIP-3    */
<TokenAvatar assetName="USDC" kind="spot" />          /* force spot lookup */
```

Sizes: `xs` (16px), `sm` (18px), `md` (20px, default), `lg` (24px). Always `rounded-md bg-brand/10 text-brand`. On load failure, falls back to 2 uppercase initials via `getTokenInitials`.

**Never** roll your own `<Image src=… onError=…>` inline — go through `<TokenAvatar>` so HL CDN naming and the fallback look stay consistent.

#### `<ModuleAsset>` — leaderboard cell (`avatar + name + sub`)

The **single "name + avatar" cell** used in leaderboard cards.

**Preferred** — let `ModuleAsset` fetch the Hyperliquid CDN icon for you:

```tsx
<ModuleAsset assetName="BTC"            name="BTC"          />   /* perp     */
<ModuleAsset assetName="HYPE_spot"      name="HYPE"         />   /* spot     */
<ModuleAsset assetName="xyz:BRENTOIL"   name="BRENTOIL"     />   /* HIP-3    */
```

`assetName` is resolved against `https://app.hyperliquid.xyz/coins/{assetName}.svg` via the canonical helper `getTokenIconUrl` (`src/lib/tokenIconUrl.ts`). On 404 or network error the avatar falls back to 2 uppercase initials. The `xyz:` prefix is preserved verbatim; `_spot` / `_USDC` suffixes pass through.

**Escape hatch** — pass arbitrary content via `logo`:

```tsx
<ModuleAsset logo={'AB'}              name={displayName} />   /* 2-initials   */
<ModuleAsset logo={<Image src={…} />} name={displayName} />   /* custom image */
```

Wrapper geometry: `w-6 h-6 rounded-md bg-brand/10 text-brand overflow-hidden`. When an image is rendered, it fills the wrapper (`object-cover`). The `name` label is `text-[12.5px] font-semibold`, `sub` is `text-[10px] text-text-tertiary`.

**Never**:
- re-implement a custom avatar (square, circle, anything else) inside a leaderboard card — use `<ModuleAsset>` or `<TokenAvatar>`;
- use `<TokenIcon>` (legacy cyan-on-navy circle) inside a leaderboard card;
- hand-build the HL CDN URL inline — always go through `getTokenIconUrl` so spot/HIP-3 conventions stay consistent.

## 6. Charts

The V4 chart system is split between **5 generic primitives** (`common/charts/`), **2 domain-specific custom SVGs**, and **one LWC factory** for TradingView candlesticks. Pick by use case from the decision table below — don't invent a chart layout from scratch.

### 6.1 Pick the right primitive

| Use case | Primitive | Tech |
|---|---|---|
| Mono-series time series (single line + area) | `<AuroraAreaChart>` | Recharts |
| Multi-series time series, dual-axis | `<MultiSeriesAreaChart>` | Recharts |
| Histogram per time bucket (per-bar colors) | `<AuroraHistogramChart>` | Recharts |
| Inline micro-curve in a stat cell | `<Sparkline>` | Inline SVG |
| **Top-N + Rest donut** (concentration) | **`<DonutTopN>`** | Recharts |
| **Top-N ranking with animated bars** | **`<FlowGrid>` + `<FlowBar>`** | CSS + Framer Motion |
| Candle / OHLC + volume (trading) | `createLwcChartOptions()` + `createChart` | `lightweight-charts` |
| Cumulative dual-line (Long/Short cumul) | Domain SVG — see `LiquidationsPanel` | Inline SVG |
| Bipolar mirror bar (in/out 24h) | Domain SVG — see `BridgeFlow` | Inline SVG |
| Probability bar Yes/No (HIP-4 outcome) | `Hip4OutcomeBar` (domain primitive) | CSS |

Anything else (heatmap, scatter, bubble, radar, …) doesn't exist yet — don't add it speculatively. **Rule**: a new primitive lands when ≥ 2 callers will use it.

### 6.2 Color conventions (semantic)

Always source from `chartPalette` (`@/components/common`). Hardcoded hex blocked by ESLint, with `chartTheme.ts` as the only authorized SSOT.

| Token | Semantic | Examples |
|---|---|---|
| `chartPalette.accent` (cyan `#83E9FF`) | Primary volume, neutral positive signal, deposits | Bridge TVL, builder volume |
| `chartPalette.gold` (`#F9E370`) | Fees, premium accent | Builder fees, dashboard fees |
| `chartPalette.violet` (`#A78BFA`) | **Open Interest**, secondary metric on a dual-bar chart | `Hip4MarketsFlowChart` OI column |
| `chartPalette.success` (`#1FA85B`) | Long, buy, deposit, win | TWAP Buy, liquidations Long, bridge in |
| `chartPalette.danger` (`#E53E3E`) | Short, sell, withdraw, loss | TWAP Sell, liquidations Short, bridge out |
| `chartPalette.multiSeries[0..7]` | Categorical (donut slices, stacked bars) | `DonutTopN`, `Hip4MarketShareChart` |

`chartPalette.success` / `chartPalette.danger` match the V4 Tailwind tokens `text-success` / `text-danger` exactly — use them inside any SVG that sits next to a UI element so the directional color is identical.

### 6.3 Animation reference — Builders style

Two animations are reused everywhere through `FlowGrid` and `DonutTopN`:

- **Container entrance**: `opacity 0 → 1`, `y 8 → 0`, `delay 0.15s`, `duration 0.35s`.
- **Row stagger**: `opacity 0 → 1`, `x -4 → 0`, **`delay = index * 0.03s`**, `duration 0.25s`.
- **Bar fill**: `width 0% → ratio·100%`, `duration 0.6s`, `ease "easeOut"`, **`delay = index * 0.03s`** (synced with row).
- **Donut hover**: ActiveArc Sector `+8px` + halo ring `+10/+13` opacity `0.45`. Drop-shadow filter `0 0 14px {color}aa` on the active slice, `transition: filter 0.25s ease`.

When in doubt, copy `BuildersFlowChart` / `BuildersOverviewChart` as the reference render.

### 6.4 `<DonutTopN>` — Top-N + Rest donut

```tsx
<DonutTopN
  data={slices}                  // { key, name, value, color }[]
  size={220}                     // px, square
  innerRadius={0.62}             // ratio
  outerRadius={0.88}             // ratio
  paddingAngle={2}
  variant="active-arc"           // "active-arc" (default, Builders ref) | "dim-others"
  useGradient                    // radial gradient fill (default true)
  activeGlow                     // drop-shadow on hover (default true)
  activeIdx={activeIdx}          // controlled hover index
  onActiveChange={setActiveIdx}  // controlled hover setter
  center={<CenterLabel … />}     // absolute content over the donut
/>
```

The donut owns the Recharts plumbing (gradients, ActiveArc, drop-shadow). The card-head + center label + legend are rendered by the consumer (kept outside so each card stays free to layout around the donut).

**Migrations done**: `BuildersConcentrationCard` (`variant="dim-others"`, no gradient), `BuildersOverviewChart` (`active-arc`, gradient + glow), `Hip4MarketShareChart` (`active-arc`, gradient + glow).

### 6.5 `<FlowGrid>` + `<FlowBar>` — Top-N ranking with animated bars

```tsx
<FlowGrid
  rows={top}
  rowKey={(r) => r.builder}
  onHoverChange={setHoverIdx}
  columns={[
    { header: "#",      width: 20,    align: "right", render: (_, i) => <Rank i={i} /> },
    { header: "Builder", width: 80,                    render: (r) => <Name … /> },
    { header: "Volume",  width: "1fr",                  render: (r, i) => (
      <FlowBar
        ratio={(r.totalVolume ?? 0) / maxVol}
        delay={i * 0.03}            // synced with FlowGrid row stagger
        variant="solid"             // Builders reference
        color={chartPalette.accent}
        minVisiblePct={6}           // always visible even when ratio = 0
        label={compactUsd(r.totalVolume ?? 0)}
      />
    )},
    …
  ]}
/>
```

`<FlowBar>` has two visual variants:

- **`solid`** (Builders reference) — solid `chartPalette.accent` fill, label inside the bar.
- **`gradient`** (Hip-4 reference) — `linear-gradient(90deg, rgba(color, αlow), rgba(color, αhigh))`, alpha varies with `ratio`. Use it when a second metric (e.g. Open Interest) sits next to a primary volume bar.

`direction="rtl"` mirrors the bar (used by `Hip4MarketsFlowChart` to right-align the volume bar so it visually feeds into the OI bar to its right).

**Migrations done**: `BuildersFlowChart` (solid brand fill), `Hip4MarketsFlowChart` (gradient cyan vol + gradient violet OI). ESLint now blocks reintroducing inline `grid-cols-[Npx_…_…]` flow tables — go through `FlowGrid`.

### 6.6 LWC (`lightweight-charts`) — `createLwcChartOptions()`

Single entry point for any production LWC chart. The factory deep-merges your overrides into `lwcDefaults` so layout / grid / crosshair / scale defaults stay consistent.

```ts
const chart = createChart(container, createLwcChartOptions({
  layout: { background: { type: ColorType.Solid, color: "transparent" } },
  rightPriceScale: { scaleMargins: { top: 0.08, bottom: 0.26 } },
  timeScale: { rightOffset: 8, barSpacing: 8 },
}));
```

**Never** call `createChart()` with a raw inline config in production. The only LWC chart in production today (`TradingViewChart`) consumes the factory. The lab demo (`QuantumCandleChart` in `labs/`) is intentionally exempt.

### 6.7 Anti-mix rule

Don't stack more than 3 series of **different natures** (flow vs stock) on the same chart. When you have 4 disparate metrics (Liquidations, Fees, Bridge TVL, Stablecoins), prefer a **tab selector** over a 4-series overlay — readability collapses otherwise.

### 6.8 Sparkline — quick reference

```tsx
<Sparkline data={feeTrend} color={chartPalette.gold} height={20} className="mt-auto pt-2" />
```

Used inside `StablecoinsCard`, `PulseBar`, `Hip4GlobalStatsStrip`, vault detail commission timeline. No axis, no tooltip — meant to be a glanceable micro-trend, never the primary chart. Lives in `common/` (shared primitive) and is re-exported from `dashboard/` for backwards compatibility.

### 6.9 `<StackedShareBar>` — proportional split bar

A single horizontal track split into proportional colored segments (Buy vs Sell share, N-outcome composition). Distinct from `<FlowBar>` (one fill vs a track) and `<Progress>` (single value, fixed brand gradient): it renders the **relative split** of several parts.

```tsx
<StackedShareBar
  height={10}
  segments={[
    { value: buy,  colorClass: "bg-success", label: `Bought ${compactUsd(buy)}` },
    { value: sell, colorClass: "bg-danger",  label: `Sold ${compactUsd(sell)}` },
  ]}
/>
```

Prefer `colorClass` (a `bg-*` token) so the bar stays on-token; `color` (explicit, e.g. a `chartPalette` entry) is available for multi-series. Lives in `common/charts/`. Used by `Hip4PositioningBar` (observed trade-flow split).

## 7. Composition patterns

Generic composition patterns, **applicable everywhere** in the app (dashboard, market, explorer, …). The DS encodes composition; domains consume it.

### 7.a — Compact table card (leaderboard / feed / activity)

**The** pattern for any compact table inside a card — regardless of domain. Source: `src/components/common/OverviewModule.tsx`. Full API and examples in §5.b.

Building blocks:

- `<OverviewModule title icon tag href viewAllLabel>` — wrapper with the standard V4 card-head (icon + title + tag + `View all` link). Use it whenever the card-head fits the standard shape. Always pass an icon. For non-standard heads (multiple pills, `LIVE` indicator, no link), use `<Card>` + the inline card-head markup from §4.
- `<ModuleTable columns density?><ModuleTableRow cells href? /></ModuleTable>` — the table itself. **One single source of truth for column widths** (`columns[].width`), header and rows stay pixel-aligned through `<colgroup>`. Two densities: `comfortable` (default, leaderboards) and `compact` (feeds, recent activity).
- `<ModuleAsset assetName name sub />` — standard asset cell (see §5.c).
- `<ModuleRow rank logo name sub stats={[{label,value}]} href? />` — alternative "leaderboard list" layout (no table, explicit ranks). Use when a header-less layout makes more sense.
- `<ModuleSubhead>HIP-3 Perp DEXs</ModuleSubhead>` — body subtitle inside a module.

**Uniformity guarantee**: every compact table card shares pixel-perfect card-head, avatar, row height, hover color, column edges and `View all` link. ESLint blocks reintroducing hand-rolled `grid-cols-[Npx_…_…]` table layouts (§5.b hard rules).

### 7.b — KPI ribbon

Horizontal strip of stat cells. **Consume the `<KpiRibbon>` primitive** (`@/components/common`) — do not hand-roll the strip. `PulseBar`, `VaultsKpiStrip`, `Hip4GlobalStatsStrip` and `NetworkPulse` all go through it.

```tsx
<KpiRibbon
  columns="grid-cols-2 sm:grid-cols-4"        // optional; defaults by cell count
  cells={[{ label, value, sub?, tone?, sparkline? }]}
/>
// Grouped ribbons (e.g. NetworkPulse): stack <KpiRibbon header={{label, helper}}> in space-y-*.
```

The primitive locks the look (the recipe below); callers pass data only.

- Container: `grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-N gap-px bg-border-subtle border border-border-default rounded-lg overflow-hidden`.
- Cell: `bg-surface hover:bg-surface-2 px-4 py-3 flex flex-col` — uppercase label `text-[10.5px]` + value `.mono text-[20px] font-semibold`.
- `tone`: `default | gold | success | danger` (semantic token, never raw hex).
- Optional sparkline at the bottom of the cell via `mt-auto pt-2` (only if the API exposes a real series).

### 7.c — Card grids (equal height)

- **No `items-start`** on rows of paired cards (`grid-cols-2`, `grid-cols-3`) → cards stretch to equal height (default `stretch`). Components designed to stretch (`flex-1` on the main section, `mt-auto` on footers) fill in correctly.
- `items-start` is reserved for asymmetric main+aside layouts (e.g. main chart + shorter right column).

### 7.d — Outcome row (prediction markets)

`<OutcomeRow>` (`@/components/common`) — the canonical "labelled probability bar": colored dot + label, optional volume + implied %, and a thin progress bar underneath. Consolidates the two predecessors it replaces (the Hip-4 card `ProbRow` + `Hip4OutcomeBar`).

```tsx
<OutcomeRow
  label="Yes" pct={62} variant="success"          // success | danger | brand (token)
  // …or color={chartPalette.multiSeries[i]}       // explicit color → multi-outcome (overrides variant)
  volume={vol}
  selected={coin === activeCoin}                   // optional → selectable button (active ring)
  onSelect={() => setActiveCoin(coin)}
/>
```

- Color: `variant` (semantic token — Yes/No/brand) OR `color` (explicit, multi-series). `color` wins.
- `onSelect` turns the row into a selectable button. Used by `Hip4OutcomeList` (binary / versus / ladder variants — one template per market type).

### 7.e — Delete confirmation dialog

`<DeleteConfirmDialog>` (`@/components/common`) — the canonical destructive-action confirm: `Dialog` + danger warning row (`AlertCircle`) + Cancel / Delete footer with built-in loading label. Consolidates the three predecessors (wallet, wallet-list, public-goods delete dialogs). Do not hand-roll delete confirms.

```tsx
<DeleteConfirmDialog
  open={open} onOpenChange={setOpen}
  title="Delete Wallet"
  description={<>The wallet <span className="font-semibold">{name}</span> will be permanently deleted.</>}
  confirmLabel="Delete"          // optional, default "Delete"
  isLoading={isDeleting}
  onConfirm={handleDelete}
/>
```

### 7.f — Loading skeletons

`<Skeleton>` / `<SkeletonCard>` / `<SkeletonGrid>` (`@/components/common`) — the canonical loading placeholders. Token-only shimmer (`bg-surface-2` + `animate-pulse`, never raw hex/`bg-white/x`). Do not hand-roll `animate-pulse` blocks.

- `<Skeleton className />` — base shimmer block, sized via `className` (`h-4 w-1/2`).
- `<SkeletonCard avatar? lines? />` — card-shaped placeholder mirroring the `<Card>` chrome (`bg-surface border-border-subtle rounded-lg`), so the loading → loaded swap doesn't shift the layout.
- `<SkeletonGrid count? columns? gap? avatar? lines? />` — a responsive grid of `SkeletonCard`s; replaces the `grid + map` boilerplate every card-grid loading state re-implements. **Match `gap`/`columns` to the real grid** so nothing jumps.

```tsx
{isLoading
  ? <SkeletonGrid count={6} gap="gap-6" />
  : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{cards}</div>}
```

## 8. Services — 4-layer architecture

```
src/services/<domain>/
├── api.ts            (Layer 1 — HTTP via withErrorHandling + get/post/del/...)
├── types.ts          (Layer 2 — TS interfaces)
├── hooks/
│   └── useX.ts       (Layer 3 — useDataFetching)
└── index.ts          (barrel)
```

### Rules

1. **`withErrorHandling`** wraps every HTTP call (descriptive context required).
2. **Centralized helpers** `get / post / put / del / patch` from `@/services/api/axios-config`. For external APIs (Hypurrscan, DefiLlama) use `getExternal / postExternal`.
3. **`useDataFetching<T>`** is the base for every fetch hook — handles cache, retries, refresh interval.
4. No `any`. Everything is typed.

### Refresh intervals

| Data type | refreshInterval |
|---|---|
| Real-time (orderbook, fills) | `10000` (10 s) |
| Normal (stats, market) | `30000` (30 s) |
| Static / historical | `60000`–`300000` |

## 9. Formatters & helpers

Everything lives in `@/lib/formatters/numberFormatting.ts` and `dateFormatting.ts`.

- `compactUsd(n, opts?)` — `$1.2M / $3.4B / $42 / —` (handles `null/NaN`, negative-aware).
- `compactHype(n, opts?)` — same shape as `compactUsd` without the `$` (caller appends ` HYPE`).
- `compactCount(n, opts?)` — integer counts (followers/holders/depositors): `1.2M / 4.5K / 123 / —`.
- `formatNumber(value, format, opts)` — locale-aware (`'US' | 'EU' | 'FR' | 'PLAIN'`).
- `formatPrice(value, format)` — adaptive decimals based on magnitude (sub-cent → 6, $1+ → 2, $1000+ → 0).
- `formatMetricValue(value, opts)` — display formatter for KPI ribbons.
- `formatLargeNumber(value, { prefix, decimals })` — chart Y axis.

Token-icon helpers in `@/lib/tokenIconUrl.ts`:

- `getTokenIconUrl(assetName, kind?)` — single source of truth for the HL CDN URL. Handles `xyz:` (HIP-3), `_spot` / `_USDC` (spot), and bare tickers (perp). When the backend already returns a `logo: string` field on a row (perp / spot via `/market/...`), use that — only build the URL yourself when the source doesn't expose one (HIP-3 indexer, liquidation feed, …).
- `getTokenInitials(assetName)` — 2-letter fallback used by `ModuleAsset` and inline coin icons on icon load error.

**Never** re-implement these locally — enforce via review.

## 10. ESLint guardrails

- `no-restricted-syntax` — **forbids hardcoded hex** in `text-*` / `bg-*` / `border-*`; use a Tailwind token or `chartPalette.*`.
- `no-restricted-syntax` — **forbids hand-rolled table grid layouts** (`className="… grid-cols-[Npx_…_…_…]"` with 3+ tracks and a `px` width). Use `<ModuleTable>` (§5.b) — its `columns` prop owns widths once and propagates them to both header and rows via `<colgroup>`. 2-col page-shell layouts (`grid-cols-[1fr_2fr]`, `grid-cols-[280px_1fr]`) stay allowed.
- `no-restricted-imports` — **forbids `@/components/ui/table` outside `common/`**. Forces `TypedDataTable`.

## 11. Honest constraints (learned during the refactor)

Documenting these limits to avoid running into them again:

- **No per-KPI history** in the API for most metrics (global volume, OI, users, market cap…). So no sparkline / delta on the PulseBar — **value only, homogeneous**. The only exceptions are metrics that DO have a real time series (fees, stablecoins, bridge TVL, liquidations).
- **Hypedexer is unstable** — the `api.hypedexer.com` API can return **402 Payment Required** on all its endpoints (`/indexer/*`, `/liquidations/recent`, `/liquidations/analytics/stats`). Any component that depends on it must degrade gracefully.
- **`/liquidations/recent` returns ~20% corrupted `time_ms`** (values around 3.5e12 = year 2082) while the ISO `time` field stays reliable. Always reparse via `Date.parse(time + "Z")` with a `time_ms` fallback; never sort or bucketize on `time_ms` directly (see `LiquidationsPanel.getLiqTimeMs`).
- **Robust time-series sources** (don't depend on hypedexer):
  - `/liquidations/historical/chart` — local DB, up to **90 days**, adaptive granularity.
  - `/market/fees/raw` — Hypurrscan, full fee history.
  - `/market/stablecoins/history` — DefiLlama, stablecoin supply.
  - Hypurrscan `/spotUSDC` — on-spot supply series per stablecoin (USDC, USDH, USDT0, USDE) + holders.
  - DefiLlama `hyperliquid-bridge` — historical Bridge TVL.
  - Hyperliquid `info` `candleSnapshot` — OHLCV per token.
- **Charts to avoid**: anything that only depends on hypedexer (HIP-3 OHLCV, funding history, vault snapshots, etc.) until the subscription is stabilized.

## 12. Index of V4 primitives & components

### Primitives (`src/components/common/`)
- `TypedDataTable`, `Column<T>` — tables (standalone pages, see §5.a).
- `TokenAvatar` — inline HL-CDN token badge (see §5.c). Single source for any "small coin icon" outside leaderboard cells.
- `LiquidMark` — the Liquid Terminal mark as inline SVG, two-tone or `currentColor` (see §13). Use instead of `<Image src="/logo.svg">`.
- `DataFlow` — decorative streamline field poured from one origin (see §13).
- `AuroraAreaChart`, `AuroraHistogramChart` — Recharts wrappers, mono-series / histogram (see §6.1).
- `DonutTopN` — Recharts donut "Top N + Rest" with hover ActiveArc (see §6.4).
- `FlowGrid` + `FlowBar` — Top-N ranking with animated bars, Builders-style stagger (see §6.5).
- `chartTheme.ts` — SSOT for chart colors + `createLwcChartOptions()` LWC factory (see §6.6).
- `AuroraAreaChart` — standard single-series chart.
- `MultiSeriesAreaChart` — dual-axis multi-series chart (lives in `@/components/dashboard/chart`, but usable outside the dashboard).
- `chartPalette` — chart palette (cyan, gold, violet, down, multiSeries[0–7]).
- `PeriodSelector`, `useChartPeriod` — period selector.
- `PageHeader`, `PageSection` — page header.
- `TimeframeTabs`, `PillTabs` — tabs.
- `LoadingState`, `ErrorState`, `EmptyState`, `ChartLoading`, `ChartEmpty`, `ChartError`.
- `StatsCard`, `StatsPanel`.
- `Num` — tabular numeric display primitive.
- `TokenIcon` — **legacy** (cyan-on-navy circle). Kept for legacy pages. **Do not use inside a leaderboard card** — always go through `<ModuleAsset>`.

### Dashboard (`src/components/dashboard/`)
- `SectionHead` — section title (`title` + `subtitle` + optional link).
- `Sparkline` — inline SVG mini-curve (stat or hero cell).
- `PulseBar` — 6-cell KPI ribbon.
- `OverviewModule` (+ `ModuleTable`, `ModuleTableRow`, `ModuleAsset`, `ModuleRow`, `ModuleSubhead`) — **THE** leaderboard card primitive (see §7.a).
- V4 dashboard cards:
  - `MoversCard` (spot/perp) — top tokens of a market.
  - `AuctionsPanel` (spot/perp) — deploy auction.
  - `LiquidationsPanel` — 24h stats + interactive histogram (bucket hover, Long/Short tooltip).
  - `TwapPanel` — HYPE buy pressure + paginated list of active TWAPs.
  - `Hip3MarketsPanel` — top HIP-3 markets + mini perp auction + top perp DEXs.
  - `Hip4OutcomesCard` — top active HIP-4 prediction markets (Yes/No mid_price + countdown).
  - `StablecoinsCard` — hero supply + sparkline + 4 stablecoins.
  - `BuildersConcentrationCard` — "Top 5 vs Rest" donut on 24h builder fees, donut ↔ legend hover sync.
- `chart/ChartSection` — 4-metric multi-series chart (Bridge TVL · Stablecoins · Liquidations · Fees) with period selector.
- `chart/MultiSeriesAreaChart` — dual-axis lightweight-charts primitive (reusable).
- `modules/VaultsModule`, `modules/ValidatorsModule`, `modules/BuildersModule` — top-5 leaderboards (all via `OverviewModule + ModuleTable + ModuleAsset`).

### Useful hooks (besides service hooks)
- `useHip4ActiveMarkets(limit)` — open HIP-4 questions (`status==="live"`) sorted by volume, with total volume and active count.
- `useLiquidationsData("24h")` — aggregated 24h stats from `/liquidations/data` (robust endpoint, see §11).
- `useRecentLiquidations({ limit: 1000, hours: 24 })` — raw stream for client-side bucketing (see §11 on corrupted `time_ms`).

### Shell (`src/components/`)
- `Sidebar`, `Header`, `ExplorerSearchBar`.

## 13. Liquid layer

> "We treat data like water." The brand line, made visual. It is a **decorative
> layer**, never an information one.

### The rule of one source

A page gets **at most one emitter**. The mark glows, currents leave it, and
everything downstream is the same water arriving somewhere. Two glowing marks
on one screen, or a flow field with no visible origin, both break the reading.

The landing is the reference implementation: the mark sits at the top of the
hero, the field is emitted from its centre, and the currents dive under the
KPI ribbon — which is exactly where the data surfaces as numbers.

### `<LiquidMark>` — the mark, inline

```tsx
<LiquidMark decorative />                                  // nav, 22px, two-tone
<LiquidMark size={16} decorative />                        // footer
<LiquidMark size={62} tone="current" className="liquid-emit text-brand" />  // source
```

- `tone="duo"` (default) — neutral peak over a cyan arc. The logo.
- `tone="current"` — monochrome, inherits `color`. Use for a source or on a
  colored surface.
- `decorative` — sets `aria-hidden` when a real label sits next to it.

Prefer it over `<Image src="/logo.svg">`: the exported file carries generic
`.cls-1/2/3` classes in a `<style>` block, which collide as soon as two copies
are inlined on one page, and a raster `<img>` cannot glow per shape.

### `<DataFlow>` — the flow field

Do not render `<DataFlow>` directly. Go through **`<LiquidSurface>`**, which
owns the z-index contract and tells anything rendering numbers that it is
standing in the water:

```tsx
<LiquidSurface
  field={{ origin: { x: 50, y: 0 }, lines: 38, animated: true, className: "text-brand" }}
  fieldClassName="inset-x-0 top-[95px] bottom-0"
  contentClassName="max-w-[1280px] mx-auto px-6"
>
  {children}
</LiquidSurface>
```

`fieldClassName` positions the field (default `inset-0`); use it to hang the
field off the source rather than off the box. Color with a token class on
`field.className` (the strokes are `currentColor`); never a hex.

| Prop | Default | Note |
|---|---|---|
| `origin` | `{x:50, y:1}` | percent of the box; put it on the mark centre |
| `lines` | `38` | above ~60 the field turns into a wash |
| `spread` | `190` | fan width at the far edge, in percent of box width |
| `intensity` | `0.22` | opacity of the brightest current |
| `focus` | `0.3` | distance from the axis where the light sits |
| `animated` | `false` | slow breathe; opt in |
| `fade` | `true` | dissolves both ends |

**z-index rule** — same as the page halo (§3): the field is `z-0`, content
**must** be `relative z-10`. `<LiquidSurface>` does this for you, which is the
point: it was prose for exactly one week and prose does not survive a second
contributor.

### Learned the hard way

- **Ease-out the opening, never ease-in.** `1 - (1-u)^2.2` opens fast then
  flattens, so the currents fall roughly parallel. A linear or ease-in profile
  draws a perspective star and reads as light rays, not water.
- **Two harmonics minimum.** One sine is too clean to pass for liquid.
- **Weight the light across the fan, not along the axis.** Brightness computed
  from distance-to-the-emission-line bunches every bright current on that line.
  `focus` puts the light in the body of the fan and keeps the middle channel
  dark, which is what makes centered copy survive on top.
- **Narrow viewports squeeze the fan into a curtain.** Under 640px the layer
  drops every second line and steps back to 55% opacity (`globals.css`).
- **Motion is opacity, not dash offset.** A moving `stroke-dashoffset` breaks
  the lines into particles; the field only reads as water while continuous.

### Helper classes (`globals.css`)

- `.liquid-bloom` — cyan halo. Put it on a sibling **behind** the mark so the
  mark itself stays crisp.
- `.liquid-emit` — drop-shadow glow carried by the mark, so the source reads
  as lit rather than as a sticker on a halo.
- `.liquid-current` — the breathe animation, applied by `<DataFlow animated>`;
  honours `prefers-reduced-motion`.

### Carrying the flow through a page

The rule of one source is about **emitters**, not about how far the water goes.
A page can keep the currents running as long as it does not open a second
spring. That is what `mode="stream"` is for: same two harmonics, no origin,
near-parallel currents crossing the box.

```tsx
// Landing footer — the other end of the hero. Same water, arrived.
<footer className="relative border-t border-border-subtle">
  <DataFlow mode="stream" lines={16} intensity={0.09} focus={0.34} className="text-brand" />
  <div className="relative z-10">{…}</div>
</footer>
```

Keep downstream intensity well under the source (`0.09` against `0.22`). The
eye should read one bright spring and a faint current, never two competing
fields. A stream that crosses body copy at readable strength is a bug.

### Where the layer does **not** go

Settled by an adversarial design review (5 designers, positions then
cross-examination). Every rule below is checkable without a judgement call.

**Scope is a path allowlist, not an intention.** `DataFlow` and `LiquidSurface`
are importable from exactly four places, enforced by `no-restricted-imports` in
`eslint.config.mjs`:

- `src/components/landing/**`
- `src/app/not-found.tsx`
- `src/app/funding/**`
- `src/components/onboarding/OnboardingVisual.tsx` (welcome step only)

Nothing under `src/app/(app)/**`, ever. The wiki will be argued as narrative;
the answer stays no, precisely because it renders in the same shell as
`/market`. `<LiquidMark>` stays free everywhere: the logo is not the layer.

The rule has to be written as `paths` + `importNames` on the barrel. A
`patterns` entry on `@/components/common/DataFlow` is a no-op, because the
`@/components/common/*` group is already banned: it would forbid a specifier
nobody is allowed to write and catch nothing.

**One field per rendered screen**, at most one in `mode="source"` per document.
Counting emitters alone made an unlimited number of streams conformant.

**Never behind a `<KpiRibbon>` or its wrapper**, except on the landing and
`/funding`, where the ribbon must render `variant="boxed"` with `bordered`.
`KpiRibbon` throws in dev when it finds itself transparent inside a
`<LiquidSurface>`: the dive under the ribbon only works because boxed cells
paint an opaque `bg-surface`, and that was an accident of a default until it
was written down.

**One `animated` instance in the codebase**, the landing hero. Forbidden on any
route that opens a WebSocket, mounts a chart, or polls on an interval.

**No `mode="source"` in a box narrower than ~0.6 of its height.** Under
`preserveAspectRatio="none"` a tall narrow box flattens the undulation into a
vertical comb, and the `max-width: 640px` de-densifier never fires on desktop.

**The layer never encodes state.** No binding to connection, freshness, volume,
volatility or loading. Review test: if a reviewer can finish "the water here
means…" with something factual, reject it.

**No text in `text-text-tertiary`, or under 12px, inside a field's box.**
Measured: tertiary is 3.95:1 on `bg-base`, already under AA before any field.

**Intensity caps: 0.22 source, 0.09 stream.** A stream readable over body copy
is a bug, not a setting.

**Every interactive element on a liquid surface carries `.focus-ring`.** A cyan
decoration behind a link makes the UA's default outline indistinguishable.

Legal pages were listed here as in scope. That was wrong and is removed:
`max-w-3xl` left-aligned prose read for minutes is the geometry `focus` does
not protect, and the sticky `backdrop-blur-xl` header re-rasterises a masked
field for the whole scroll. The 24px mark already there is enough.

### Shared links (Open Graph / Twitter cards)

`pnpm gen:og` regenerates every card from `scripts/gen-og.mjs`. One template,
five cards, output committed to `public/og/` plus `public/og-image.png` and
`public/twitter-image.png`. The streamline math in that script is a port of
`DataFlow.tsx`; changing one without the other makes shared links stop looking
like the site they point at.

Layout rules baked into the template, learned by rendering:

- **Copy left, source right.** A 1200x630 canvas only shows the first third of a
  fan aimed across it, and that stretch is where the currents are still straight.
  It read as light rays and it striped the headline. Giving the field its own
  half fixes both.
- **`scaleY` the field, don't shorten it.** The full fan is drawn into a tall box
  and squashed, so the card shows the drape rather than the emission. Shortening
  the box instead just crops back to the straight part.
- **The mark, its bloom, the field and the URL are always brand cyan.** Only the
  tag pill and the accented word in the title follow a section accent. A gold
  droplet on a shared wiki link reads as a different product.
- **The mark is large and it is the only one.** At feed thumbnail size it is the
  only element anyone resolves, so the top-left lockup is the wordmark alone and
  the card keeps one source.
