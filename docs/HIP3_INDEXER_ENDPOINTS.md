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

**Client:** `fetchHip3TopMovers(params?)` in `src/services/indexer/hip3/api.ts`  
**Upstream:** HypeDexer `GET /hip3/top-movers` — OpenAPI summary: **“Top coins by 24h volume”** (`get_top_movers_hip3_top_movers_get`)  
**Types:** `Hip3SnapshotRow[]` in `src/services/indexer/hip3/types.ts` (aligned with HypeDexer `LiveSnapshot`; upstream may also send `open_interest_usd`, `builder_fees_24h` — extend types if consumed)

### Query parameters

| Param | Notes |
|-------|--------|
| `limit` | Optional; upstream OpenAPI: integer **1–100**, **default 20** |

### Unwrapped `data` payload

Ordered list of **`Hip3SnapshotRow`** — one row per **(dex_id, coin)** snapshot, ranked by indexer logic for “top movers” (24h volume–driven per upstream summary).

| Field | Type | Role |
|-------|------|------|
| `dex_id` | string | DEX scope |
| `coin` | string | Market / coin symbol |
| `current_mark_price` | number | Mark |
| `current_oracle_price` | number | Oracle |
| `current_funding_rate` | number | Funding |
| `open_interest` | number | OI |
| `volume_24h` | number | 24h volume |
| `fees_24h` | number | 24h fees |
| `trades_24h` | number | 24h trade count |
| `total_volume_cumulative` | number | Cumulative volume |
| `total_fees_cumulative` | number | Cumulative fees |
| `is_halted` | boolean | Halted flag |
| `last_update` | string | Last snapshot update |

### Product discussion (2026-04)

- **What we already have:** `TopHip3MarketsCard` builds **“top markets by 24h vol”** in the browser by **aggregating** `usePerpDexMarketData()` across all HL PerpDexs (same ticker can appear on multiple DEXs → rollup + `primaryDexName` for deep link). That is **HL-shaped** and **cross-DEX aggregated**.
- **What this endpoint adds:** **Server-side** ranking of **per-(dex, coin)** snapshots from the indexer — includes **`dex_id` + `coin`** on each row, plus **fees**, **trades**, **cumulative** series, **halted**, **last_update** in one payload. Good when we want **“which DEX’s book moved most”** without client-side fan-out over every DEX’s assets.
- **Value if used well:** Hub widget **“Top movers (indexer)”** with explicit **DEX column**; avoids recomputing top-N from WS; supports **fees / trade count** columns HL cards do not emphasize.
- **Risk if used badly:** Placing this **next to** `TopHip3MarketsCard` **without** copy that distinguishes **HL aggregate** vs **indexer per-market rows** → reads as duplicate “top markets” with different numbers.

**Conclusion for UI:** Either **replace** the client aggregate for “top movers” with this **one** list, or show **one** card with a clear title (e.g. by volume, **per market & DEX**, indexer). Do not stack two unnamed “top markets” tables.

---

## 5. `GET /indexer/hip3/assets`

**Client:** `fetchHip3Assets(params?)` in `src/services/indexer/hip3/api.ts`  
**Upstream:** HypeDexer `GET /hip3/assets` — OpenAPI summary: **“List all HIP-3 assets”** (`get_assets_hip3_assets_get`)  
**Types:** `Hip3AssetRow[]` in `src/services/indexer/hip3/types.ts` (maps to HypeDexer `AssetConfig`)

### Query parameters

| Param | Notes |
|-------|--------|
| `dex_id` | Optional — filter rows to one DEX |
| `search` | Optional — filter by ticker/symbol substring (upstream description) |
| `limit` | Optional; upstream OpenAPI: **1–1000**, **default 200** |
| `offset` | Optional; upstream **default 0** (pagination) |

### Unwrapped `data` payload

Array of **`Hip3AssetRow`** — **static / config** per listed HIP-3 market (not live mark/volume; those live on **§6 snapshots** or HL WS).

