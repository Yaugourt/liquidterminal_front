# STRATEGY.md — Liquid Terminal

## 1. TL;DR

Liquid Terminal a deux verites a mettre en gras avant tout le reste. Un: tout le wedge repose sur l'API d'un tiers (`api.hypedexer.com`), qui a la data, un MCP de 64 outils et les competences pour sortir son propre front grand public. LT construit aujourd'hui la vitrine gratuite d'un concurrent potentiel qui controle le robinet. Deux: la monetisation chiffrable a court terme (2 a 4k$/mois de bot) n'est pas un business, c'est un tip jar qui ne paie pas un dev.

Consequence strategique: LT n'est pas un business SaaS deguise. C'est un bien public open source (MIT) de l'ecosysteme Hyperliquid, dont le runway vient des grants et des dons, et dont le seul actif possedant de la retention, un canal de distribution proprietaire et une surface de paiement est le bot Telegram. Pas le terminal (commodite, deja concurrence par HypurrScan/ASXN/DefiLlama, aveu du produit lui-meme).

Direction: arreter le framing "terminal-first". Le produit qui compte est le bot d'alertes retail HL. Le contenu exclusif qui justifie de s'abonner et qui n'existe nulle part ailleurs, ce sont les perp DEX HIP-3 (data HypeDexer deja branchee cote back, jamais rendue). Le site web devient le canal d'acquisition gratuit qui nourrit le bot, pas une fin en soi.

Avant d'ajouter quoi que ce soit: le back crashe (pollers qui saturent les pools DB, confirme) et 72 commits V4 ne sont pas en prod. Un terminal qui tombe n'a aucune credibilite. Stabilite + merge d'abord, features ensuite.

## 2. Ou en est Liquid Terminal aujourd'hui

Etat honnete, tire de la lecture des 4 repos.

**Forces reelles**
- Market (spot/perp/HIP-3/HIP-4/builders/tracker) et Explorer (address/block/tx/validator/vaults/liquidations/priority-fees) matures, branches sur data reelle.
- Dashboard V4 avec 8 sections thematiques cablees (Network Pulse, Protocol Revenue en 5 sources, Live Activity, Capital Allocators).
- Bot Telegram solide et livre (grammY, v1.4.1): Fill alerts, Liquidation alerts, Wallet tracking, conversations, filtres avances, changelog versionne. C'est le seul actif avec retention et surface de paiement.
- Archi back 4 couches propre (clients, services, routes, core), circuit breaker, rate limiter, Redis, 4 DB isolees par domaine.
- Design System V4 discipline ("real data only, no fake sparkline"). Rare a ce niveau.
- Couverture HIP-3 via HypeDexer, differenciant que quasi personne n'a. Aujourd'hui.

**Dettes reelles (par ordre de gravite)**
- **Instabilite back.** Pollers/WS qui saturent les pools DB, crashs confirmes, non reproductibles en local. Un terminal qui tombe perd sa credibilite d'infra. C'est un P0, pas un risque de note de bas de page.
- **Dependance dure a `api.hypedexer.com`** sous `/indexer` (REST + WS). Single point of failure externe non redonde ET concurrent potentiel. Toute la valeur wedge s'eteint si la cle coupe.
- **72 commits V4 non merges** sur `feat/project-detail-protocol`. Prod n'est pas le code lu. Rien de neuf ne compte tant que ce retard existe.
- **Fragmentation.** `labs/` mockups a fausses donnees, 8 modeles Telegram parkes, "coming soon" eparpilles. Beaucoup de chantiers ouverts, peu fermes.
- **Zero monetisation implementee.** Aucun quota, aucun tier, aucun paiement.

**Proposition de valeur reelle (non marketing)**
Un bot d'alertes fills/liquidations/wallets reellement livre, adosse a un explorer/dashboard HL dense, gratuit et OSS. La valeur unique n'est pas le site (commodite). C'est le bot (retention + distribution + paiement) et la seule matiere qu'il peut alerter que personne d'autre ne rend: les perp DEX HIP-3.

## 3. Le probleme repense

