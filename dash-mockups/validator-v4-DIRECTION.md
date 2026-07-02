# Validators V4 — Art Direction (single source for the rebuild)

> Consolidated resolution of all expert findings into ONE coherent art direction, then a
> per-page rebuild brief (A Operator, B Capital, C Governance). The DATA is correct and
> curl-proven (`validator-v4-PROOF.md`) — it is PRESERVED verbatim. Only presentation changes.
> Nothing is fabricated. Every block maps 1:1 to a `kit.html` primitive.

---

## 0. The single thesis

The three views are **one page, one product, three lenses** of the same validator set. They must
share one header, one tab spine, one KPI ribbon style, one card-head, one avatar, one bar color,
one badge vocabulary. The current mockups read as three admin dashboards because they each invented
their own chrome, abused gold as a generic highlight, and dumped raw data. The fix is discipline,
not new ideas.

**One-line per lens (the question each answers):**
- **A · Operator** — "Is the active set healthy right now?" (directory + health)
- **B · Capital** — "Where does stake sit, and how Foundation-dependent is the network?" (concentration story)
- **C · Governance** — "What is pending ratification, who votes, and does the Foundation participate?" (the 54.1%-stake-but-0-votes signal)

---

## 1. Token resolution (decide the conflicts once)

These are the canonical values. The mockup Tailwind config headers currently diverge — reconcile
ALL three mockups and `DESIGN_SYSTEM.md`/`CLAUDE.md` to globals.css as the one source.

| Token | CANONICAL value | Notes / what to fix |
|---|---|---|
| `bg-base` | `#0A0B0F` | Mockups + kit.html use `#08101A`. globals.css / CLAUDE.md token table say `#0A0B0F`. **Use `#0A0B0F`.** Sync kit.html + all 3 mockups + DESIGN_SYSTEM to it (one source = globals.css). This is the only place kit.html itself is wrong — flag it. |
| `success` | `#1FA85B` | Mockups + kit.html use `#1FB58E`; DESIGN_SYSTEM §2 + Tailwind token + `chartPalette.success` are `#1FA85B`. **Use `#1FA85B` everywhere** (text-success AND chartPalette.success must match, §6.2). Fix kit.html + 3 mockups. |
| `brand` (cyan) | `#83E9FF` | Correct. Scope = **focus / active nav / links / "View all" / positive-or-neutral accent ONLY**. The ONLY allowed bar use is `chartPalette.accent` as a neutral-magnitude fill — kept consistent, never mixed per-row with gold/green. |
| `gold` | `#F9E370` | **RESERVED for protocol fee / commission-as-fee figures ONLY.** Not APR, not stake share, not "Foundation", not a histogram bucket, not a queue total, not a vote tally, not a category. This is the central abuse to kill. |
| `chartPalette.multiSeries[0..7]` | categorical | Donut/stacked-bar slices source here in index order. Gold is the FEES semantic, NOT "slice 0". |
| `violet` | `#A78BFA` | Secondary metric (e.g. a community-weighted bar variant if one is needed). |

**No raw hex in shipped components** (ESLint). Charts go through `chartPalette`; everything else
through Tailwind tokens. Every inline `style="background:#..."` in the current mockups is a bug.

---

## 2. Shared chrome contract (identical on A, B, C)

### 2.1 PageHeader (kit.html PageHeader, L74–88)
- `h1` = **`Validators`** on all three. No `· Capital` / `· Governance` suffix. The lens lives in the tab row, not the title.
- description = **one** sentence-case line, equal register per lens, plus freshness rendered through the freshness primitive (`charts/DataFreshness`, fed by `dataUpdatedAt`) — never hand-concatenated (the "updated for … ago" bug). Guarded format: `Updated <relative>`; `just now` when <5s; `—` when no timestamp. Never emit a dangling "updated"/"for".
  - A: `Health and performance of the active validator set.`
  - B: `Where stake sits and how it is flowing out.`
  - C: `Pending L1 votes awaiting validator ratification.`
- Per-lens controls go in the PageHeader **actions slot** (right), NOT beside the h1:
  - A: `Export CSV` (kit ghost button).
  - B / C: the all↔community filter as **text tabs** (see 2.3), placed in the actions slot or on the tab row — never as a filled pill beside the h1.

