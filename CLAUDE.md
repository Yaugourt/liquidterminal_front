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

## Design System (V3)

### Color Tokens (use these, not raw colors)

| Token | Value | Usage |
|-------|-------|-------|
| `bg-brand-primary` | `#0B0E14` | Main background |
| `bg-brand-secondary` | `#151A25` | Cards, sections |
| `text-text-secondary` | `#a1a1aa` | Labels, headers |
| `text-text-muted` | `#71717a` | Muted text |
| `text-brand-accent` | `#83E9FF` | Links, accent |
| `text-brand-gold` | `#f9e370` | Secondary accent |
| `border-border-subtle` | `rgba(255,255,255,0.05)` | Light borders |
| `border-border-hover` | `rgba(255,255,255,0.1)` | Hover borders |

### Glass Components (defined in globals.css)

```tsx
<div className="glass-panel">       // Standard cards (60% opacity)
<div className="glass-card">        // Higher opacity cards (90%)
<div className="glass-dialog">      // Modals
<div className="stat-card">         // Stats displays
<input className="glass-input" />   // Inputs
<button className="glass-button">   // Buttons
```

### Typography

- **Titles:** `font-outfit`
- **Body:** `font-inter`
- **Code/Addresses:** `font-mono`

### Semantic Colors

- **Success/Buy:** `emerald-400/500`
- **Error/Sell:** `rose-400/500`
- **Accent:** `text-brand-accent`
- **Warning:** `text-brand-gold`

### Migration Checklist (when editing components)

Replace legacy classes:
- `text-zinc-400` → `text-text-secondary`
- `text-zinc-500` → `text-text-muted`
- `border-white/5` → `border-border-subtle`
- `border-white/10` → `border-border-hover`
- `bg-[#151A25]` → `bg-brand-secondary`

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

### Loading State

```tsx
<div className="flex justify-center items-center h-[200px] glass-panel">
  <div className="flex flex-col items-center">
    <Loader2 className="h-6 w-6 animate-spin text-brand-accent mb-2" />
    <span className="text-text-muted text-sm">Loading...</span>
  </div>
</div>
```

### Error State

```tsx
<div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 text-center text-rose-400 text-sm backdrop-blur-md">
  Error: {error.message}
</div>
```

### Tables (use shadcn Table components)

```tsx
<TableHead className="py-3 px-3">
  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
    {header}
  </span>
</TableHead>
<TableCell className="py-3 px-3 text-sm text-white">
  {content}
</TableCell>
```

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
npm run build    # Production build
npm run lint     # ESLint check
npm run start    # Production server
```

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
