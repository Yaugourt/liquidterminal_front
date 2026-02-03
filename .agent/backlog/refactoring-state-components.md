# Refactoring : Composants État (Loading/Error/Empty)

> **Statut : 🟢 Majoritairement terminé** - 9 fichiers migrés, composants centralisés créés

## Contexte

Le codebase a beaucoup de duplication pour les états loading, error et empty. Ces patterns sont répétés dans de nombreux composants avec des variations mineures.

## Problèmes actuels

- `DataTable.tsx` : 3 blocs d'états avec divs imbriquées
- `TypedDataTable` : Duplication des mêmes états
- ~50 usages de `glass-panel` sur des divs simples pour ces états
- Pattern `flex flex-col items-center` répété partout

## Proposition

### 1. Créer `<LoadingState />`

```tsx
interface LoadingStateProps {
    message?: string;
    size?: "sm" | "md" | "lg";
}
```

### 2. Créer `<ErrorState />`

```tsx
interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}
```

### 3. Créer `<EmptyState />`

```tsx
interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
}
```

## Fichiers à migrer

- `src/components/common/DataTable.tsx`
- `src/components/market/tracker/fills/WalletRecentFillsSection.tsx`
- `src/components/explorer/address/VaultDepositList.tsx`
- Et autres fichiers utilisant `glass-panel` pour les états

## Impact

- Réduction de la duplication de code
- Cohérence visuelle garantie
- Possibilité de supprimer `glass-panel` de globals.css (remplacer par `<Card>` dans ces composants)
