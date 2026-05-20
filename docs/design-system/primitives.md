# Primitives — API

API des composants du Design System V4. Vue d'ensemble : [`../DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md).

---

## TypedDataTable

La table unique. Encode le look V4 (densité, mono, fees or, header navy, états).
Import : `import { TypedDataTable, type Column } from "@/components/common"`.

### `Column<T>`

| Champ | Type | Rôle |
|---|---|---|
| `key` | `string` | Identifiant stable (clé React + champ de tri). Requis si `sortable`. |
| `header` | `ReactNode` | Libellé d'en-tête. |
| `accessor` | `keyof T \| (row, index, absoluteIndex) => ReactNode` | Cellule : clé de propriété ou fonction de rendu. |
| `type` | `"numeric" \| "fees" \| "change" \| "address" \| "text"` | Style auto : mono, alignement, or des fees, couleur signée. Défaut : aucun style auto. |
| `format` | `(value, row) => ReactNode` | Formateur (quand `accessor` est une clé). |
| `align` / `headerAlign` | `"left" \| "right" \| "center"` | Alignement. `numeric`/`fees`/`change` → droite par défaut. |
| `sortable` | `boolean` | En-tête cliquable. |
| `getSortValue` | `(row) => number \| string` | Valeur de tri (requis si `accessor` est une fonction et tri local). |
| `className` | `string` | Classe sur l'en-tête + les cellules. |
| `width` | `string \| number` | Largeur fixe — à éviter (fluide par défaut). |

### Props principales

| Prop | Rôle |
|---|---|
| `data` / `columns` | Données + config de colonnes. |
| `getRowKey` | Clé React stable par ligne. |
| `isLoading` / `error` / `onErrorRetry` | États ; `errorTitle`, `emptyMessage`, `emptyDescription`. |
| `density` | `"comfortable"` (défaut) \| `"compact"`. |
| `onRowClick` / `rowClassName` | Interaction de ligne. |
| `rowMotion` | Anime l'apparition des lignes (`motion.tr`). |
| `toolbar` | Slot au-dessus de la table (recherche, filtres). |
| `title` / `icon` / `subtitle` / `headerAction` | Mode carte (enveloppe dans un `<Card>` avec header). |
| `stickyHeader` | En-tête collant au scroll. |

**Pagination locale** : `paginate`, `itemsPerPage`, `initialSort`, `paginationVariant` (`"full"`/`"compact"`/`"none"`), `rowsPerPageOptions`.
**Pagination serveur** : `total`, `page`, `rowsPerPage`, `onPageChange`, `onRowsPerPageChange`.
**Tri serveur** : `onSortChange(field, dir)`, `sortField`, `sortDirection` — la table émet l'événement, le parent re-fetch (ne pas combiner avec le tri local).

### Exemple

```tsx
const columns: Column<Row>[] = [
  { key: "name", header: "Builder", sortable: true,
    getSortValue: (r) => r.name, accessor: (r) => r.name },
  { key: "vol", header: "Volume", type: "numeric", sortable: true,
    getSortValue: (r) => r.vol, accessor: (r) => formatNumber(r.vol, fmt) },
  { key: "fees", header: "Builder Fees", type: "fees",
    accessor: (r) => formatNumber(r.fees, fmt) },
];

<TypedDataTable<Row>
  data={rows} columns={columns}
  isLoading={isLoading} error={error}
  paginate itemsPerPage={25}
  initialSort={{ field: "vol", direction: "desc" }}
  onRowClick={(r) => router.push(`/builders/${r.address}`)}
/>
```

---

## Card

Surface V4. Import : `import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"`.

| Prop (`Card`) | Valeurs | Défaut |
|---|---|---|
| `padding` | `none` / `sm` / `md` / `lg` | `none` |
| `interactive` | `boolean` (bordure au hover) | `true` |

`CardHeader` / `CardContent` / `CardFooter` acceptent `density` : `comfortable` (`p-6`, défaut) ou `compact` (`p-3.5`).

---

## Num

Affichage d'un chiffre **autonome** (hors table — en table, utiliser `Column.type`).
Toujours rendu en mono. Import : `import { Num } from "@/components/common"`.

| Prop | Rôle |
|---|---|
| `value` | `number \| string \| null \| undefined`. |
| `format` | `"compact"` \| `"price"` \| `"metric"` \| `"raw"` \| `(n) => string`. |
| `variant` | `"default"` \| `"fees"` (or) \| `"change"` (signé + couleur) \| `"muted"`. |
| `prefix` / `suffix` / `fallback` | Préfixe/suffixe ; texte si valeur absente (défaut `—`). |

```tsx
<Num value={volume} format="compact" />
<Num value={pnl} variant="change" format="price" />
```

---

## PageHeader / PageSection

Structure de page. Import : `@/components/common`. Fluides, `w-full`.

`PageHeader` : `title` (requis), `description`, `actions` (slot droite), `children`
(contenu sous l'en-tête : recherche/filtres), `breadcrumb`.

`PageSection` : `title`, `actions`, `children` — bloc de section avec espacement standard.

```tsx
<PageHeader title="Builders" description="..." actions={<TimeframeTabs … />} />
```

---

## TimeframeTabs

Sélecteur de période, bâti sur `PillTabs`. Import : `@/components/common`.

| Prop | Rôle |
|---|---|
| `options` | `Timeframe[]` — sous-ensemble proposé (`1h`/`24h`/`7d`/`30d`/`90d`/`1y`/`all`). |
| `value` / `onChange` | Période active + callback. |

---

## StatsCard / StatsPanel

`StatsCard` : carte de stat (`title`, `value`, `icon`, `change`, `changeDirection`,
`subValue`, `density`, `withCard`). `StatsPanel` : panneau groupant plusieurs
`StatsCard` sous un header (`title`, `icon`, `headerAction`, états `isLoading`/`error`).

## États

`LoadingState` / `ErrorState` / `EmptyState` (`@/components/ui/*`) — props `withCard`,
`size`/`message`/`title`. `TypedDataTable` les gère nativement via `isLoading`/`error`/`emptyMessage`.
