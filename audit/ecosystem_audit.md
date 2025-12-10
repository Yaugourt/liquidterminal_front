# Rapport d'Audit : Ecosystem (Projects & Public Goods)

## 🏗️ L1 Projects (`src/app/ecosystem/project`)

Nom : **ProjectsGrid**
Type : Bonnes Pratiques ✅
Situation :
- La page `project/page.tsx` est propre et délègue l'affichage à `<ProjectsGrid />`.
- Rien à signaler, c'est l'exemple à suivre.

---

## 🤝 Public Goods (`src/app/ecosystem/publicgoods`)

### 1. Duplication inter-pages (Listes)

**Fichiers concernés :**
- `src/app/ecosystem/publicgoods/page.tsx` (Main)
- `src/app/ecosystem/publicgoods/my-submissions/page.tsx`
- `src/app/ecosystem/publicgoods/pending/page.tsx`

**Problème :**
Ces trois pages partagent une structure quasi-identique (copier-coller) :
- **Logique de Recherche :** Filtrage côté client `filteredProjects` réimplémenté ou très similaire.
- **Grid UI :** Boucle `.map(project => <PublicGoodsCard ... />)` répétée 3 fois.
- **Loading & Empty States :** Conditionnelles pour `isLoading` et "No projects found" dupliquées.
- **Auth Checks :** Vérification `!user` et UI "Authentication Required" répétées.

**Opportunité (Gain Élevé) :**
- Créer un composant **`PublicGoodsList`** ou **`PublicGoodsTable`** (similaire à `TokenTable` ou `ProjectsGrid`) qui accepte une liste de `projects`, un `isLoading`, et un titre.
- Ce composant gérerait le loading state et l'affichage en grille.

### 2. Monolithe Page de Détail (`[id]/page.tsx`)

**Fichier :** `src/app/ecosystem/publicgoods/[id]/page.tsx` (~555 lignes)

**Problème :**
Le fichier contient toute la logique et le rendu de la page de détail :
- **Helpers Inline :** `getStatusColor`, `getStatusIcon` définis dans le composant.
- **Sections Hardcodées :** "Impact on HyperLiquid", "Team & Technical", "Support Requested" sont des blocks de JSX massifs dans le fichier principal.
- **Modales Multiples :** Gestion des états de 3 modales (Edit, Review, Delete) dans la page.

**Opportunité (Gain Moyen) :**
- Extraire les sections en composants : `ProjectHeader`, `ProjectImpactSection`, `ProjectTeamInfo`, `ProjectSidebar`.
- Déplacer `getStatusColor/Icon` vers un composant `ProjectStatusBadge` réutilisable.

---

## 📋 Plan d'Action Suggéré

1.  **Refactor Listes :**
    - Extraire la logique d'affichage de la grille et des états de chargement vers `src/components/ecosystem/publicgoods/PublicGoodsGrid.tsx`.
    - Utiliser ce composant dans les 3 pages de liste.

2.  **Refactor Détail :**
    - Découper `[id]/page.tsx` en sous-composants pour améliorer la lisibilité.

    - Centraliser la logique de statut (couleurs/icônes) qui est probablement utilisée dans les cartes (`PublicGoodsCard`) et la page de détail.

---

## ✅ État Actuel (Post-Refactor)

> Mise à jour du 09/12/2025

### 🚀 Améliorations Réalisées

1.  **Unification des Listes Public Goods**
    *   **Problème Résolu :** Duplication massive (loading, empty states, grid mapping) sur 3 pages (Main, My Submissions, Pending).
    *   **Solution :** Création de `src/components/ecosystem/publicgoods/PublicGoodsGrid.tsx`.
    *   **Gain :** Les pages de liste ne contiennent plus que la logique spécifique (filtrage des données) et délèguent tout l'affichage au Grid. Maintenance centralisée des états "vide" et "chargement".

2.  **Refactor Page Détail**
    *   **Problème Résolu :** Page `[id]/page.tsx` monolithique (>550 lignes).
    *   **Solution :** Découpage en composants fonctionnels :
        *   `ProjectHeader` : Titre, liens, bandeau.
        *   `ProjectContent` : Sections d'information (Impact, Tech, Support).
        *   `ProjectInfoSidebar` : Métadonnées, contacts et boutons d'action.
    *   **Gain :** Meilleure lisibilité et séparation des responsabilités.

3.  **Standardisation des Statuts**
    *   Création de `ProjectStatusBadge.tsx` pour gérer uniformément les couleurs et icônes des statuts (Approved, Pending, Rejected).

### 📝 Composants Clés (Post-Refactor)

*   `PublicGoodsGrid` : Wrapper générique pour listes de projets.
*   `ProjectStatusBadge` : Badge standardisé.
*   `ProjectHeader` / `Content` / `Sidebar` : Composants de détail.

### 🔍 Prochaines Étapes
*   Le pattern `PublicGoodsGrid` (avec empty/loading states intégrés) est excellent et pourrait inspirer une refonte de `ProjectsGrid` (L1 Projects) ou d'autres listes pour plus de cohérence.
