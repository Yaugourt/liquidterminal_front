# Validators V4 — Reproducibility Proof (GATE 1 ledger + GATE 5 proof table)

Source of truth: **live local back `:3002`, 2026-06-02**. Every mockup cell is a
real value; every block maps 1:1 to an existing prod primitive. Primitives are
imported via the `@/components/common` barrel (or `@/components/ui/*` for atoms).

---

## GATE 1 — Data ledger (curled, non-empty, ≥3 rows pasted in chat)

| Field used | Route (local back) | Unit | Nullable? | Cardinality (live) |
|---|---|---|---|---|
| `name, validator, description` | `GET /staking/validators` | str / 0x / str | no | 31 |
| `stake` | `GET /staking/validators` | HYPE (wei/1e8) | no | 31 |
| `apr, commission, uptime` | `GET /staking/validators` | % | no (0 if jailed) | 31 |
| `isActive, nRecentBlocks` | `GET /staking/validators` | bool / int | no | 31 |
| `stats.{totalValidators, activeValidators, totalHypeStaked}` | `GET /staking/validators` | int/int/HYPE | no | 31 / 27 / 429.6M |
| `distributionByRange[] {range, holdersCount, totalStaked, percentage}` | `GET /staking/holders/stats` | mixed | no | 8 buckets |
| `topHoldersStats[] {topCount, percentage}` | `GET /staking/holders/stats` | int / % | no | 5 |
| `totalHolders, totalStaked` | `GET /staking/holders/stats` | int / HYPE | no | 49,234 / 429.6M |
| `dailyStats[] {date, totalTokens, transactionCount, uniqueUsers}` | `GET /staking/unstaking-queue/stats` | date/HYPE/int/int | no | ~30 d |
| `totalStats`, `upcomingUnstaking.{nextHour,next24Hours,next7Days}` | `GET /staking/unstaking-queue/stats` | obj | no | present |
| validations `{time, type, amount, validator}` | `GET /staking/validations` | ISO/enum/HYPE/0x | no | 255 |
| **NEW** `id, actionType, summary, expireTime, quorumReached` | `GET /staking/validators/votes` | int/str/str?/ms/bool | `summary` nullable; list can be empty | 4 pending |
| **NEW** `voterCount, participationPct, stakeWeightPct, stakeWeightExFoundationPct, foundationVoterCount` | `GET /staking/validators/votes` | int / % | no | per proposal |
| **NEW** `voters[] {validator, name, stake, isFoundation}` | `GET /staking/validators/votes` | 0x/str/HYPE/bool | no | 12–13 / proposal |

**Vote JOIN invariant (proven):** proposal #0 voters = **13/13 ∩ `validator`**, **1/13 ∩ `signer`** → JOIN on `validator`.
**Foundation (GATE 3, proven):** 5 validators = **232.5M HYPE = 54.1%** of 429.6M; community = 197.1M (45.9%).
**Headline signal (proven):** Foundation voted on **0 / 4** pending proposals; community alone reached quorum on all 4.

---

## GATE 5 — Proof table  (block · prod primitive (path) · key props · data source)

### Mockup A — `validator-v4-A-operator.html` (network health)

| # | Block | Prod primitive (path) | Key props | Data source (route · field) |
|---|---|---|---|---|
| 1 | PageHeader | `@/components/common/PageHeader` (+ `charts/DataFreshness` in `actions`) | `title, description, actions` | static · `useValidators().dataUpdatedAt` |
| 2 | KpiRibbon (6) | `@/components/common/KpiRibbon` | `cells: KpiCell[]`, `variant="plain"` | `/staking/validators` `.stats.{totalHypeStaked,totalValidators,activeValidators}`; Jailed = total−active; median uptime/apr ← `.data[].{uptime,apr}` |
| 3 | Validators table | `@/components/common/DataTable` (`TypedDataTable`) + `@/components/ui/status-badge` | `columns: Column<Validator>[]`, `data`, `density="compact"`, `paginationVariant` | `/staking/validators` `.data[].{name,validator,stake,commission,apr,uptime,nRecentBlocks,isActive}` (share = stake/Σstake, front) |
| 4 | Validations tape | `@/components/common/OverviewModule` + `ModuleTable` + `ModuleTableRow` | `title, href, columns, cells` | `/staking/validations` `.data[].{time,type,amount,validator}` |

### Mockup B — `validator-v4-B-capital.html` (concentration)

