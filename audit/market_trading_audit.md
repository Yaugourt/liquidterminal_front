# Rapport d'Audit : Market Trading (Perp & Spot)

## 🎨 UI Patterns & Architecture Globales

Nom : **TradingPageLayout**
Type : Architecture UI
Situation :
- `Spot/[token]/page.tsx` possède un layout complexe (Grid 12 cols) avec Chart, OrderBook et Sidebar.
- `Perp/[token]/page.tsx` est actuellement un "mockup" avec des données hardcodées mais devrait idéalement refléter la même structure que Spot.
Gain estimé : **Critique**
*Action recommandée : Extraire le layout de la page Spot vers un composant `TradingLayout` utilisable par les deux marchés.*

Nom : **TradingViewChart** & **OrderBook**
Type : Composants Métier
Situation :
- Déjà existants dans `@/components/market/token`.
- Ils sont génériques (`symbol`, `marketIndex`) et prêts à être utilisés pour le Perp (actuellement absents du code Perp).
Gain estimé : **Élevé** (Pour la feature Perp)

Nom : **TokenHeaderCard**
Type : UI
Situation :
- `TokenCard` utilisé dans Spot.
- Perp utilise une version hardcodée en ligne ("General Information").
Gain estimé : **Moyen**

---

## 🧠 Logique & Data Fetching

Nom : **useTokenData** Abstraction
Type : Hook Pattern
Situation :
- Spot utilise `getToken`, `useTokenDetails`, `useTokenHolders`.
- Perp utilise un `setTimeout` mocké.
- Besoin d'harmoniser l'accès aux données pour que le `TradingLayout` puisse recevoir des données uniformes.
Gain estimé : **Élevé**
*Action recommandée : Créer une interface `MarketTokenData` commune.*

Nom : **WebSocketAbstraction**
Type : Architecture Service
Situation :
- `OrderBook.tsx` utilise `useTokenWebSocket` (basé sur `marketIndex`).
- Il faudra s'assurer que le service WebSocket gère aussi les paires Perp (souvent des IDs différents).
Gain estimé : **Moyen**

## 💅 Styles & Tailwind

Nom : **Grid Layouts Complexes**
Type : CSS / Tailwind
Situation :
- La grille `grid-cols-1 xl:grid-cols-12` est définie manuellement dans la page. C'est le candidat principal pour l'extraction dans le `TradingLayout`.
- Les cartes "Glass" (`bg-[#151A25]/60 ...`) sont omniprésentes (encore !).

---

## 📋 Plan d'Action Suggéré

1. **Promouvoir le Layout Spot** : Extraire la structure de `src/app/market/spot/[token]/page.tsx` vers un composant générique.
2. **Standardiser les Composants** : Remplacer les cartes "General Info" de Perp par le composant `TokenCard` existant.
3. **Connecter Perp** : Brancher `TradingViewChart` et `OrderBook` sur la page Perp (en vérifiant le support API).

---

## ✅ État Actuel (Post-Refactor)

> Mise à jour du 09/12/2025

### 🚀 Améliorations Réalisées

1.  **TradingLayout Standardisé** `src/components/market/layout/TradingLayout.tsx`
    *   **Problème Résolu :** Duplication du layout complexe et incohérence entre Spot et Perp.
    *   **Solution :** Création d'un composant de layout unique qui gère la grille 12 colonnes, le header, la sidebar responsive et les slots pour Chart, OrderBook, etc.
    *   **Gain :**
        *   `spot/[token]/page.tsx` nettoyé (~300 lignes → ~180 lignes).
        *   `perp/[token]/page.tsx` transformé de "mockup" en vraie page de trading fonctionnelle utilisant le même layout.

2.  **Architecture Unifiée**
    *   Les deux pages utilisent désormais strictement la même structure visuelle.
    *   Intégration réussie de `TradingViewChart` et `OrderBook` sur le Perp.

### 📝 Composants Clés (Post-Refactor)

*   `TradingLayout` : Composant structurel parent.
*   `TokenTable` : Utilisé pour les listes de marchés.
*   `OrderBook` : Partagé (avec abstraction ws).
*   `TradingViewChart` : Partagé.

### 🔍 Prochaines Étapes (Futures Opportunités)
*   Extraire une abstraction `useMarketData` qui unifie vraiment `useTokenDetails` (Spot) et les données Perp.
*   Généraliser le sélecteur de paires.
