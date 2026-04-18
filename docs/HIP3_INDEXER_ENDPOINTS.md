# HIP-3 indexer API — design notes (Liquid Terminal)

Backend path prefix: **`/indexer/hip3`** (proxied; response shape is LiquidTerminal `{ success, data }` with `data` as below).

We document endpoints **in the same order as** `src/services/indexer/hip3/api.ts` and capture product discussion as we go.

---

## 1. `GET /indexer/hip3/overview`

**Client:** `fetchHip3Overview()` in `src/services/indexer/hip3/api.ts`  
**Types:** `Hip3Overview` in `src/services/indexer/hip3/types.ts`

### Unwrapped `data` payload

| Field | Type | Role |
|-------|------|------|
| `total_dexs` | number | Count of DEXs in indexer scope |
| `total_assets` | number | Asset rows / markets counted by indexer |
| `total_volume_24h` | number | Aggregated 24h volume (indexer) |
| `total_fees_24h` | number | Aggregated 24h fees (indexer) |
| `total_trades_24h` | number | Trade count 24h (indexer) |
| `total_open_interest` | number | Aggregated OI (indexer) |
| `active_auctions` | number | Auctions counted as active by indexer |

### Product discussion (2026-04)

- **What we already have:** `/market/perpdex` overview KPIs (`PerpDexStatsCard`) are driven by **`usePerpDexMarketData()`** — Hyperliquid REST + WebSocket (“LIVE”). That is the canonical **exchange-facing** view for traders.
- **What this endpoint adds:** One **indexer-shaped** global rollup. Same *family* of metrics (DEX count, volume, OI, auctions) but built from **HypeDexer / indexer fills & snapshots**, not from the same aggregation path as HL’s meta.
- **Value if used well:** Good for **fees**, **trade counts**, and **history-consistent** rollups where the indexer is the source of truth; useful for **internal sanity checks** or a **single secondary line** (“rollup from indexer”) **without duplicating** the whole hero card row.
- **Risk if used badly:** Showing **both** HL overview and this on the same screen **without** a clear primary source reads as duplicate/confusing (OI/volume can diverge materially vs HL meta).

**Conclusion for UI:** Treat as **optional enrichment or reconciliation**, not a second “overview strip” unless we explicitly label **one** primary source and keep the other minimal or behind a tooltip.

---

## 2. `GET /indexer/hip3/dexs`

**Client:** `fetchHip3Dexs(params?)` in `src/services/indexer/hip3/api.ts`  
**Upstream:** HypeDexer `GET /hip3/dexs` (LiquidTerminal proxies via `IndexerHip3Service.getDexs`)  
**Types:** `Hip3DexRow[]` in `src/services/indexer/hip3/types.ts`

### Query parameters

| Param | Notes |
|-------|--------|
| `limit` | Optional number |
| `offset` | Optional non-negative integer (pagination) |

### Unwrapped `data` payload

Array of **`Hip3DexRow`** (one row per DEX known to the indexer):

| Field | Type | Role |
|-------|------|------|
| `dex_id` | string | Stable id for indexer APIs (`dex_id` on assets, snapshots, fills, etc.) |
| `name` | string | Display name |
| `deployer_address` | string | Deployer wallet |
| `oracle_updater` | string | Oracle updater address |
| `collateral_asset` | string | Collateral identifier |
| `fee_share_pct` | number | Fee share percentage |
| `is_growth_mode` | boolean | Growth mode flag |
| `active_since` | string | ISO-ish timestamp when DEX became active (indexer) |
| `total_staked_hype` | number | Staked HYPE associated with the DEX (indexer) |

### Product discussion (2026-04)

- **What we already have:** `PerpDexTable`, `TopPerpDexsCard`, and routing to `/market/perpdex/[dex]` use **`fetchPerpDexs` + perp metas + WS** (`usePerpDexMarketData`) — Hyperliquid `perpDexs` + live `dayNtlVlm` / OI per asset. Sorting “top by volume” is **derived from HL market fields**, not from this list.
- **What this endpoint adds:** A **registry / static-ish** row per DEX: **addresses** (deployer, oracle updater), **collateral**, **fee share**, **growth mode**, **active_since**, **total_staked_hype**. Those are **not** the same shape as `PerpDex` from HL; **`dex_id`** is the key to join indexer analytics (`/assets`, `/snapshots`, `/fills`, …) to a human **name**.
- **Value if used well:** “**About this DEX**” panel on the detail page, admin/explorer-style transparency, linking HL name ↔ `dex_id` for charts and leaderboards; **paginated** directory of all DEXs **without** recomputing list from HL only.
- **Risk if used badly:** A **second full table** next to `PerpDexTable` with name + volume again → duplicate UX; volume/OI from HL will **not** appear on this row (must join snapshots or stay HL-primary).

**Conclusion for UI:** Prefer **metadata + id bridge** and **pagination**, not a second “markets leaderboard” unless the row is explicitly **indexer-only** fields HL does not show.

---

## 3. `GET /indexer/hip3/dexs/{dex_id}`

**Client:** `fetchHip3DexById(dexId)` in `src/services/indexer/hip3/api.ts`  
**Upstream:** HypeDexer `GET /hip3/dexs/{dex_id}` (`IndexerHip3Service.getDexById`)  
**Types:** single **`Hip3DexRow`** (same shape as one element of §2)

### Path parameters

| Param | Notes |
|-------|--------|
| `dex_id` | URL-encoded string (`min(1)` … `max(128)` on LiquidTerminal validation) |

No query string.

### Unwrapped `data` payload

One **`Hip3DexRow`** — field list identical to the table in **§2**.

### Product discussion (2026-04)

- **What we already have:** `/market/perpdex/[dex]` resolves **`dexName`** from the URL, loads **`usePerpDexWithMarketData(dexName)`**, and matches the HL **`PerpDex`** object (assets, live volume/OI via WS). There is **no** dedicated HL REST call that returns the same **registry row** as HypeDexer in one shot for “deployer + oracle updater + fee_share + staked HYPE”.
- **What this endpoint adds:** **Authoritative indexer row for that `dex_id`**. Use when the UI already knows **`dex_id`** (from list §2, from assets, or from a mapping table) and needs **metadata without scanning the full `/dexs` list**. Same join key as §2 for `/assets`, `/snapshots`, `/fills`, etc.
- **Value if used well:** Header or sidebar “**DEX facts**” on the detail page; prefetch by id when deep-linking from indexer-driven tables; **404/empty handling** if HL lists a name the indexer has not ingested yet (signals coverage gap).
- **Risk if used badly:** Calling with **HL display name** instead of **`dex_id`** → wrong or missing row; must **map name → `dex_id`** once (from §2 or from first asset row) and cache.

**Conclusion for UI:** **One cheap GET** for registry metadata keyed by **`dex_id`**; keep **markets + PnL** on HL/WS; use this for **addresses, fees, growth mode, stake** and for **consistency** with other indexer routes on the same id.

---

## 4. `GET /indexer/hip3/top-movers`

*To be filled in the next discussion.*

---

*(Further endpoints follow `api.ts` order; extend this file as we go.)*
