# Refactoring : Migration glass-panel vers Card

## Contexte

Après l'intégration du style glass dans le composant `Card`, il reste ~50 usages de `<div className="glass-panel">` dans le codebase.

## Objectif

Migrer tous les usages de `glass-panel` vers le composant `<Card>` pour :

- Supprimer la classe CSS `glass-panel` de globals.css
- Avoir une seule source de vérité pour le style glass
- Améliorer la cohérence du code

## Usages actuels

### États loading/error/empty (~20 usages)

- `DataTable.tsx` - États de la table
- `WalletRecentFillsSection.tsx` - États du composant
- `VaultDepositList.tsx` - États du composant
  → Dépend du chantier "Composants État"

### Conteneurs de page (~15 usages)

- `dashboard/page.tsx` - Sections
- `explorer/page.tsx` - Conteneurs
- `validator/page.tsx` - Conteneurs
- `liquidations/page.tsx` - Conteneurs
- `vaults/page.tsx` - Conteneurs
  → Remplacer `<div className="glass-panel">` par `<Card>`

### Conteneurs spécifiques (~15 usages)

- `StatsCard.tsx` - Wrapper
- `StatsGrid.tsx` - État d'erreur
- `UserManagement.tsx` - Sections
- `ProjectInfoSidebar.tsx` - Sections
- `PublicGoodsGrid.tsx` - État vide

## Ordre recommandé

1. D'abord le chantier "Composants État"
2. Puis migration des conteneurs de page
3. Enfin les conteneurs spécifiques
