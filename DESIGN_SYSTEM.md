# Liquid Terminal - Design System V2

> **Ce document est destiné à guider l'IA lors de la modification des pages du site pour uniformiser le design.**

## 🎨 Palette de Couleurs

### Couleurs Principales
| Variable | Valeur | Usage |
|----------|--------|-------|
| `#0B0E14` | Background principal | Body, main containers |
| `#151A25` | Cards/Sections | Avec `/60` pour transparence |
| `#051728` | Sidebar, Header elements | Background secondaire |
| `#0A0D12` | Tabs container | Pills background |

### Couleurs Accent
| Variable | Valeur | Usage |
|----------|--------|-------|
| `#83E9FF` | Cyan principal | Accent, active states, hover, icons |
| `#f9e370` | Gold/Jaune | Secondary accent, admin, warnings |
| `#00ff88` | Vert | Success, positive values |
| `emerald-400/500` | Vert | Buy actions, progression |
| `rose-400/500` | Rouge | Sell actions, errors, negative values |

### Opacités Standards
```
/5   → borders subtils (border-white/5)
/10  → backgrounds légers hover (bg-white/10, bg-[#83e9ff]/10)
/20  → backgrounds accentués
/60  → cards transparentes (bg-[#151A25]/60)
/80  → header backdrop (bg-[#0B0E14]/80)
```

---

## 📐 Structure de Page Standard

```tsx
<div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
  {/* Mobile menu button - fixed position */}
  <div className="fixed top-4 left-4 z-50 lg:hidden">
    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
      <Menu className="h-6 w-6" />
    </Button>
  </div>
  
  <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
  
  <div className="">
    {/* Header avec glass effect */}
    <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
      <Header customTitle="Page Title" showFees={true} />
    </div>
    
    {/* SearchBar mobile */}
    <div className="p-2 lg:hidden">
      <SearchBar placeholder="Search..." />
    </div>

    {/* Contenu principal */}
    <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
      {/* Sections ici */}
    </main>
  </div>
</div>
```

---

## 🃏 Cards & Containers

### Card Standard (glassmorphism)
```tsx
<div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
  {/* Contenu */}
</div>
```

### Card avec padding
```tsx
<div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all shadow-xl shadow-black/20 group">
  {/* Contenu */}
</div>
```

### Stats Card Pattern
```tsx
<div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all shadow-xl shadow-black/20 group">
  <div className="flex items-center gap-3 mb-2">
    <div className="w-8 h-8 rounded-xl bg-[#83e9ff]/10 flex items-center justify-center transition-transform group-hover:scale-110">
      <IconComponent size={16} className="text-[#83e9ff]" />
    </div>
    <h3 className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">{title}</h3>
  </div>
  <span className="text-xl text-white font-bold tracking-tight">{value}</span>
</div>
```

---

## 🔘 Tabs System (Pills Style)

### Container des Tabs
```tsx
<div className="flex items-center gap-2 p-4 border-b border-white/5">
  <div className="flex bg-[#0A0D12] rounded-lg p-1 border border-white/5">
    {tabs.map(tab => (
      <button
        key={tab.key}
        onClick={() => setActiveTab(tab.key)}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
          activeTab === tab.key
            ? 'bg-[#83E9FF] text-[#051728] shadow-sm font-bold'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
</div>
```

### Tab Active State
- Background: `bg-[#83E9FF]`
- Text: `text-[#051728]`
- Font: `font-bold`
- Shadow: `shadow-sm`

### Tab Inactive State
- Text: `text-zinc-400`
- Hover text: `hover:text-zinc-200`
- Hover bg: `hover:bg-white/5`

---

## 📊 Tables

### Table Container
```tsx
<div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
  <Table className="table-fixed w-full">
    {/* ... */}
  </Table>
</div>
```

### Table Header
```tsx
<TableHeader>
  <TableRow className="border-b border-white/5 hover:bg-transparent">
    <TableHead className="py-3 px-3">
      <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">
        {headerText}
      </span>
    </TableHead>
  </TableRow>
</TableHeader>
```

### Table Row
```tsx
<TableRow className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
  <TableCell className="py-3 px-3 text-sm text-white font-medium">
    {content}
  </TableCell>
</TableRow>
```

### Badges dans Tables
```tsx
// Buy badge
<span className="px-2 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400">
  Buy
</span>

// Sell badge
<span className="px-2 py-1 rounded-md text-xs font-bold bg-rose-500/10 text-rose-400">
  Sell
</span>

// Positive change
<span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-[#83e9ff]/10 text-[#83e9ff]">
  +5%
</span>

// Negative change
<span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400">
  -3%
</span>
```

---

## ⏳ Loading States

### Spinner
```tsx
<div className="flex justify-center items-center h-[200px]">
  <div className="flex flex-col items-center">
    <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF] mb-2" />
    <span className="text-zinc-500 text-sm">Loading...</span>
  </div>
</div>
```

### Skeleton Card
```tsx
<div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center justify-center shadow-xl shadow-black/20">
  <Loader2 className="w-4 h-4 text-white/20 animate-spin" />
</div>
```

### Skeleton Line
```tsx
<div className="h-7 bg-white/5 animate-pulse rounded w-24" />
```

---

## ❌ Error States

### Error Container
```tsx
<div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 text-center text-rose-400 text-sm backdrop-blur-md">
  Error: {error.message}
</div>
```