| Field | Type | Role |
|-------|------|------|
| `dex_id` | string | Join key for snapshots, fills, oracle stats |
| `asset_id` | number | Numeric asset id in indexer / HL universe |
| `ticker` | string | Short ticker |
| `symbol` | string | Symbol / display string |
| `max_leverage` | number | Max leverage |
| `oi_cap_usd` | number | OI cap (USD) |
| `is_halted` | boolean | Trading halted |
| `oracle_source` | string | Oracle feed identifier |
| `update_timestamp` | string | When config row was updated |
| `fee_share_pct` | number | Fee share (default 0 upstream if omitted) |

### Product discussion (2026-04)

- **What we already have:** `PerpDexMarketsTable` on `/market/perpdex/[dex]` is fed **`PerpDexAssetWithMarketData[]`** from **`usePerpDexWithMarketData`** — HL perp metas + **live** `dayNtlVlm`, OI, funding, mark, etc. That is the **trading** table.
- **What this endpoint adds:** **Canonical list of configured markets** from the indexer: **oracle_source**, **oi_cap**, **fee_share_pct**, **asset_id**, **`dex_id`**, halted flag, **search + pagination** across all DEXs or one DEX. Use to **enumerate** markets for server-driven UIs, **cross-DEX** asset search, or to **align** `asset_id` / `dex_id` with **§6–§12** routes without scraping HL meta alone.
- **Value if used well:** Explorer-style **“all HIP-3 markets”** table with filters; detail-page **“config” strip** (oracle, cap, fee share) **next to** the HL live table; building **coin + dex_id** for OHLCV / oracle stats APIs.
- **Risk if used badly:** Replacing **`PerpDexMarketsTable`** with this list **only** → users lose **live prices and 24h volume** unless paired with snapshots or HL.

**Conclusion for UI:** **Config + directory + join keys**; keep **live PnL/volume** from HL or **§6 snapshots**. Prefer **one** combined mental model: “config from indexer, marks from HL or snapshots.”

---

## 6. `GET /indexer/hip3/snapshots`

**Client:** `fetchHip3Snapshots(params?)` in `src/services/indexer/hip3/api.ts`  
**Upstream:** HypeDexer `GET /hip3/snapshots` — OpenAPI summary: **“Live market snapshots for all coins”** (`get_snapshots_hip3_snapshots_get`)  
**Types:** `Hip3SnapshotRow[]` (same row shape as **§4**; HypeDexer `LiveSnapshot`)

### Query parameters

| Param | Notes |
|-------|--------|
| `dex_id` | Optional — restrict to one DEX |
| `coin` | Optional — restrict to one coin / ticker |

No `limit` / `offset` on this LiquidTerminal client call; upstream OpenAPI defines **only** these two filters (response is the full filtered array the upstream returns).

### Unwrapped `data` payload

Array of **`Hip3SnapshotRow`** — see **§4** for the column table (`dex_id`, `coin`, mark/oracle, funding, OI, `volume_24h`, `fees_24h`, `trades_24h`, cumulatives, `is_halted`, `last_update`).  
Upstream `LiveSnapshot` may also include **`open_interest_usd`**, **`builder_fees_24h`**; extend `Hip3SnapshotRow` if the UI needs them.

### Product discussion (2026-04)

- **What we already have:** PerpDex UI uses **Hyperliquid WebSocket + meta** for **sub-second** marks, funding, 24h volume, OI per asset (`usePerpDexMarketDataStore` + `usePerpDexWithMarketData`). That is the **default trading truth** in-app.
- **What this endpoint adds:** **Point-in-time (or slowly refreshed) “live snapshot” rows from the indexer** for **all** `(dex_id, coin)` pairs, or a **slice** via `dex_id` and/or `coin`. Same numeric story as §4 but **not** ranked — suitable for **server-driven tables**, **CSV/export**, **historical alignment** with fills/OHLCV that also use indexer time, or **when WS is down**.
- **Value if used well:** Periodic **reconciliation** (“indexer vs HL” on one row); building **charts** that must use **one** pipeline; **detail page** supplement with **fees_24h / trades_24h** from the same place as **§7 fills** aggregates.
- **Risk if used badly:** Polling snapshots on a **short interval** and rendering them **beside** WS-driven cells **without** labeling → two numbers for “volume” or “OI” that drift and confuse; replacing WS entirely → **worse latency** than HL.

