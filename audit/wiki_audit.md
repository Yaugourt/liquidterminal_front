# Rapport d'Audit : Wiki (Education) 📚

## État Général
Le module Wiki (`src/app/wiki`) est **bien structuré** et modulaire. Contrairement aux sections précédentes (Market, Ecosystem), il n'y a pas de duplication massive ni de fichiers monolithiques critiques.

## Structure Actuelle
- **Page Principale (`page.tsx`)** : Orchestre l'état global (catégories sélectionnées, recherche) et la mise en page. Propre.
- **Composants (`src/components/wiki`)** :
  - `EducationContent` : Affiche le contenu statique/éditorial.
  - `EducationSidebar` : Affiche les métadonnées HyperLiquid.
  - `CategoryFilter` : Gère le dropdown de filtres.
  - `ResourcesSection` : Affiche la grille de ressources dynamiques.

## Opportunités d'Amélioration

### 1. Logique Complexe dans `ResourcesSection`
**Fichier :** `src/components/wiki/ResourcesSection.tsx`
**Constat :** Ce composant fait beaucoup de choses :
- Récupération des données (`useEducationalResourcesByCategories`).
- Gestion de l'état local pour le "Show More/Less" (`expandedCategories`).
- Logique de filtrage "côté client" pour la recherche (`matchesSearch`).
- Gestion de la suppression optimiste (`handleDeleteResource`) avec synchronisation d'état local (`useEffect`).

**Proposition :**
Extraire toute cette logique "business" dans un hook personnalisé **`useWikiResources`**.
Cela rendrait `ResourcesSection` purement visuel (UI).

### 2. Gestion de l'État Optimiste
La synchronisation manuelle entre `serverResources` et `localResources` via `useEffect` est fonctionnelle mais peut être source de bugs subtils (race conditions).
Utiliser `tanstack-query` (si disponible, ou continuer avec le pattern actuel encapsulé) simplifierait cela, mais pour l'instant l'extraction dans un hook est un bon premier pas.

## Plan d'Action Recommandé

1.  **Créer le hook `useWikiResources` :**
    - Déplacer la logique de fetching, suppression optimiste et filtrage hors du composant UI.
    - Le hook retournerait : `{ categoriesWithResources, isLoading, deleteResource, loadMore, ... }`.

2.  **(Optionnel) Refactor Mineurs :**
    - `EducationModal` est bien isolé.
    - `CategoryFilter` est autonome.

## Conclusion
Le code est **sain**. Pas d'urgence critique.
Le refactoring proposé est de type "Qualité de Code" (Pureté des composants) plutôt que "Réparation" (Bug/Duplication).
