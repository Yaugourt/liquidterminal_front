# Rapport d'Audit : Dashboard & Architecture

## 🎨 UI Patterns Récurrents

Nom : **GlassPanel**
Type : UI
Snippet du code actuel :
```tsx
// Répété  dans page.tsx et StatsGrid.tsx pour les conteneurs
className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20"
```
Gain estimé : Élevé

Nom : **PillTabs**
Type : UI
Snippet du code actuel :
```tsx
// TrendingTokensTabs.tsx
<button className={`px-3 py-1.5 rounded-md ... ${active ? 'bg-[#83E9FF]' : 'text-zinc-400'}`}>
  {tab.label}
</button>
```
Gain estimé : Moyen

Nom : **DashboardLayoutWrapper** (ou PageBackground)
Type : UI
Snippet du code actuel :
```tsx
// page.tsx (root div)
<div className="min-h-screen bg-[#0B0E14] ... bg-[radial-gradient(...)] ...">
```
Gain estimé : Faible

---

## 🧠 Logique & Hooks

Nom : **useSidebarState**
Type : Hook
Snippet du code actuel :
```tsx
// page.tsx
const { width } = useWindowSize();
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
useEffect(() => { if (width >= 1024) setIsSidebarOpen(false); }, [width]);
```
Gain estimé : Moyen

Nom : **useMetricIcon** (ou fichier de config)
Type : Hook / Util
Snippet du code actuel :
```tsx
// StatsCard.tsx
const getIcon = () => {
  switch (title) {
    case "Users": return <Users ... />;
    // ...
  }
};
```
Gain estimé : Faible

---

## 💅 Styles & Tailwind

Nom : **card-glass**
Type : Class CSS / Tailwind Layer
Snippet du code actuel :
```tsx
bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20
```
Gain estimé : Élevé

Nom : **text-brand-gradient** (ou couleurs thématiques)
Type : Config Tailwind
Snippet du code actuel :
```tsx
// Couleurs hardcodées répétées
text-[#83e9ff]
bg-[#83e9ff]/10
```
Gain estimé : Moyen

---

## 💾 Structure des Données

Nom : **MetricType** (ou DashboardMetric)
Type : Type
Snippet du code actuel :
```tsx
// StatsGrid.tsx (et implicite dans StatsCard)
{ title: string; value: string; change?: number; }
```
Gain estimé : Faible

Nom : **TabOption**
Type : Type
Snippet du code actuel :
```tsx
// TrendingTokensTabs.tsx (implémenté inline)
{ key: "perp" | "spot" ..., label: string }
```
Gain estimé : Faible
