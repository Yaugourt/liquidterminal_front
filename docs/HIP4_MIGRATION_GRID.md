# HIP-4 migration grid (Phase 0)

Criteria of done: URLs unchanged (`/hip4/[slug]`), `generateStaticParams` + per-slug metadata preserved, no `dangerouslySetInnerHTML` for migrated slugs, styling via design system + `Hip4ChapterShell`, downloadable assets (`/hip4/*.abi`, `.sol`, `.bin`) remain under `public/hip4/` if linked.

| Slug | Content type | Legacy DOM / scripts | Migrated implementation |
|------|----------------|----------------------|-------------------------|
| `home` | Prose, hero, stats | `.page-wrapper` | `Hip4HomeChapter` |
| `overview` | Prose + responsive grid | `.access-grid`, `layout.js` | `Hip4OverviewChapter` (CSS grid) |
| `abi` | Tabs + tables + JSON | `.hip4-abi-tab`, `#hip4-v2-abi-json`, `abi.js` (unused in app) | `Hip4AbiChapter` + `Tabs` + static ABI imports |
| `events` | Tables | `<table>` | `Hip4EventsChapter` + `Table` |
| `reverts` | Prose + revert list | classes in `main.css` | `Hip4RevertsChapter` |
| `markets` | Tables + RPC scan | `HIP4_CONFIG`, `markets.js`, `markets-scan.js` | `Hip4MarketsChapter` + `useHip4MarketsScan` |
| `mechanics` | Prose | — | `Hip4MechanicsChapter` |
| `bridge` | Tables + prices (markets.js) | `#asset-table`, deferred broken `../js/markets.js` | `Hip4BridgeChapter` + shared `Hip4AssetTable` |
| `txexamples` | Table + prose | — | `Hip4TxexamplesChapter` |
| `storage` | Table + prose | — | `Hip4StorageChapter` |
| `docs` | Large prose + code | — | `Hip4DocsChapter` |

**Done (this repo):** `Hip4DocBody` removed; `hip4/layout.tsx` no longer loads `main.css`; `public/hip4/*.html` and legacy `.js` removed; ABIs bundled under `src/lib/hip4/abi/` for the ABI tab and kept in `public/hip4/` for downloads. `npm run sync:hip4` is a no-op copy reminder — re-copy ABIs from `public/hip4` into `src/lib/hip4/abi/` if they change.
