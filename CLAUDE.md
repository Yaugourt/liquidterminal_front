# CLAUDE.md - Liquid Terminal Frontend Guidelines

> This file provides context for Claude Code when working on this codebase.

## Project Overview

**Liquid Terminal** is a comprehensive data platform for the HyperLiquid ecosystem, built with Next.js 15, React 19, and TypeScript. It provides real-time market data, blockchain exploration, analytics, educational resources, and community features.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand |
| HTTP | Axios (custom configuration) |
| Auth | Privy (Web3) |
| Charts | TradingView Lightweight Charts, Recharts |
| Animations | Framer Motion |
| Validation | Zod |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # User portfolio & dashboard
│   ├── ecosystem/          # Public goods, projects
│   ├── explorer/           # Blockchain explorer, liquidations
│   ├── market/             # Trading data, tokens, perps
│   ├── user/               # User profile
│   └── wiki/               # Educational resources
├── components/             # Domain-organized components
│   ├── ui/                 # shadcn/ui base components
│   ├── common/             # Shared components
│   └── [domain]/           # Domain-specific components
├── services/               # API layer (4-layer architecture)
│   ├── api/                # Axios config, error handling, cache
│   └── [domain]/           # Domain services (api.ts, types.ts, hooks/)
├── hooks/                  # Custom React hooks
├── contexts/               # React contexts (auth, theme)
├── store/                  # Zustand stores
└── lib/                    # Utilities (formatting, helpers)
```

## Architecture Patterns

### 4-Layer API Architecture

All API integrations follow this pattern:

```
Layer 1: api.ts       → HTTP calls with withErrorHandling()
Layer 2: types.ts     → TypeScript interfaces
Layer 3: hooks/       → React hooks using useDataFetching
Layer 4: components   → UI consuming hooks
```

**Example service structure:**
```
src/services/explorer/
├── api.ts              # fetchLiquidations(), fetchVaults()...
├── types.ts            # Liquidation, LiquidationParams, UseLiquidationsResult
├── hooks/
│   ├── useLiquidations.ts
│   └── useLiquidationsPaginated.ts
└── index.ts            # Re-exports
```

### API Implementation Rules

1. **Always use `withErrorHandling`** to wrap API calls:
```typescript
export const fetchData = async (): Promise<DataType> => {
  return withErrorHandling(async () => {
    return await get<DataType>('/endpoint');
  }, 'fetching data'); // Descriptive context
};
```

2. **Always use centralized HTTP helpers** (`get`, `post`, `put`, `del`, `patch`):
```typescript
import { get, post } from '@/services/api/axios-config';
```

3. **Always use `useDataFetching`** hook as base for data fetching:
```typescript
const { data, isLoading, error, refetch } = useDataFetching<ResponseType>({
  fetchFn: () => fetchData(params),
  refreshInterval: 30000,  // 30s default, 10s real-time, 60s static
  dependencies: [param1, JSON.stringify(complexObj)],
  maxRetries: 3,
});
```

4. **Type everything** - No `any` types allowed.

## Design System (V4)

Le V4 est encodé par une **couche de primitives** : on les compose, on ne
réimplémente pas la composition. Un changement central se propage partout.

### Color tokens (use tokens, never raw hex)

| Token | Rôle |
|-------|------|
| `bg-base` | Fond de page (`#0A0B0F`) |
| `bg-surface` | Surface des cards/panneaux (`#0F1421`, navy whisper) |
| `bg-surface-2` / `bg-surface-3` | Surfaces imbriquées, hover, header de table |
| `text-text-primary` / `-secondary` / `-tertiary` | Hiérarchie de texte (3 niveaux) |
| `border-border-subtle` / `-default` / `-strong` | Bordures (navy opaque) |
| `text-brand` / `bg-brand` | Cyan signature `#83E9FF` ; `text-brand-text-on` = navy sur cyan |
| `text-gold` / `bg-gold` | Or `#F9E370` — réservé à la colonne Builder Fees |
| `success` / `danger` / `warning` | Sémantique |

> Les noms `brand-main/secondary/dark/accent/gold` sont des **alias legacy**
> (aliasés vers les tokens V4) — ne pas en introduire de nouveaux.

### Primitives — la source unique de composition