| # | Block | Prod primitive (path) | Key props | Data source (route · field) |
|---|---|---|---|---|
| 1 | PageHeader | `@/components/common/PageHeader` | `title, description` | static · `dataUpdatedAt` |
| 2 | ex-Foundation toggle | `@/components/ui/pill-tabs` (`PillTabs variant="pill"`) | `tabs, activeTab, onTabChange` | client filter via `isFoundationValidator()` over `.data[]` |
| 3 | KpiRibbon (5) | `@/components/common/KpiRibbon` | `cells`, `variant="plain"` | derived front-side from `/staking/validators` `.data[].stake` (Foundation split, top-N cumulative, HHI) |
| 4 | DonutTopN | `@/components/common/charts/DonutTopN` | `data: DonutSlice[]`, `variant` | `/staking/validators` `.data[].{name,stake}` aggregated (Foundation + top community + Rest) |
| 5 | FlowGrid + FlowBar | `@/components/common/charts/FlowGrid` (+ `FlowBar`) | `rows, columns`; `FlowBar ratio,color` | `/staking/validators` `.data[]` top-N by stake |
| 6 | AuroraHistogramChart | `@/components/common/charts/AuroraHistogramChart` | `data: HistogramDataPoint[]` | `/staking/holders/stats` `.distributionByRange[].{range,holdersCount}` |
| 7 | Top-N share table | `@/components/common/OverviewModule` + `ModuleTable` | `columns, cells` | `/staking/holders/stats` `.topHoldersStats[].{topCount,percentage}` |
| 8 | KpiRibbon (queue) | `@/components/common/KpiRibbon` | `cells` | `/staking/unstaking-queue/stats` `.totalStats` + `.upcomingUnstaking` |
| 9 | AuroraAreaChart | `@/components/common/charts/AuroraAreaChart` | `data: AuroraDataPoint[] {time,value}` | `/staking/unstaking-queue/stats` `.dailyStats[].{date,totalTokens}` |

### Mockup C — `validator-v4-C-governance.html` (L1 votes)

| # | Block | Prod primitive (path) | Key props | Data source (route · field) |
|---|---|---|---|---|
| 1 | PageHeader | `@/components/common/PageHeader` | `title, description` | static · `useValidatorVotes().dataUpdatedAt` |
| 2 | ex-Foundation toggle | `@/components/ui/pill-tabs` (`PillTabs variant="pill"`) | `tabs, activeTab, onTabChange` | swaps `stakeWeightPct` ↔ `stakeWeightExFoundationPct` (both served) |
| 3 | KpiRibbon (5) | `@/components/common/KpiRibbon` | `cells` | `/staking/validators/votes` `.stats.{pendingCount,totalValidators}` + `.data[]` aggregates (avg participation, quorum count, Σ foundationVoterCount) |
| 4 | Proposals table | `@/components/common/DataTable` (`TypedDataTable`) + `@/components/ui/status-badge` + `charts/FlowBar` (inline cell) | `columns: Column<ValidatorVote>[]` (custom accessors), `data` | `/staking/validators/votes` `.data[].{id,actionType,summary,expireTime,voterCount,totalValidators,participationPct,stakeWeightPct,stakeWeightExFoundationPct,quorumReached,foundationVoterCount}` |
| 5 | Voters rail | `@/components/common/OverviewModule` + `ModuleTable` + `ModuleAsset` + `@/components/ui/status-badge` | `title, cells` | `/staking/validators/votes` `.data[0].voters[].{name,stake,isFoundation}` |

---

## ex-Foundation view (GATE 3) — where it lives

- **Single source:** `LiquidTerminal_Back/src/constants/staking.constants.ts` → `isFoundationValidator()` + `FOUNDATION_VALIDATOR_NAME_PREFIXES`. `trending.validator.service.ts` and `votes.service.ts` both consume it (no duplicated `startsWith('Hyper Foundation')`).
- **Server-stamped:** `/staking/validators/votes` returns `voters[].isFoundation` + `stakeWeightExFoundationPct` so the front never re-derives the rule.
- **Surfaced in:** Mockup B (toggle drives concentration KPIs + stake bars), Mockup C (toggle drives the stake-weight column; voter rail flags Foundation).

## Missing primitives
**None** — every block maps 1:1 to an existing primitive in `@/components/common` (or `@/components/ui/*`).

## GATE 1 · NOT SERVED → NOT DRAWN (no fabricated data)
- `isJailed / signer / unjailableAfter / stats series` — dropped by the formatted `ValidatorDetails` → "Jailed" KPI uses `total − active`; Status badge uses `isActive` only.
- per-validator stake sparkline — no per-validator time series served → omitted (DESIGN_SYSTEM "no fake sparkline" rule).
- HHI / top-N% — no upstream field → computed front-side from served `stake[]` (declared as a derivation, not a source).
- vote history / timeline — upstream `validatorL1Votes` serves the **pending snapshot only** → no time series drawn; empty snapshot renders the table empty-state.
