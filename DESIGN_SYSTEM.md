# Liquid Terminal — Design System V4

> Référence unique du design system. Tout nouvel écran ou composant compose à partir d'ici ; aucune valeur de style ne se ré-invente.

## 1. Philosophie

- **Analytics-first** — viser le niveau DefiLlama / Token Terminal : densité d'info, hiérarchie scannable, sobriété.
- **Données réelles uniquement** — pas de sparkline / delta / point inventé. Si la source n'expose pas l'historique, on ne l'affiche pas.
- **Fond plat avec profondeur subtile** — `bg-base` + un halo discret en haut de page. Pas de dégradé criard.
- **Une primitive, plusieurs domaines** — les tables passent toutes par `TypedDataTable`, les charts par `chartPalette`, les cartes par `<Card>` + card-head. Les pages composent, elles ne re-stylent pas.

## 2. Tokens

### Couleurs

| Token Tailwind | Hex | Usage |
|---|---|---|
| `bg-base` | `#0A0B0F` | Fond de l'app |
| `bg-surface` | `#0F1421` | Fond des cartes, sidebar |
| `bg-surface-2` | `#141B2A` | En-tête de table, hover, pills |
| `bg-surface-3` | `#1C2436` | Hover plus profond, items de dropdown |
| `border-subtle` | `#1E2535` | Bordures internes, séparateurs |
| `border-default` | `#2C354A` | Bordures de carte, inputs |
| `text-primary` | `#E8EAED` | Texte principal |
| `text-secondary` | `#9CA3AF` | Labels, sous-titres |
| `text-tertiary` | `#6B7280` | Texte atténué, captions |
| `brand` | `#83E9FF` | Cyan accent, liens, focus, actifs |
| `brand-deep` | `#1692AD` | Variante brand foncée (gradients) |
| `gold` | `#F9E370` | Fees, accent secondaire |
| `success` | `#1FA85B` | Positif, long, buy |
| `danger` | `#E53E3E` | Négatif, short, sell |

**Charts** — palette dédiée dans `@/components/common` (`chartPalette`) : `accent`, `gold`, `violet` (`#A78BFA`), `down` (rose), `roseLight`, `roseSoft`.

### Typographie

- Stack unique **Inter** — `font-sans`, `font-mono` résolvent tous deux vers Inter.
- Classe `.mono` pour les nombres tabulaires (`font-feature-settings: "tnum"`). Préférer `.mono` à `tabular-nums`.
- Tailles courantes :
  - Hero d'une carte : `text-[20px]` à `text-[23px]`, `font-semibold`, `tracking-[-0.02em]`.
  - Titre de carte (card-head) : `text-[13px] font-semibold`.
  - Label de stat : `text-[10.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold`.
  - Header de colonne de table : `text-[9px]–[10px] uppercase tracking-wide text-text-tertiary`.
  - Ligne de tableau : `text-[11.5px]`–`text-[12.5px]`.

### Rayons

- `rounded-md` (6px) — pills, boutons, petites cellules.
- `rounded-lg` (8px) — cartes, inputs.

### Espacements

- Gap principal : `gap-4` (16px).
- Card-head : `px-3.5 py-2.5`.
- Corps de carte : `px-3.5 py-3` ou `px-3` selon la densité.

## 3. Layout shell

### Fond de page

```tsx
<div className="min-h-screen bg-base text-text-primary font-inter">
  {/* Halo subtil — donne de la profondeur au fond plat */}
  <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[340px]
                  bg-gradient-to-b from-surface/60 to-transparent" />
  <Sidebar … />
  <div className="relative z-10 lg:pl-[232px]">
    <Header />
    <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
      {children}
    </main>
  </div>
</div>
```

**Règle z-index** : le halo est `z-0`, le contenu **doit** être `relative z-10`. Sans ça le halo se peint par-dessus et délave le texte.

### Sidebar

- Largeur **`232px`** à `lg+`, `208px` en mobile.
- `bg-surface` + `border-r border-border-subtle`.
- Bloc de marque (logo + "Liquid Terminal" + sous-titre `HYPERLIQUID DATA`).
- Labels de groupe : `text-[10px] uppercase tracking-[0.1em] text-text-tertiary font-semibold`.
- Item actif : `bg-brand/10 text-text-primary` + icône cyan + filet latéral `w-[2px] h-4 bg-brand`.

### Header

- **Sticky** : `sticky top-0 z-30 bg-base/80 backdrop-blur-xl`.
- **Pas de filet bas** (`border-b` retiré pour une transition propre).
- Barre de recherche : `bg-surface border border-border-default rounded-lg`, icône loupe à gauche en `text-text-tertiary`, focus `border-brand`. Dropdown des suggestions en `bg-surface-2 border-border-default`.

## 4. Carte (pattern central)

### Conteneur

```tsx
<Card className="overflow-hidden flex flex-col">…</Card>
```
- `<Card>` de `@/components/ui/card` — encode `bg-surface` + `border border-border-subtle` + `rounded-lg`.
- Padding par défaut : **none**. Le contenu gère ses paddings.