**Le vrai objet.** Pas "un terminal de plus". Le retail crypto a deja dix dashboards gratuits. Ce qu'il n'a pas: un truc qui reste ouvert 24/7 et le previent quand quelque chose bouge sur Hyperliquid, y compris sur des surfaces que personne d'autre ne surveille (les perp DEX HIP-3).

**Pour qui.** Un seul profil primaire, pas dix.
- Le trader HL retail deja initie qui veut etre alerte sur Telegram sans payer 499$/mois un outil B2B, et qui veut etre prevenu quand un DEX HIP-3 bouge sans devoir surveiller un dashboard 24/7.

Le nouveau venu, le builder dev, l'analyste institutionnel ne sont pas la cible primaire. Le wiki reste, on n'investit pas l'onboarding pedagogique.

**Signal de demande: a prouver, pas a supposer.** Le draft precedent posait "forte demande a venir" pour la lisibilite HIP-3 sans une preuve. C'est l'hypothese porteuse de tout le plan et elle n'est etayee par rien: pas un tweet, pas une requete user, pas une waitlist. 3,38 Md$ de vol 24h sur 9 DEX peut etre 5 insiders et des bots, pas une audience. Donc la premiere chose a faire n'est pas de construire six vues HIP-3, c'est de shipper UNE alerte HIP-3 et de mesurer si quelqu'un s'abonne. Toute la roadmap data est conditionnee a ce signal.

**Job-to-be-done.** "Previens-moi sur Telegram quand quelque chose bouge sur HL, y compris sur les DEX HIP-3, sans que j'aie a fixer un dashboard." Pas "donne-moi encore un dashboard".

**Correction factuelle (intel terrain).** Flowscan et hl.eco RENDENT deja la data HIP-3 en dashboard (Flowscan a meme HIP-3 + HIP-4 + Builder Intelligence). Donc "montrer HIP-3" n'est PAS un espace vide. Ce qu'aucun concurrent ne fait, c'est POUSSER cette data en alerte au retail sur Telegram. Le job est la livraison, pas l'affichage. Le wedge ci-dessous est corrige en consequence.

## 4. Positionnement & wedge

**La chose UNE (une seule, pas quatre):**
> Le bot d'alertes Hyperliquid que le retail garde ouvert 24/7. Les autres terminaux affichent la data (HIP-3 compris) dans des dashboards; aucun ne la pousse en alerte au retail sur Telegram. LT possede cette couche de livraison. Le site est la vitrine gratuite OSS qui nourrit le bot.

