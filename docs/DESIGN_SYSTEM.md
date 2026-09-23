# Design System — index

> Ce fichier est un **index court**. La charte active et complète est à la racine :
> [`../DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md). Ne pas dupliquer ici les valeurs de tokens.

## Où trouver quoi

| Besoin | Source |
|---|---|
| Charte active (tokens, anatomie, variantes, composition) | [`../DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md) |
| API des primitives (imports, props, exemples) | [`design-system/primitives.md`](./design-system/primitives.md) |
| Valeurs réellement consommées (couleurs, surfaces) | `src/app/globals.css` |
| Utilitaires Tailwind, échelle de type, breakpoints | `tailwind.config.ts` |
| Chargement des polices (Inter UI + JetBrains Mono chiffres) | `src/app/layout.tsx` |
| Palette des graphiques | `src/components/common/charts/chartTheme.ts` |
| Rationnel historique daté (non actif) | [`DESIGN_SYSTEM_V4.md`](./DESIGN_SYSTEM_V4.md) |

## Règles d'or (résumé)

1. Composer les primitives de `@/components/common` — ne jamais réimplémenter une composition à la main.
2. Jamais de hex en dur : tokens uniquement (exception `chartTheme.ts`). Interdit par ESLint.
3. Tout chiffre en mono (`Column.type`, `<Num>`, ou la classe `.mono`).
4. Pas de largeur fixe sur les primitives : elles remplissent l'espace du parent.
5. Importer depuis le barrel `@/components/common`, pas les fichiers internes.

Le détail de chaque règle, les paddings, tailles et l'inventaire complet sont dans la charte racine.
