# STRATEGY — Annexes (matiere brute du workflow)
_Genere par le workflow multi-agents liquidterminal-strategy. Matiere de travail, pas le doc final (voir STRATEGY.md)._


---

## Audit produit

Inventaire complet ci-dessous. Basé sur lecture directe des 4 repos (branche front active `feat/project-detail-protocol`, 72 commits devant `main`).

---

# Liquid Terminal — Inventaire de l'état réel (2026-07-01)

## 0. Cadrage technique
- **Front** `/home/yaugourt/liquidterminal_front` : Next.js 16 / React 19, ~50 routes `page.tsx`, Design System V4 documenté (`DESIGN_SYSTEM.md`, 31 Ko), auth Privy (`src/components/Providers.tsx`), Tanstack Query + Zustand. Le gros du produit V4 vit sur des branches non mergées (`feat/project-detail-protocol` est **72 commits devant `main`**) : ce que voit le repo n'est pas encore ce qui est en prod.
- **Back** `/home/yaugourt/LiquidTerminal_Back` : Express + Prisma, **4 bases séparées** (main, `prisma-content`, `prisma-historical`, `prisma-telegram`), ~40 groupes de routes (`src/app.ts`), WebSocket interne (`/ws`), Redis, circuit breaker, rate limiter maison (`src/core/`).
- **Bot** `/home/yaugourt/liquidTelegram_Bot` : grammY, v1.4.1, base Telegram dédiée.
- **Point clé archi** : le fameux `/indexer` **EST HypeDexer**. Le back proxie `api.hypedexer.com` (REST + WS, clé `HL_INDEXER_API_KEY`) sous `src/clients/hypedexer/` → routes `/indexer/*` → front `src/services/indexer/`. HypeDexer n'est pas une brique interne stable, c'est une **dépendance externe tierce** wrappée.

---

## 1. Ce qui EXISTE et marche (features réelles, câblées data)

**Market** (le plus mûr)
- Spot : liste + détail token (`market/spot/[token]`), holders (`HoldersTable`), auction de listing spot live.
- Perp : liste + détail (`market/perp/[token]`).
- **HIP-3 / perpdex** : `market/perpdex/[dex]`, marchés et déployeurs (data HypeDexer réelle).
- **HIP-4** : `market/hip4/[coin]`, marchés de prédiction + analytics chart.
- **Builders** : liste, détail `[address]`, page "intelligence", donut de concentration de fees.
- **Tracker** : wallets perso, listes publiques, page wallet `[address]` (feature sociale : `WalletList` côté back).

**Explorer** (deuxième pilier solide)
- Address `[address]`, Block `[number]`, Transaction `[hash]`, Validator, Vaults + détail `[address]` avec charts, Liquidations, Priority-fees. Data via RPC Hyperliquid + back.

**Dashboard** (`dashboard/page.tsx`) — page vitrine V4, 8 sections thématiques réellement branchées : Network Pulse, Protocol Revenue (décompo fees 5 sources perp/spot/HIP-1/HIP-3/HIP-4), Spot movers + auction + builders, Perp + HIP-3 auctions/déployeurs, Live Activity (liquidations + TWAPs), Capital Allocators (vaults + validators), Stablecoins.

**Wiki / Ecosystem** (contenu + modération)
- Wiki + ReadLists (perso + publiques, `readList`).
- Ecosystem : projets `project/[id]`, **Public Goods** avec workflow complet (soumission user, pending, my-submissions, modération, reports). Back : `PublicGood`, `ResourceReport`, `EducationalResource`.

**Bot Telegram** — 3 familles d'alertes réellement livrées (v1.4.1) :
- **Fill alerts** (perp + spot, filtres avancés Side/Source/Direction/Max size, PnL réalisé, bloc TWAP, preset "Position Closes >$50k").
- **Liquidation alerts** (all / avec filtres coin+montant+wallets, max 3 subs).
- **Wallet tracking** (`/addwallet`, `walletSubscription`).
- Conversations, menus, rate-limit, announcements. Client doc-update présent (`docUpdateAlertClient`).

**USDH / HYPE** : pages dédiées (`usdh`, `hype`) — intégration `@usdh-kit/sdk` + widget.

---

## 2. À moitié construit / placeholders / gelé