Ce recentrage a des consequences dures et assumees:
- L'exclusivite n'est PAS la data HIP-3 (Flowscan et hl.eco l'affichent deja) mais l'**alerte HIP-3 poussee en temps reel sur Telegram**, que personne ne fait. C'est ca la raison de s'abonner.
- Le terminal web devient un canal d'acquisition, pas une fin.
- On arrete d'investir explorer/vault/EVM/leaderboards qui ne servent ni la retention ni le revenu.

**HIP-4 sort du wedge.** HIP-3 (perp DEX, audience traders) et HIP-4 (prediction markets, audience differente, marche minuscule aujourd'hui) n'ont rien a voir. Les bundler, c'est deja se disperser. HIP-4 passe en LATER, opportuniste.

**Leaderboards: on tranche.** Le draft precedent se contredisait (interdire le whale tracking sature, puis en faire le retard prioritaire). On tranche: les leaderboards de traders SONT du whale tracking sature (ASXN/Hyperdash/HyperTracker). Ce n'est pas le wedge. On ne court pas dessus. Si on expose un leaderboard un jour, c'est **restreint aux DEX HIP-3** (la ou personne n'en a), jamais le leaderboard HL global.

Pourquoi c'est defendable face aux references (intel terrain a jour, voir COMPETITOR_INTEL.md):
- **hl.eco** (opere en solo par @guru__hl): hub analytique + annuaire de ~235 projets + moteur de liens, monetise par referral (code GURU, "Trade Save 4%") et dons. A un onglet HIP-3 (331 Md$ vol all-time). Mais zero alerte, zero bot. Terrain: decouverte/hub, pas livraison.
- **hydromancer.xyz / flowscan.xyz**: Flowscan est le dashboard gratuit de lead-gen de Hydromancer, data infra B2B (300 a 2500$/mo, SLA 99,9%, clients Kinetiq/Native Markets/Hyperdash/tread.fi). Flowscan affiche DEJA HIP-3, HIP-4, Builder Intelligence, Revenue, Validators. C'est le concurrent le plus complet cote data. Mais son modele vise les builders/market makers et il n'a pas de bot d'alertes retail. On ne le combat PAS sur la data brute ni la latence/L4 (perdu d'avance); on le contourne par la distribution retail + le push Telegram.
- **hypurrscan.io**: explorer L1 + HyperEVM de reference, avec HypurrTrace (tracing/simulation forensics) et une API premium a tiers JWT. Power-user/dev. Filtre HIP-3 present mais pas d'analytics DEX poussee, et pas de bot d'alertes.

Le constat qui compte: les trois AFFICHENT de la data, aucun ne POUSSE d'alerte retail sur Telegram. C'est le seul terrain vide.

**Honnetete sur le moat.** "HIP-3 lisible" est une feature deja livree par Flowscan et hl.eco: ce n'est meme plus une avance, c'est un rattrapage. Ce n'est pas un moat. Les seuls actifs reellement defendables ici: (1) la retention du bot (touchpoint recurrent, cout de switch reel une fois les alertes configurees), (2) la carte public-good/OSS qui finance le runway et que ni un SaaS B2B ni un produit fee-driven ne peut copier sans se saborder. Flowscan est la preuve VIVANTE du risque de dependance: c'est exactement le dashboard gratuit d'une boite data B2B (Hydromancer). LT risque d'etre ce dashboard pour HypeDexer. La difference a creuser et a tenir: Flowscan vise les builders/experts, LT vise le retail + Telegram. Ce segment, et la distribution qui va avec, est le vrai terrain a defendre avant que quelqu'un copie le push.

## 5. Roadmap NOW / NEXT / LATER

Principe: fermer avant d'ouvrir. Tout ce qui suit NOW attend un signal de traction (des abonnes qui paient pour l'alerte HIP-3). Effort en deux monnaies: humain (decision, negociation, revue, QA) et CC+gstack (implementation assistee IA).

### NOW (le strict minimum, 4 items, rien d'autre)

1. **Stabiliser le back (P0).** Corriger la saturation des pools DB par les pollers/WS avant d'ajouter la moindre charge. Un terminal qui crashe tue le pitch "infra fiable" du premium. Effort: humain moyen, CC moyen.
2. **Merger la dette V4 (P0).** Rapprocher `feat/project-detail-protocol` (72 commits) de `main`. Prod doit etre le code lu avant d'empiler. Effort: humain moyen-eleve (revue/QA), CC moyen.
3. **UNE alerte HIP-3 + oracle health, dans le bot d'abord.** Nouveau DEX/asset HIP-3 et deviation/staleness oracle (`hd_hip3_oracle_stats`, service `indexer/hip3/api.ts` deja ecrit). Le but n'est pas six vues web, c'est de tester si le retail s'abonne pour ce contenu exclusif. La vue web `[dex]` (aujourd'hui juste l'adresse `oracleUpdater`) suit comme vitrine d'acquisition. Effort: CC eleve, humain faible. Meilleur ratio du plan.
4. **Socle Bot Premium v1 + charte.** Gating d'abonnement, paiement, charte "toujours gratuit" publique. Voir section 6. Effort: CC moyen, humain moyen (pricing, charte).

Ce qui SORT de NOW par rapport au draft precedent: page /funding, candidatures grants immediates, leaderboard multi-metrique, nettoyage labs. Le nettoyage labs est un sous-produit du merge V4. Les grants ne dictent pas la sequence (voir section 6, hypothese d'eligibilite non verifiee).

### NEXT (1 a 3 mois, SI et seulement si NOW a produit des abonnes payants)

5. **Elargir les alertes HIP-3** sur la data deja branchee: spikes funding (`hl_public_predicted_fundings`), detection TWAP (`hd_twaps_stats`), drawdown de vault, nouveaux listings builders. Ce sont les alertes premium. Effort: CC moyen, humain faible.
6. **Vues web HIP-3 completes** (leaderboard traders par DEX restreint HIP-3, top movers, snapshots, TWAP tracker agrege) comme vitrine d'acquisition du bot. Effort: CC moyen, humain faible.
7. **Cross-venue predicted funding.** Table funding HL vs Binance/Bybit. Angle arbitrage, parfait comme alerte premium. Effort: CC moyen, humain faible.
8. **Page /funding publique + wallet dons on-chain.** Transparence OSS, argument grant. Effort: CC faible, humain faible.
9. **Verifier et deposer les grants** une fois qu'il y a une traction a montrer (des abonnes, une audience). Un grant se pitche mieux avec des chiffres. Effort: humain faible-moyen.

### LATER (3 a 6 mois+, opportuniste, jamais avant que le wedge soit prouve)

10. **Redondance HypeDexer.** Fallback vers `hl_public` + HypurrScan sur les endpoints critiques. Reduit le single point of failure. A monter des que le bot depend vraiment de cette data en prod. Effort: CC eleve, humain moyen.
11. **HIP-4 prediction markets**, si un signal de demande apparait. Hors focus aujourd'hui.
12. **HIP-3 auction tracker, PnL round-trip, vault analytics, explorer HyperEVM.** Scope creep tant que la retention bot n'est pas prouvee. Chacun attend une demande explicite.
13. **Builder codes.** GELE tant que le premier revenu bot n'est pas prouve ET que le statut reglementaire n'est pas clarifie (voir sections 6 et 8). C'est un produit a part (wallet connect, signature, execution) avec surface reglementaire, pas une feature.
14. **API/widgets B2B.** Risque ToS HypeDexer (revente vs value-add) et marche sur Hydromancer. Seulement si audience et fiabilite etablies.

## 6. Monetisation freemium-legere (et sans se raconter d'histoires)

**Poser le choix que le draft precedent esquivait.** 2 a 4k$/mois de bot ne paie pas un dev. Donc soit LT est un bien public finance par grants + dons, et la monetisation freemium est un complement de dignite, pas un business plan. Soit c'est un vrai business, et il faut un plan d'acquisition et un TAM qui n'existent pas encore. Position retenue: **bien public grant-funded en priorite, revenu bot en complement recurrent**. On ne se ment pas sur l'echelle.

**La frontiere "data gratuite / convenience payante" est en partie fictive, on l'assume.** Une alerte funding-spike EST de la data. Pretendre "la data ne se paie jamais" puis facturer les signaux differenciants est une contradiction qui s'erode au premier user qui rale. La formulation honnete de la charte:
- **Ce qui est gratuit pour toujours: toute la data en libre acces sur le web** (market, explorer, vaults, liquidations, HIP-3/HIP-4), le core MIT, l'API publique de base. N'importe qui peut aller lire la donnee.
- **Ce que le premium vend: le push, le timing, le volume et l'agregation.** Etre prevenu tout de suite et automatiquement plutot que d'aller regarder, sur autant d'alertes qu'on veut, avec une latence prioritaire. La donnee reste consultable gratuitement sur le site. Le premium paie le fait de ne pas avoir a la surveiller soi-meme.

**Premium Telegram (~7-9$/mois ou ~60$/an), chiffres a considerer comme des hypotheses non validees:**
- Alertes illimitees, latence prioritaire, quotas hauts, alertes avancees HIP-3/funding/TWAP/vault/wallet.
- **Paiement: Telegram Stars n'est PAS 0% sur mobile.** Apple/Google prelevent ~30% sur les Stars achetes en app. Le net affiche doit integrer cette coupe. On pousse desktop/web + USDC crypto pour l'eviter, en assumant que c'est une friction reelle pour le retail. Le chiffre net est plus bas que le brut.
- **Projection: hypothese, pas prevision.** On ne connait ni le nombre de traders HL retail actifs (TAM), ni le taux de conversion free vers paid, ni le churn (brutal sur les bots d'alertes). Cible de travail a valider: quelques centaines d'abonnes. Tant que NOW n'a pas produit les 20 premiers payants, tout chiffre au-dela est de la fiction.

**Referral affiliate (le lane le plus leger, deja prouve dans l'ecosysteme).** hl.eco monetise avec un simple code de parrainage Hyperliquid ("Trade Save 4%"). C'est un lien d'affiliation, PAS du builder code: aucun routing d'ordre, aucune signature wallet, aucune surface reglementaire d'introducing broker. Ajouter un code referral LT sur le site et dans le bot est quasi zero effort et non-dilutif. Il partage la meme tension de neutralite que les builder codes ("je gagne quand tu trades"), donc il doit etre affiche honnetement, mais sans la surface technique ni juridique du routing. A activer des NEXT, bien avant les builder codes (qui restent geles). C'est le premier euro le plus facile a encaisser apres le bot premium.

**Grants (le vrai runway non-dilutif), mais sans planifier sur un peut-etre:**
- Grant Hyper Foundation 10M$ (annonce 28 juin 2026, deadline fin juillet) cible USDH sunset vers USDC. **Eligibilite NON verifiee.** LT a des pages `usdh` + `@usdh-kit/sdk`, a verifier vite, mais on ne construit AUCUNE sequence autour d'un grant dont l'eligibilite est incertaine.
- Grants generaux Hyper Foundation, retroactive public goods funding, GitHub Sponsors/Gitcoin: coherent avec l'ADN MIT. Les grants sont competitifs et narratifs, pas automatiques pour tout repo MIT. On pitche avec de la traction, pas avec un README.
- Partenariat/grant HypeDexer: reduit le risque de dependance ET finance. A negocier tot, mais c'est un voeu tant que rien n'est signe, pas une garantie.

**Builder codes: gele, pas planifie.** Router des trades retail contre un fee (max 0,1% perps / 1% spot) transforme un terminal read-only en surface d'execution, avec une surface reglementaire potentielle (activite proche d'un introducing broker) et une position "je gagne quand tu trades" qui abime la neutralite sur laquelle repose le pitch grant. La projection ~10k$/mois en routant 50 M$/mois suppose une distribution que LT n'a pas. Reservoir de revenu reel a terme, mais conditionne a: bot premium prouve, canal d'acquisition existant, avis juridique sur le statut. Pas avant.

**Couts, jamais poses en face du revenu.** 4 DB Railway, Redis, pollers WS, et surtout la dependance API HypeDexer (payante?). Si HypeDexer facture l'acces, la marge sur 2-4k$ peut etre negative. A chiffrer avant toute projection.

**Sequence:** NOW = socle bot premium + charte honnete. NEXT = alertes avancees + referral affiliate + grants avec traction. LATER = builder codes une fois le juridique et le revenu clarifies.

## 7. Distribution & visibilite

LT part derriere en notoriete (ASXN, HypurrScan, hl.eco sont les reflexes cites). Le bot est le canal de retention; le site est l'acquisition. Leviers:

1. **Le bot comme canal de retention.** Chaque alerte livree est un point de contact recurrent avec lien vers le site. C'est le seul actif qui retient. Tout le reste sert a l'alimenter.
2. **Se faire referencer sur hl.eco.** Une entree "bot d'alertes + terminal HIP-3 OSS" y amene du trafic qualifie.
3. **Devenir la source citee sur HIP-3.** Publier des faits data exclusifs (nouveau DEX HIP-3, oracle qui derape, TWAP anormal) en threads X. Chaque fait exclusif = un post = une raison de s'abonner au bot pour l'avoir en temps reel.
4. **La carte OSS/grants comme relations publiques.** Page /funding transparente (revenus, depenses, wallet verifiable), argument de confiance que les concurrents fermes n'ont pas.
5. **Co-marketing HypeDexer.** Ils fournissent la data, LT la rend visible au retail. Interet mutuel, et amorce de la relation a securiser.

## 8. Risques & garde-fous

**Risques, par gravite**
- **Dependance HypeDexer = existentiel ET concurrentiel, pas un simple risque d'infra.** Ils ont la data, un MCP de 64 outils, les competences. Rien ne les empeche de sortir leur propre front grand public et de tuer LT en un week-end. LT construit potentiellement la vitrine gratuite de son fournisseur. Mitigation: securiser la relation par un partenariat/grant ecrit (pas un voeu), monter la redondance (LATER item 10) des que la data devient critique en prod, et batir le moat la ou HypeDexer ne va pas (retention bot, distribution retail, marque OSS), pas sur la data brute.
- **Instabilite back (pollers/DB).** Confirme. Remonte de la section Risques au P0 de la roadmap. Un terminal qui tombe n'a aucune credibilite d'infra a vendre en premium.
- **Concurrence copie le HIP-3 en jours.** "Aucun ne combine X+Y+Z" est vrai aujourd'hui, faux dans un mois si quelqu'un le veut. Scenario le plus probable. Mitigation: transformer l'avance en retention bot avant la copie, ne pas dependre d'une feature comme moat.
- **TAM inconnu.** Si le pool de traders HL retail actifs est petit (dizaines de milliers), le plafond bot est structurellement minuscule et aucune monetisation ne le sauve. A chiffrer avant toute projection serieuse.
- **Operateur/team = goulot reel.** La roadmap suppose un debit CC eleve, mais le vrai goulot (revue, QA, pricing, negociation grant, juridique) est humain. En solo, 4 items NOW bien fermes valent mieux que 18 items ouverts. C'est le facteur limitant n1.
- **Reglementaire + liability.** Bot d'alertes financieres = surface de responsabilite (fausse alerte, missed liquidation, faux funding spike qui fait perdre de l'argent). Builder codes = fees sur trades routes, potentiellement regule. Juridiction a clarifier (asso loi 1901? entite dediee?). Un disclaimer "aucune garantie, pas un conseil financier" est le minimum, l'avis juridique le vrai prealable aux builder codes.
- **SLA/accuracy des alertes.** Le premium vend de la fiabilite. Aucune reflexion aujourd'hui sur latence garantie, faux positifs, gestion des trous quand HypeDexer coupe. C'est exactement ce que le premium pretend vendre: a construire avant de facturer.
- **Monetisation qui trahit l'OSS.** Le moindre paywall sur la data brise le moat communautaire. Mitigation: charte "toujours gratuit" ecrite, et honnetete sur ce que vend le premium (le push, pas la data).

**Garde-fous OSS**
- Charte "toujours gratuit" publique: data web, core MIT, API de base restent gratuits. Le premium vend le push/timing/volume, jamais un mur devant la donnee consultable.
- Transparence radicale: page /funding avec revenus, depenses, wallet on-chain verifiable.
- Builder code (si un jour): opt-in, fee affiche, revocable, taux annonce, avis juridique prealable. Jamais cache.
- Zero vente de donnees utilisateurs. Jamais.
- Open-core minimal: si closed-source un jour, uniquement la logique de gating premium du bot, jamais le core data ni le front.

## 9. Les 3 prochains pas immediats (cette semaine)

1. **Stabiliser le back et merger les 72 commits V4.** Rien de neuf ne compte tant que prod crashe et n'est pas le code lu. C'est le prealable non negociable a toute feature. Decorer une maison qui brule est inutile.
2. **Shipper UNE alerte HIP-3 (nouveau DEX/asset + oracle health) dans le bot, et mesurer.** Le service `indexer/hip3/api.ts` est deja ecrit. Le but n'est pas six vues web, c'est de tester si le retail s'abonne pour ce contenu exclusif. Ce signal conditionne toute la suite de la roadmap.
3. **Poser le socle Bot Premium (gating + Telegram Stars avec la coupe 30% assumee + option USDC) et rediger la charte "toujours gratuit" honnete.** Premier revenu recurrent sur l'existant, et clarification du modele: bien public grant-funded, revenu bot en complement, pas un business SaaS deguise.

En parallele, deux verifications a faible effort et haute valeur: chiffrer le cout d'infra (dont l'acces HypeDexer) en face du revenu attendu, et verifier l'eligibilite au grant 10M$ sans construire de plan dessus.