### 2.2 Lens spine — PillTabs variant="text" (kit "Tabs — text", L121–129)
A single row directly under the header, present on all three, is the primary navigation between lenses:
`Operator` · `Capital` · `Governance`. Active = `text-brand font-medium`; inactive = `text-text-tertiary hover:text-text-primary`. No container, no indicator, no filled pill.

**DELETE the breadcrumb bar + `lens:` chip entirely** (it is not a primitive). The sticky header keeps
only the global nav/halo + the `bg-base/80 backdrop-blur-xl` token (no `border-b`). Keep the `z-0` halo / `relative z-10` content layering — that part is correct.

### 2.3 Secondary filter — also PillTabs variant="text"
The all↔community toggle (B and C) and any status filter (A) use the SAME text-tabs primitive (kit L121–129).
Kill the filled `bg-brand` legacy pill. Unify wording across B and C: **`All validators`** / **`Community`**
(drop the `(ex-Foundation)` jargon; explain once via tooltip). Same control language as A's status filter.

### 2.4 KpiRibbon — canonical minimal (kit.html KpiRibbon, L92–117; DESIGN_SYSTEM §7.b)
Replace the legacy filled strip (`gap-px bg-border-subtle` + per-cell `bg-surface`, value `text-[20px] font-semibold`) on ALL ribbons with:
`border border-border-subtle rounded-lg divide-x divide-y sm:divide-y-0 divide-border-subtle`, cells `px-5 py-4`,
label `text-[10px] uppercase tracking-[0.08em] text-text-tertiary`, value `mono text-[22px] font-medium tracking-[-0.01em] leading-none mt-2`, sub `text-[10.5px] text-text-tertiary mt-1.5`.
Tone via `tone` token (`default|gold|success|danger`) — never inline text-color, and **gold tone is for fee cells only**. Group ribbons with `<KpiRibbon header={{label, helper}}>` stacked in `space-y-*`.

### 2.5 Card-head — minimal (kit OverviewModule head, L138–141)
Drop the `bg-brand/10` cyan icon square from every data-card head. Use `flex items-baseline gap-2 px-4 py-3`,
title `text-[13px] font-medium text-text-primary`, optional count/tag as plain `text-[11px] text-text-tertiary ml-auto`,
`View all →` link in `text-brand` only where it is a real feed link. This stops cyan scattering and unifies all heads. Apply identically across A/B/C.

### 2.6 Avatars — single neutral treatment (kit ModuleAsset, L153/187/230)
ONE avatar style for every row everywhere: `w-6 h-6 rounded-md bg-surface-2 text-text-secondary grid place-items-center text-[9px] font-semibold`, 2-initial fallback. **No per-row color branching.** Avatars never encode category (no gold Foundation avatar, no cyan blob).

### 2.7 StatusBadge vocabulary (kit StatusBadge, L243–251)
- Active / positive / quorum-reached → `success` variant (`bg-success/10 border-success/25 text-success` + dot).
- Inactive / neutral category / humanized enum / "Foundation" tag → **neutral** variant (`bg-surface-2 border-border-subtle text-text-tertiary`).
- Genuine negative/alert (e.g. "0 voted" framed as a risk) → `danger` variant.
- **No gold badges** except a real fee/whitelist-fee tag. Reserve `danger` red for failure/jailed/negative only — never for a normal on-chain action (Undelegate) or merely "not producing".

### 2.8 Bars — FlowBar primitive only (DESIGN_SYSTEM §6.5, §10)
Every in-row magnitude/weight bar goes through `<FlowBar ratio variant="solid" color={chartPalette.accent} label=… />`.
**All bars cyan (`chartPalette.accent`), in every toggle state.** No hand-rolled `<div style="width;background">`, no gold bar, no success-green "community" bar. The toggle changes the VALUE, not the color. If a second metric truly needs a distinct hue, that is `chartPalette.violet` — not success, not gold.

### 2.9 "Foundation" identity — one non-reserved channel, used everywhere
Foundation is an identity/category, never a fee. Pick ONE treatment and apply it page-wide: a neutral
`StatusBadge variant="inactive"` tag appended to the name (preferred), or a subtle `bg-surface-2` row tint, or `brand/10` sparingly. **Never gold, never danger by default.** Length/value already carries magnitude — do not double-encode it with color.