### Empty State
```tsx
<div className="flex flex-col items-center justify-center text-center py-8">
  <Database className="w-10 h-10 mb-3 text-zinc-600" />
  <p className="text-zinc-400 text-sm mb-1">No data found</p>
  <p className="text-zinc-600 text-xs">Try again later</p>
</div>
```

---

## 📏 Grids & Layouts

### Stats Grid (responsive)
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2 md:gap-3 w-full">
  {/* Stats cards */}
</div>
```

### Two Columns (responsive)
```tsx
<div className="flex flex-col md:flex-row gap-8 w-full">
  <div className="w-full md:w-[35%]">
    {/* Left content */}
  </div>
  <div className="flex-1">
    {/* Right content */}
  </div>
</div>
```

### Custom breakpoint layout
```tsx
<div className="flex flex-col custom:flex-row custom:gap-8">
  <div className="w-full custom:w-[35%] mb-6 custom:mb-0">
    {/* Left */}
  </div>
  <div className="w-full custom:w-[65%]">
    {/* Right */}
  </div>
</div>
```

> Note: `custom` breakpoint = `1227px` (défini dans tailwind.config.ts)

---

## 🔗 Links & Buttons

### Link Accent
```tsx
<Link 
  href={url}
  className="text-[#83E9FF] font-mono text-xs hover:text-white transition-colors"
>
  {text}
</Link>
```

### "View All" Link
```tsx
<Link
  href={url}
  className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-[#83E9FF] transition-colors"
>
  View All
  <ExternalLink size={10} />
</Link>
```

### Icon Button
```tsx
<button className="group p-1 rounded transition-colors">
  <Copy className="h-3 w-3 text-zinc-500 group-hover:text-white transition-all duration-200" />
</button>
```

---

## 📝 Typography

### Fonts
- **Titres accent**: `font-higuen` (Higuen Elegant Serif)
- **Corps de texte**: `font-inter`

### Tailles de texte
| Classe | Usage |
|--------|-------|
| `text-xl font-bold` | Valeurs principales, stats |
| `text-sm font-medium` | Contenu standard |
| `text-xs` | Labels, badges |
| `text-[11px]` | Small labels |
| `text-[10px]` | Micro labels, headers tableau |

### Couleurs de texte
| Classe | Usage |
|--------|-------|
| `text-white` | Texte principal |
| `text-zinc-100` | Body text |
| `text-zinc-300` | Texte secondaire |
| `text-zinc-400` | Labels, headers |
| `text-zinc-500` | Texte discret |
| `text-zinc-600` | Placeholder, disabled |

---

## 📱 Responsive Breakpoints

| Breakpoint | Valeur | Usage |
|------------|--------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop (sidebar visible) |
| `custom` | 1227px | Layout custom |
| `xl` | 1280px | Large desktop |

### Pattern Mobile Menu
```tsx
// Bouton menu mobile
<div className="fixed top-4 left-4 z-50 lg:hidden">
  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
    <Menu className="h-6 w-6" />
  </Button>
</div>

// SearchBar mobile
<div className="p-2 lg:hidden">
  <SearchBar placeholder="Search..." />
</div>
```

---

## 🌊 Animations & Transitions

### Transitions standard
```css
transition-all
transition-colors
transition-transform
```

### Durées
```css
duration-200
duration-300
```

### Hover effects
```tsx
// Scale on hover
<div className="transition-transform group-hover:scale-110">

// Border color change
<div className="border border-white/5 hover:border-white/10 transition-all">

// Text color change  
<span className="text-zinc-400 hover:text-[#83E9FF] transition-colors">
```

### Loading animation
```tsx
<Loader2 className="animate-spin" />
<div className="animate-pulse" />
```

---

## 🔧 Composants à Réutiliser

### Imports standards pour une page
```tsx
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Menu, Loader2 } from "lucide-react";
import { useWindowSize } from "@/hooks/use-window-size";
```

### Pattern useWindowSize pour fermer sidebar
```tsx
const { width } = useWindowSize();
const [isSidebarOpen, setIsSidebarOpen] = useState(false);

useEffect(() => {
  if (width && width >= 1024) {
    setIsSidebarOpen(false);
  }
}, [width]);
```

---

## ✅ Checklist Migration Design

Pour chaque page à migrer:

- [ ] Ajouter le background gradient au container principal
- [ ] Wrapper avec `bg-[#0B0E14]/80 backdrop-blur-xl` pour le header sticky
- [ ] Ajouter `border-b border-white/5` sous le header
- [ ] Migrer les cards vers `bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20`
- [ ] Migrer les tabs vers le style pills (`bg-[#0A0D12] rounded-lg p-1 border border-white/5`)
- [ ] Mettre à jour les couleurs des badges (Buy/Sell)
- [ ] Ajouter les hover states (`hover:border-white/10`, `group-hover:scale-110`)
- [ ] Vérifier le responsive (mobile menu, grids)
- [ ] Mettre à jour les loading/error states
- [ ] Ajouter `max-w-[1920px] mx-auto` au main content

---

## 📂 Fichiers de Référence

- **Page exemple**: `src/app/dashboard/page.tsx`
- **Stats Card**: `src/components/dashboard/StatsCard.tsx`
- **Tabs Pills**: `src/components/dashboard/vaultValidator/TabButtons.tsx`
- **Table**: `src/components/dashboard/twap/TwapTable.tsx`
- **Header**: `src/components/Header.tsx`
- **Sidebar**: `src/components/Sidebar.tsx`

