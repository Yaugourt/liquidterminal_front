# DATA_POSITIONING — Liquid Terminal

Comment se positionner sur la DATA pour devenir "house of all Hyperliquid", avoir la couverture des concurrents (hl.eco, Flowscan, HypurrScan) ET s'en differencier. Complete STRATEGY.md et COMPETITOR_INTEL.md.

## 1. Le piege a eviter

"House of all Hyperliquid" ne peut PAS etre une revendication de couverture. Si ca veut dire "j'ai tous les memes onglets qu'eux", alors :
- La data est deja chez HypeDexer, Hyperliquid public, HypurrScan. Tout le monde peut la tirer.
- Un onglet se copie en un apres-midi. Flowscan affiche deja HIP-3 + HIP-4 + Builder Intelligence. hl.eco a Wall Street + market share + yield + projects. HypurrScan a l'EVM + forensics.
- Empiler 25 onglets pour matcher tout le monde = se disperser, et finir 4e terminal identique mais moins connu.

**Avoir la meme data est un ticket d'entree, pas un avantage.** La parite de couverture est necessaire pour etre credible comme "house of all", mais elle ne differencie rien. La differenciation vient de ce qu'on FAIT de la data, pas de la data elle-meme.

## 2. Ce que "house of all" doit vraiment vouloir dire

Pas "chaque graphe existe quelque part dans mes onglets". Plutot : **"n'importe quelle question sur Hyperliquid commence et se termine ici."**

