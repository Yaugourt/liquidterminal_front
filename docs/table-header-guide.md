# 📊 Guide des Composants TableHeader Centralisés

Ce guide explique les 2 types de headers de tableau centralisés et comment les utiliser.

---

## 🏗️ Architecture

Tous les composants de table sont centralisés dans un seul fichier :

```
src/components/ui/table.tsx
```

### Composants Exportés

| Composant               | Description                                   | Classes par défaut                          |
| ----------------------- | --------------------------------------------- | ------------------------------------------- |
| `Table`                 | Conteneur principal `<table>`                 | `w-full`                                    |
| `TableHeader`           | Section header `<thead>`                      | —                                           |
| `TableBody`             | Section body `<tbody>`                        | —                                           |
| `TableRow`              | Ligne `<tr>`                                  | `border-b border-border-subtle`             |
| `TableHead`             | Cellule header `<th>`                         | `py-3 px-3 text-table-header`               |
| `TableCell`             | Cellule body `<td>`                           | `py-3 px-3 text-table-cell`                 |
| **`SortableTableHead`** | Header **triable** (avec bouton et icône)     | Hérite de `TableHead`                       |
| **`TableHeadLabel`**    | Label de header **non-triable** (texte stylé) | `text-[11px] text-text-secondary uppercase` |

---

## 🔄 Type 1 : SortableTableHead (Headers Triables)

### Quand l'utiliser ?

Pour les colonnes que l'utilisateur peut **trier** en cliquant dessus.

### Emplacement du style mère

Le style est défini dans **2 endroits** :

