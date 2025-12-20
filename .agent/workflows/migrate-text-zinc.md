---
description: Migrer text-zinc-* vers design tokens (R12)
---

# Migration text-zinc-* → Design Tokens

## Contexte
Le projet utilise des couleurs Tailwind hardcodées (`text-zinc-*`) au lieu des tokens du design system.

## Règles de remplacement

| Pattern | Token |
|---------|-------|
| `text-zinc-400` | `text-text-secondary` |
| `text-zinc-500` | `text-text-muted` |
| `text-zinc-600` | `text-text-muted` |
| `text-zinc-300` | `text-white/80` |

## Procédure

1. Lister les fichiers affectés :
```bash
grep -r "text-zinc-" src/components --include="*.tsx" -l | wc -l
```

2. Traiter par dossier (priorité) :
   - `src/components/explorer/` (61 fichiers)
   - `src/components/market/` (65 fichiers)
   - `src/components/wiki/` (23 fichiers)
   - `src/components/ecosystem/` (29 fichiers)

3. Pour chaque fichier, remplacer les occurrences selon les règles ci-dessus.

// turbo
4. Vérifier le build après chaque batch de 5-10 fichiers :
```bash
npm run build 2>&1 | tail -5
```

## Notes
- Ne pas toucher aux couleurs dans les contextes spécifiques (hover states avec zinc-300 par exemple)
- Le texte placeholder utilise `placeholder:text-text-muted`
- Vérifier visuellement si possible après migration
