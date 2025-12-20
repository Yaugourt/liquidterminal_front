# Liquid Terminal - Design System V3

> **Ce document guide l'IA lors de la modification des pages pour uniformiser le design.**

## 🎨 Tokens de Couleurs

### CSS Variables (définies dans tailwind.config.ts)

| Token | Valeur | Usage |
|-------|--------|-------|
| `bg-brand-primary` | `#0B0E14` | Background principal |
| `bg-brand-secondary` | `#151A25` | Cards, sections |
| `bg-brand-tertiary` | `#0A0D12` | Tabs container |
| `text-text-secondary` | `#a1a1aa` | Labels, headers (remplace `text-zinc-400`) |
| `text-text-muted` | `#71717a` | Texte discret (remplace `text-zinc-500`) |
| `border-border-subtle` | `rgba(255,255,255,0.05)` | Bordures légères |
| `border-border-hover` | `rgba(255,255,255,0.1)` | Bordures hover |
| `text-brand-accent` | `#83E9FF` | Accent principal |
| `text-brand-gold` | `#f9e370` | Accent secondaire |

### Couleurs Sémantiques

| Couleur | Usage |
|---------|-------|
| `emerald-400/500` | Success, Buy, positif |
| `rose-400/500` | Error, Sell, négatif |
| `text-brand-accent` | Liens, actif, hover |
| `text-brand-gold` | Admin, warnings |

---

## 🃏 Classes Utilitaires (globals.css)

### Glass Components

```tsx
// Panel standard (cards, containers)
<div className="glass-panel">

// Card avec plus d'opacité
<div className="glass-card">

// Dialog/Modal background
<div className="glass-dialog">

// Stat card (Header stats)
<div className="stat-card">

// Input field
<input className="glass-input" />

// Button glass
<button className="glass-button">
```

### Définitions

```css
.glass-panel {
  @apply bg-brand-secondary/60 backdrop-blur-md border border-border-subtle shadow-premium rounded-2xl;
}

.glass-card {
  @apply bg-brand-secondary/90 backdrop-blur-md border border-border-subtle shadow-premium rounded-2xl;
}

.glass-dialog {
  @apply bg-brand-secondary/95 backdrop-blur-xl border border-border-hover shadow-2xl shadow-black/40;
}

.stat-card {
  @apply bg-brand-secondary/40 backdrop-blur-sm border border-border-subtle rounded-lg;
}
```

---

## 📐 Structure de Page

```tsx
<div className="min-h-screen bg-brand-primary text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-brand-primary to-[#050505]">
  <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
  
  <div>
    {/* Header sticky */}
    <div className="sticky top-0 z-40 backdrop-blur-xl bg-brand-primary/80 border-b border-border-subtle">
      <Header customTitle="Page Title" />
    </div>
    
    {/* Contenu */}
    <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
      {/* Sections */}
    </main>
  </div>
</div>
```

---

## 🃏 Cards & Containers

### Card Standard
```tsx
<div className="glass-panel p-4">
  {/* Contenu */}
</div>

// Avec hover
<div className="glass-panel p-4 hover:border-border-hover transition-all group">
  {/* Contenu */}
</div>
```

### Stats Card
```tsx
<div className="glass-panel p-4 hover:border-border-hover transition-all group">
  <div className="flex items-center gap-3 mb-2">
    <div className="w-8 h-8 rounded-xl bg-brand-accent/10 flex items-center justify-center transition-transform group-hover:scale-110">
      <Icon size={16} className="text-brand-accent" />
    </div>
    <h3 className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">{title}</h3>
  </div>
  <span className="text-xl text-white font-bold">{value}</span>
</div>
```

---

## 🔘 Tabs System

```tsx
<div className="flex bg-brand-tertiary rounded-lg p-1 border border-border-subtle">
  {tabs.map(tab => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
        activeTab === tab.key
          ? 'bg-brand-accent text-[#051728] font-bold shadow-sm'
          : 'text-text-secondary hover:text-white hover:bg-white/5'
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
```

---

## 📊 Tables

### Header
```tsx
<TableHead className="py-3 px-3">
  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
    {headerText}
  </span>
</TableHead>
```

### Row
```tsx
<TableRow className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors">
  <TableCell className="py-3 px-3 text-sm text-white">
    {content}
  </TableCell>
</TableRow>
```

### Badges
```tsx
// Buy
<span className="px-2 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400">Buy</span>

// Sell
<span className="px-2 py-1 rounded-md text-xs font-bold bg-rose-500/10 text-rose-400">Sell</span>

// Positive
<span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-brand-accent/10 text-brand-accent">+5%</span>

// Negative
<span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400">-3%</span>
```

---

## ⏳ Loading & Error States

### Loading
```tsx
<div className="flex justify-center items-center h-[200px] glass-panel">
  <div className="flex flex-col items-center">
    <Loader2 className="h-6 w-6 animate-spin text-brand-accent mb-2" />
    <span className="text-text-muted text-sm">Loading...</span>
  </div>
</div>
```

### Error
```tsx
<div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 text-center text-rose-400 text-sm backdrop-blur-md">
  Error: {error.message}
</div>
```

### Empty
```tsx
<div className="flex flex-col items-center justify-center py-8 glass-panel">
  <Database className="w-10 h-10 mb-3 text-text-muted" />
  <p className="text-text-secondary text-sm mb-1">No data found</p>
  <p className="text-text-muted text-xs">Try again later</p>
</div>
```

---

## 📝 Typography

### Fonts
- **Titres accent**: `font-outfit`
- **Corps**: `font-inter`
- **Code/Addresses**: `font-mono`

### Couleurs de Texte
| Token | Usage |
|-------|-------|
| `text-white` | Texte principal |
| `text-white/80` | Texte secondaire important |
| `text-text-secondary` | Labels, headers |
| `text-text-muted` | Texte discret, placeholders |
| `text-brand-accent` | Liens, accents |

---

## 🔗 Buttons & Links

### Link Accent
```tsx
<Link href={url} className="text-brand-accent font-mono text-xs hover:text-white transition-colors">
  {text}
</Link>
```

### Icon Button
```tsx
<button className="group p-1 rounded transition-colors">
  <Copy className="h-3 w-3 text-text-muted group-hover:text-white transition-all" />
</button>
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Valeur | Usage |
|------------|--------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop (sidebar) |
| `custom` | 1227px | Layout custom |
| `xl` | 1280px | Large desktop |

---

## ✅ Checklist Migration

- [ ] Utiliser `glass-panel` pour les cards
- [ ] Remplacer `text-zinc-400` → `text-text-secondary`
- [ ] Remplacer `text-zinc-500` → `text-text-muted`
- [ ] Remplacer `border-white/5` → `border-border-subtle`
- [ ] Remplacer `border-white/10` → `border-border-hover`
- [ ] Remplacer `bg-[#151A25]` → `bg-brand-secondary`
- [ ] Utiliser `glass-dialog` pour les modals
- [ ] Vérifier les hover states

---

## 📂 Fichiers de Référence

- **Tokens**: `tailwind.config.ts`
- **Classes utilitaires**: `src/app/globals.css`
- **Header**: `src/components/Header.tsx`
- **Sidebar**: `src/components/Sidebar.tsx`
- **DataTable**: `src/components/common/DataTable.tsx`