### Card-head V4 (référence à appliquer partout)

```tsx
<div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
  <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
    <Icon size={13} className="text-brand" />
  </span>
  <h3 className="text-[13px] font-semibold text-text-primary">{title}</h3>
  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded
                   bg-surface-2 text-text-tertiary border border-border-subtle">
    {tag}
  </span>
  <Link href={…} className="ml-auto flex items-center gap-1 text-[11px]
                            font-medium text-brand hover:text-brand-hover">
    View all <ArrowRight size={12} />
  </Link>
</div>
```

### Pills `tag`

- Sobre : `text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle`.
- Variante **LIVE / FEED** : `bg-success/10 text-success border-success/25` + point pulsant `<span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />`.

### Section sub-head (au-dessus des grilles)

```tsx
<SectionHead title="Network Pulse" subtitle="Real-time ecosystem metrics" href="/…" />
```
- `flex items-baseline gap-3 mb-1`.
- h2 `text-[14px] font-semibold text-text-primary`, sous-titre `text-[11px] text-text-tertiary`, lien optionnel `ml-auto`.

## 5. Tables

**Règle absolue** : passer par `<TypedDataTable<Row>>` de `@/components/common`. Le `<Table>` brut de `@/components/ui/table` est **interdit hors de `src/components/common/`** (ESLint).

```tsx
<TypedDataTable<Row>
  title={…}              // optionnel — sans title, pas de wrap Card
  icon={…}
  columns={[
    { key: "name",   header: "Token",  accessor: (r) => <TokenCell … /> },
    { key: "price",  header: "Price",  type: "numeric",  accessor: (r) => fmtPrice(r.price) },
    { key: "fees",   header: "Fees",   type: "fees",     accessor: (r) => compactUsd(r.fees) },
    { key: "chg",    header: "24h",    type: "change",   accessor: (r) => r.change24h },
  ]}
  data={rows}
  getRowKey={(r, i) => `${market}-${r.name}-${i}`}
  isLoading={…}
  error={…}
  density="compact"
  onRowClick={…}
  rowMotion
/>
```

`Column.type` applique automatiquement `.mono` + alignement droit + couleur signée selon le type.

## 6. Charts

### Composants

| Composant | Quand l'utiliser |
|---|---|
| `<AuroraAreaChart data lineColor formatValue height onCrosshairMove />` | Mono-série, axe unique. Couvre 90 % des cas. |
| `<MultiSeriesAreaChart series height onCrosshairMove />` | Multi-séries avec axes gauche/droit (cas où des échelles différentes doivent coexister). |
| `<Sparkline data color height />` | Mini-courbe inline (SVG), dans une cellule de stat ou de carte compacte. |

### Couleurs

- **Toujours** depuis `chartPalette` (importé de `@/components/common`). Hex hardcodés bloqués par ESLint.
- Conventions adoptées dans le dashboard :
  - Bridge TVL → `chartPalette.accent` (cyan).
  - Stablecoins → `chartPalette.violet`.
  - Fees → `chartPalette.gold`.
  - Liquidations → `chartPalette.down` (rose).

### Sparkline — exemple

```tsx
<Sparkline data={feeTrend} color={chartPalette.gold} height={20} className="mt-auto pt-2" />
```

### Règle anti-mélange

Ne pas superposer plus de 3 séries de **natures différentes** (flow vs stock) sur un même chart. Quand on a 4 métriques disparates (Liquidations, Fees, Bridge TVL, Stablecoins), préférer un **sélecteur d'onglet** plutôt qu'un overlay 4-séries — la lisibilité s'effondre sinon.

## 7. Patterns Dashboard

### PulseBar (ruban de stats)

- `grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-N gap-px bg-border-subtle border border-border-default rounded-lg overflow-hidden`.
- Chaque cellule : `bg-surface hover:bg-surface-2 px-4 py-3 flex flex-col` avec label uppercase + valeur `.mono text-[20px] font-semibold`.
- Sparkline optionnelle en bas de cellule via `mt-auto`.

### OverviewModule (carte « résumé d'une page »)

Primitive de `src/components/dashboard/OverviewModule.tsx` :
- `<OverviewModule title tag href viewAllLabel>` — wrapper avec card-head.
- `<ModuleTable columns><ModuleTableRow cells href? /></ModuleTable>` — table à la `.tbl` de la maquette.
- `<ModuleRow rank logo name sub stats={[{label,value}]} href? />` — ligne de leaderboard.
- `<ModuleAsset logo name sub />` — cellule asset standard.
- `<ModuleSubhead>HIP-3 Perp DEXs</ModuleSubhead>` — sous-titre dans le corps.

### Grilles de cartes pairs (g-2, g-3)

- **Pas de `items-start`** sur les rangées de cartes pairs → les cartes s'étirent à hauteur égale (grid default stretch). Les composants conçus pour stretcher (`flex-1` sur la section principale, `mt-auto` sur les pieds) remplissent correctement.
- `items-start` est réservé aux layouts main+aside asymétriques (ex : g-main chart + colonne droite).

