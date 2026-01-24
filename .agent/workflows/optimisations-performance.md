---
description: Optimisations à réappliquer après annulation des changements public/privé
---

# Workflow : Réappliquer les optimisations de performance

Après avoir annulé les modifications de séparation public/privé avec `git checkout`, suivre ces étapes pour réappliquer les optimisations utiles.

## 1. Lazy loading de la Sidebar

Dans `src/components/Providers.tsx`, remplacer l'import direct de la Sidebar par un import dynamique :

```tsx
// Avant
import { Sidebar } from "@/components/Sidebar";

// Après
import dynamic from "next/dynamic";

const Sidebar = dynamic(
  () => import("@/components/Sidebar").then(mod => ({ default: mod.Sidebar })),
  { ssr: false }
);
```

**Bénéfice** : La Sidebar (22KB) se charge après le HTML initial.

---

## 2. ISR (Incremental Static Regeneration) sur les pages de données

Pour les pages qui affichent des données qui ne changent pas à chaque seconde, ajouter ISR :

```tsx
// Dans le composant serveur ou generateMetadata
export const revalidate = 60; // Regénère toutes les 60 secondes
```

**Pages recommandées** :
- `/dashboard` - `revalidate = 60`
- `/explorer` - `revalidate = 60`
- `/market/spot`, `/market/perp` - `revalidate = 60`
- `/wiki` - `revalidate = 300`

---

## 3. Lazy loading des composants lourds

### Charts et graphiques
```tsx
const PerformanceChart = dynamic(
  () => import("@/components/charts/PerformanceChart"),
  { loading: () => <div className="h-80 animate-pulse bg-brand-secondary/60 rounded-2xl" /> }
);
```

### Tables avec beaucoup de données
```tsx
const DataTable = dynamic(() => import("@/components/DataTable"), {
  loading: () => <TableSkeleton />
});
```

### Composants qui utilisent des librairies lourdes
```tsx
// Exemple: composants avec recharts, apex-charts, etc.
const HeavyChart = dynamic(() => import("@/components/HeavyChart"), { ssr: false });
```

---

## 4. Optimisation des images

Utiliser `next/image` avec les bonnes propriétés :

```tsx
<Image
  src={imageUrl}
  alt="description"
  width={400}
  height={300}
  loading="lazy"           // Chargement différé
  placeholder="blur"        // Placeholder flou (si blurDataURL fourni)
  priority={false}          // true seulement pour images above-the-fold
/>
```

---

## 5. Prefetching intelligent

Pour les liens fréquemment utilisés :

```tsx
<Link href="/dashboard" prefetch={true}>Dashboard</Link>  // Prefetch activé
<Link href="/settings" prefetch={false}>Settings</Link>   // Pas de prefetch (rarement utilisé)
```

---

## 6. React.memo pour les composants qui se re-rendent souvent

Envelopper les composants qui reçoivent les mêmes props mais se re-rendent :

```tsx
import { memo } from 'react';

// Avant
export function TokenRow({ token, price }: Props) { ... }

// Après
export const TokenRow = memo(function TokenRow({ token, price }: Props) {
  ...
});
```

**Composants candidats** :
- Lignes de tableaux (`TokenRow`, `WalletRow`, etc.)
- Cartes répétées dans des listes
- Composants dans des boucles `.map()`

---

## 7. useMemo pour les calculs coûteux

```tsx
// Avant - recalculé à chaque render
const sortedData = data.sort((a, b) => b.value - a.value);

// Après - recalculé seulement si data change
const sortedData = useMemo(() => {
  return data.sort((a, b) => b.value - a.value);
}, [data]);
```

**Cas d'usage** :
- Tri de grandes listes
- Filtrage de données
- Calculs de totaux/moyennes

---

## 8. useCallback pour les fonctions passées en props

```tsx
// Avant - nouvelle fonction à chaque render
<Button onClick={() => handleClick(id)}>Click</Button>

// Après - fonction mémorisée
const handleButtonClick = useCallback(() => {
  handleClick(id);
}, [id]);

<Button onClick={handleButtonClick}>Click</Button>
```

---

## 9. Optimisations diverses

### Éviter les re-renders inutiles avec des clés stables
```tsx
// Mauvais - nouvelle clé si l'index change
{items.map((item, index) => <Item key={index} />)}

// Bon - clé basée sur l'ID unique
{items.map(item => <Item key={item.id} />)}
```

### Debounce pour les inputs de recherche
```tsx
import { useDebouncedValue } from '@/hooks/use-debounced-value';

const [search, setSearch] = useState('');
const debouncedSearch = useDebouncedValue(search, 300);

// Utiliser debouncedSearch pour les requêtes API
```

### Virtualization pour les longues listes
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

// Pour les listes de 100+ items
```

---

## Vérification

Après avoir appliqué les optimisations, vérifier :

// turbo
1. `npm run build` - Vérifier que le build passe

2. Ouvrir Chrome DevTools > Network > Désactiver le cache et vérifier :
   - Le temps de First Contentful Paint (FCP)
   - La taille du bundle JavaScript initial

3. Lighthouse : viser un score Performance > 80

4. React DevTools > Profiler pour identifier les re-renders excessifs
