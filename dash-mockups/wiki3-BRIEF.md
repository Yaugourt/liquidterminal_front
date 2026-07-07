# WIKI V5 DESIGN COUNCIL BRIEF (single source of truth)

Mission: redesign the ENTIRE wiki section of Liquid Terminal (dark crypto data
platform for the Hyperliquid ecosystem). The current V4.1 fused "Learn x
Library" hub is the baseline to beat. The council must cover EVERY view, not
just the article listing, and every view must prove it survives content
growth.

## Views to design (all 6, per direction)

1. `home` — the wiki landing: curriculum (7 Learn chapters) + community articles.
2. `topic-chapter` — a chapter selected (use HIP Framework with HIP-1/2/3 subs): Learn primer + that theme's articles.
3. `topic-community` — a community category selected (use HypurrCollective, 28 articles): no Learn primer exists for it.
4. `readlists` — index of community read lists (curated reading paths).
5. `readlist-detail` — one read list opened: its ordered items, progress, author.
6. `contributions` — my submissions + their moderation status, the suggest-content entry, and the moderator review queue.

## Growth requirements (every view must visibly handle these)

- Chapters may grow 7 -> ~15 (new curricula possible: "HyperEVM DeFi", "Trading").
- Categories: 41 today -> 100+.
- Articles: 194 today -> 2,000+.
- New content TYPES are coming: article, X thread, video, podcast, official doc.
  Show type affordances (icon/badge/filter) somewhere sensible.
- Read lists: 1 today -> hundreds (community curation is a roadmap bet).
- Each mockup must include at least one "scaled" proof: overflowing rail,
  type filters, pagination/virtualization hint, grouping, search-first, etc.

## Non-negotiable constraints

- Compose ONLY from the design kit vocabulary (`dash-mockups/kit.html` blocks
  mirror the React primitives 1:1). New pattern = flag it as a new primitive.
- Tokens (verbatim, do not invent): base #0A0B0F, surface #0F1421,
  surface-2 #141B2A, surface-3 #1C2436, border-subtle #1E2535,
  border-default #2C354A, text-primary #E8EAED, text-secondary #9CA3AF,
  text-tertiary #6B7280, brand #83E9FF (text-on #051728), gold #F9E370,
  success #1FA85B, danger #E53E3E, violet #A78BFA. Fonts Inter + JetBrains
  Mono (`.mono` for numbers).
- Page shells: nested TWO-column grids only (ESLint bans 3+ track grids with
  px). `minmax(0,1fr)` on the fluid column.
