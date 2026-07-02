# COMPETITOR_INTEL — Terminaux data Hyperliquid

Intel terrain collectee manuellement (Claude Chrome), plus fiable que le WebFetch des SPA. Sert de source a STRATEGY.md sections 4, 6, 7, 8. A rafraichir quand les concurrents evoluent.

Constat transversal: **les trois affichent de la data en dashboard, aucun ne pousse d'alerte retail sur Telegram.** C'est le terrain vide sur lequel LT se positionne.

---

## hl.eco — "House of all Hyperliquid"

**Nature.** Terminal analytique + hub communautaire mono-ecosysteme Hyperliquid. Combine Bloomberg Terminal + DeFiLlama + Nansen + awesome-list sur un seul actif. Independant, non affilie a la Hyper Foundation, opere en solo par **@guru__hl** (X).

**Sections.** 4 entrees nav:
- **Home**: dashboard temps reel, ~20 onglets thematiques.
- **Explorer**: analyse de n'importe quel wallet HyperCore (valeur compte, PnL, win rate, positions, trades, vaults). Version pro = **MLM Mode / "Hyperliquid Investigator"** (forensique: murs de liquidation, exposition, levier effectif).
- **Projects**: annuaire permissionless ~235 projets classes (DeFi 75, Infra 29, Data Analytics 24, Validators 22, Mobile 20...). Self-listing apres verif X + controle IA.
- **Links**: "moteur de recherche Hyperliquid", centaines de liens categorises (Bridge, DEX, DeFi, Trade, Wallets, Explorers, Analytics, Infra).