- **HIP-4 déployeurs** : composant explicite `Hip4DeployersComingSoon.tsx` sur le dashboard ; section HIP-4 "pending mainnet".
- **Perp metadata** : `market/perp/[token]/page.tsx:52` → `// TODO: Replace with real API call to get perpetual metadata`.
- **Auction perp** : `AuctionTable.tsx` affiche "Coming Soon" pour le perp.
- **Address analytics** : `AddressAnalyticsLayout.tsx:184` "Coming soon: {label}" ; "Private name tags are coming soon" (`AddressSummary`).
- **`labs/`** : pages `charts`, `revenue-mockups`, `revenue-5050-mockups` = **mockups à fausses données** (`makeFakeData`, `mockData.ts`, `QuantumCandleChart`, `AuroraEcosystemShowcase`). Terrain d'expérimentation, pas produit.
- **Bot — alertes gelées** : la base `prisma-telegram` contient 8+ modèles définis mais **non câblés** dans le bot : `TelegramWhaleTradeSubscription`, `TelegramMarketTradeSubscription`, `TelegramPriceAlert`, `TelegramHip4SentAlert`, `TelegramSpotFillSubscription`. Confirme les "alertes HypeDexer gelées" (models Prisma parkés).
- **HypeDexer côté back** : 13 services `indexer-*` (analytics, funding, twaps, completed-trades, hip3, hip4, evm, users, vaults) créés mais surface d'exposition front partielle (surtout builders/evm/hip3/hip4/overview côté `src/services/indexer/` du front).
- **Divergence branches** : `main` (prod) vs V4 (72 commits d'avance) = grosse dette d'intégration ; l'"état réel prod" est en retard sur le code lu ici.

---

## 3. Surface UX actuelle — que peut faire un utilisateur ?

Aujourd'hui un utilisateur peut : explorer tokens spot/perp/HIP-3/HIP-4, fouiller la chain (adresses, blocs, tx, validateurs, vaults, liquidations, fees), suivre des wallets et des listes publiques, lire/curer un wiki de ressources, soumettre des projets/public-goods, et surtout **s'abonner à des alertes Telegram (fills, liquidations, wallets)**.

**Utilisateur implicite = le trader/on-chain analyst Hyperliquid déjà initié.** Toute la densité (HIP-3/HIP-4, builders intelligence, TWAPs, funding, priority-fees, concentration de builder fees) parle à quelqu'un qui connaît déjà l'écosystème. Ce n'est **pas** un produit pour le nouveau venu HL (pas d'onboarding, pas de pédagogie hors wiki), ni pour le builder (pas d'outillage dev). Le chercheur/data-nerd est bien servi en lecture, mais l'export/API publique n'est pas la vitrine.

---

## 4. Forces techniques vs dettes/fragilités

**Forces**
- Archi propre 4-couches back (`clients` → `services` → `routes` + `core`), circuit breaker + rate limiter + Redis + 4 DB isolées par domaine (résilience).
- Design System V4 réellement écrit et discipliné : "real data only, no fake sparkline", primitives uniques (`TypedDataTable`, `chartPalette`, `<Card>`). Rare à ce niveau de rigueur.
- Bot solide (grammY, conversations, filtres, versioning changelog) = c'est le **canal de monétisation le plus prêt**.
- Couverture data énorme déjà branchée sur HypeDexer (HIP-3/HIP-4 = différenciant que peu de concurrents ont).

**Dettes/fragilités**
- **Dépendance HypeDexer sous `/indexer`** : le back dépend en dur de `api.hypedexer.com` (REST + WS). Si HypeDexer tombe/coupe la clé, HIP-3/HIP-4/builders/completed-trades/twaps s'éteignent. Single point of failure externe, non redondé.
- **Pollers/WS qui saturent les pools DB** (confirmé mémoire) : nombreux `setInterval`/services WS (liquidations ingestion, builders, toptraders, validation, unstaking) sur 4 pools cappés → crashs back non reproductibles en local.
- **Dette de branche** : 72 commits V4 non mergés → risque d'intégration, prod ≠ repo.
- **Fragmentation stratégique visible dans le code** : `labs/`, mockups revenue, 8 modèles Telegram parkés, "coming soon" éparpillés = beaucoup de chantiers ouverts, peu fermés. Pas de fil directeur produit lisible dans l'arborescence.
- Zéro monétisation implémentée (pas de quota, pas de tier, pas de paywall) — tout est gratuit/ouvert aujourd'hui.

---

## 5. Le "so what" (proposition de valeur ACTUELLE, non marketing)

**Un explorer + dashboard analytics Hyperliquid dense, gratuit et open-source, qui couvre déjà HIP-3/HIP-4 et les builders (via HypeDexer), doublé d'un bot Telegram d'alertes fills/liquidations/wallets qui, lui, est réellement livré et prêt à être le levier premium.**

En clair : la valeur unique aujourd'hui n'est pas le site web (concurrencé par HypurrScan/ASXN/DefiLlama), c'est **la profondeur HIP-3/HIP-4 + le bot d'alertes** — c'est là que se trouve le wedge et la seule surface monétisable prête.

Fichiers de référence : `LiquidTerminal_Back/src/app.ts`, `LiquidTerminal_Back/src/clients/hypedexer/`, `LiquidTerminal_Back/prisma-telegram/schema.prisma` (modèles parkés), `liquidterminal_front/src/app/(app)/dashboard/page.tsx`, `liquidterminal_front/src/services/indexer/`, `liquidterminal_front/DESIGN_SYSTEM.md`, `liquidTelegram_Bot/src/config/changelog.ts` + `src/bot/commands/help.ts`.

---

## Data & opportunites

Analysis complete. Here is the deliverable.

---

# DATA GAPS — Ce que HypeDexer permet mais que Liquid Terminal n'exploite pas (encore)

## Méthode
J'ai appelé la data réelle HypeDexer (HIP-3, HIP-4, TWAP, builders, traders, EVM, vaults, funding) et croisé avec `liquidterminal_front/src/services` + les pages/composants qui consomment réellement ces services. Distinction clé faite partout : **scaffoldé** (service écrit mais jamais rendu) vs **surfacé** (rendu dans une page).

## Baseline — ce que le produit surface DÉJÀ (à ne pas re-vendre comme nouveau)
Bien couvert, souvent richement :
- **Builders** : leaderboard, intelligence, détail par builder, users, coin breakdown, flow, concentration. Data réelle confirmée riche (Phantom 345k$ de builder fees / 7j, 8843 users ; INVO 13991 users). C'est déjà un des meilleurs modules.
- **HIP-4 prediction markets** : grid, questions, outcomes Yes/No, fills, settlements, analytics. Surfacé (`market/hip4`). Data = marchés récurrents BTC priceBinary/priceBucket journaliers, volume/fills/unique_users par marché.
- **EVM / HyperEVM** : blocks, txs, bridge events, network pulse (`explorer/v4`). Data = 596k blocks, 2.17M txs, 8.7M logs depuis le 26/03.
- **Marché perp/spot** : perp, spot, tokens, auction (listing), fees, revenue, stablecoins, active users, top traders, hype buyback, assistance fund.
- **Explorer** : vault, validator, address, priority-fees, liquidations.

## DATA GAPS priorisés (gisement non exploité)

**P0 — HIP-3 analytics profondes (le plus gros gap vs la valeur)**
Le service `indexer/hip3/api.ts` est **entièrement écrit** (overview, dexs, assets, snapshots, topMovers, fills, leaderboard, statsTraders, ohlcv) mais **jamais consommé** : pas de dossier `hooks`, aucun import dans les pages. Les pages `market/perpdex` utilisent le service `market/perpDex` qui tape l'API Hyperliquid brute (`perpDexs`/`allPerpMetas`) = simple listing, pas les analytics.
Non exploité concrètement :
- **Leaderboard/trader stats par DEX HIP-3** (`hd_hip3_traders`) — qui trade sur Felix/Ventuals/Paragon.
- **Oracle health** (`hd_hip3_oracle_stats`) — la page `[dex]` n'affiche que l'adresse `oracleUpdater`, pas la déviation/staleness de l'oracle. Or c'est LE risque n°1 d'un perp DEX builder-deployed.
- **Top movers / snapshots historiques** par asset HIP-3.
- **Auction de déploiement HIP-3** (`hd_hip3_auctions`) — actuellement auction active à 500 HYPE, fin le 02/07. Aucun tracker (à ne pas confondre avec `market/auction` qui est le listing spot/perp).
Valeur : builders, déployeurs de DEX, traders qui cherchent le prochain marché niche. Différenciant : **très fort**, 9 dexs / 194 assets / 3,38 Md$ vol 24h de data que quasi personne n'agrège proprement.

**P1 — TWAP execution tracker (agrégat marché)**
Le service TWAP existant (`market/order/useTwapOrders`, `twap-real-time`) suit les TWAP live d'un asset dans le carnet. L'agrégat marché (`hd_twaps_stats`, `hd_twaps_search`, `hd_twap_detail`) n'est **pas surfacé** : 4087 TWAPs / 24h, 365 M$ notional exécuté, ventilation par statut (finished 1797, terminated 1027, error insufficient margin 920), durée moyenne, 502k fills, 524 users uniques.
Valeur : traders pro / desk (détecter les gros ordres passifs, l'accumulation), analystes flux. Différenciant : **fort**, presque personne ne montre les TWAP en agrégat.

**P1 — Cross-venue predicted funding (arbitrage)**
`hl_public_predicted_fundings` renvoie le funding prédit tous coins × toutes venues (HL/Binance/Bybit, payload de 63k caractères). Aucun service front ne l'exploite (les hits « funding » sont revenue/buyback/builders). Le funding actuel est montré par asset HL uniquement.
Valeur : traders de funding arb, hedge. Différenciant : **fort**, table « funding HL vs CEX » = angle trading direct et sticky pour alertes Telegram premium.

**P2 — Completed trades / PnL réalisé round-trip**
`hd_completed_trades_search` + `hd_completed_trade_fills` = PnL réalisé par position clôturée (entrée/sortie appariées). Non surfacé (aucun `completedTrade/roundTrip/realizedPnl`). L'address explorer montre des fills bruts, pas le PnL réalisé par position.
Valeur : tout trader qui veut lire un wallet (copy-trading, due diligence). Différenciant : **fort**, l'appariement round-trip est rare et coûteux à recalculer soi-même.

**P2 — Traders leaderboard multi-métrique**
`hd_traders_leaderboard` par `pnl / volume / trades / priority_fees` sur fenêtre 1-168h. `market/toptraders` existe mais partiel. Les vues **PnL** (top +9,7 M$ observé) et **priority_fees** (qui paie le plus pour prioriser) ne sont pas exposées.
Valeur : retail (qui gagne), analystes MEV/gas. Différenciant : **moyen** (le PnL leaderboard existe ailleurs), sauf la vue priority_fees = **fort**.

**P2 — Vault analytics avancés**
`explorer/vault` + branche v4 existent, mais `hd_vault_snapshots` (courbe PnL/equity historique), `hd_user_vault_equities` (exposition vault d'un wallet), et le leaderboard trié par followerCount/leaderCommission/isClosed ne sont pas pleinement exploités. Data : HLP 91 557 followers, Systemic Strategies HyperGrowth 4178, commissions leader visibles.
Valeur : allocateurs de capital vers vaults. Différenciant : **moyen** (HyperDash/Hypurr montrent des vaults), sauf la courbe historique + exposition par wallet.

**P3 — Builder→users detail** (déjà bien couvert, marge faible) et **EVM transfers/user ledger** (`hd_evm_transfers`, `hd_evm_user`) pour un vrai explorer de compte HyperEVM = extension du module explorer existant.

## TOP 5 des données les plus différenciantes (que peu/pas de concurrents montrent)

1. **HIP-3 oracle health + trader leaderboard par DEX builder-deployed** — la data existe déjà côté service (juste à brancher), 9 DEX / 194 assets, et personne ne montre la santé oracle qui est le vrai risque. Wedge fort.
2. **TWAP execution tracker agrégé** — 365 M$/24h de notional TWAP ventilé par statut/durée/user. Quasi unique.
3. **Cross-venue predicted funding (HL vs Binance/Bybit)** — table d'arbitrage funding, parfaite pour des alertes Telegram premium.
4. **PnL réalisé round-trip par wallet** (completed trades appariés) — coûteux à recalculer, rarement montré, très utile pour copy-trading/DD.
5. **HIP-3 deployment auction tracker** (prix en HYPE, fenêtre, historique) — angle « qui déploie le prochain perp DEX et à quel prix », narratif exclusif à l'écosystème HL.

## Fichiers clés
- Gap P0 concret : `/home/yaugourt/liquidterminal_front/src/services/indexer/hip3/api.ts` (service complet, 0 hook, 0 rendu ; pas de `hooks/`).
- Pages perpdex qui n'utilisent PAS ce service : `/home/yaugourt/liquidterminal_front/src/app/(app)/market/perpdex/page.tsx` et `.../perpdex/[dex]/page.tsx` (tapent `src/services/market/perpDex/api.ts` = API HL brute).
- Modules déjà riches à ne pas dupliquer : `src/services/indexer/builders`, `src/services/indexer/hip4`, `src/services/indexer/evm`.

---

## Benchmark concurrents

I have enough to compile the benchmark. Here is the full deliverable.

---

# BENCHMARK CONCURRENTS — DATA HYPERLIQUID (pour Liquid Terminal)

## 1. Analyse en profondeur des 3 sites clés

### hl.eco — « House of all Hyperliquid »
- **Positionnement** : agrégateur/annuaire de TOUT l'écosystème HL. Se présente comme « 50+ dashboards » qui centralisent chaque métrique et chaque outil de l'écosystème. C'est le hub de découverte, pas un terminal de trading.
- **Features clés** : dashboards par thème (Stablecoin supply `/stables`, Live TWAPs `/all-twaps`, Community `/community`, revenue protocole, tally de burn HYPE / Assistance Fund, projets écosystème). Beaucoup de vues « une métrique = une page ».
- **Data montrée** : supply stables, TWAPs live, revenus (fees après payout HLP/builder/spot-deployer), déflation HYPE (buyback/burn), liste des projets et markets.
- **Modèle éco** : 100% gratuit, pas d'API commerciale visible, pas de premium. C'est un projet de curation/branding communautaire.
- **UX/design** : minimaliste, orienté « portail de liens » + quelques dashboards natifs. Léger, lisible, très « HL native » (branding maison).
- **Cible** : nouveaux venus et curieux de l'écosystème, gens qui cherchent « où voir X ».
- **MIEUX que LT** : couverture de découverte (le réflexe « point d'entrée »), storytelling narratif (déflation, treasury), autorité de marque communautaire.
- **NE fait PAS** : terminal de trading temps réel, explorer profond, tracking de wallets/positions, API, alertes. C'est un aiguilleur, pas un outil de travail.

### hydromancer.xyz — « The Hyperliquid Builder Platform »
- **Positionnement** : infrastructure data B2B pour builders/market makers. « La plateforme data HL la plus complète », infra peerée aux validateurs. Ce n'est PAS un dashboard grand public.
- **Features clés** : REST batch (1000+ wallets d'un coup), WebSocket streams (fills, orders, builder events), streaming orderbook L2/L4 avec visibilité d'adresses, snapshots historiques résolution 1s, endpoints spécialisés (`builderFillsByTime`, `builderLiquidations`). Contributions OSS : Flowscan (explorer), Reservoir (historique gratuit), Builder Intelligence.
- **Data montrée (marketing)** : 150M$+ volume quotidien alimenté, 80+ apps live, 10M+ appels API/jour, ~380 updates orderbook/s, latence ~47-135ms.
- **Modèle éco** : SaaS pur. Starter 300$/mo, Growth 1 200$/mo, Scale 2 500$/mo, Enterprise custom. SLA uptime, incident response, accès fondateurs. Pas de tier gratuit.
- **UX/design** : landing dark theme pro, sections numérotées 001-007, exemples de code, logos clients, testimonials X. Orienté vente de contrats, pas d'app à consommer.
- **Cible** : devs d'apps HL, MM, HFT, LP — ceux qui construisent AU-DESSUS.
- **MIEUX que LT** : profondeur data brute (L4, trigger orders, batch), latence, positionnement B2B monétisé, crédibilité « on est d'ex-builders ».
- **NE fait PAS** : produit end-user (dashboards à regarder), wiki/éducation, bot alertes retail, gratuit. Ils vendent des tuyaux, pas une expérience.

### hypurrscan.io — Explorer HL L1
- **Positionnement** : l'explorer de référence communautaire pour Hyperliquid L1. « Le block explorer que l'officiel devrait être ». En beta mais adopté (référencé par ASXN comme source).
- **Features clés** : pages d'adresse (transactions, holdings, transferts, TWAPs en cours, auctions live/passées, tout temps réel), suivi Dutch auctions, prix d'enchères, déploiements de tokens, flux de fonds, pages token (supply, market cap, évolution de la distribution), transactions de withdrawal (+ chemin Arbitrum). API `fees`, `spotUSDC` exposées (déjà utilisées par LT).
- **Data montrée** : on-chain L1 brute rendue lisible — whales, TWAPs, auctions, tokens.
- **Modèle éco** : gratuit, API publique gratuite. Pas de premium visible. Financement type grant/communautaire.
- **UX/design** : SPA JS (contenu non indexé, minimaliste), fonctionnel « scanner » façon Etherscan, cat-branding « Hypurr ».
- **Cible** : traders on-chain, whale watchers, chercheurs, autres builders qui consomment son API.
- **MIEUX que LT** : profondeur explorer L1 (auctions/TWAP/token distribution), API reconnue, référence de marché sur « on-chain HL ».
- **NE fait PAS** : trading terminal, funding/OI/leaderboards perps riches, éducation/wiki, bot d'alertes, HIP-3/HIP-4, expérience portefeuille personnel poussée.

---

## 2. Les autres acteurs (grille courte)

| Acteur | Positionnement | Data forte | Modèle éco | Cible |
|---|---|---|---|---|
| **ASXN / Hyperscreener** | Dashboard analytics gratuit + risk dashboard consensus validateurs | Whale positions, liquidations, top traders, funding, OI, revenue HyperCore/EVM, HIP-3, builder codes, staking/validators, auctions, risk metrics | Gratuit, API gratuite (api-hyperliquid.asxn.xyz), refresh souvent journalier | Chercheurs, analystes, retail, validateurs |
| **Hyperdash** | Terminal de trading + analytics UI (lié pvp.trade) | Liquidation heatmaps, position changes live, whale alerts, leaderboards (PNL/winrate/Sharpe/drawdown), cohorts par profitabilité, copy trading, profil perso (PNL calendar) | Dashboard gratuit, monétise via exécution/copy trading (fees), pas d'API | Traders actifs |
| **HyperTracker (CoinMarketManager)** | Intelligence API + dashboard behavioral | 16 cohortes comportementales, liquidation risk scoring, leaderboards, visibilité stop/TP, trade flow, refresh 5min | Freemium API : gratuit 100 req/j, puis 179 / 499 / 1 159 / 2 399 $/mo (WebSocket + webhooks sur tiers hauts) | Builders de bots/dashboards/alertes |
| **Stats officiel (stats.hyperliquid.xyz)** | Stats natives de l'équipe HL | Volume, OI, fees, users, HLP — basique et fiable | Gratuit, officiel | Tout le monde (baseline) |
| **DefiLlama (HL)** | Agrégateur DeFi cross-chain | TVL, fees, revenue, DEX/perp volume, OI, comparaison protocoles | Gratuit + Pro dashboards | Analystes DeFi macro |
| **Nansen** | Labels d'entités cross-chain | 500M+ wallets labellisés, entity-level, whale behavior | Freemium, Pro ~49-69$/mo, API | Chercheurs cross-chain |
| **Arkham** | Intelligence entités + AI labeling | Identification d'entités, traçage de flux, tagging KOL | Dashboard gratuit, API sur candidature | Investigateurs on-chain |
| **CoinGlass** | Data derivatives multi-exchange | Whale alerts 1M$+, heatmaps liquidations, OI, funding (page HL dédiée) | 29 → 699$/mo + enterprise, 80+ endpoints | Traders multi-exchange |
| **Velo / Artemis** | Data futures / métriques on-chain macro | Séries funding/vol futures (Velo), métriques fondamentales (Artemis) | Gratuit + premium | Quants / analystes |
| **Raw RPC (HypeRPC, Chainstack, QuickNode)** | Infra brute | JSON-RPC, accès protocole complet | Usage-based (~5-12$/M req) | Équipes avec ingénieurs |

---

## 3. Matrice de features (qui couvre quoi)

Légende : ✅ fort / 🟡 partiel / ❌ absent. LT = état actuel Liquid Terminal (front V4 + bot Fill alerts).

| Feature / Data | hl.eco | Hydromancer | Hypurrscan | ASXN | Hyperdash | HyperTracker | Stats off. | DefiLlama | **LT** |
|---|---|---|---|---|---|---|---|---|---|
| Découverte / annuaire écosystème | ✅ | ❌ | ❌ | 🟡 | ❌ | ❌ | ❌ | ❌ | 🟡 (ecosystem) |
| Wiki / éducation | ❌ | ❌ | ❌ | ❌ | 🟡 (learn) | ❌ | ❌ | ❌ | ✅ |
| Market data perps/spot temps réel | ❌ | ✅ | 🟡 | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ |
| Explorer L1 (tx/adresses) | ❌ | 🟡 (Flowscan) | ✅ | 🟡 | ❌ | ❌ | 🟡 | ❌ | ✅ |
| Auctions / TWAPs on-chain | ✅ | 🟡 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | 🟡 |
| Liquidations (heatmap/feed) | ❌ | 🟡 | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | 🟡 (page liquidations) |
| Funding / OI | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 |
| Whale / position tracking | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 🟡 |
| Leaderboards / cohortes traders | ❌ | 🟡 | ❌ | ✅ | ✅ | ✅ (16) | 🟡 | ❌ | ❌ |
| Vaults analytics | 🟡 | ✅ | ❌ | ✅ | 🟡 | 🟡 | ✅ | 🟡 | ✅ (branche v4) |
| HIP-3 (dexs/assets) | 🟡 | ✅ | 🟡 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| HIP-4 (prediction markets) | ❌ | 🟡 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| HyperEVM (blocks/tx/transfers) | 🟡 | ✅ | 🟡 | ✅ | ❌ | ❌ | ❌ | 🟡 | 🟡 |
| Builder codes analytics | ❌ | ✅ | ❌ | ✅ | ❌ | 🟡 | ❌ | ❌ | ❌ |
| Portfolio perso / dashboard user | ❌ | ❌ | 🟡 | 🟡 | ✅ | ✅ | ✅ | ❌ | ✅ (Privy) |
| API publique | ❌ | ✅ (payante) | ✅ (gratuite) | ✅ (gratuite) | ❌ | ✅ (freemium) | 🟡 | ✅ | 🟡 |
| Alertes Telegram / bot | ❌ | 🟡 (streams) | ❌ | ❌ | 🟡 (in-app) | ✅ (webhooks) | ❌ | ❌ | ✅ (Fill alerts) |
| Open source (MIT) | 🟡 | 🟡 (repos OSS) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Gratuit end-user | ✅ | ❌ | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ | ✅ |

**Lecture rapide** : le marché est saturé sur market data / whale tracking / liquidations (ASXN, Hyperdash, HyperTracker, CoinGlass se battent là). Il est peu couvert sur : éducation intégrée, open source, HIP-3/HIP-4, et alertes retail sur bot. C'est là que LT a de l'angle.

---

## 4. Les 3 white spaces où Liquid Terminal peut gagner

**White space #1 — Le seul terminal HL vraiment OPEN SOURCE + gratuit + tout-en-un.**
Personne dans le top tier n'est MIT open source end-user. Hydromancer OSS quelques repos d'infra, hl.eco est un portail. Aucun concurrent ne combine terminal complet (market + explorer + vaults + liquidations) + wiki + open source + gratuit. C'est un positionnement de « bien public de l'écosystème » que ni un SaaS B2B (Hydromancer) ni un produit fee-driven (Hyperdash) ne peuvent copier sans se saborder. Levier direct pour grants Hyper Foundation.

**White space #2 — HIP-3 et HIP-4 (dexs déployés, prediction markets) : quasi personne n'y est.**
Seul Hydromancer touche sérieusement HIP-3, et personne ne rend HIP-4 (marchés de questions/outcome tokens) lisible pour le grand public. Avec la matière HypeDexer (hd_hip3_*, hd_hip4_*, builders, TWAPs, oracle stats), LT peut être le PREMIER terminal grand public à visualiser les dexs HIP-3, les markets HIP-4 et les builders. C'est le wedge le plus frais : nouvelle surface data, pas encore de leader établi, forte demande à venir.

**White space #3 — Alertes retail avancées sur bot Telegram (freemium-light).**
Le seul acteur avec alertes programmables est HyperTracker, mais c'est du B2B API cher (webhooks à partir de 499$/mo) pour builders, pas un bot grand public. Hyperdash a des alertes in-app non portables. LT a déjà le bot + Fill alerts livrées : il peut posséder le créneau « alertes puissantes accessibles au trader retail » (whale moves, liquidations, TWAP starts, HIP-3 listings, funding extrêmes) en freemium — core gratuit, quotas/alertes avancées en premium. C'est la brique de monétisation la plus défendable car elle ne ferme jamais la data OSS.

---

## 5. Positionnement le plus défendable

> **« Le terminal open source de l'écosystème Hyperliquid : toute la data HL (perps, spot, explorer, vaults, HIP-3/HIP-4) gratuite et lisible, + un bot d'alertes retail que personne d'autre n'offre. »**

Défendable parce que :
- **Le SaaS (Hydromancer, CoinGlass, HyperTracker) ne peut pas suivre sur le gratuit/OSS** sans casser son business.
- **Les gratuits (ASXN, hl.eco, Hypurrscan) ne monétisent pas et ne veulent pas d'un bot alertes premium** : LT peut rester gratuit sur la data ET avoir un revenu via le bot, sans trahir l'esprit OSS.
- **OSS + grants = moat communautaire** : légitimité « infra publique HL » que les concurrents fermés n'auront jamais.

## Où LT est HONNÊTEMENT en retard (à ne pas se raconter d'histoires)

1. **Leaderboards / cohortes de traders : absent.** ASXN, Hyperdash et HyperTracker (16 cohortes comportementales) ont une avance nette. C'est une attente forte du marché retail et LT n'a rien.
2. **Whale/position tracking encore léger vs Hyperdash/ASXN** (position changes live, whale alerts temps réel). LT a des briques mais pas le produit poli.
3. **Profondeur data brute et latence** : Hydromancer joue à un autre niveau (L4, batch 1000 wallets, ~47ms). LT ne doit PAS chercher à les battre là — c'est perdu d'avance et hors-cible.
4. **Autorité de marque / distribution** : ASXN, Hypurrscan, hl.eco sont déjà les réflexes de l'écosystème et cités comme sources. LT part derrière en notoriété.
5. **API publique pas encore un produit** : ASXN et Hypurrscan offrent des API gratuites déjà consommées par d'autres (effet réseau). LT n'a pas ce statut d'infra-dont-on-dépend.

**Recommandation de focus** : ne pas courir après le market data / whale tracking déjà saturé. Concentrer le wedge sur (a) HIP-3/HIP-4 en premier terminal grand public, (b) alertes bot freemium, (c) la carte OSS/grants — et combler le retard leaderboards en priorité car c'est le plus visible pour le retail.

---

Fichiers locaux pertinents consultés : `/home/yaugourt/liquidterminal_front/README.md` (positionnement et pages actuelles de LT). Outils data disponibles pour le wedge HIP-3/HIP-4 : suite `mcp__hypedexer__hd_hip3_*` et `hd_hip4_*` (déjà branchée).

---

## Monetisation

# Monetisation freemium-light — Liquid Terminal

Recherche faite (bots crypto, terminaux data OSS, grants HL, Telegram Stars, builder codes). Le contexte HL change la donne: **les builder codes sont la piste OSS-native la plus rentable et la plus sous-exploitée** (40M$+ générés à l'échelle de l'écosystème, top 3 builders = 31M$). C'est central à la reco.

---

## Les 4 pistes (chiffrées)

### Piste 1 — Bot Telegram Premium (à activer en premier)
Le bot + Fill alerts existent déjà: c'est le levier le plus rapide.

- **Gratuit:** toute la data web (market, explorer, vaults, liquidations...), l'OSS, l'API publique de base, Fill alerts basiques (1 à 3 alertes, latence standard).
- **Payant (~7-9$/mois, ou ~60$/an):** alertes illimitées + alertes avancées bâties sur la matière HypeDexer: whale wallet tracking (`hd_user_*`, `hd_traders_leaderboard`), liquidations proches de ta position, nouveau dex/asset HIP-3 (`hd_hip3_dexs/assets`), spikes de funding (`hd_funding_predicted`), détection TWAP (`hd_twaps_search`), drawdown de vault, nouveaux listings builders. Quotas plus élevés + latence prioritaire.
- **Paiement:** Telegram Stars (Telegram ne prend 0% côté créateur) **et** option USDC/crypto directe — pousser desktop/web + crypto pour éviter la ponction Apple/Google de ~32% sur l'achat de Stars mobile.
- **Effort:** FAIBLE-MOYEN (gating abonnement + nouveaux types d'alertes sur data déjà branchée).
- **Friction communautaire:** FAIBLE — on paie de la convenience/vitesse/quotas, jamais la data brute.
- **Revenu réaliste:** 300-500 abonnés × 7-8$ = **~2 000-4 000$/mois**. Modeste mais récurrent et immédiat.

### Piste 2 — Builder codes (le vrai plafond, 100% compatible OSS)
Mécanique native HL: un fee sur les trades routés via LT. Max 0,1% perps / 1% spot, opt-in utilisateur, révocable, transparent on-chain. Ce **n'est pas un paywall** — ça ne ferme aucune data ni aucun code.

- Ajouter une action "one-tap trade" depuis une alerte du bot (et/ou bouton trade sur le front) avec le builder code LT attaché.
- **Effort:** MOYEN-ÉLEVÉ (exécution d'ordre + signature/wallet connect; LT est aujourd'hui un terminal data, pas un venue d'exécution).
- **Friction:** FAIBLE si le fee est affiché clairement et opt-in.
- **Revenu réaliste:** ~40% des DAU HL passent déjà par des frontends tiers. Router seulement 50M$/mois de volume à ~0,02% de builder fee moyen = **~10 000$/mois**. Ramp progressif, plafond très supérieur au premium bot.

### Piste 3 — Grants & financement écosystème (runway non-dilutif)
- **Effort:** FAIBLE (candidatures). **Revenu:** ponctuel, lumpy, 10k-100k$.
- Voir section dédiée ci-dessous.

### Piste 4 — API/data B2B via HypeDexer (plus tard)
- **Gratuit:** UI publique + API de base. **Payant:** tiers API haut débit, exports pro, widgets embarquables pour d'autres projets HL (agrégation propre HypeDexer + hl_public + HypurrScan avec value-add: normalisation, historique, uptime).
- **Effort:** ÉLEVÉ (infra API robuste, SLA; attention à la ToS HypeDexer en amont — value-add, pas revente brute).
- **Friction:** FAIBLE (B2B, hors périmètre communauté retail).
- **Revenu:** 200-2 000$/mois par client, quelques clients = **quelques milliers $/mois** à terme.

---

## Grants / financement écosystème Hyperliquid à viser
- **Hyper Foundation — grant 10M$ (annoncé 28 juin 2026, deadline fin juillet 2026):** ciblé USDH sunset → USDC. LT n'y est éligible **que** s'il avait une intégration USDH à migrer. À vérifier vite vu la deadline; sinon signal fort que la Foundation finance activement l'outillage.
- **Hyper Foundation grants généraux / builder programs:** LT = public good data/OSS, profil typique de grant infra/outillage.
- **Retroactive public goods funding (style RetroPGF) + GitHub Sponsors / Gitcoin:** cohérent avec l'ADN MIT/OSS; ouvrir un wallet "buidl" on-chain public.
- **Partenariat/grant HypeDexer:** LT amplifie leur data → co-marketing ou support data gratuit/réduit négociable.
- **Sponsors natifs HL** (dexs HIP-3, protocoles HyperEVM) pour du placement data non-intrusif.

---

## Séquence recommandée
1. **NOW (semaines):** Bot Premium via Telegram Stars + USDC (Piste 1) + page `/funding` publique + wallet dons on-chain + déposer les candidatures grants immédiatement (Piste 3). Zéro nouvelle infra lourde, monétise l'existant.
2. **NEXT (1-3 mois):** Builder codes / one-tap trade depuis les alertes (Piste 2). Plus haut plafond de revenu, 100% pur OSS.
3. **LATER (3-6 mois+):** API/widgets B2B en value-add sur HypeDexer (Piste 4), une fois l'audience et la fiabilité data établies.

---

## Garde-fous OSS (ne pas casser la confiance)
- **Charte "toujours gratuit" écrite et publique:** toute la data de consultation web, le code core MIT, l'API publique de base, les Fill alerts de base. Le premium ne met **jamais** un mur devant la data brute — seulement convenience, vitesse, quotas, alertes avancées.
- **Transparence radicale:** page `/funding` avec revenus (premium, builder fees, grants), dépenses, et wallet on-chain vérifiable. C'est l'argument OSS par excellence.
- **Builder code = opt-in, fee affiché, révocable, jamais caché.** Annoncer publiquement le taux appliqué.
- **Zéro vente de données utilisateurs.** Jamais.
- **Open-core minimal:** si un jour du closed-source, uniquement la logique de gating premium du bot — jamais le core data ni le front.

---

Sources:
- [Hyperliquid Foundation $10M grants — crypto.news](https://crypto.news/hyper-foundation-allocates-10m-in-grants-to-support-usdh-migration/)
- [Builder codes — Hyperliquid Docs](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/builder-codes)
- [Builder revenue / frontend wars — Blockworks](https://blockworks.com/news/hyperliquid-the-frontend-wars)
- [Hyperliquid Builder Codes: Earning Millions — Dwellir](https://www.dwellir.com/blog/hyperliquid-builder-codes)
- [Telegram Stars Guide 2026 — GramBase](https://grambase.ai/blog/telegram-stars-guide-2026)
- [Bot Payments API for Digital Goods — Telegram](https://core.telegram.org/bots/payments-stars)
- [Crypto price alert bot pricing — cryptocurrencyalerting.com](https://cryptocurrencyalerting.com/bot/telegram)
- [How to Monetize an Open Source Project — DEV](https://dev.to/whoffagents/how-to-monetize-an-open-source-project-freemium-open-core-and-license-gating-4il6)

Fichiers pertinents lus: `/home/yaugourt/liquidTelegram_Bot/` (bot Fill alert existant, base du premium).

---

## Critique adversariale

# Stress-test STRATEGY.md — Liquid Terminal

Direct, sans complaisance. Le draft est bien écrit et honnête sur la dette technique, mais il confond "features qu'on peut construire" avec "stratégie", et il enterre deux vérités qui devraient être en gras page 1 : (a) tout le wedge repose sur l'API d'un tiers, (b) le business chiffré à 2-4k$/mois n'est pas un business.

## 1. Les 5 hypothèses les plus fragiles

1. **"Forte demande à venir" pour la lisibilité HIP-3/HIP-4.** C'est l'hypothèse porteuse de tout le plan et elle n'est prouvée nulle part. 3,38 Md$ de vol 24h sur 9 DEX builder-deployed, ça peut être 5 insiders et des bots, pas une audience retail. Personne ne montre l'oracle health des perp DEX HIP-3 parce que peut-être que personne ne la demande. Le draft traite "personne ne le rend lisible" comme une opportunité alors que c'est peut-être juste l'absence de marché. Zéro signal de demande cité (pas un tweet, pas une requête user, pas une waitlist).

2. **La dépendance `api.hypedexer.com` est traitée comme un risque d'infra alors que c'est un risque existentiel + concurrentiel.** HypeDexer a la data ET un MCP à 64 outils ET les compétences. Rien ne les empêche de sortir leur propre front-end grand public et de tuer LT en un week-end. Vous ne construisez pas un moat, vous construisez la vitrine gratuite d'un concurrent potentiel qui contrôle votre robinet. "Sécuriser la relation par un grant/partenariat" est un vœu, pas une garantie.

3. **300-500 abonnés à 7-8$/mois.** Chiffre sorti du chapeau. Le retail crypto ne paie quasi jamais pour de la data/des alertes (tout l'écosystème est gratuit, c'est l'ADN cité dans la stratégie elle-même). Aucune taille de marché (combien de traders HL retail actifs au total ?), aucun taux de conversion free→paid référencé, aucune hypothèse de churn. Les bots d'alertes ont un churn brutal.

4. **Builder codes = ~10k$/mois en routant 50 M$/mois.** C'est une hypothèse déguisée en projection. Router 50 M$/mois suppose (a) une distribution que LT n'a pas, (b) transformer un terminal read-only en surface d'exécution de trades (wallet connect, signature, opt-in), soit un produit entièrement différent avec surface réglementaire. Le "plafond très supérieur" est fantaisiste tant que le canal d'acquisition n'existe pas.

5. **Éligibilité au grant 10M$.** Le draft écrit lui-même "à vérifier vite". Construire une "sequence NOW" autour d'un grant dont on ne sait pas si on est éligible, c'est planifier sur un peut-être. Et "public good OSS = profil typique de grant" est optimiste : les grants sont compétitifs et narratifs, pas automatiques pour tout repo MIT.

## 2. Wedge trop mou / "on fait tout"

Le wedge annoncé comme "la chose UNE" est en réalité **quatre** : (1) HIP-3 lisible, (2) HIP-4 lisible, (3) bot retail, (4) OSS/grants. Plus l'explorer, le dashboard V4, les leaderboards en dette. Ça n'est pas un wedge, c'est un catalogue.

Problèmes concrets :

- **HIP-3 et HIP-4 sont collés alors qu'ils n'ont rien à voir.** HIP-3 = perp DEX builder-deployed (audience traders/desks). HIP-4 = prediction markets (audience totalement différente, marché minuscule aujourd'hui). Les bundler dans un même wedge, c'est déjà se disperser. **Coupez HIP-4 du wedge.**

- **Contradiction directe sur les leaderboards.** Section 4 dit "ne pas courir après le market data / whale tracking saturé", puis désigne les **leaderboards/cohortes de traders comme le retard prioritaire à combler**. Les leaderboards de traders SONT du whale tracking. Vous foncez sur exactement la case saturée (ASXN/Hyperdash/HyperTracker) que vous venez d'interdire, sur le terrain où vous êtes le plus en retard. Incohérent. Soit c'est le wedge, soit c'est interdit — pas les deux.

- **Le "moat OSS" n'est pas un moat.** L'OSS n'empêche pas un concurrent financé et distribué de shipper les mêmes charts HIP-3 plus vite avec plus d'audience. HIP-3 lisible est une **feature**, copiable en jours. La seule chose non copiable ici c'est la carte grant/public-good, mais ça ne retient pas les users, ça finance juste le runway.

Le vrai actif défendable et monétisable n'est pas le terminal (commodité, concurrencé par HypurrScan/ASXN/DefiLlama, aveu du draft lui-même). C'est **le bot** : c'est le seul truc qui possède de la rétention (touchpoint récurrent), un canal de distribution propriétaire, et une surface de paiement. Le draft le sait à moitié mais garde le framing "terminal-first", ce qui dilue tout.

## 3. Roadmap : ce qu'on COUPE

18 items = dispersion. La section "fermer avant d'ouvrir" est trahie par sa propre roadmap.

**Erreur de priorisation majeure :** la stabilité back (pollers/DB qui crashent, confirmé) est reléguée en section 8 Risques, pas dans NOW. Un terminal qui tombe n'a aucune crédibilité d'infra — c'est écrit noir sur blanc — et pourtant on empile des features data par-dessus. **La stabilité pollers + le merge de la dette V4 (72 commits) doivent être les DEUX seuls P0.** Tant que prod n'est pas le code lu et que ça crashe, brancher HIP-3 c'est décorer une maison qui brûle.

À couper ou repousser sans remords :
- **HIP-4 / prediction markets** — audience différente, marché minuscule, hors focus. Sortir du wedge, LATER au mieux.
- **Item 12** (PnL round-trip par wallet) — coûteux, niche copy-trading.
- **Item 15** (vault analytics avancés), **item 16** (explorer HyperEVM) — extensions sans lien avec le wedge, pur scope creep.
- **Item 17** (API/widgets B2B) — vous devenez un revendeur de data HypeDexer, conflit ToS + vous marchez sur Hydromancer que vous dites vouloir éviter.
- **Item 13** (builder codes / one-tap trade) — à geler tant que le premier revenu bot n'est pas prouvé. C'est un produit à part avec surface réglementaire.

NOW réaliste = 4 items, pas 8 : (1) stabilité back, (2) merge V4, (3) brancher HIP-3 + oracle health, (4) socle bot premium. Point. Tout le reste attend un signal de traction.

## 4. Monétisation : irréaliste + risque OSS

- **La frontière "data gratuite / convenience payante" est fictive.** Le premium vend "nouveau DEX HIP-3, spikes de funding, détection TWAP, drawdown de vault". **Ce sont des données, pas de la convenience.** Une alerte funding-spike EST de la data. Vous dites "la data ne se paie jamais" puis vous facturez les signaux data différenciants. Cette contradiction va s'éroder au premier user qui râle, et elle affaiblit la charte "toujours gratuit" avant même de l'écrire.

- **Telegram Stars 0% est faux sur mobile.** Le draft l'admet à moitié (ponction Apple/Google ~30%) mais garde ensuite le pricing "7-9$" et la projection 2-4k$ sans intégrer la coupe. Soit vous poussez desktop/crypto (friction énorme pour le retail), soit vous mangez 30%. Le chiffre net est plus bas qu'affiché.

- **2-4k$/mois n'est pas un business, c'est un tip jar.** À dire explicitement. Ça ne paie pas un dev. Donc la vraie question stratégique n'est pas "comment monétiser le bot" mais "est-ce que ça reste un side-project financé par grants, ou est-ce que ça devient un vrai produit ?" Le draft esquive ce choix. Si c'est grant-funded public good, alors la monétisation freemium est du bruit et vous devriez tout miser sur les grants + la légitimité écosystème. Si c'est un business, 2-4k$ ne suffit pas et il faut un plan d'acquisition, absent.

- **Builder codes tuent la neutralité perçue + ajoutent du risque légal.** Router les trades retail contre un fee, c'est une activité potentiellement régulée (introducing broker), zéro mention. Et ça met LT en position de "je gagne quand tu trades", ce qui abîme la posture "bien public neutre" sur laquelle repose le pitch grant.

Ce qui ne tue PAS l'OSS et que vous faites bien : data web gratuite, core MIT, page /funding transparente. Gardez ça. Le danger c'est le glissement des alertes-data vers le paywall.

## 5. Angles morts totaux

- **Le team/opérateur.** Qui construit ? Solo ? La roadmap suppose un débit CC énorme mais le goulot réel (revue, QA, pricing, négo grant, légal) est humain et hand-wavé. 18 items + stabilité + merge V4 + monétisation en solo = irréaliste. C'est le facteur limitant n°1 et il est absent.

- **Réglementaire.** Builder codes = fees sur trades routés. One-tap-trade retail depuis une alerte. Zéro mot sur le statut réglementaire, la juridiction (asso loi 1901 française ? entité ?), la responsabilité si une alerte fausse fait perdre de l'argent (missed liquidation, faux funding spike). Un bot d'alertes financières a une surface de liability réelle.

- **Réponse concurrentielle chiffrée.** "Aucun ne combine X+Y+Z" est vrai aujourd'hui et faux dans un mois si quelqu'un le veut. Combien de temps pour qu'ASXN/Hyperdash/HypeDexer ajoute une vue HIP-3 ? Réponse honnête : jours. Le plan n'a aucune analyse de "et s'ils copient", alors que c'est le scénario le plus probable.

- **TAM.** Aucune taille de marché. Combien de traders HL retail actifs ? Si le pool est petit (dizaines de milliers), le plafond bot est structurellement minuscule et aucune monétisation freemium ne le sauve. Sans ce chiffre, toutes les projections revenus sont de la fiction.

- **Coûts.** 4 DB Railway, Redis, pollers WS, dépendance API tierce (payante ?). Le coût d'infra n'est jamais posé en face des 2-4k$. Si HypeDexer facture l'accès data, la marge peut être négative.

- **Accuracy / SLA des alertes.** Un bot d'alertes vend de la fiabilité. Aucune réflexion sur latence garantie, faux positifs, gestion des trous quand HypeDexer coupe. C'est précisément ce que le premium prétend vendre.

## 6. Wedge alternatif, plus tranchant

Le draft se trompe de sujet en mettant "terminal" devant. Le terminal est un loss-leader commodité ; le seul actif qui possède rétention + distribution + surface de paiement, c'est le bot. Inversez.

> **Pas un terminal de plus : le bot d'alertes Hyperliquid que le retail garde ouvert 24/7, seul à alerter sur les perp DEX HIP-3 avant que quiconque ne les rende visibles. Le site n'est que la vitrine gratuite qui nourrit le bot.**

Conséquence si vous adoptez ça : le HIP-3 lisible n'est plus le produit, c'est le **contenu exclusif des alertes** (la raison de s'abonner). Le terminal web devient un canal d'acquisition, pas une fin. Et vous arrêtez d'investir dans explorer/vault/EVM/leaderboards qui ne servent ni la rétention ni le revenu. Un seul objet à défendre, un seul truc à vendre.