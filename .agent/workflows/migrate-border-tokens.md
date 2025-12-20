---
description: Migrer border-white/* vers design tokens (R14)
---

# Migration border-white/* → Design Tokens

## Contexte
Le projet utilise des bordures avec opacité hardcodée (`border-white/*`) au lieu des tokens du design system.

## Règles de remplacement

| Pattern | Token |
|---------|-------|
| `border-white/5` | `border-border-subtle` |
| `border-white/10` | `border-border-hover` |
| `border-white/20` | Garder (hover states) |

## Procédure

1. Compter les occurrences :
```bash
grep -r "border-white/" src/components --include="*.tsx" | wc -l
```

2. Lister les fichiers :
```bash
grep -r "border-white/" src/components --include="*.tsx" -l
```

3. Pour chaque fichier, remplacer les occurrences selon les règles ci-dessus.
   - Attention aux cas `hover:border-white/20` → laisser tel quel

// turbo
4. Vérifier le build :
```bash
npm run build 2>&1 | tail -5
```

## Notes
- `border-white/5` est le plus fréquent (bordures subtiles)
- `border-white/10` est utilisé pour les hover states et les séparateurs
- `border-white/20` peut être gardé pour les états actifs