**Onglets dashboard (l'angle business):**
- **Today**: KPI live (prix HYPE, frais ~1,59 M$/j, revenu all-time 1,17 Md$, tokens burnes, ETF spot, traders actifs, liquidations, holders, profondeur carnet HL vs Binance).
- **Wall Street** (`/hypestrat`): societes cotees accumulant du HYPE facon MicroStrategy (PURR sur NASDAQ, 28,7 M HYPE, ~1,88 Md$ mcap, mNAV, pipeline ETF). Angle le plus institutionnel.
- **HL vs Competitors** (`/market-share`): part de marche HL vs CEX/DEX/chaines/Robinhood.
- **HIP-3**: marches perp permissionless (331,75 Md$ vol all-time, 194 marches, 9 deployers).
- **Builder Codes** (`/builders`): economie des frontends monetisant le flux (87 M$ revenus, classement Phantom/MetaMask/Rabby).
- **Auctions**: encheres de deploiement marches/tokens.
- **Yield**: screener rendement (25 protocoles, 98 pools, 1,4 Md$ TVL).
- **Research**: bibliotheque de papiers du Hyperliquid Research Collective.

**Modele eco.** Gratuit/communautaire. Monetise surtout par **affiliation trading** (bouton persistant "Trade Save 4%", code "GURU"), + **dons** (Donate), listing projets gratuit. Modele createur/influenceur qui monetise attention + referral.

**Design.** Terminal financier crypto dark mode. Fond vert sapin quasi-noir `#061515` + halo mint. Palette monochrome-teal: mint `#50d2c1` (positif/actif), corail `#ff6565` (negatif), ambre `#f5b66b` (secondaire), profondeur par empilement de blancs translucides. Typo soignee 4 familles: **JetBrains Mono** (chiffres/data), **Instrument Sans** (UI), **Fraunces + Teodor** (branding/titres, touche editoriale). Labels section: majuscules ~11px, letter-spacing large, blanc 64%. Cartes radius 8px, bordures 8% blanc, nav en pill flottante, onglets actifs a contraste inverse. Next.js + Tailwind, tokens CSS custom.

**Pour LT.** hl.eco est un hub de decouverte, pas un outil d'alerte. Cible de distribution: se faire lister dans Projects + Links. Le referral "Trade Save 4%" prouve le lane affiliation dans l'ecosysteme.

---

## Flowscan (flowscan.xyz) — le public good de Hydromancer

**Nature.** Explorateur + analytics on-chain Hyperliquid temps reel (latence ~67 ms). Public expert: traders, investisseurs, builders, market makers, validateurs, equipes projets.

**Le point cle (modele business a deux niveaux).** **Flowscan est le produit GRATUIT ("public good") edite par une societe commerciale, Hydromancer** ("The Hyperliquid Builder Platform"). Flowscan = vitrine / demo de puissance / outil d'acquisition. Modele open-core / "free tool as marketing".

**Hydromancer (le B2B derriere).** Vend de l'infra data: API REST + WebSocket, streaming orderbook **L4** (le plus rapide du marche revendique, ~380 updates/sec), batch multi-wallets pour builders (`builderFills`, `builderLiquidations`), Reservoir (historique gratuit sur S3).
- **Pricing SaaS usage-based:** Starter 300$/mo (500k tokens, 10 streams), Growth 1 200$/mo (3M tokens, 30 streams, "populaire"), Scale 2 500$/mo (15M tokens, 100 streams), Enterprise sur devis. Overage degressif (60$ -> 25$ -> 10$ / 100k tokens). SLA 99,9% + acces fondateurs sur tous les plans.
- **Clients references:** fomo (social trading), SEDA (oracle HIP-3), Markets by Kinetiq, HyENA, Native Markets (USDH), **Hyperdash** (terminal trading), tread.fi (market making), Outcome Markets (#1 builder prediction markets). Plusieurs reapparaissent dans les dashboards Flowscan.

**Sections Flowscan (toutes temps reel):**
- **Home**: activite reseau live, revenu 24h (~1,6 M$/j), offre stablecoins.
- **Staking (Validators)**: ~438 M HYPE stakes, 33 validateurs, ~49 200 delegateurs, APR ~1,78%.
- **Builders (Builder Arena)**: classement apps routant du volume (revenus/volume/new users), par categorie. Phantom + Metamask dominent.
- **Builder Intelligence**: analytics approfondies par builder.
- **HIP-3 (DEX Stats)**: 362 Md$ vol all-time, TradeXYZ dominant ~91%, ~9,3 M$ revenus deployeurs.
- **HIP-4 (Prediction Markets)**: sport, seuils prix crypto, custom (~9 M$ vol 24h).
- **Weekend Trading**: actions tokenisees (NVDA, AAPL) tradables le weekend.
- **Stables**: 9,57 Md$ valeur totale, USDC ~99% dominance, ~991k detenteurs.
- **Revenue**: 162 M$ sur 102 jours, annualise ~583 M$ (perps natifs ~92%, perps HIP-3, gas).

**Design.** Dark theme terminal financier sobre/dense. Fond bleu-nuit `#0F1A24`, surfaces `#152430`/`#213040`, texte `#F0F4F7`, gris-bleu ardoise signature `#6B8A9E` (labels). Cartes OKLAB translucides (glassy, Tailwind v4). Accents rares/semantiques: vert positif, bleu `~#3B7BF5` liens/barres. Typo unique **Space Grotesk** (UI + chiffres); grands KPI en weight 300 a 30px+, labels petits/gris/majuscules. Cartes radius 4px, bordure fine translucide, flat (pas d'ombre). Signatures: heatmap "Live Block Activity" animee, watermark "Flowscan" en filigrane.

**Pour LT.** Concurrent data le plus complet (HIP-3 + HIP-4 + Builder Intelligence deja livres). **Miroir exact du risque LT/HypeDexer** (dashboard gratuit d'une boite data B2B). Ne PAS le combattre sur data brute / latence L4. Le contourner: retail + Telegram + push. Cible differente (lui = builders/experts, LT = retail).

---

## HypurrScan (hypurrscan.io) — l'explorer power-user

**Nature.** Explorateur blockchain communautaire Hyperliquid, alternative enrichie a l'explorer officiel. Couvre a la fois **Hypercore** (perps + spot) ET **HyperEVM** (chain ID 999). Explorer grand public gratuit + analytics/API premium. Cible: traders actifs + devs.

**Positionnement.** Couche data "power-user" de reference, a la croisee: explorers (vs officiel, Flowscan), analytics (vs HyperDash, Nansen), simulation/debug EVM (vs Tenderly/Phalcon mais natif HL). Differenciation: Hypercore + HyperEVM, profondeur historique, forensics, forte identite communautaire (culture "purr", NFT Hypurrs, statuts validateurs PURRING/CROUCHING).

**Stack (3 briques, sous-domaines distincts):** frontend `hypurrscan.io`, API data Hypercore `api.hypurrscan.io`, API traçage EVM **HypurrTrace** `trace.hypurrscan.io`. Les 2 APIs documentees en Swagger/OpenAPI = l'acces data est vendu comme produit.

**Produits.** Dashboard (frais 24h, stablecoins, TWAP buy pressure, auctions, trending, transfers live), Feed personnalisable (widgets liquidations/trades), EVM Explorer (tx/contrats/tokens + trace/simulation/decodage), Stats (frais, prix auctions, rendements HLP), Vaults (PnL/APR/TVL), Bundles (regroupement d'adresses pour tracker whales), Staking/Validators, Lending (BLP: Supply/Borrow APY, LTV), API + HypurrTrace, Tools (decodage, simulation, wrap/unwrap), Hypurrs NFT / Bozo PFP, Account (wallet, tier/JWT).

**Modele eco.** API data premium (tiers via JWT, rate limits ponderes 1000/min base, poids endpoint 1-50), HypurrTrace (simulation/tracing/forensics avance), validateur staking ("Hypurrscanning", ~23M HYPE, 1% commission), referral Hyperliquid, NFT/branding, partenariats (Sherlock-clan grant, Nansen, HyperDash).

**APIs en detail.**
- **api.hypurrscan.io**: familles Tokens (holders, holders historiques a un timestamp = atout rare, TWAP), Addresses (rank, tags, watchlist), Global (aliases, auctions, deploys), Experimental (bridges, delegations, transfers, fees, unstaking), Private (interne).
- **HypurrTrace**: 40+ endpoints dev/MEV/securite. Tracing (single + batch parallele), Simulation (sequentielle avec propagation d'etat, "intervene" pour rejouer une tx, multi parallele), Analytics (balance-changes, fund-flow en Sankey, gas-profile flame-chart), Address (portfolio, value-over-time), Block/Token/Decode. Une signature wallet debloque les deux APIs.

**Snapshot data observe.** Frais 24h ~1,78 M$, stablecoins spot ~2,56 Md$ (USDC dominant), HyperEVM ~5,7-7,4 TPS / ~26-28% utilisation / ~9 592 adresses actives 24h, HYPE ~64,66$. Staking ~438M HYPE / 33 validateurs (Hyper Foundation dominante). Vault HLP: TVL ~265,8 M$, PnL all-time +136,9 M$ (51,87% 2023, 41,53% 2024, 15,73% 2025). Lending BLP: USDC ~142M supply, 39,5% utilisation, Borrow APY 5%.

**Design.** Dark "deep teal", fond `rgb(4,36,31)`, cartes `rgb(19,27,26)`/`rgb(35,44,43)`, nav `rgb(76,115,110)`. Accent turquoise `#45D3C3`. Code semantique trading strict (vert BUY/hausse, rouge SELL/baisse). Typo: **Roboto** (corps/tables 16px) + **Inter** (titres/UI 400/500/600), nav/boutons majuscules. Layout colonnes asymetriques, cartes arrondies sans bordure, tables denses tri/filtres, pagination, pill-buttons ALL/SPOT/PERPS/HIP-3, adresses tronquees cliquables, skeleton loaders + spinners turquoise, nav fixe avec recherche ⌘K, mascotte chat en filigrane. Responsive mobile non valide.

**Pour LT.** Reference explorer L1 + EVM + API premium JWT. Confirme que le lane "vendre la data en API" est deja occupe (avec Hydromancer). Filtre HIP-3 present mais pas d'analytics DEX poussee, pas de bot d'alertes.
