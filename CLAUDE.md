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

**Référence complète** : [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md). Lire ce fichier avant tout nouvel écran ou composant.

### Tokens essentiels

| Token | Usage |
|-------|-------|
| `bg-base` `#0A0B0F` | Fond de l'app |
| `bg-surface` `#0F1421` | Cartes, sidebar |
| `bg-surface-2` `#141B2A` | Header de table, hover, pills |
| `border-subtle` / `border-default` | Séparateurs / bordures |
| `text-primary` / `secondary` / `tertiary` | Hiérarchie de texte |
| `brand` `#83E9FF` | Cyan accent (focus, actifs) |
| `gold` `#F9E370` | Fees, accent secondaire |
| `success` `#1FA85B` / `danger` `#E53E3E` | Long/buy · Short/sell |

### Primitives (toujours composer à partir de là)

- **Cartes** : `<Card>` + card-head V4 (icône brand + titre 13px + tag pill + action `ml-auto`).
- **Tables** : `<TypedDataTable>` uniquement — le `<Table>` brut hors `common/` est bloqué par ESLint.
- **Charts** : `<AuroraAreaChart>` mono-série / `<MultiSeriesAreaChart>` dual-axis / `<Sparkline>` inline. Couleurs via `chartPalette` — hex hardcodé bloqué par ESLint.
- **Layout shell** : `bg-base` + halo subtil `z-0` ; contenu `relative z-10` ; sidebar 232px ; header sticky `bg-base/80 backdrop-blur-xl` sans border-b.

### Règles dures

- Aucun hex hardcodé dans le style — toujours un token.
- `.mono` pour les nombres tabulaires.
- Pas de sparkline/delta inventé : si l'API n'a pas d'historique pour la métrique, on ne l'affiche pas.
- Hypedexer (`/indexer/*`) est instable (402) — tout chart qui en dépend doit dégrader proprement. Sources robustes : DB locale `/liquidations/historical/chart`, Hypurrscan fees + `/spotUSDC`, DefiLlama bridge.

Voir [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) pour le détail des patterns Dashboard (PulseBar, OverviewModule, SectionHead), des paddings, des tailles de police et de l'inventaire complet des primitives.

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