Aucun des trois ne possede vraiment ca aujourd'hui, parce que chacun a un centre de gravite qui laisse un angle mort :
- **hl.eco** : hub de decouverte + angle business/institutionnel (Wall Street, market share, annuaire projets). Large mais peu profond, siloté en onglets, ferme, solo.
- **Flowscan** : profondeur temps reel + analytics builders/market-makers (L4, Builder Intelligence). Puissant mais oriente B2B/expert, dashboards agreges, ferme (lead-gen de Hydromancer).
- **HypurrScan** : explorer + forensics EVM + API power-user. Profond sur les adresses/EVM mais oriente dev, outils siloten, ferme (vend l'API).

Ils sont tous "complets dans leur lentille". Aucun n'est le lieu ou toutes les lentilles se rejoignent pour un utilisateur normal. C'est la que se trouve la place.

## 3. Carte de couverture (la parite a atteindre)

Legende : ● fort · ◐ partiel · ○ absent

| Domaine data | Liquid Terminal | hl.eco | Flowscan | HypurrScan |
|---|---|---|---|---|
| Marches perp/spot (prix, OI, funding) | ● | ● | ● | ◐ |
| Order book depth L2/L4 | ◐ | ○ | ● | ○ |
| HIP-3 perp DEX (deployers/assets/oracle) | ◐ | ● | ● | ◐ |
| HIP-4 prediction markets | ○ | ○ | ● | ○ |
| Builders / builder codes | ◐ | ● | ● | ○ |
| Vaults (HLP + user, PnL/TVL/leaderboards) | ● | ◐ | ○ | ● |
| Staking / validateurs | ● | ◐ | ● | ● |
| Liquidations | ● | ◐ | ◐ | ◐ |
| Revenu protocole / fees | ● | ● | ● | ● |
| Stablecoins (supply/dominance/holders) | ◐ | ◐ | ● | ● |
| HyperEVM explorer (blocks/tx/contrats) | ○ | ○ | ○ | ● |
| EVM forensics / tracing / simulation | ○ | ○ | ○ | ● |
| Bridges / flows | ◐ | ◐ | ○ | ● |
| TWAP tracking | ◐ | ○ | ○ | ● |
| Auctions (deploy tokens/marches) | ● | ● | ○ | ● |
| Lending (BLP) | ○ | ○ | ○ | ● |
| Actions tokenisees / weekend | ○ | ○ | ● | ○ |
| Tresoreries / societes cotees (Wall St) | ○ | ● | ○ | ○ |
| Market share vs CEX/DEX/chaines | ○ | ● | ○ | ○ |
| Yield / DeFi screener | ○ | ● | ○ | ○ |
| Annuaire projets / hub liens / research | ○ | ● | ○ | ○ |
| Wallet / address 360 | ● | ● | ◐ | ● |
| Leaderboards traders | ● | ◐ | ● | ● |

**Lecture pour LT :**
- **Deja fort (a garder) :** marches, vaults, staking, liquidations (DB propre, atout), revenu, auctions, wallet, leaderboards.
- **Parite a rattraper via HypeDexer (peu d'effort, gros retour) :** profondeur HIP-3, builder intelligence, stablecoins, TWAP, HIP-4. C'est la data que tu as deja au bout de l'API.
- **Le jeu de curation de hl.eco (a NE PAS courir tout de suite) :** Wall Street/tresoreries, market share, yield screener, annuaire projets, hub liens, research. C'est de l'editorial et de la curation communautaire, pas de la data indexee. Couteux en entretien, faible retour pour ta cible. Skip ou tres tard.
- **Le turf dev de HypurrScan (a ne pas chasser) :** forensics/tracing/simulation EVM (HypurrTrace), lending BLP. Marche perdu d'avance, hors de ta cible. Un explorer HyperEVM basique un jour, la profondeur forensics jamais.

## 4. Les deux axes de differenciation defendables

On ne gagne pas en AYANT la data. On gagne en la CONNECTANT et en l'OUVRANT. Deux axes, cumulables, qu'aucun concurrent ne peut copier vite.

### Axe A — Donnees connectees, pas siloten (entity-first, cross-layer)

Tous les concurrents te donnent soit des **dashboards** (vues agregees, onglet par onglet) soit un **explorer** (une adresse). Personne ne CONNECTE les objets entre eux.

Le principe : **la colonne vertebrale de LT n'est pas une liste d'onglets, c'est un graphe d'entites.** Token, DEX HIP-3, wallet, validateur, vault, builder. Tu atterris sur n'importe quel objet, tu vois son 360, et tu SAUTES vers les objets lies :

> Un DEX HIP-3 -> son deployer -> la sante de son oracle -> ses top traders -> les vaults de ces traders -> leurs wallets HyperEVM -> leurs positions. En un seul flux, sans changer d'outil.

Les dashboards agreges deviennent des **portes d'entree dans le graphe**, pas le produit. C'est exactement ce que la data unifiee de HypeDexer (HyperCore + HyperEVM + HIP-3 + builders + vaults dans une seule API) rend possible, et c'est ce qu'un terminal-a-onglets ne peut pas copier en un apres-midi : il faudrait re-architecturer, pas ajouter une page.

C'est le "Nansen pour Hyperliquid, mais ouvert et cross-layer" : la relation entre les donnees EST le produit.

### Axe B — Substrat ouvert, pas jardin ferme

Les trois sont fermes, chacun pour une raison economique :
- hl.eco monetise le referral (le lock-in c'est le trafic).
- Flowscan est le lead-gen d'un SaaS B2B (ouvrir tuerait le funnel).
- HypurrScan vend son API (ouvrir tuerait le produit).

LT est MIT + API publique gratuite. Donc LT peut etre ce qu'aucun d'eux ne peut se permettre d'etre : **le substrat data ouvert sur lequel le reste de l'ecosysteme construit.** Widgets embeddables, API libre, data forkable.

"House of all" pris au mot : pas "j'ai tout dans mes onglets" mais "**c'est la maison ou les apps des autres habitent**". Chaque projet HL qui embed un widget LT ou tape l'API LT te rend un peu plus incontournable. Et ca, hl.eco/Flowscan/HypurrScan ne peuvent pas le copier sans se saborder leur modele.

## 5. Comment on presente la MEME data differemment

Concret, la ou tout le monde a les memes chiffres :

- **Entity-centric** : chaque chiffre agrege est cliquable vers son entite, chaque entite lie vers ses voisines. Le prix d'un asset HIP-3 -> le DEX -> l'oracle -> les traders. Personne d'autre ne relie.
- **Cross Core + EVM** : un wallet montre en une vue ses perps (HyperCore) ET son activite HyperEVM. HypurrScan a les deux mais separement.
- **Temps reel pousse** : la couche bot (STRATEGY.md) est la distribution par-dessus le substrat. La meme data, mais elle vient a toi.
- **Densite + design** : le Design System V4 ("real data only") est un actif. Meme data, lisibilite superieure.
- **Ouvert** : "voir le code", "utiliser l'API", "embed ce widget" sous chaque vue. Transforme un lecteur en integrateur.

## 6. Reconciliation avec STRATEGY.md

Pas de contradiction, une precision. STRATEGY.md disait "le terminal est une commodite". Exact pour **le terminal-tas-d'onglets**. Faux pour **le terminal-substrat-connecte-et-ouvert**.

La pile coherente devient :
1. **Substrat** : la data, connectee (graphe d'entites) et ouverte (API/MIT). Le socle differenciant.
2. **Terminal** : la surface dense qui rend ce substrat lisible, entity-first.
3. **Bot** : la couche de distribution qui pousse le substrat au retail.

La differenciation est **architecturale** (connecte + ouvert), pas une liste de features. C'est ca qui rend "house of all" defendable au lieu d'etre un concours de bingo de couverture.

## 7. Prochaine etape concrete

1. **Atteindre la parite core via HypeDexer** (HIP-3 profond, builders, stablecoins, TWAP, HIP-4) : c'est de la data que tu as deja, faible effort.
2. **Choisir la colonne vertebrale entity-first** : definir les 6 entites (token, DEX HIP-3, wallet, validateur, vault, builder) et le graphe de liens entre elles. C'est LE choix d'architecture qui differencie.
3. **Poser l'API publique + un premier widget embeddable** : amorcer le substrat ouvert.
4. **Ne PAS courir** le jeu de curation hl.eco (Wall Street, projects, links, yield) ni le forensics EVM de HypurrScan. Rester discipline sur la cible.
