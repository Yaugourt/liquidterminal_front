# Design System V4 — Liquid Terminal

Référence pratique pour construire l'UI. Le rationnel design complet (couleurs,
philosophie, spec détaillée) est dans [`DESIGN_SYSTEM_V4.md`](./DESIGN_SYSTEM_V4.md).
L'API détaillée des composants est dans [`design-system/primitives.md`](./design-system/primitives.md).

## Principe

Le V4 est **encodé dans des primitives**. On les compose, on ne réimplémente
jamais la composition à la main. Un changement central se propage partout.

## Tokens (toujours des tokens, jamais de hex)

### Surfaces & texte

| Token | Usage |
|---|---|
| `bg-base` | Fond de page (`#0A0B0F`) |
| `bg-surface` / `-2` / `-3` | Cards ; imbrications & hover ; header de table |
| `text-text-primary` / `-secondary` / `-tertiary` | Hiérarchie de texte (3 niveaux) |
| `border-border-subtle` / `-default` / `-strong` | Bordures (navy opaque) |

### Marque & sémantique

| Token | Usage |
|---|---|
| `brand` (`text-`/`bg-`) | Cyan signature `#83E9FF` ; `text-brand-text-on` = navy sur cyan |
| `gold` | Or `#F9E370` — **réservé à la colonne Builder Fees** |
| `action` | CTA primaire (cyan profond) |
| `success` / `danger` / `warning` | Sémantique |

Typo : échelle px fixe `text-2xs`(10) … `text-3xl`(28). Tout chiffre en
JetBrains Mono. Radius des cards : `rounded-lg` (8px).

## Primitives — la source unique de composition

| Besoin | Primitive | Import |
|---|---|---|
| Tableau de données | `TypedDataTable` | `@/components/common` |
| Surface / carte | `Card` (+ `CardHeader`/`CardContent`) | `@/components/ui/card` |
| Chiffre autonome | `Num` | `@/components/common` |
| En-tête / section de page | `PageHeader` / `PageSection` | `@/components/common` |
| Carte de stat | `StatsCard` / `StatsPanel` | `@/components/common` |
| Sélecteur de période | `TimeframeTabs` | `@/components/common` |
| États chargement/erreur/vide | `LoadingState` / `ErrorState` / `EmptyState` | `@/components/ui/*` |

→ API détaillée : [`design-system/primitives.md`](./design-system/primitives.md).

## Règles d'or

1. **Jamais** le `<Table>` brut de `@/components/ui/table` — toujours
   `TypedDataTable` (interdit par ESLint hors `common/`).
2. **Jamais de hex en dur** — tokens uniquement (interdit par ESLint).
   Seule exception : `src/components/common/charts/chartTheme.ts`.
3. **Tout chiffre en mono** — via `Column.type` (table), `<Num>` (autonome)
   ou la classe `.mono`.
4. **Pas de largeur fixe** sur les primitives — elles remplissent l'espace
   que leur parent leur donne (fluide en grid/flex).
5. **Importer depuis le barrel** `@/components/common`, pas les fichiers internes.

## Hors périmètre (plans séparés)

- **Mode clair** — les tokens `[data-theme="light"]` sont prêts dans
  `globals.css` ; la bascule reste à implémenter.
- **Composants graphiques** — encore codés sur-mesure (Recharts / Lightweight
  Charts) ; `chartTheme.ts` centralise déjà palette, axes et tooltips.
