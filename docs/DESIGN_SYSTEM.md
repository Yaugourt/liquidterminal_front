# Liquid Terminal — Design System

Règles **prescriptives** pour bâtir une nouvelle page sans diverger. ESLint bloque les principales infractions ; le reste est convention.

---

## 1. Règles d'or (lis ça avant tout)

1. **Jamais de hex hardcodé.** Tokens Tailwind (`brand-*`) ou `chartPalette` uniquement. ESLint bloque.
2. **Jamais d'`<input type="checkbox">` natif.** Utilise `<Checkbox>` de `@/components/ui/checkbox`. ESLint bloque.
3. **Jamais `<Loader2>` direct.** Utilise `<LoadingState>` (block) ou `<InlineSpinner>` (inline). ESLint bloque.
4. **Tous les imports `common/` passent par le barrel** `@/components/common`. Pas de chemin direct. ESLint bloque.
5. **Une stat = `<StatsCard>`. Un groupe de stats = `<StatsPanel>`.** Pas de re-implementation.
6. **Une table = `<TypedDataTable>`.** Pas de `<Table>` brute pour des données structurées.
7. **Un form modal = `<FormModal>`.** Champs = `<FormField>`, sections = `<FormSection>`, footer = `<FormFooter>`.
8. **Animations cards staggered = `staggeredCardVariants`.** Fade-in scroll = `<FadeIn>` / `<HeroFadeIn>`.
9. **Tooltip info = `<TooltipIcon>`.** Pas de Tooltip Radix custom.
10. **Une nouvelle primitive ?** Tu l'ajoutes au barrel `src/components/common/index.ts` **dans la même PR**, sinon ESLint refuse les imports.

---

## 2. Couleurs

### Tokens brand (Tailwind)

| Classe | Hex | Usage |
|---|---|---|
| `bg-brand-main` | `#0B0E14` | Background app |
| `bg-brand-secondary` | `#151A25` | Cards, panels |
| `bg-brand-tertiary` | `#051728` | Tabs container, accents foncés |
| `bg-brand-dark` | `#0A0D12` | Backgrounds profonds |
| `text-brand-accent` | `#83E9FF` | Accent primaire (cyan) — liens, active, sort actif |
| `text-brand-gold` | `#f9e370` | Accent secondaire (gold) — premium, admin, highlights |
| `text-brand-success` | `#00ff88` | États succès |
| `text-brand-error` | `#ef4444` | États erreur |
| `text-brand-warning` | `#f59e0b` | États warning |
| `text-brand-telegram` | `#0088cc` | **Réservé Telegram** — pas un accent UI |

### Texte / Borders

- `text-white` (primaire), `text-text-secondary` (`#a1a1aa`), `text-text-muted` (`#71717a`)
- `border-border-subtle` (default), `border-border-hover` (hover)

### Sémantique

| Cas | Classes |
|---|---|
| Positif / Buy / Up | `text-emerald-400`, `bg-emerald-500/10` |
| Négatif / Sell / Down | `text-rose-400`, `bg-rose-500/10` |
| Warning | `text-orange-400`, `bg-orange-500/10` |
| Link / Active | `text-brand-accent` |
| Admin / Premium | `text-brand-gold` |

### Alpha dynamique (animations)

Pour les rgba calculés au runtime (radial-gradient hover, box-shadow), utilise les CSS vars `--brand-*-rgb` :

```css
background: rgb(var(--brand-accent-rgb) / 0.12);
box-shadow: 0 0 8px rgb(var(--brand-gold-rgb) / 0.5);
```

Disponibles : `--brand-accent-rgb`, `--brand-gold-rgb`, `--brand-success-rgb`, `--brand-error-rgb`, `--chart-up-rgb`, `--chart-down-rgb`, `--chart-violet-rgb`.

Alpha statique = Tailwind (`bg-brand-accent/30`). Alpha dynamique = CSS var.

### Charts multi-séries

Hex autorisés uniquement dans [`src/components/common/charts/chartTheme.ts`](../src/components/common/charts/chartTheme.ts). Importe `chartPalette` :

```ts
import { chartPalette } from "@/components/common/charts/chartTheme";
// chartPalette.accent, .gold, .up, .down, .violet
// chartPalette.multiSeries[] — rotation 10 couleurs pour donuts/pies
```

---

## 3. Typography

- **Police unique** : `font-inter` (Inter). Pas d'autre famille.
- **Classes** : `text-xs` `text-sm` `text-base` `text-lg` `text-xl` `text-2xl`. Pas de `text-[10px]` arbitraire **sauf labels uppercase** (convention `text-[10px] uppercase tracking-wider text-text-secondary`).
- **Tabular nums** : tous les chiffres dans tables/stats → `tabular-nums`.
- **Utility classes** dans `globals.css` :
  - `.text-stat-label` — label uppercase compact
  - `.text-table-header` / `.text-table-cell` — en-têtes et cellules
  - `.text-label` — micro-labels (chips, badges)