| Besoin | Primitive | Import |
|--------|-----------|--------|
| Tableau de données | `<TypedDataTable>` (colonnes typées) | `@/components/common` |
| Surface / panneau | `<Card>` (+ `CardHeader`/`CardContent`) | `@/components/ui/card` |
| Chiffre autonome | `<Num value format variant />` | `@/components/common` |
| En-tête / section de page | `<PageHeader>` / `<PageSection>` | `@/components/common` |
| Carte de stat | `<StatsCard>` / `<StatsPanel>` | `@/components/common` |
| Sélecteur de période | `<TimeframeTabs>` | `@/components/common` |

**Tables — `<TypedDataTable>` est obligatoire** (le `<Table>` brut de
`@/components/ui/table` est interdit hors `common/` — règle ESLint). Les
colonnes déclarent un `type` (`numeric` / `fees` / `change` / `address`) qui
applique automatiquement police mono, alignement, or des fees, couleur signée.
Tri local (`sortable`+`getSortValue`+`initialSort`) ou serveur (`onSortChange`).

### Typographie

- Inter pour l'UI ; **JetBrains Mono pour tous les chiffres** (classe `.mono`
  ou `Column.type`/`<Num>` qui l'appliquent). Non négociable.
- Échelle px fixe dans `tailwind.config.ts` (`text-2xs` 10 … `text-3xl` 28).

### Flexibilité

