# Design System — "Minimal" direction (canonical)

Decision: the **minimal** treatment (see `dash-mockups/vaults-v4-minimal.html`) becomes the DS.
Each pattern below is promoted from a one-off into a primitive variant + a `kit.html` block,
in the same PR (kit rule: new pattern = new primitive/variant + kit block + DESIGN_SYSTEM entry).

Tokens are unchanged (globals.css). Only composition/treatment changes.

---

## Rollout — defaults vs variants (the one call that sets blast radius)

These primitives are shared app-wide (PulseBar, dashboard cards, market tables…). Two options:

- **Default-flip** — minimal becomes each primitive's default look. Truest to "minimal *is* the DS",
  but every existing page changes at once → needs a visual-check sweep of dashboard/market/explorer.
- **Variant-first (recommended)** — add the variants, make the **low-risk** ones default
  (neutral avatars, no table-header fill, SectionHead weight) and keep the **high-blast** ones
  opt-in for now (`KpiRibbon variant`, tabs, card-head title weight). The vaults page adopts the
  minimal variants immediately; other pages flip page-by-page (matches the existing
  "refonte page par page" on v4-pages). Once all pages are migrated, flip the defaults.

Prereq: `KpiRibbon` and the chart primitives live on **v4-pages** and are **absent from v4-vaults**
— bring them in (merge/rebase v4-pages) before adding the `plain` variant here.

---

## A. Structural changes (new prop/variant)

### A1 · Tabs — text variant  (`src/components/ui/pill-tabs.tsx`)
Add `variant?: "pill" | "text"`.
- `"pill"` (current): `bg-surface-2 rounded-lg p-1` + animated `bg-brand` indicator, active `text-brand-text-on`.
- **`"text"` (DS canonical for status filters):** no container/indicator.
  - wrapper: `flex items-center gap-3`
  - button: `text-xs font-medium transition-colors`
  - active: `text-brand` · inactive: `text-text-tertiary hover:text-text-primary`
  - trailing count rendered `mono text-text-tertiary` (inactive) / `text-text-tertiary` (active).
Consumers: vaults directory toolbar (All/Open/Closed).

### A2 · KpiRibbon — plain variant  (`src/components/common/KpiRibbon.tsx`)
Add `variant?: "boxed" | "plain"` (recommend default `"plain"`).
- `"boxed"` (current): outer `border border-border-default rounded-lg`, grid `gap-px bg-border-subtle`,
  cell `bg-surface hover:bg-surface-2 px-4 py-3`, label `text-[10.5px] tracking-[0.06em] font-semibold`,
  value `text-[20px] font-semibold`, sub `mono text-[10px]`.
- **`"plain"` (minimal):**
  - outer `border border-border-subtle rounded-lg`
  - grid `grid ${cols} divide-x divide-y sm:divide-y-0 divide-border-subtle` (no `gap-px bg-border-subtle`)
  - cell `px-5 py-4 flex flex-col` (drop `bg-surface hover:bg-surface-2`)
  - label `text-[10px] uppercase tracking-[0.08em] text-text-tertiary` (drop `font-semibold`)
  - value `mono text-[22px] font-medium tracking-[-0.01em] leading-none mt-2` (was 20px/600)
  - sub `text-[10.5px] text-text-tertiary mt-1.5` (non-mono)
Consumers if default-flipped: PulseBar, HIP-4, NetworkPulse → visual-check required.

### A3 · OverviewModule card-head — minimal  (`src/components/common/OverviewModule.tsx`)
- `icon` is already optional → minimal **omits the brand icon square**.
- `tag` currently always renders a pill. Add `tagVariant?: "pill" | "plain"` (DS default `"plain"`):
  - `"plain"`: `ml-auto shrink-0 text-[11px] text-text-tertiary` (no bg/border).
- Title weight: `text-[13px] font-semibold` → **`font-medium`** (canonical minimal).
- Head padding: `px-3.5 py-2.5` → `px-4 py-3`, align `items-baseline`.

### A4 · Neutral avatars — `ModuleAsset` + `ModuleRow`  (`src/components/common/OverviewModule.tsx`)
Add `tone?: "brand" | "neutral"` (DS default `"neutral"`).
- `"brand"` (current): square `bg-brand/10 text-brand`.
- **`"neutral"` (minimal):** square `bg-surface-2 text-text-secondary`.
- Row/name weight `font-semibold` → `font-medium`.
Applies to: directory table name cell, all rail leaderboard rows.

---

## B. Cosmetic changes (props/tokens, low risk → make default)

### B1 · TypedDataTable  (`src/components/common/` table primitive)
- `headerFill?: boolean` (DS default **false**): drop `bg-surface-2` on `th`, keep `border-b border-border-subtle`.
- `th`: `tracking-[0.05em] font-semibold` → `tracking-[0.08em] font-medium`.
- row density: cells `px-4 py-3` (was `py-2.5`), hover `bg-surface-2/60` (was `bg-surface-2`).
- name cell `text-sm` (14px) → `text-[13px] font-medium`; addr stays `mono text-[11px]`.

### B2 · SectionHead  (`src/components/dashboard/SectionHead.tsx`)
- h2 `text-[14px] font-semibold text-text-primary` → **`text-[13px] font-medium text-text-secondary`**.
- subtitle unchanged (`text-[11px] text-text-tertiary`).

### B3 · Button — ghost-brand  (`src/components/ui/button.tsx`)
- "Create Vault" primary action: solid `bg-brand text-brand-text-on` → ghost
  `bg-brand/10 border border-brand/25 text-brand hover:bg-brand/15`. Add/confirm a `ghost-brand` variant.

### B4 · PageHeader title (optional)
- minimal uses `text-[22px] font-semibold` (vs `text-2xl sm:text-3xl`). Keep current unless a denser
  title is wanted globally; low priority.

### B5 · Charts (props only)
- `AuroraAreaChart`: line `stroke-width 1.25`, fill gradient opacity `0.18` (lighter).
- bar charts (`FlowBar`, histogram): bar opacity `~0.85`, thin tracks `bg-surface-2`.

---

## C. New primitive (out of current scope, nice-to-have)

### C1 · Callout / Notice
The page caveat ("Backend on feat/vault-leaderboards…") is bespoke today. A minimal `Callout`:
`flex items-center gap-2 text-[11.5px] text-text-tertiary border-l-2 border-{tone}/40 pl-3`,
tones `info|warning|danger`. Until it exists, keep the inline line.

---

## Kit blocks to update (`dash-mockups/kit.html`)
- KpiRibbon block → `plain` markup (A2).
- **new** "Tabs — text" block (A1).
- TypedDataTable block → no header fill + neutral avatar (B1, A4).
- OverviewModule / ModuleRow blocks → neutral avatar, plain tag, no-icon head, medium weight (A3, A4).
- DESIGN_SYSTEM.md §5/§7 prose updated to match.