**Conclusion for UI:** Treat as **indexer-consistent live-ish state** with explicit **refresh cadence** (e.g. 30–60s) or **on-demand** load; **do not** silently duplicate WS columns. Prefer **one** primary source per metric on screen.

---

## 7. `GET /indexer/hip3/fills`

**Client:** `fetchHip3Fills(params?)` in `src/services/indexer/hip3/api.ts`  
**Upstream:** HypeDexer `GET /hip3/fills` — OpenAPI summary: **“HIP-3 fills (trades)”** (`get_fills_hip3_fills_get`)  
**Types:** `Hip3FillRow[]` in `src/services/indexer/hip3/types.ts` (maps to HypeDexer `Hip3Fill`; `tid` optional on our type)

### Query parameters

| Param | Notes |
|-------|--------|
| `dex_id` | Optional — filter to one HIP-3 DEX |
| `coin` | Optional — filter to one market |
| `user` | Optional — trader address (OpenAPI: “Trader address”) |
| `side` | Optional — `B` or `A` (bid / ask) |
| `start` | Optional — ISO datetime window start |
| `end` | Optional — ISO datetime window end |
| `min_notional` | Optional — minimum notional filter |
| `limit` | Optional; upstream OpenAPI: **1–1000**, **default 100** |
| `offset` | Optional; upstream **default 0** |

Always pass a **tight** `start`/`end` or **`limit`** for UX lists; unbounded “all HIP-3 fills” can be heavy on upstream and the browser.

### Unwrapped `data` payload

Array of **`Hip3FillRow`** — one indexed **trade / fill** per row.

| Field | Type | Role |
|-------|------|------|
| `time` | string | Fill time (ISO) |
| `dex_id` | string | DEX |
| `coin` | string | Market |
| `user` | string | Trader address |
| `side` | string | Side (`B` / `A` per upstream) |
| `px` | number | Price |
| `sz` | number | Size |
| `notional` | number | Notional |
| `fee` | number | Fee |
| `builder_fee_usd` | number | Optional in our type; present upstream |
| `is_liquidation` | number | Liquidation flag (0/1 style) |
| `hash` | string | Fill / tx identifier |
| `tid` | number | Optional trade id in our typings |

### Product discussion (2026-04)

- **What we already have:** PerpDex pages **do not** expose a **HIP-3–scoped fill tape** today; market view is **meta + WS**, not trade-by-trade history. Generic LiquidTerminal **`/indexer/fills`** is **global** indexer fills, not this HIP-3–filtered route.
- **What this endpoint adds:** **Auditable trade stream** for HIP-3 only, filterable by **DEX, coin, user, time, side, min size**, with **pagination** (`limit`/`offset`). Powers **“recent trades on this DEX”**, **address activity**, **liquidation highlights**, and reconciles with **§1 overview** / **§6 snapshots** aggregates if windows match.
- **Value if used well:** Detail-page **feed** or modal “fills” with **defaults**: e.g. `dex_id` + `limit=50` + `end=now`; **export** for research; **user drill-down** when combined with **§17 user fills** for the same address.
- **Risk if used badly:** Large `limit`, wide `start`/`end`, no `dex_id` on a busy hub → **slow** pages and rate-limit pain; showing raw fills **without** time range copy → users think it is “all history”.

**Conclusion for UI:** **On-demand or slow poll** (e.g. 15–60s), **always bounded** query; pair with **pagination** or “load more”. This is the **right** endpoint for “tape” UX, not §6 snapshots.

---

## 8. `GET /indexer/hip3/leaderboard`

*To be filled in the next discussion.*

---

*(Further endpoints follow `api.ts` order; extend this file as we go.)*