Les primitives sont **fluides** (aucune largeur fixe — elles remplissent
l'espace donné), avec variantes de densité (`compact`/`comfortable`) et slots
(`toolbar`, `actions`, `children`). Le look V4 reste verrouillé.

## Component Patterns

### Page Structure

```tsx
<div className="min-h-screen bg-brand-primary text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-brand-primary to-[#050505]">
  <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
  <div>
    <div className="sticky top-0 z-40 backdrop-blur-xl bg-brand-primary/80 border-b border-border-subtle">
      <Header customTitle="Page Title" />
    </div>
    <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
      {/* Content */}
    </main>
  </div>
</div>
```

### Loading / error / empty states

Ne pas réimplémenter : utiliser `<LoadingState>` / `<ErrorState>` /
`<EmptyState>` (`@/components/ui/*`). `<TypedDataTable>` gère ces trois états
nativement via les props `isLoading` / `error` / `emptyMessage`.

### Tables — `<TypedDataTable>` (jamais le `<Table>` brut)

```tsx
import { TypedDataTable, type Column } from "@/components/common";

const columns: Column<Row>[] = [
  { key: "name", header: "Name", accessor: (r) => r.name, sortable: true,
    getSortValue: (r) => r.name },
  { key: "volume", header: "Volume", type: "numeric", sortable: true,
    getSortValue: (r) => r.volume, accessor: (r) => formatNumber(r.volume, fmt) },
  { key: "fees", header: "Builder Fees", type: "fees",
    accessor: (r) => formatNumber(r.fees, fmt) },
];

<TypedDataTable<Row>
  data={rows} columns={columns}
  isLoading={isLoading} error={error}
  paginate itemsPerPage={25}
  initialSort={{ field: "volume", direction: "desc" }}
/>
```

`Column.type` (`numeric`/`fees`/`change`/`address`) applique mono, alignement
et couleur automatiquement. Tri serveur : `onSortChange`/`sortField`/`sortDirection`.

## Key Files Reference

| Purpose | Location |
|---------|----------|
| Axios config & HTTP helpers | `src/services/api/axios-config.ts` |
| Error handling | `src/services/api/error-handler.ts` |
| Data fetching hook | `src/hooks/useDataFetching.ts` |
| API constants | `src/services/api/constants.ts` |
| Tailwind tokens | `tailwind.config.ts` |
| Global CSS & glass classes | `src/app/globals.css` |
| Number formatting | `src/lib/numberFormatting.ts` |
| Date formatting | `src/lib/dateFormatting.ts` |

## Commands

```bash
npm run dev      # Development server (Turbo mode)
npm run build    # Production build (TypeScript + Next; does not replace ESLint)
npm run lint     # ESLint on app source (`src/`, config, etc.) — run before PR/ship
npm run start    # Production server
```

**Build vs lint:** `npm run build` can succeed while `npm run lint` fails. Always run both before merging. Vendored paths under `.agents/` and `.cursor/` are ignored by ESLint (third-party gstack tooling, not Liquid Terminal source).

## Important Conventions

### Do

- Use the 4-layer architecture for new services
- Use design system tokens (not raw hex colors)
- Use `glass-*` classes for containers
- Use `useMemo` and `useCallback` for performance
- Add JSDoc to API functions
- Type all responses and parameters
- Use pagination hooks for large datasets

### Don't

- Use raw axios calls (use centralized helpers)
- Use `any` type
- Create inline styles with hex colors
- Skip error handling wrappers
- Create components without loading/error states
- Use `text-zinc-*` (use semantic tokens instead)

## Authentication

- Uses Privy for Web3 authentication
- JWT tokens auto-injected via axios interceptor
- Token refresh handled automatically on 401
- Role-based access: USER, MODERATOR, ADMIN

## Performance Considerations

- `useDataFetching` has built-in caching
- Use `refreshInterval` appropriate to data type:
  - Real-time data: 10s
  - Normal data: 30s
  - Static data: 60s
- Memoize expensive computations
- Use server-side pagination when available
- Lazy load heavy components

## Documentation Files

| File | Content |
|------|---------|
| `DESIGN_SYSTEM.md` | Full design system reference |
| `API_IMPLEMENTATION_GUIDE.md` | Detailed API patterns |
| `XP_SYSTEM_README.md` | Gamification system |
| `PUBLIC_GOODS_API.md` | Public goods feature |
| `WIKI_FRONTEND_INTEGRATION.md` | Wiki/educational system |
| `LIQUIDATIONS_DATA_API.md` | Liquidations API spec |

## gstack

This repo vendors [gstack](https://github.com/garrytan/gstack) under `.agents/skills/gstack` for **Cursor** (and other agents that load [Agent Skills](https://cursor.com/docs/context/skills) from `.agents/skills/`). After clone, `setup` emits sibling skill folders `gstack-*` (symlinks) at `.agents/skills/`.

**Prerequisite to run `setup`:** [Bun](https://bun.sh/) 1.x (`npm install -g bun` works if the curl installer is unavailable).

**Invoking skills (Cursor Agent):** type `/` in chat and pick the skill (e.g. `gstack-review`, `gstack-qa`). Names use the `gstack-` prefix from this install.

**Web browsing:** gstack’s `/gstack-browse` flow targets its Playwright/Chromium stack. For everyday work in **Cursor**, you may still use the **cursor-ide-browser** MCP when it fits; use gstack browse when following a gstack QA/review workflow end-to-end.

**Useful commands:** `gstack-office-hours`, `gstack-plan-ceo-review`, `gstack-plan-eng-review`, `gstack-plan-design-review`, `gstack-design-consultation`, `gstack-design-shotgun`, `gstack-design-html`, `gstack-review`, `gstack-ship`, `gstack-land-and-deploy`, `gstack-canary`, `gstack-benchmark`, `gstack-browse`, `gstack-connect-chrome`, `gstack-qa`, `gstack-qa-only`, `gstack-design-review`, `gstack-setup-browser-cookies`, `gstack-setup-deploy`, `gstack-retro`, `gstack-investigate`, `gstack-document-release`, `gstack-cso`, `gstack-autoplan`, `gstack-careful`, `gstack-freeze`, `gstack-guard`, `gstack-unfreeze`, `gstack-upgrade`, `gstack-learn`.

**After clone or pull:** run `cd .agents/skills/gstack && ./setup --host codex` so `browse/dist` and the generated skill folders under `gstack/.agents/skills/` exist (they are gitignored inside the vendored tree; symlinks at `.agents/skills/gstack-*` point there).

**Troubleshooting:** same `setup` command (or `--host auto`). If `/gstack-browse` fails: `cd .agents/skills/gstack && bun install && bun run build`. Confirm skills under **Cursor Settings → Rules**. Telemetry is off by default; see gstack README.

**Claude Code (optional):** If skills are missing there, use the upstream path `~/.claude/skills/gstack` + `./setup`, or re-run `./setup --host auto` from `.agents/skills/gstack` so multiple hosts are registered.