### 2.10 Empty states & copy (define once, sentence case, `text-text-tertiary`, no italics, no backend words)
- Proposals table empty: `No pending votes right now.`
- Voters rail empty: `No voters recorded for this proposal.`
- Validations tape empty: `No recent staking activity.`
- Missing proposal summary: render the humanized action label on a **single line, no second line** — absence reads clean, not as a labelled void.
- Scope note (C footer, once): `Showing pending votes only. Historical votes are not available.` (drop "snapshot", "served", "upstream").
- Humanize enums: `settleOutcome → Settle outcome`, `registerTokensAndStandaloneOutcome → Register tokens`; unknown key → split camelCase to Title Case. Raw enum kept only as `title`/tooltip. Render as a **neutral** StatusBadge, never a brand pill.

### 2.11 Two-tier vertical rhythm
Wrap each logical zone in `PageSection` with a `SectionHead` (DESIGN_SYSTEM §Section sub-head). Section gap `space-y-8`; intra-section gap `gap-4`. This grouping cadence is the single highest-leverage fix against the flat-admin feel. Replace the uniform `space-y-5` flat sibling stack.

---

## 3. Page A — Operator (network health)

**Question:** "Is the active set healthy right now?" Hero = the directory, but framed by a health story.

### 3.1 Section layout
```
PageHeader (h1 "Validators", desc A, actions: Export CSV)
PillTabs text — Operator | Capital | Governance         (active: Operator)
space-y-8:
  §Overview     KpiRibbon row 1 (5 primary) + KpiRibbon row 2 (health band, grouped header "Network health")
  §Directory    grid xl:grid-cols-[minmax(0,1fr)_280px] gap-4 items-start
                  ├─ TypedDataTable (7 cols) + toolbar (search + status text-tabs)
                  └─ aside (sticky): OverviewModule "Recent staking activity" (tape) + ModuleRow "Top by blocks produced"
```

### 3.2 Blocks → primitives → tokens
- **KpiRibbon primary (kit L92–117), 5 cells** — drop to 5 so each breathes:
  - `Total Staked` `429.6M` sub `HYPE` → text-primary
  - `Validators` `31` sub `in the set` → text-primary
  - `Active` `27` sub `producing` → **success** (legitimate positive)
  - `Median Uptime` `100.0%` sub `last 24h` → text-primary
  - `Median APR` `2.19%` sub `est. annualized` → **text-text-primary** (NEVER gold; APR is a yield, not a fee)
- **KpiRibbon health band (second grouped ribbon, header `{label:"Network health"}`)** — promotes the health answer above the directory:
  - `Active 27` / `Inactive 4` (label "Inactive", NOT "Jailed" — `isActive` is all the API serves; sub `not producing`, neutral tone — NOT danger) / `Median uptime` / `Blocks last epoch`. Move the ex-"Jailed" cell here so the primary ribbon stays at 5-up.
- **TypedDataTable (kit L200–241)** with `headerFill={false}`, rows `py-3`, name cell `text-[13px] font-medium` + `text-[11px]` mono address. Toolbar: search + status text-tabs (`All` / `Active` / `Inactive`). **7 columns** (trim from 9 — move redundant `Share` OR `Comm.` to row detail): `#`, `Validator`, `Stake`, `APR`, `Uptime`, `Blocks`, `Status`.
  - Cell tokens: `#` mono text-tertiary · Stake mono text-primary · APR mono **text-text-secondary** (NOT gold) · Uptime mono text-secondary (text-success only at ≥99.9 is acceptable as a directional positive) · Blocks mono text-secondary.
  - **Commission**, if kept: mono **text-text-secondary** — never a full gold column.
  - **Status**: `success` badge "Active" / **neutral** badge "Inactive" (not danger red).
  - **Foundation rows**: neutral avatar + `text-text-primary` name + a neutral `StatusBadge variant="inactive"` "Foundation" tag appended. **No gold avatar, no gold name.**
  - Footer: `Showing 15 of 31` + Prev/Next (numeric pager stays on the directory only).
- **Rail (kit Page layout L254–264 + ModuleRow L176–197)** — fill the rail so it doesn't dwarf against the tall table:
  - `OverviewModule` "Recent staking activity" tape: Time / Type / Amount. Type badges **neutral** (`Delegate`/`Undelegate` are normal actions — no success/danger coloring). Footer `255 events total` + `View all →` link (feed idiom, not a pager).
  - `ModuleRow` leaderboard "Top by blocks produced" stacked beneath, so rail length approaches table length.