---

## 4. Layout d'une page

```tsx
// src/app/(app)/<section>/page.tsx
<div className="p-4 md:p-6 space-y-6">
  <PageHeader title="..." />              {/* H1 + subtitle + actions */}
  <KpiGrid />                              {/* StatsCard ou StatsPanel */}
  <MainContent />                          {/* tables, charts, listes */}
</div>
```

- **Container** : `space-y-6` entre sections, `gap-3` à `gap-4` dans les grids.
- **Padding page** : `p-4 md:p-6`.
- **Grids stats** : `grid grid-cols-2 lg:grid-cols-4 gap-4`. Adapte selon le nombre.
- **Glassmorphism** : `.glass-panel` (= `bg-brand-secondary/60 backdrop-blur-md border border-border-subtle shadow-premium rounded-2xl`) pour les conteneurs principaux.

---

## 5. Primitives canoniques

**Tout** est exporté depuis `@/components/common`. Aucun chemin direct.

### 5.1 Cards / Stats

**`<StatsCard>`** — une stat dans une grille (KPI rows, métriques).

```tsx
<StatsCard
  title="24h Volume"
  value={`$${formatLargeNumber(volume)}`}
  icon={<DollarSign className="h-4 w-4 text-brand-gold" />}
  iconClassName="bg-brand-gold/10"      // override tint
  change={12.3}                         // → pill "+12.3%" auto-colorée
  // change={<>+$12.3K</>} + changeDirection="up"  // delta custom
  subValue="vs prev. 24h"
  density="compact"                     // ou "comfortable" (default)
  withCard={false}                      // bare div quand imbriqué
/>
```

**`<StatsPanel>`** — Card avec header + groupe de stats.

```tsx
<StatsPanel
  title="Validator Stats"
  icon={<Shield size={16} className="text-brand-accent" />}
  iconVariant="accent"                  // "accent" | "gold"
  // iconClassName="bg-rose-500/10"     // tint libre
  isLoading={isLoading}
  error={error}
  headerAction={<PeriodSelector />}     // slot droit
>
  <div className="grid grid-cols-2 gap-4">
    {/* stats inside */}
  </div>
</StatsPanel>
```

**Règle** : une stat par card en grille → `<StatsCard>`. Plusieurs stats sous un même header → `<StatsPanel>`.

### 5.2 Tables

**`<TypedDataTable>`** — primitive unique pour tables data-driven.

```tsx
const columns: Column<Row>[] = [
  {
    key: "rank",
    header: "Rank",
    accessor: (_row, _i, absoluteIndex) => <>#{absoluteIndex + 1}</>,
  },
  {
    key: "volume",
    header: "Volume",
    sortable: true,
    align: "right",
    getSortValue: (r) => r.volume,
    accessor: (r) => `$${formatLargeNumber(r.volume)}`,
  },
];

<TypedDataTable<Row>
  title="Top Traders"                   // → Card mode (icon + title + headerAction)
  icon={<TrendingUp />}
  data={rows}
  columns={columns}
  getRowKey={(r) => r.id}
  paginate                              // pagination locale
  itemsPerPage={10}
  initialSort={{ field: "volume", direction: "desc" }}
  // ou: paginationVariant="full" + rowsPerPageOptions={[5,10,25,50]}
  // ou: server pagination → total, page, rowsPerPage, onPageChange, onRowsPerPageChange
/>
```

**Modes** :
- Static : `data` + `columns`.
- Sortable : `sortable: true` sur colonnes + tri-state interne (desc → asc → unsorted).
- Local pagination : `paginate: true` (compact footer par défaut, `paginationVariant="full"` pour rows-per-page selector).
- Server pagination : `total` + `page` + `rowsPerPage` + handlers (full footer auto).
- Card mode : pass `title` → wrap auto dans Card avec header.

**Outliers** (motion.tr, WS, layouts custom) → sub-primitives :

```tsx
import { useSortablePagination, SortableTableHead, TablePaginationFooter } from "@/components/common";
```

Tri actif = **toujours `text-brand-gold`** (enforced par `SortableTableHead`).

### 5.3 Forms

```tsx
<FormSection title="General">
  <FormField label="Name" required error={errors.name}>
    <Input value={name} onChange={...} />
  </FormField>
  <FormField label="Description" as="textarea">
    <Textarea value={desc} onChange={...} />
  </FormField>
</FormSection>

<FormFooter
  onCancel={onClose}
  submitLabel="Create"
  loading={isSubmitting}
  disabled={!isValid}
/>
```

