# Rapport d'Audit : Market Analytics (Tracker & PerpDex)

## 📊 Tracker (`src/app/market/tracker`)

Nom : **WalletTabs** & **WalletAssetsNavigation**
Type : Navigation UI
Situation :
- Utilise un style "Pill Tabs" similaire à `TrendingTokensTabs` (Dashboard) et `TokenTable` (Spot).
- Opportunité de créer un composant `SegmentedControl` ou `PillTabs` générique.
Gain estimé : **Moyen**

Nom : **Tableaux de Données** (`AssetsSection`, `WalletOrdersSection`)
Type : Composants Métier
Situation :
- Utilisation probable de patterns de tableau répétés.
- À standardiser avec le `TokenTable` (qui est propre maintenant) ou une abstraction `DataTable` générique.

---

## 📈 PerpDex (`src/app/market/perpdex`)

Nom : **PerpDexDetailTable** (Inline)
Type : Refactoring Critique
Situation :
- **Fichier :** `src/app/market/perpdex/[dex]/page.tsx` (Lignes 448-580)
- Une table complète est définie *en dur* à l'intérieur de la page.
- Elle gère l'affichage des marchés (Prix, 24h, Volume, OI, Funding).
- **Problème :** Rend le fichier page.tsx énorme (600 lignes) et duplique la logique de tableau.
Gain estimé : **Élevé**
*Action recommandée : Extraire vers `src/components/market/perpDex/PerpDexMarketsTable.tsx`.*

Nom : **Stats Grid Patterns**
Type : UI Pattern
Situation :
- `src/app/market/perpdex/[dex]/page.tsx` réimplémente manuellement une grille de stats (Volume, OI, Funding...) avec le style "Glass Card".
- C'est exactement le même pattern que `StatsGrid` (Dashboard) ou `GlobalStatsCard` (Market).
Gain estimé : **Moyen**

Nom : **Logic Helpers** (`renderAddressLink`, `AssetLogo`)
Type : Utils / UI
Situation :
- `renderAddressLink` : Duplique la logique d'affichage d'adresse tronquée + lien Explorer + Copy. Devrait être un composant atomique `AddressDisplay`.
- `AssetLogo` : Composant défini dans le fichier page.tsx. À extraire.

---

## 📋 Plan d'Action Suggéré

1.  **Nettoyage PerpDex Detail** :
    - Extraire `PerpDexMarketsTable`.
    - Extraire les helpers (`AssetLogo`, `AddressDisplay`) vers `@/components/common`.
2.  **Standardisation UI** :
    - Vérifier si les "Stats Cards" peuvent utiliser un composant `StatsCard` générique (existant dans Dashboard/Explorer).

Le code du Tracker semble plus modulaire (`components/market/tracker` est bien fourni), l'effort principal doit se porter sur la page de détail PerpDex qui est monolithique.

---

## ✅ État Actuel (Post-Refactor)

> Mise à jour du 09/12/2025

### 🚀 Améliorations Réalisées

1.  **Refactor Page Détail PerpDex**
    *   **Problème Résolu :** `perpdex/[dex]/page.tsx` était monolithique (>600 lignes) avec des tables définies inline.
    *   **Solution :**
        *   Extraction de `src/components/market/perpDex/PerpDexMarketsTable.tsx` : Gère toute la logique du tableau des marchés.
        *   Extraction de `AssetLogo` et `AddressDisplay` vers `src/components/common`.
    *   **Gain :** Fichier de page réduit de ~300 lignes, logique de tableau réutilisable.

2.  **Nouveaux Composants Partagés (`src/components/common`)**
    *   `AddressDisplay.tsx` : Gère l'affichage tronqué, le lien explorer et la copie (remplace de multiples duplications inline).
    *   `AssetLogo.tsx` : Standardise l'affichage des icônes d'actifs.

### 📝 Composants Clés (Post-Refactor)

*   `PerpDexMarketsTable` : Tableau spécifique aux DEX perpétuels.
*   `AddressDisplay` : Utilitaire UI atomique (très réutilisable ailleurs).
*   `AssetLogo` : Utilitaire UI atomique.

### 🔍 Prochaines Étapes
*   Vérifier si `AddressDisplay` peut remplacer d'autres implémentations similaires dans `Explorer` ou `Dashboard`.
