# Refactoring : Simplification des Divs Imbriquées

## Contexte

Le codebase contient de nombreuses structures avec des divs imbriquées inutiles qui pourraient être simplifiées.

## Exemples problématiques

### DataTable.tsx

```tsx
// Avant - 2 niveaux de divs
<div className="flex justify-center items-center h-[300px] w-full glass-panel">
    <div className="flex flex-col items-center">
        <Loader2 ... />
        <span>Loading...</span>
    </div>
</div>

// Après - 1 seul niveau
<Card className="flex flex-col items-center justify-center h-[300px]">
    <Loader2 ... />
    <span>Loading...</span>
</Card>
```

## Patterns à corriger

### 1. Wrapper + Centrage

```tsx
// Mauvais
<div className="wrapper"><div className="flex items-center">...</div></div>

// Bon
<div className="wrapper flex items-center">...</div>
```

### 2. Container + Content

```tsx
// Mauvais
<div className="glass-panel"><div className="p-6">...</div></div>

// Bon
<Card className="p-6">...</Card>
```

## Fichiers prioritaires

- `src/components/common/DataTable.tsx`
- `src/components/market/token/*.tsx`
- `src/components/explorer/address/*.tsx`

## Bénéfices

- DOM plus léger
- CSS plus simple
- Meilleure lisibilité du code
- Moins de nesting = moins de complexité