Champ "nom + description" partagé → `<CategoryForm>`.

### 5.4 Modals

**Form modal** :

```tsx
<FormModal
  open={open}
  onOpenChange={setOpen}
  title="Edit Project"
  tabs={[{ id: "general", label: "General" }, { id: "links", label: "Links" }]}
  currentTab={tab}
  onTabChange={setTab}
>
  {tab === "general" ? <GeneralForm /> : <LinksForm />}
  <FormFooter ... />
</FormModal>
```

Modal non-form → `<Dialog>` shadcn direct (rare).

### 5.5 Animations

| Pattern | API |
|---|---|
| Scroll-triggered fade | `<FadeIn>` (IntersectionObserver, pas de framer) |
| Initial-load fade | `<HeroFadeIn delay={0.2}>` |
| Cards staggered grid | `staggeredCardVariants` (framer variants) |

```tsx
import { staggeredCardVariants } from "@/components/common";
const v = staggeredCardVariants({ delay: 0.06, y: 16 });

<motion.div variants={v} custom={i} initial="hidden" animate="visible">
  <StatsCard ... />
</motion.div>
```

**Layout pill indicator** (active tab/period highlight) : `<motion.div layoutId="...">` inline. Pas de wrapper canonique — chaque usage a son layoutId.

### 5.6 Tooltip

```tsx
<TooltipIcon text="What this metric means" side="top" />
// rend : <Info /> + Tooltip avec le texte
```

### 5.7 États

| Composant | Usage |
|---|---|
| `<LoadingState>` | Block-level "Loading…" (cards, sections vides) |
| `<InlineSpinner>` | Spinner inline (boutons, badges) |
| `<EmptyState>` | "Aucun résultat" avec icône + texte |
| `<ErrorState>` | Erreur avec retry optionnel |

`<TypedDataTable>` gère déjà ces 3 états via `isLoading` / `error` / `emptyMessage`.

### 5.8 Adresses

```tsx
<AddressDisplay address={addr} withCopy />
// rend : 0x1234...5678 + bouton copy
```

Jamais de `addr.slice(0,6) + "..." + addr.slice(-4)` manuel.

### 5.9 Pagination standalone

`<Pagination>` — pour les cas hors table. La plupart du temps `<TypedDataTable>` la gère via ses props.

### 5.10 Charts

- **Loading** : `<ChartSkeleton>` (jamais `<Loader2>`).
- **Couleurs** : `chartPalette` depuis `chartTheme.ts`. Aucun hex hardcodé ailleurs.
- **Multi-séries** : `chartPalette.multiSeries[]` (10 couleurs).

---

## 6. Sidebar / Header

- **Sidebar** : structure existante, ne pas dupliquer. Ajouter une route → `src/lib/sidebar-config.ts`.
- **Sidebar item actif** : `text-brand-accent` + `bg-brand-accent/10` + barre gauche `bg-brand-accent`.
- **Header** : déjà géré dans le layout `(app)`. Stats compactes → `.stat-card` (classe utility globals.css).

---

## 7. Buttons

```tsx
<Button variant="default">      {/* cyan primary */}
<Button variant="outline">      {/* border, hover bg-white/5 */}
<Button variant="ghost">        {/* hover bg-white/5 — le plus courant */}
<Button variant="destructive">  {/* rouge */}
<Button size="sm | default | lg | icon">
```

CTA login/primary : `bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-bold`.

---

## 8. Badges / Tags

```tsx
// Statut
<span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">
  Active
</span>

// Pill numérique (delta)
<NumericChangePill change={12.3} />  // utilisé par StatsCard auto
```

Couleurs : emerald (positif), rose (négatif), brand-accent (info), brand-gold (premium), white/5 (neutre).

---

## 9. Tabs

```tsx
<Tabs value={tab} onValueChange={setTab}>
  <TabsList className="bg-brand-tertiary border border-border-subtle rounded-lg p-0.5">
    <TabsTrigger value="x" className="data-[state=active]:bg-brand-accent/20 data-[state=active]:text-brand-accent">
      X
    </TabsTrigger>
  </TabsList>
  <TabsContent value="x">...</TabsContent>
</Tabs>
```

Pour un period selector custom (1h / 4h / 24h), utilise le pattern flex + button, **pas Tabs Radix** (cf. `LiquidationsStatsCard`).

---

## 10. Iconographie

- **Lucide React uniquement.** `import { TrendingUp, ... } from "lucide-react"`.
- **Tailles** : `h-3.5 w-3.5` (mini, dans labels), `h-4 w-4` (boutons, stats), `h-5 w-5` (headers de section).
- **Couleurs** : passe la classe directement sur l'icône (`<Shield className="text-brand-accent" />`).