### 3.3 Copy fixes (A)
- KPI subs parallel, lowercase, no period: `HYPE`, `in the set`, `producing`, `last 24h`, `est. annualized`, `not producing`.
- Remove the `total − active` derivation sub (internal note → user-facing descriptor `not producing`).
- Table caption `Sorted by stake` (word, no glyph). Rail footer `255 events total`.

---

## 4. Page B — Capital (concentration story)

**Question:** "Where does stake sit, how Foundation-dependent is the network?" The page is a thesis read top-to-bottom, not five equal cards.

### 4.1 Section layout
```
PageHeader (h1 "Validators", desc B, actions: text-tabs "All validators | Community")
PillTabs text — Operator | Capital | Governance         (active: Capital)
space-y-8:
  §Concentration   KpiRibbon (5, Foundation Share = lead cell)
                   grid lg:grid-cols-2 gap-4 (NO items-start — paired cards stretch equal height):
                     ├─ DonutTopN  (composition)
                     └─ FlowGrid   (ranking)         caption the pair: composition vs ranking
  §Delegators      grid lg:grid-cols-[minmax(0,1fr)_300px] gap-4 items-start:
                     ├─ AuroraHistogramChart "Stakers by size"
                     └─ OverviewModule "Delegator concentration" (top-N share table)
  §Exit pressure   KpiRibbon (queue, 4) + AuroraAreaChart (unstaking flow)
```

### 4.2 Blocks → primitives → tokens
- **KpiRibbon (kit L92–117), 5 cells**, Foundation Share promoted to lead:
  - `Foundation Share` `54.1%` sub `232.5M HYPE · 5 validators` → **text-text-primary** (default neutral; only `text-danger` if it crosses a defined concentration threshold — do not default to gold)
  - `Top-1` `13.0%` sub `single validator` → text-primary
  - `Top-5` `56.5%` sub `cumulative` → text-primary
  - `Top-10` `78.8%` sub `cumulative` → text-primary
  - `HHI` `808` sub `low concentration` (compute the verdict; do NOT print `<1500 = unconcentrated`) → text-primary
  - Community toggle values preserved verbatim: `Community Stake 197.1M` / `26 validators · 45.9% of total`, Top-1 `13.0%` "Anchorage (of community)", Top-5 `53.8%`, Top-10 `74.6%`, HHI `742`.
- **DonutTopN (DESIGN_SYSTEM §6.4)** — center label `54.1%` mono `text-text-primary`; slices from `chartPalette.multiSeries` in index order:
  - Foundation (5) `54.1%` → `multiSeries[0]` (cyan `#83E9FF`) — **NOT gold**
  - Anchorage `5.9%` → `multiSeries[1]`; Hypurrscanning `5.4%` → `[3]`; Nansen `5.3%` → `[4]`; infinitefield `4.1%` → `[5]`; Hyperliquid Strategies `4.0%` → `[7]`
  - `Rest · 21 validators` `21.2%` → an explicit muted remainder token (a desaturated multiSeries step at lower opacity), NOT the raw `#2C354A` scrollbar grey — 21% must read as 21%.
  - Legend: every label `text-text-secondary`, every value `text-text-primary`. **No per-slice gold text.** Show `54.1%` once with weight (the donut center IS the concentration story); the KPI cell stays neutral, not gold.
- **FlowGrid + FlowBar (DESIGN_SYSTEM §6.5)** — ALL bars `chartPalette.accent` (cyan), solid variant, in both toggle states. The top-4 Foundation rows: encode identity in a SECOND channel (neutral "Foundation" tag in the name column or subtle row tint), never a gold bar. Values preserved: all-mode `13.0 / 12.9 / 12.4 / 12.2 / 5.9 / 5.4 / 5.3 / 4.1`; comm-mode `12.95 / 11.71 / 11.53 / 8.99 / 8.65 / 5.03 / 4.74 / 3.86` (caption `share of community (197.1M)`).
- **AuroraHistogramChart (DESIGN_SYSTEM §6.1)** — strictly a COUNT distribution; all bars one color `chartPalette.accent`, heights = `holdersCount` only. Buckets preserved: `0-10 23,010 · 10-50 11,210 · 50-250 8,051 · 250-1k 2,797 · 1k-5k 2,546 · 5k-25k 1,045 · 25k-100k 336 · 100k+ 239`. **No gold "hero" bar.** To emphasize 100k+, use opacity/intensity or a brand-deep step within the accent family — not gold, not a recolor that implies a stake fact.
  - The `91.6%`-of-stake fact does NOT live on this count chart. Move it into the adjacent "Delegator concentration" table or a KpiCell where stake-share is the explicit metric. Copy: `239 wallets in the 100k+ bucket hold 91.6% of staked HYPE.` (drop "Long-tailed:" prefix; remove the gold on 91.6% → text-text-primary).
