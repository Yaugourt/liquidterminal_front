---
description: Réduire le nombre de directives "use client" dans l'application Next.js
---

# Workflow : Réduction des Client Components

## Objectif

Minimiser le JavaScript côté client en convertissant les composants vers Server Components quand possible.

---

## Phase 1 : Audit Initial

### 1.1 Compter les directives actuelles

```bash
// turbo
grep -r '"use client"' src/components src/app --include="*.tsx" | wc -l
```

### 1.2 Lister tous les fichiers avec "use client"

```bash
// turbo
grep -rl '"use client"' src/components src/app --include="*.tsx" | head -50
```

### 1.3 Analyser les raisons du "use client"

Pour chaque fichier, identifier pourquoi il est client :

| Raison                   | Peut être converti ?             |
| ------------------------ | -------------------------------- |
| `useState`               | ⚠️ Parfois (URL state avec nuqs) |
| `useEffect`              | ❌ Non                           |
| `onClick/onChange`       | ❌ Non                           |
| `useContext`             | ❌ Non                           |
| Hooks custom (`useXxx`)  | ❌ Non                           |
| Juste des imports client | ✅ Oui (Islands)                 |

---

## Phase 2 : URL State avec nuqs

### 2.1 Installer nuqs

```bash
npm install nuqs
```

### 2.2 Configurer le provider

Dans `src/components/Providers.tsx` :

```tsx
import { NuqsAdapter } from "nuqs/adapters/next/app";

// Wrapper autour de l'app
<NuqsAdapter>{children}</NuqsAdapter>;
```

### 2.3 Identifier les candidats

Chercher les composants avec useState pour :

-   Filtres (tabs, toggles)
-   Période sélectionnée
-   Pagination
-   Tri de tableaux

```bash
// turbo
grep -rn "useState.*filter\|useState.*tab\|useState.*period\|useState.*page" src/components --include="*.tsx"
```

### 2.4 Migrer un composant

**Avant :**

```tsx
const [filter, setFilter] = useState<FilterType>("default");
```

**Après :**

```tsx
import { useQueryState, parseAsStringLiteral } from "nuqs";

const OPTIONS = ["option1", "option2", "option3"] as const;
const [filter, setFilter] = useQueryState("filter", parseAsStringLiteral(OPTIONS).withDefault("option1"));
```

### 2.5 Ajouter Suspense boundary

Dans la page parente :

```tsx
import { Suspense } from "react";

<Suspense fallback={<LoadingFallback />}>
    <ComponentWithNuqs />
</Suspense>;
```

> ⚠️ **Important** : Sans Suspense, le build échouera avec l'erreur `useSearchParams() should be wrapped in a suspense boundary`

---

## Phase 3 : Islands Architecture (Splitting)

### 3.1 Identifier les composants mixtes

Composants qui ont :

-   Partie statique (titre, layout)
-   Partie interactive (boutons, inputs)

### 3.2 Pattern de splitting

**Avant :** Un seul composant client

```tsx
"use client";
export function Card({ data }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div>
            <h2>{data.title}</h2> {/* Statique */}
            <p>{data.description}</p> {/* Statique */}
            <button onClick={() => setIsOpen(!isOpen)}>Toggle</button> {/* Client */}
        </div>
    );
}
```

**Après :** Server Component + Island

```tsx
// CardContent.tsx (Server Component - pas de "use client")
export function CardContent({ data }) {
    return (
        <>
            <h2>{data.title}</h2>
            <p>{data.description}</p>
        </>
    );
}

// CardToggle.tsx (Client Component)
("use client");
export function CardToggle() {
    const [isOpen, setIsOpen] = useState(false);
    return <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>;
}

// Card.tsx (Server Component - composition)
import { CardContent } from "./CardContent";
import { CardToggle } from "./CardToggle";

export function Card({ data }) {
    return (
        <div>
            <CardContent data={data} />
            <CardToggle />
        </div>
    );
}
```

---

## Phase 4 : Vérification

### 4.1 Build de test

```bash
// turbo
npm run build
```

### 4.2 Recompter les directives

```bash
// turbo
grep -r '"use client"' src/components src/app --include="*.tsx" | wc -l
```

### 4.3 Comparer le bundle size

Avant/après dans le output du build :

```
+ First Load JS shared by all    XXX kB
```

---

## Patterns NON recommandés

### Server Actions pour formulaires existants

❌ Si les formulaires utilisent déjà des hooks custom (`useWallets`, `useReportResource`), ne pas migrer vers Server Actions - le gain est minimal et le refactoring majeur.

### URL state pour composants sans Suspense

❌ L'adoption de nuqs nécessite un Suspense wrapper dans chaque page parente. Évaluer le coût avant de migrer massivement.

---

## Checklist finale

-   [ ] Audit initial terminé
-   [ ] nuqs configuré (NuqsAdapter)
-   [ ] Composants avec filtres/tabs migrés vers URL state
-   [ ] Suspense boundaries ajoutés
-   [ ] Composants splittés (Islands) si applicable
-   [ ] Build passe sans erreur
-   [ ] Bundle size comparé

---

## Références

-   [nuqs Documentation](https://nuqs.47ng.com/)
-   [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
-   [Islands Architecture](https://www.patterns.dev/posts/islands-architecture)