---

## 11. Responsive

- **Breakpoints** : `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536.
- **Mobile-first** : classes de base = mobile, override avec préfixe (`md:`, `lg:`).
- **Grids stats** : `grid-cols-2 lg:grid-cols-4`. **Jamais** `grid-cols-4` sans fallback mobile.
- **Tables** : colonnes secondaires masquées avec `hidden md:table-cell` ou `hidden lg:table-cell`.
- **Padding page** : `p-4 md:p-6`.

---

## 12. ESLint enforced

`eslint.config.mjs` bloque ces patterns dans `src/components/**` :

| Règle | Exception |
|---|---|
| Hex hardcodé (`#83E9FF`) | `chartTheme.ts` |
| Tailwind arbitraire (`text-[#xxx]`) | aucune |
| `<input type="checkbox">` natif | `ui/checkbox.tsx` |
| `import { Loader2 } from "lucide-react"` | `ui/loading-state.tsx`, `common/charts/ChartSkeleton.tsx` |
| `import from "@/components/common/<file>"` (sub-path) | aucune — toujours via barrel |

Si l'une de ces règles te gêne légitimement, **discute avant de désactiver**. La règle n'existe que parce qu'on a constaté la divergence sans elle.

---

## 13. Checklist : nouvelle page

Avant de commit une nouvelle page (`src/app/(app)/.../page.tsx`) :

1. ✅ **Layout** : `p-4 md:p-6 space-y-6`, container vertical.
2. ✅ **Tokens** : aucun hex hardcodé. `pnpm run lint` passe.
3. ✅ **Stats** : utilise `<StatsCard>` ou `<StatsPanel>`. Pas de label uppercase + value bold à la main.
4. ✅ **Tables** : `<TypedDataTable>` avec config columns. Sortable = colonnes `sortable: true` + `getSortValue`.
5. ✅ **Forms** : `<FormField>` + `<FormSection>` + `<FormFooter>` + `<FormModal>` si modal.
6. ✅ **Loading** : `<LoadingState>` (block) ou `<ChartSkeleton>` (chart). Jamais `<Loader2>`.
7. ✅ **Empty / Error** : passe les states à la primitive (TypedDataTable les gère). Sinon `<EmptyState>` / `<ErrorState>`.
8. ✅ **Animations** : `<FadeIn>` ou `staggeredCardVariants` pour entrées. Pas de motion.div inline ad-hoc.
9. ✅ **Adresses** : `<AddressDisplay>`. Jamais `.slice(0,6)...slice(-4)`.
10. ✅ **Tooltips** : `<TooltipIcon text="..." />`.
11. ✅ **Icons** : Lucide, tailles standard.
12. ✅ **Responsive** : grids `grid-cols-2 lg:grid-cols-N`, colonnes secondaires `hidden md:table-cell`.
13. ✅ **Imports** : `@/components/common` (barrel) — jamais sub-path.
14. ✅ **Type-check** : `npx tsc --noEmit` zéro erreur sur tes fichiers.
15. ✅ **Lint** : `pnpm run lint` zéro erreur.

---

## 14. Ajouter une nouvelle primitive commune

Procédure :

1. Crée le fichier dans `src/components/common/<NewPrimitive>.tsx` (ou sous-dossier thématique).
2. **Ajoute l'export au barrel** `src/components/common/index.ts` **dans le même commit** — sinon ESLint refuse l'import depuis n'importe où.
3. Documente l'API ici (section 5).
4. Si elle remplace un pattern dupliqué → migre les call-sites (audit `grep`) dans la même PR ou une PR suivante référencée.

---

## 15. Fichiers de référence

| Fichier | Rôle |
|---|---|
| [`tailwind.config.ts`](../tailwind.config.ts) | Tokens `brand-*`, fonts, breakpoints |
| [`src/app/globals.css`](../src/app/globals.css) | CSS vars RGB, `.glass-panel`, utility classes |
| [`src/components/common/index.ts`](../src/components/common/index.ts) | Barrel SSOT |
| [`src/components/common/charts/chartTheme.ts`](../src/components/common/charts/chartTheme.ts) | Palette charts (hex autorisés ici) |
| [`eslint.config.mjs`](../eslint.config.mjs) | Règles enforced |
| [`AGENTS.md`](../AGENTS.md) | Conventions apprises (font, scrollbar, …) |

---

**TL;DR** : avant d'écrire un `<div>`, vérifie qu'il n'existe pas déjà une primitive. Avant d'écrire `#xxxxxx`, vérifie le token Tailwind. Avant d'écrire `<Loader2>`, importe `<LoadingState>`. Le design system n'est plus aspirationnel — il est prescriptif et ESLint le fait respecter.