- **OverviewModule top-N share table** — values preserved: `Top 10 77.34% · Top 50 83.77% · Top 100 87.53% · Top 500 95.22%`. Minimal card-head, mono text-secondary values.
- **KpiRibbon (queue, 4 cells)** — `Queued 14.34M` (`5,014 entries`) · `Next hour 1.02M` (`14 tx`) · `Next 24h 1.23M` (`271 tx`) · `Next 7d 5.63M` (`2,530 tx`). The Next-7d value → **text-text-primary** (or `text-danger` if intentionally flagging outflow pressure as negative) — **NOT gold**.
- **AuroraAreaChart (DESIGN_SYSTEM §6.2)** — stroke/area/gradient all from `chartPalette.accent` (cyan is correct here — positive/primary flow — just source it, no inline hex). Use the FULL `dailyStats[].{date,totalTokens}` (~30 points per PROOF L21), not the 10-point under-sample. Single series.

### 4.3 Copy fixes (B)
- Section heads: `Concentration` / `Delegators` / `Exit pressure`, each with a one-line subtitle.
- HHI sub = computed verdict `low concentration`; insight line leads with the number, sentence case, one period.

---

## 5. Page C — Governance (the 54.1%-but-0-votes signal)

**Question:** "What is pending, who votes, does the Foundation participate?" Lead with the story; the
4-row table must not be a hero with three empty placeholder rows.

### 5.1 Section layout
```
PageHeader (h1 "Validators", desc C, actions: text-tabs "All validators | Community")
PillTabs text — Operator | Capital | Governance         (active: Governance)
space-y-8:
  §Signal       Full-width Card callout (the page thesis)
  §Pending      KpiRibbon (5)
                Proposals as a SINGLE-COLUMN stack of Cards (one Card per proposal),
                NOT a 1fr-table + 280px rail (only 4 rows → kills the dead space).
                Each proposal Card: humanized action + participation FlowBar + quorum badge
                + voters inline (expandable) per proposal.
  §footer note  scope caption (once)
```
> If a table layout is strongly preferred for parity with A, keep TypedDataTable but make rows
> selectable and re-label the rail `Voters · selected proposal`. The single-column Card stack is
> the recommended resolution because it eliminates the dead rail next to 4 rows.

### 5.2 Blocks → primitives → tokens
- **Signal callout (Card)** directly under the spine — the page thesis, neutral or danger-toned, NEVER gold:
  `Foundation controls 54.1% of stake and voted on 0 of 4 pending proposals — community alone reached quorum on all 4.` Use `bg-surface-2` neutral or `bg-danger/10 border-danger/25 text-danger` if framed as a risk. Remove the `bg-gold/5` head tint.
- **KpiRibbon (kit L92–117), 5 cells** — values preserved:
  - `Pending 4` sub `proposals` → text-primary
  - `Avg participation 40%` sub `of 31 validators` → text-primary
  - `Quorum reached 4 / 4` sub `all pending` → **success**
  - `Foundation voted 0 / 5` sub `abstained on all` → **text-text-primary** (the count) or **text-danger** if flagged as the risk — **NOT gold**
  - `Eligible 31` sub `validators` → text-primary
