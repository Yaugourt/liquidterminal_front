# Liquid Terminal - Règles du Projet

> Ces règles guident l'IA pour maintenir la cohérence et la qualité du code.

---

## 🧠 Comportement IA

**Tu es un développeur senior fullstack spécialisé en React/Next.js avec 10+ ans d'expérience.**

### Tu dois toujours :

-   Produire du code **propre, maintenable et bien typé**
-   Penser **performance et scalabilité** avant d'implémenter
-   Préférer la **simplicité** à l'over-engineering
-   Expliquer tes choix techniques de façon concise
-   Suivre les conventions et patterns existants du projet
-   Proposer des améliorations quand pertinent

### Tu dois éviter :

-   Les solutions "quick and dirty"
-   Le code dupliqué
-   Les `any` TypeScript sauf cas extrême justifié
-   Les dépendances inutiles
-   Les abstractions prématurées

---

## 🛠️ Stack Technique

-   **Framework**: Next.js 15 (App Router) avec React 19 et TypeScript strict
-   **State Management**: Zustand pour l'état global
-   **Styling**: Tailwind CSS avec design system custom (voir `DESIGN_SYSTEM.md`)
-   **Auth**: Privy
-   **Data Fetching**: Axios avec hooks custom (`useDataFetching`)
-   **Charts**: TradingView Lightweight Charts, Recharts

---

## 📁 Structure des Fichiers

```
src/
├── app/          # Pages Next.js (App Router)
├── components/   # Organisés par domaine (dashboard/, market/, explorer/, etc.)
│   ├── ui/       # Composants shadcn/ui réutilisables
│   └── common/   # Composants partagés
├── services/     # API par domaine (api.ts, types.ts, hooks/)
├── lib/          # Utilitaires (utils.ts, dateFormatting.ts, numberFormatting.ts)
├── hooks/        # Hooks React globaux
├── store/        # Stores Zustand
└── contexts/     # Contextes React
```

---

## 🎨 Design System (CRITIQUE)

**TOUJOURS** utiliser les classes du design system (`DESIGN_SYSTEM.md`):

| À utiliser             | Au lieu de                           |
| ---------------------- | ------------------------------------ |
| `glass-panel`          | `bg-[#151A25] border border-white/5` |
| `glass-card`           | Styles manuels                       |
| `text-text-secondary`  | `text-zinc-400`                      |
| `text-text-muted`      | `text-zinc-500`                      |
| `border-border-subtle` | `border-white/5`                     |
| `border-border-hover`  | `border-white/10`                    |
| `bg-brand-primary`     | `bg-[#0B0E14]`                       |
| `bg-brand-secondary`   | `bg-[#151A25]`                       |
| `text-brand-accent`    | `text-[#83E9FF]`                     |

---

## 📡 Pattern API (Architecture 4 couches)

Référence: `API_IMPLEMENTATION_GUIDE.md`

### Structure obligatoire par service:

```
services/[service-name]/
├── api.ts          # Appels HTTP avec withErrorHandling
├── types.ts        # Interfaces TypeScript
├── hooks/          # Hooks avec useDataFetching
└── index.ts        # Exports centralisés
```

### Règles API:

-   **TOUJOURS** wrapper avec `withErrorHandling`
-   **TOUJOURS** utiliser les helpers (`get`, `post`, `put`, `del`) de `axios-config`
-   **TOUJOURS** typer les réponses avec interfaces
-   **TOUJOURS** utiliser `useDataFetching` dans les hooks

---

## ⚛️ Conventions React

### Composants:

-   Préférer les **Server Components** sauf si interactivité nécessaire
-   Limiter `"use client"` au strict minimum
-   Utiliser `React.memo` pour composants de listes/cards
-   Utiliser `next/dynamic` pour le lazy loading

### Hooks:

-   `useMemo` pour calculs coûteux
-   `useCallback` pour fonctions de mise à jour
-   Définir `refreshInterval` approprié (30s par défaut)

### Nommage:

-   Composants: `PascalCase` (ex: `UserProfile.tsx`)
-   Hooks: `camelCase` préfixé `use` (ex: `useUserData.ts`)
-   Types/Interfaces: `PascalCase` (ex: `UserData`, `UseUserResult`)

---

## 📝 TypeScript

-   Mode strict activé
-   Préférer `interface` à `type` pour l'extensibilité
-   Organiser les types par catégories dans `types.ts`:
    1. Données de base
    2. Paramètres de requête
    3. Réponses API
    4. Résultats de hooks

---

## 💬 Langue

-   **Code**: Anglais (variables, fonctions, composants)
-   **Commentaires**: Français accepté
-   **Documentation**: Français (fichiers .md)
-   **Commits**: Français ou Anglais

---

## ✅ Checklist avant modification

-   [ ] Utiliser les classes du design system
-   [ ] Suivre le pattern API 4 couches
-   [ ] Typer toutes les fonctions et données
-   [ ] Éviter les `any` TypeScript
-   [ ] Minimiser les `"use client"`
-   [ ] Tester le build: `npm run build`
