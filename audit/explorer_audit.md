# Rapport d'Audit Complet : Module Explorer

## 🎨 UI Patterns Récurrents & Duplication

Nom : **StatsDisplay** (ou `MetricCard`)
Type : UI Composite
Situation : 
- `ExplorerStatsCard` (Home) : Icône + Label + Valeur
- `ValidatorStatsCard` : Similaire mais grid différente
- `VaultStatsCard` : Variation mineure
Gain estimé : **Élevé**
*Action recommandée : Créer un composant `StatCard` générique acceptant `icon`, `label`, `value`, `subValue`.*

Nom : **PaginatedTableView**
Type : Layout Pattern
Situation : 
- Répété dans `TransfersDeployTable`, `ValidatorTable`, `VaultSection`
- Code copié-collé pour la pagination `Pagination` + `RowsPerPage` + `Tabs`
Gain estimé : **Élevé**
*Action recommandée : Créer un HOC ou un composant wrapper `<PaginatedView />` qui gère le state de pagination et l'affichage.*

Nom : **TabNavigation**
Type : UI
Situation :
- `TrendingTokensTabs` (Dashboard)
- `Explorer/Tabs`
- `ValidatorTabButtons`
Gain estimé : **Moyen**
*Action recommandée : Extraire un composant `PillTabs`.*

---

## 🧠 Logique & Hooks

Nom : **usePaginationState**
Type : Custom Hook
Snippet actuel (x5 fichiers) :
```tsx
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);
const handlePageChange = ...
```
Gain estimé : **Moyen**
*Action recommandée : Centraliser ce hook dans `@/hooks/usePagination`.*

Nom : **useTableSyncedUrl** (Optionnel)
Type : Hook
Situation : Les onglets et la pagination ne sont pas synchronisés avec l'URL, ce qui perd l'état au refresh.
Gain estimé : **Faible (UX bonus)**

Nom : **useWebSocketConnection**
Type : Hook (Service abstraction)
Situation : La logique de connexion/déconnexion Websocket avec timeout dans `RecentDataTable` est fragile et devrait être abstraite.
Gain estimé : **Élevé**

---

## 💅 Styles & Tailwind

Nom : **GlassContainer**
Type : Utility Class
Snippet :
```tsx
bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl
```
Gain estimé : **Élevé**
*Action recommandée : Ajouter une classe `.glass-panel` dans `globals.css` ou `tailwind.config`.*

Nom : **StatusBadge**
Type : Component
Snippet :
```tsx
bg-rose-500/10 text-rose-400 (Error) vs bg-[#83e9ff]/10 (Success/Info)
```
Gain estimé : **Faible**

---

## 💾 Structure des Données

Nom : **ExplorerTableProps**
Type : Interface
Action : Uniformiser les interfaces des props pour les tables afin de faciliter le polymorphisme.