- **Proposal Cards** (one per proposal, values preserved exactly):
  - id 0: action `settleOutcome` → **`Settle outcome`** (neutral StatusBadge); summary present (the PSG/UEFA text — keep verbatim); `Expires Jun 7`; participation `42%` (`13/31`); stake weight all `26.0%` / community `56.6%`; `Quorum Reached`; Foundation `0/5`.
  - id 1: `registerTokensAndStandaloneOutcome` → **`Register tokens`**; summary null → single clean line, no "no summary served"; `Jun 8`; `39%`; `21.9%` / `47.6%`; Reached; `0/5`.
  - id 2: same shape; `21.9%` / `47.6%`.
  - id 3: same; `24.9%` / `54.2%`.
  - **Action chip**: humanized label in a **neutral** StatusBadge (`bg-surface-2 text-text-tertiary border-border-subtle`), raw enum only as `title`. **Not the brand pill, not mono camelCase.**
  - **Stake-weight bar**: `<FlowBar variant="solid" color={chartPalette.accent}>` — cyan in BOTH toggle states (drop the success-green community branch and the inline hex). Column header relabels (`weight: all stake` ↔ `weight: community (ex-Foundation)`) and the value swaps — that is sufficient signal. Value label mono text-primary.
  - **Quorum**: `success` StatusBadge "Reached".
  - **Foundation `0/5`**: neutral count chip (mono `text-text-primary` + neutral StatusBadge), or `text-danger` if framed as the abstention warning. **Drop the gold chip column.**
- **Voters (inline per proposal, or rail if table layout kept)** — values preserved:
  `Hypurrscanning 23.07M · Nansen x HypurrCollective 22.73M · infinitefield.xyz 17.72M · Imperator.co - HypeRPC 7.61M · ASXN 6.40M · ValiDAO 5.01M · B-Harvest 4.81M · HypurrCorea - Spacebar 4.76M · Purrposeful x HyBridge 4.54M · Alphaticks 4.15M · CMI 4.10M · Liquid Spirit x Hydromance 3.47M · Enigma - Hypedexer.com 3.24M`.
  Neutral avatars, name text-primary, stake mono text-secondary. Header `Voters` (drop zero-indexed `Proposal #0`; reference the humanized action, e.g. `Voters · Settle outcome`). Ratio `13/31` kept, labelled on hover `voters / eligible`.
  - **Foundation-abstention banner** (was the gold pill): copy `Foundation abstained — 0 of 5 voted`, neutral treatment (`text-text-secondary on surface-2`) or `danger` if framed as risk. Not gold.

### 5.3 Copy fixes (C)
- No `no summary served` (null summary → single clean action line). No `· paginated`. Footer scope note once: `Showing pending votes only. Historical votes are not available.`
- Empty-state (if votes list returns empty per PROOF L84): `No pending votes right now.`

---

## 6. Missing primitives to flag (kit.html has ZERO chart blocks)

Every chart in the mockups is hand-rolled raw SVG/divs because **kit.html exposes no chart primitive**,
even though the codebase ships them (`DonutTopN`, `FlowGrid`/`FlowBar`, `AuroraHistogramChart`, `AuroraAreaChart`).
Per the "missing block = missing primitive" rule, the fix is to **add four chart blocks to kit.html** mirroring
the real primitives 1:1 (same props, same `chartPalette` colors), then rebuild each mockup chart by copying
those blocks instead of inline SVG. Until kit.html has them, the chart color/encoding bugs will keep recurring.
Action items (same PR as the rebuild):
1. `DonutTopN` block (center + legend slots, slices from `multiSeries`).
2. `FlowGrid` + `FlowBar` block (solid `chartPalette.accent`, ratio-driven, label inside).
3. `AuroraHistogramChart` block (Bar + axes, color via `chartPalette`, single series).
4. `AuroraAreaChart` block (time/value, `chartPalette.accent` stroke + gradient).

Also reconcile the `bg-base` (`#0A0B0F`) and `success` (`#1FA85B`) token values in kit.html itself so the
canonical palette stops propagating the divergent `#08101A` / `#1FB58E` into every mockup.

---

## 7. Definition of done (the floor)
- One header, one tab spine, one ribbon style, one card-head, one avatar, one bar color, one badge vocab across A/B/C.
- Zero gold outside genuine fee figures. Zero raw hex in shipped components. Zero hand-rolled bars/charts.
- Every value on the page traces to PROOF — nothing fabricated, no fake sparkline/delta, NOT-SERVED → NOT-DRAWN.
- `pnpm run lint` green (no-hex), `pnpm run build` green, `pnpm run visual-check` green at 375/1024/1440.