1. **Variante Button** : [button.tsx](file:///home/yanis/liquidterminal_front/src/components/ui/button.tsx#L21)

    ```tsx
    tableHeaderSortable: "p-0 h-auto text-text-secondary hover:text-white hover:bg-transparent text-label text-[11px] gap-1.5 disabled:hover:text-text-secondary disabled:cursor-default";
    ```

2. **Classes CSS actives** : [globals.css](file:///home/yanis/liquidterminal_front/src/app/globals.css#L57)
    ```css
    .table-header-active-accent {
        @apply text-brand-accent;
    }
    .table-header-active-gold {
        @apply text-brand-gold;
    }
    ```

### Props disponibles

```tsx
interface SortableTableHeadProps {
    label: string; // Texte du header
    onClick?: () => void; // Callback de tri (si absent, pas d'icône)
    isActive?: boolean; // True si cette colonne est triée
    highlight?: "accent" | "gold"; // Couleur quand actif (défaut: 'accent')
    className?: string; // Classes additionnelles pour <th>
}
```

### Usage

```tsx
import { SortableTableHead } from "@/components/ui/table";

// Cas standard (Market - accent bleu)
<SortableTableHead
  label="Price"
  onClick={() => handleSort("price")}
  isActive={sortField === "price"}
  className="py-3 px-3 w-[15%]"
/>

// Dashboard (gold doré)
<SortableTableHead
  label="Name"
  onClick={() => handleSort("name")}
  isActive={activeSort === "name"}
  highlight="gold"
  className="pl-4 w-[35%]"
/>

// Header non-triable mais avec le même style
<SortableTableHead
  label="Supply"
  className="py-3 px-3"
/>
```

### Comment modifier le style ?

| Modification                                    | Où modifier                                         |
| ----------------------------------------------- | --------------------------------------------------- |
| Taille du texte, espacement, couleur par défaut | `button.tsx` → variante `tableHeaderSortable`       |
| Couleur quand actif (accent)                    | `globals.css` → `.table-header-active-accent`       |
| Couleur quand actif (gold)                      | `globals.css` → `.table-header-active-gold`         |
| Taille de l'icône                               | `table.tsx` → `<ArrowUpDown className="h-3 w-3" />` |

### Ajouter une nouvelle couleur d'highlight

1. Dans `globals.css`, ajouter :

    ```css
    .table-header-active-cyan {
        @apply text-cyan-400;
    }
    ```

2. Mettre à jour le type dans `table.tsx` :
    ```tsx
    highlight?: 'accent' | 'gold' | 'cyan';
    ```

---

## 📝 Type 2 : TableHeadLabel (Labels Non-Triables)

### Quand l'utiliser ?

Pour les headers de colonnes **statiques** (pas de tri possible).

### Emplacement du style mère

Le style est défini directement dans [table.tsx](file:///home/yanis/liquidterminal_front/src/components/ui/table.tsx#L85) :

```tsx
const TableHeadLabel = ({ children, align = "left", className }: TableHeadLabelProps) => (
    <span
        className={cn(
            "text-text-secondary font-semibold uppercase tracking-wider block w-full text-[11px]",
            align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
            className,
        )}
    >
        {children}
    </span>
);
```

### Props disponibles

```tsx
interface TableHeadLabelProps {
    children: React.ReactNode; // Contenu du header
    align?: "left" | "center" | "right"; // Alignement (défaut: 'left')
    className?: string; // Classes additionnelles
}
```

### Usage

```tsx
import { TableHead, TableHeadLabel } from "@/components/ui/table";

<TableHead className="py-3 px-4 w-[150px]">
  <TableHeadLabel>Value</TableHeadLabel>
</TableHead>

// Avec alignement à droite
<TableHead className="py-3 px-4">
  <TableHeadLabel align="right">Total</TableHeadLabel>
</TableHead>

// Avec classe custom
<TableHead className="py-3 px-4">
  <TableHeadLabel className="text-brand-accent">Special</TableHeadLabel>
</TableHead>
```

### Comment modifier le style ?

| Modification                       | Où modifier                                          |
| ---------------------------------- | ---------------------------------------------------- |
| Couleur, taille, font-weight, etc. | `table.tsx` → composant `TableHeadLabel`             |
| Classes de base                    | La ligne avec `text-text-secondary font-semibold...` |

---

## 📋 Récapitulatif

| Besoin                         | Composant à utiliser                                                        |
| ------------------------------ | --------------------------------------------------------------------------- |
| Header avec tri (icône ↕️)     | `<SortableTableHead>`                                                       |
| Header statique (texte simple) | `<TableHead><TableHeadLabel>`                                               |
| Header statique minimaliste    | `<TableHead>Texte</TableHead>` (utilise `text-table-header` de globals.css) |

---

## 🎨 Variables CSS liées

Dans [globals.css](file:///home/yanis/liquidterminal_front/src/app/globals.css) :

```css
/* Style de base pour <TableHead> */
.text-table-header {
    @apply text-label text-text-secondary text-[12px];
}

/* Style de base pour les labels */
.text-label {
    @apply text-[10px] font-semibold uppercase tracking-wider;
}

/* Couleurs d'état actif pour SortableTableHead */
.table-header-active-accent {
    @apply text-brand-accent;
}
.table-header-active-gold {
    @apply text-brand-gold;
}
```

---

## 🔧 Variables de Couleur

Les couleurs utilisées sont définies dans `tailwind.config.ts` :

| Variable              | Usage                            |
| --------------------- | -------------------------------- |
| `text-text-secondary` | Couleur par défaut des headers   |
| `text-brand-accent`   | Couleur active (sections Market) |
| `text-brand-gold`     | Couleur active (Dashboard)       |
| `hover:text-white`    | Couleur au hover                 |

---

## ✅ Fichiers Modifiés lors de la Centralisation

| Fichier                   | Avant                     | Après                          |
| ------------------------- | ------------------------- | ------------------------------ |
| `TokensTable.tsx`         | `TableHeaderCell` local   | `SortableTableHead`            |
| `UniversalTokenTable.tsx` | `TableHeaderCell` local   | `SortableTableHead`            |
| `PerpDexTable.tsx`        | `TableHeaderCell` local   | `SortableTableHead`            |
| `AuctionTable.tsx`        | `TableHeaderCell` local   | `SortableTableHead`            |
| `TrackerTableHeader.tsx`  | Style local               | Variante `tableHeaderSortable` |
| `DataTable.tsx`           | `TableHeaderButton` local | `TableHeadLabel`               |
| `TwapTable.tsx`           | `TableHeaderButton` local | `TableHeadLabel`               |
| `UserTwapTable.tsx`       | `TableHeaderButton` local | `TableHeadLabel`               |