## 8. Services — architecture 4 couches

```
src/services/<domain>/
├── api.ts            (Layer 1 — HTTP via withErrorHandling + get/post/del/...)
├── types.ts          (Layer 2 — interfaces TS)
├── hooks/
│   └── useX.ts       (Layer 3 — useDataFetching)
└── index.ts          (barrel)
```

### Règles

1. **`withErrorHandling`** wrappe tout appel HTTP (contexte descriptif obligatoire).
2. **Helpers centralisés** `get / post / put / del / patch` depuis `@/services/api/axios-config`. Pour les APIs externes (Hypurrscan, DefiLlama) utiliser `getExternal / postExternal`.
3. **`useDataFetching<T>`** est la base de tous les hooks de fetch — gère cache, retries, refresh interval.
4. Aucun `any`. Tout est typé.

### Intervalles de rafraîchissement

| Type de donnée | refreshInterval |
|---|---|
| Temps réel (orderbook, fills) | `10000` (10 s) |
| Normal (stats, marché) | `30000` (30 s) |
| Statique / historique | `60000`–`300000` |

## 9. Formatters

Tout vit dans `@/lib/formatters/numberFormatting.ts` et `dateFormatting.ts`.

- `compactUsd(n)` — `$1.2M / $3.4B / $42 / —` (gère `null/NaN`).
- `formatNumber(value, format, opts)` — locale-aware.
- `formatLargeNumber(value, { prefix, decimals })` — axe Y de chart.

Ne **jamais** ré-implémenter ces fonctions localement — l'imposer via review.

## 10. Garde-fous ESLint

- `no-restricted-syntax` — **interdit le hex hardcodé** dans `text-*` / `bg-*` / `border-*` ; utiliser un token Tailwind ou `chartPalette.*`.
- `no-restricted-imports` — **interdit `@/components/ui/table` hors de `common/`**. Force le passage par `TypedDataTable`.

## 11. Contraintes honnêtes (apprises pendant la refonte)

Documenter ces limites pour éviter de re-buter dessus :

- **Pas d'historique par KPI** côté API pour la majorité des métriques (volume global, OI, users, market cap…). Donc pas de sparkline / delta sur la PulseBar — **valeur seule, homogène**. Les seules exceptions sont les données qui ONT une vraie série temporelle (fees, stablecoins, bridge TVL, liquidations).
- **Hypedexer instable** — l'API `api.hypedexer.com` peut tomber en **402 Payment Required** sur l'ensemble de ses endpoints (`/indexer/*`, `/liquidations/recent`, `/liquidations/analytics/stats`). Tout composant en dépendant doit dégrader proprement.
- **Sources de séries temporelles robustes** (ne dépendent pas de hypedexer) :
  - `/liquidations/historical/chart` — DB locale, jusqu'à **90 jours**, granularité adaptative.
  - `/market/fees/raw` — Hypurrscan, historique complet de fees.
  - `/market/stablecoins/history` — DefiLlama, supply de stablecoins.
  - Hypurrscan `/spotUSDC` — série de supply on-spot par stablecoin (USDC, USDH, USDT0, USDE) + holders.
  - DefiLlama `hyperliquid-bridge` — Bridge TVL historique.
  - Hyperliquid `info` `candleSnapshot` — OHLCV par token.
- **Charts à éviter** : tout ce qui dépend uniquement de hypedexer (HIP-3 OHLCV, funding history, vault snapshots, etc.) tant que l'abonnement n'est pas stabilisé.

## 12. Index des primitives & composants V4

### Primitives (`src/components/common/`)
- `TypedDataTable`, `Column<T>` — tables.
- `AuroraAreaChart`, `MultiSeriesAreaChart` — charts.
- `chartPalette` — palette charts.
- `PeriodSelector`, `useChartPeriod` — sélecteur de période.
- `PageHeader`, `PageSection` — en-tête de page.
- `TimeframeTabs`, `PillTabs` — tabs.
- `LoadingState`, `ErrorState`, `EmptyState`, `ChartLoading`, `ChartEmpty`, `ChartError`.
- `TokenIcon`, `StatsCard`, `StatsPanel`.

### Dashboard (`src/components/dashboard/`)
- `SectionHead` — titre de section.
- `Sparkline` — mini-courbe inline.
- `PulseBar` — ruban de stats.
- `OverviewModule` (+ `ModuleRow`, `ModuleTable`, `ModuleTableRow`, `ModuleCell`, `ModuleAsset`, `ModuleSubhead`).
- `MoversCard`, `AuctionsPanel`, `LiquidationsPanel`, `TwapPanel`, `Hip3MarketsPanel`, `StablecoinsCard`.
- `chart/ChartSection`, `chart/FeesChartSection`, `chart/MultiSeriesAreaChart`.
- `modules/VaultsModule`, `ValidatorsModule`, `BuildersModule`.

### Shell (`src/components/`)
- `Sidebar`, `Header`, `ExplorerSearchBar`.
