# Liquid Terminal

The data platform for the HyperLiquid ecosystem: real-time markets, blockchain explorer, analytics, wiki, and community features in one place.

## Stack

Next.js 16 (App Router) | React 19 | TypeScript (strict) | Tailwind CSS + shadcn/ui | Zustand | Privy (auth)

Charts use TradingView Lightweight Charts and Recharts, animations use Framer Motion, and data fetching goes through Axios with custom hooks.

## Features

- Real-time market data: spot, perps, order books, and price feeds
- Blockchain explorer for transactions, addresses, and liquidations
- Personal dashboard with portfolio and trading history
- Wiki and educational resources
- Web3 authentication via Privy

## Getting started

### Prerequisites

- Node.js 22+ and [pnpm](https://pnpm.io)
- The [backend API](https://github.com/Yaugourt/LiquidTerminal_Back) running locally, or a deployed endpoint

### Setup

```bash
git clone https://github.com/Yaugourt/liquidterminal_front.git
cd liquidterminal_front
pnpm install
cp env.example .env   # then fill in the values
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Development server (Turbopack, 127.0.0.1:3000) |
| `pnpm run build` | Production build |
| `pnpm run start` | Start the production build |
| `pnpm run lint` | ESLint |
| `pnpm run visual-check <route>` | Screenshot a route at 3 breakpoints and fail on clipping or overflow |

Run both `pnpm run build` and `pnpm run lint` before merging: a build can pass while lint fails.

## Configuration

Copy `env.example` to `.env`:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API` | Backend API URL (e.g. `http://localhost:3002`) |
| `JWKS_URL`, `NEXT_PUBLIC_PRIVY_AUDIENCE` | Privy authentication |
| `NEXT_PUBLIC_ENVIRONMENT` | `development` or `production` |

## Architecture

```
src/
├── app/          # App Router pages (dashboard, explorer, market, wiki...)
├── components/   # Domain-organized components (ui/ = shadcn base)
├── services/     # 4-layer API pattern per domain
├── hooks/        # Custom React hooks
├── store/        # Zustand stores
└── lib/          # Formatting and helpers
```

Each API service follows a four-layer pattern: `api.ts` (HTTP calls) -> `types.ts` (interfaces) -> `hooks/` (data fetching) -> components. All calls go through the centralized Axios helpers and the `useDataFetching` hook.

## Documentation

- [docs/CODEMAP.md](docs/CODEMAP.md) - route to component to data-source map. Start here.
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) - design system reference (tokens, primitives, patterns)
- [API_IMPLEMENTATION_GUIDE.md](API_IMPLEMENTATION_GUIDE.md) - how to add a new API service

## Links

- Backend: [LiquidTerminal_Back](https://github.com/Yaugourt/LiquidTerminal_Back)
- Website: [liquidterminal.xyz](https://liquidterminal.xyz)
- X: [@LiquidTerminal](https://x.com/liquidterminal)

## License

MIT. See [LICENSE](LICENSE).
