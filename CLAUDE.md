# CLAUDE.md: Liquid Terminal frontend

Instructions for AI agents working in this repo. This is the only instruction file: keep it short and true. A version or a figure is read in the code (`package.json`, `tailwind.config.ts`, `docs/DATA_BUDGET.md`), never copied from memory.

## Project

Liquid Terminal is a free, open-source data terminal for the Hyperliquid ecosystem: markets, explorer, HYPE analytics, capital (vaults, staking, builders), ecosystem, wiki and the Elysium pages. This repo is the web app. The API lives in a separate repo (`LiquidTerminal_Back`).

## Stack

Majors below, exact versions in `package.json`.

| Area | Technology |
|------|------------|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript 5, strict mode |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix) |
| State | Zustand 5 |
| HTTP | Axios through the helpers of `src/services/api/axios-config.ts` |
| Auth | Privy (login with X only), JWT injected by the axios interceptor |
| Charts | TradingView Lightweight Charts 5, Recharts 3 |
| Animation | Framer Motion 12 |
| Runtime | Node 22 (`.nvmrc`, `engines`), pnpm (lockfile `pnpm-lock.yaml`) |

## Commands

```bash
pnpm install            # use pnpm, not npm
pnpm run dev            # dev server, 127.0.0.1:3000
pnpm run lint           # ESLint
pnpm run typecheck      # tsc --noEmit
pnpm run build          # production build (does not run ESLint)
pnpm run start          # serve the production build
pnpm run visual-check <route>   # screenshots at 375/1024/1440, fails on clipping
                                # or sideways scroll; needs the dev server
```

There is no test script. CI (`.github/workflows/ci.yml`) runs install, lint, typecheck and build on every PR and every push to `main`.

The build needs `NEXT_PUBLIC_API` and `NEXT_PUBLIC_PRIVY_AUDIENCE` (see `env.example` and `src/lib/env.ts`).

## Structure

```
src/
├── app/            # App Router: (app)/ = pages inside the shell, api/ = route handlers
│   └── (app)/      # dashboard, market, explorer, hype, ecosystem, wiki, elysium, ...
├── components/     # ui/ (shadcn base), common/ (shared primitives), then one folder per domain
├── services/       # API layer: api/ (axios, errors, cache), then one folder per domain
├── hooks/          # shared hooks (useDataFetching)
├── contexts/       # auth context
├── store/          # Zustand stores
├── layouts/
└── lib/            # formatters/, env.ts, SEO, og/ (share tiles), helpers
docs/               # CODEMAP.md, DATA_BUDGET.md, API_IMPLEMENTATION_GUIDE.md, ...
scripts/            # visual-check.mjs, gen-og.mjs, predev-clean.mjs
.agents/            # vendored third-party agent tooling: not our source, ignored by ESLint
```

## Read before you work

| File | When |
|------|------|
| `docs/CODEMAP.md` | Start of any task: route to components to data source, fragile spots |
| `DESIGN_SYSTEM.md` (root) | Before any new screen or component. It is the active reference; `docs/DESIGN_SYSTEM_V4.md` is history |
| `docs/DATA_BUDGET.md` | Before changing a poll interval, cache TTL, rate limit or upstream budget. Update it in the same commit (an identical copy lives in the backend repo) |
| `docs/API_IMPLEMENTATION_GUIDE.md` | Details of the API layer patterns |
| `CHANGELOG.md` | What was delivered, in plain words |

## Rules

### Workflow

- Every change goes through a branch, then a pull request. Never push to `main`: a push to `main` goes to production (Vercel). Each branch gets a Vercel preview: look at it before merging.
- Every PR adds its line to `CHANGELOG.md` under `[Unreleased]` when the change is visible to a user.
- Before opening a PR: `pnpm run lint`, `pnpm run typecheck` and `pnpm run build` pass. For a page, also `pnpm run visual-check <route>`, and for a new data endpoint, call it and check it is not empty and its ranges make sense.
- Commit only the files of the task, not the whole working tree.

### Writing