- NO CSS line-clamp (it fails the repo's visual-check clipping gate) — cut
  text in the copy itself.
- NO em dash character anywhere in UI copy. UI copy in English.
- Sidebar shell: 232px dark sidebar, "Wiki" active; halo gradient on top.
  Copy the shell verbatim from `dash-mockups/wiki2-E-topichub.html`.
- Data must be the REAL data below. Extra rows needed for scaled states must
  be plausible Hyperliquid content, never invented protocol facts.

## Real data

### Learn chapters (public/hyperliquid-education.json + education-meta.ts)
1. Introduction · "A sovereign L1 for fully on-chain finance" · stats: Founded 2022, Mainnet Feb 2023, Architecture 3-layer · 8 mapped articles
2. HyperBFT · "Trader-grade consensus, built for latency" · ~0.2s latency, 200k OPS, 1-block finality · 3 articles
3. HyperCore · "Fully on-chain order books, zero gas to trade" · Gas-free, On-chain CLOB, Perp+Spot · 11 articles
4. HyperEVM · "Ethereum-compatible, HyperCore-aware" · ~2s small blocks, ~60s big blocks, Unified state · 10 articles
5. HyperCore <-> HyperEVM · "Where DeFi meets a native CLOB" · Read precompiles 0x…0800, CoreWriter 0x3333…3333, atomic single block · 12 articles
6. $HYPE · "Fuel, stake and governance of the network" · 1B supply, ~334M circulating, genesis Nov 29 2024 · 3 articles
7. HIP Framework · "Binding code upgrades that extend the protocol" · 3 live HIPs, 500k HYPE stake, $25B+ HIP-3 volume · 32 articles · subs: HIP-1 Token standard (7), HIP-2 Hyperliquidity (7), HIP-3 Builder perps (17)

### Categories with counts (real, top of 41; total 194 approved articles)
HypurrCollective 28, Farming 24, HIP-3 17, Thesis 11, Builder codes 9,
HyperEVM 9, Podcast 8, HyperLiquid 8, OAK Research 7, HIP-1 7, HIP-2 7,
Analysis 6, HyperCore 6, USDH 5, CoreWriter 5, Read precompiles 4,
Market maker 3, Validator 3, Order Book 3, Governance 2, ... 21 more with 1-2.

### Real article titles (use these; domains real)
HIP-3: "HIP-3 in Q1 2026: 40% of Hyperliquid Is Now Commodities" (x.com, 58d),
"HIP-3 Explained: Why Hyperliquid Will Flip Binance" (blocmates.com, 2 saves),
"Kinetiq Launch: Making way for the People's Exchange" (x.com),
"HIP-3 and the Future of Decentralized Market Infrastructure" (x.com),
"HIP-3: Turning Hyperliquid into the Everything Exchange" (x.com).
HIP-1/2: "Hyperliquid Unveils HIP-1 Spot Token Deployment" (Metaverse Post),
"What Is HIP-2, Hyper Liquidity?" (x.com, 1 save),
"WTF is Hyperliquidity (HIP-2) The 0-1 for CLOB's" (x.com).
HyperEVM: "HyperEVM is Dead" (x.com), "The New Coinbase Effect: From
Hyperliquid to HyperEVM" (x.com), "DYOR or be Poor: A HyperEVM OPSEC Guide"
(x.com), "HyperEVM | Hyperliquid Docs" (hyperliquid.gitbook.io).
HyperCore: "Beginner/Intermediate Guide to HyperCore and HyperEVM"
(skygg.substack.com), "How HyperCore Powers Performance Across Hyperliquid"
(hyperpc.app), "Hyperliquid L1: The Next-Gen DEX" (luganodes.com).
Core<->EVM: "Demystifying the Hyperliquid Precompiles and CoreWriter" (medium),
"Hyperliquid Precompiles: A Breakdown for Dummies" (x.com).
Community: "Builder Codes: A Case for the Little Guy" (x.com), "Uncoil x
HypurrCo Community Research" (hypurr.co), "MARKET MAKING 101" (x.com),
"Why HYPE DATs Can Win" (x.com), "If You Just Heard About Hyperliquid" (x.com),
"Semiannual Report: Inside Hyperliquid's Growth" (x.com),
"Felix, The Liquidity Backbone of HyperEVM" (x.com).

### Read lists (real: only ONE exists; scaled states must be marked plausible)
Real: "Alice public list" · A public reading list · by alice · 2 items · 1 read.
Plausible scaled examples (placeholders): "Hyperliquid onboarding path",
"HIP-3 builder starter pack", "Security essentials", "Farming season 2 prep".

### Popularity signal
`savesCount` per article = number of read lists including it (gold star badge).
Only 2 articles have saves today (2 and 1). No per-article view counts exist.
NEVER show fake metrics (no fabricated read counts, deltas or sparklines).

### Contributions (current features, keep them all)
- Any signed-in user suggests a URL + categories (rate limited 5/day).
- Status flow: PENDING -> APPROVED / REJECTED (with reviewer notes).
- Moderators: pending queue with approve/reject + notes, reports list.
- XP is granted on submit and on approval (gamification exists platform-wide).

## Current implementation (baseline to critique, read these if useful)
- Live page: src/components/wiki/hub/*.tsx (WikiHub, ChapterStrip, ThemeBand,
  PrimerBand, TopicRail, ArticleShell), src/app/(app)/wiki/page.tsx.
- Approved mockups it came from: dash-mockups/wiki2-E-topichub.html (topic
  view) and dash-mockups/wiki2-F-bands.html (home bands).
- Older library iteration: dash-mockups/wiki-C-command.html.
- Read lists page today (/wiki/readlist) is untouched legacy: plain grid of
  list cards, no visual identity; detail page is a bare item list.
- Contributions: dialog with "My submissions" card + moderation card.

## Output rules for final mockup files
- One self-contained HTML file per view, Tailwind CDN config header copied
  from wiki2-E-topichub.html (same tokens/fonts/scrollbar css).
- File naming: dash-mockups/wiki3-<KEY>-<view>.html with <KEY> in {A,B,C} and
  <view> in {home, topic-chapter, topic-community, readlists,
  readlist-detail, contributions}.
- Every file: a top HTML comment block stating direction name, view, the
  consensus decisions it implements, and its growth proof.
- Density, spacing and typography must be production-grade, not wireframe.