- English in code, comments, JSDoc, commit messages and docs.
- Never name a competitor or the private data indexer in code, comments, commits or shared documents. Write "the data indexer" and "an analytics site". Older code and docs still contain such names: do not add new ones.
- Nothing invented: a figure has a source (API, Hyperliquid docs, a measurement) or it is not written.

### API layer (4 layers)

`api.ts` (HTTP calls) → `types.ts` → `hooks/` → components. See `src/services/explorer/liquidation/` for a complete example.

- Wrap every API call in `withErrorHandling(fn, 'context')` (`src/services/api/error-handler.ts`).
- Use the central helpers `get`, `post`, `put`, `del`, `patch`. No raw axios.
- Data hooks are built on `useDataFetching` (`src/hooks/useDataFetching.ts`). Pick the refresh interval from `docs/DATA_BUDGET.md`.
- Type every response and parameter. No `any`.
- Every component that loads data has a loading state and an error state.
- Routes under `/indexer/*` depend on the data indexer, which can refuse calls: anything built on them must degrade without breaking the page.
- No fake sparkline or delta: if the API has no history for a metric, do not show one.

### Design system

Compose from the real primitives, imported from `@/components/common`. Read the component, never rebuild its classes elsewhere. If a primitive is missing, build it in `common/` and document it in `DESIGN_SYSTEM.md`.

- Cards: `<Card>` + `<CardHead>`. Card heads go through `<CardHead>`, directly or via `<OverviewModule>` / `TypedDataTable` (`title`).
- Page tables: `<TypedDataTable>` only (raw `<Table>` outside `common/` is blocked by ESLint). A column is either simple (`accessor: 'field'` + `type`) or custom (function returning JSX, no `type`).
- Top-N cards: `OverviewModule` + `ModuleTable` + `ModuleTableRow` + `ModuleAsset`.
- Stat strip: `<KpiRibbon>` only. Never hand-roll one.
- Numbers: `<Num>` outside tables, `Column.type` inside. Formatting from `@/lib/formatters/numberFormatting` and `dateFormatting`: do not redeclare formatters locally.
- Layout: `<PageHeader>`, `<PageSection>`, `<TimeframeTabs>` / `PillTabs`.
- Charts: `<AuroraAreaChart>`, `<MultiSeriesAreaChart>`, `<Sparkline>`, colors from `chartPalette` (`src/components/common/charts/chartTheme.ts`).

Hard rules:

- No hardcoded hex. Colors are tokens (`tailwind.config.ts`, `src/app/globals.css`); charts use `chartPalette`.
- Text uses `text-text-primary` / `secondary` / `tertiary`. Never `text-zinc-*`, never raw `white` utilities in new code.
- Containers use the opaque surfaces `bg-surface`, `bg-surface-2`, `bg-surface-3`.
- `.mono` for tabular numbers. One focus treatment: `.focus-ring`.
- Tabs are styled by `<TabsTrigger size>` / `<TabsList size>` or `PillTabs` variants, not by pasted `data-[state=active]:` recipes.
- `common/` and `ui/` primitives are never dead code, even when unused for now.

## Gotchas

- Login buttons: `onClick={() => login()}` with `type="button"`, not `onClick={login}`. React passes the click event as first argument and `login` would read it as credentials, so Privy never opens.
- Client pages read route params with `useParams()`; `params` is a Promise.
- A panel or tab that owns data hooks is mounted once on first open, then hidden or shown. Mounting and unmounting on each toggle fires its requests again.
- Do not use `scrollIntoView` to center a tab in a strip: it can scroll the page sideways. Scroll the strip's container.
- The build runs on Turbopack: do not add a `webpack()` hook to `next.config.js`.
- After deleting files, a stale "Module not found" in dev comes from `.next/`: clear it and restart.
- The React Compiler rules of `eslint-plugin-react-hooks` are turned off in `eslint.config.mjs` on purpose.
- Roles are `USER`, `MODERATOR`, `ADMIN`. The token is refreshed automatically on a 401.
