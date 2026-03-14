# Liquid Terminal - Design System V3

> Comprehensive design guidelines for maintaining visual consistency across the application.

---

## Table of Contents

1. [Color Tokens](#color-tokens)
2. [Typography](#typography)
3. [CSS Utility Classes](#css-utility-classes)
4. [Component Library](#component-library)
5. [Sidebar](#sidebar)
6. [Header](#header)
7. [Cards & Containers](#cards--containers)
8. [Tables](#tables)
9. [Buttons](#buttons)
10. [Inputs & Forms](#inputs--forms)
11. [Dialogs & Modals](#dialogs--modals)
12. [Badges & Tags](#badges--tags)
13. [Tabs](#tabs)
14. [Loading & States](#loading--states)
15. [Icons](#icons)
16. [Spacing & Layout](#spacing--layout)
17. [Responsive Design](#responsive-design)
18. [Animation](#animation)
19. [Migration Checklist](#migration-checklist)

---

## Color Tokens

### Brand Colors (defined in `tailwind.config.ts`)

| Token | Value | CSS Class | Usage |
|-------|-------|-----------|-------|
| `brand-main` | `#0B0E14` | `bg-brand-main` | Main app background |
| `brand-secondary` | `#151A25` | `bg-brand-secondary` | Cards, panels, sections |
| `brand-tertiary` | `#051728` | `bg-brand-tertiary` | Dark accents, tabs container |
| `brand-dark` | `#0A0D12` | `bg-brand-dark` | Deepest backgrounds |
| `brand-accent` | `#83E9FF` | `text-brand-accent` | Primary accent (cyan) |
| `brand-gold` | `#f9e370` | `text-brand-gold` | Secondary accent (gold) |
| `brand-success` | `#00ff88` | `text-brand-success` | Success states |
| `brand-error` | `#ef4444` | `text-brand-error` | Error states |

### Text Colors

| Token | Value | CSS Class | Usage |
|-------|-------|-----------|-------|
| `text-primary` | `#ffffff` | `text-white` | Main content text |
| `text-secondary` | `#a1a1aa` | `text-text-secondary` | Labels, headers, secondary text |
| `text-muted` | `#71717a` | `text-text-muted` | Placeholders, disabled, subtle text |

### Border Colors

| Token | Value | CSS Class | Usage |
|-------|-------|-----------|-------|
| `border-subtle` | `rgba(255,255,255,0.05)` | `border-border-subtle` | Default borders |
| `border-hover` | `rgba(255,255,255,0.1)` | `border-border-hover` | Hover state borders |

### Semantic Colors

| Usage | Color | CSS Class |
|-------|-------|-----------|
| Success / Buy / Positive | `emerald-400/500` | `text-emerald-400`, `bg-emerald-500/10` |
| Error / Sell / Negative | `rose-400/500` | `text-rose-400`, `bg-rose-500/10` |
| Warning | `orange-400/500` | `text-orange-400`, `bg-orange-500/10` |
| Link / Active | `brand-accent` | `text-brand-accent` |
| Admin / Premium | `brand-gold` | `text-brand-gold` |

---

## Typography

### Font Families

| Font | CSS Class | Usage |
|------|-----------|-------|
| Inter | `font-inter` | Body text, UI elements (default) |
| Higuen Elegant Serif | `font-higuen` | Logo, accent titles, branding |
| Monospace | `font-mono` | Addresses, hashes, code |

### Text Sizes & Weights

```tsx
// Page title
<h1 className="text-xl font-bold text-white font-inter">

// Section title
<h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">

// Card title
<h3 className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">

// Body text
<p className="text-sm text-white">

// Muted text
<span className="text-xs text-text-muted">

// Labels (use utility class)
<span className="text-label">  // 10px, semibold, uppercase, tracking-wider

// Table header
<th className="text-table-header">  // 12px label style

// Stat value
<span className="text-stat-value">  // sm, white, bold
```

### Typography Utility Classes (from `globals.css`)

```css
.text-label      /* 10px, semibold, uppercase, tracking-wider */
.text-table-header  /* label style, text-secondary, 12px */
.text-table-cell    /* sm, white */
.text-stat-label    /* label style, text-secondary */
.text-stat-value    /* sm, white, bold */
```

---

## CSS Utility Classes

### Glassmorphism (from `globals.css`)

```tsx
// Standard panel (60% opacity)
<div className="glass-panel">

// Uses: bg-brand-secondary/60, backdrop-blur-md, border-border-subtle, shadow-premium, rounded-2xl
```

### Shadows

```tsx
// Premium shadow (used on cards)
<div className="shadow-premium">  // shadow-xl shadow-black/20
```

### Interactive States

```tsx
// Card hover effect
<div className="interactive-card">  // hover:border-border-hover transition-all

// Inactive tab
<button className="tab-inactive">  // text-text-secondary hover:text-zinc-200 hover:bg-white/5

// Subtle hover
<div className="hover-subtle">  // hover:bg-white/5 transition-colors

// Secondary interactive
<button className="interactive-secondary">  // text-text-secondary hover:text-white hover:bg-white/5
```

### Stat Cards (Header)

```tsx
// Compact stat display
<div className="stat-card">
  // bg-brand-secondary/40, backdrop-blur-sm, border-border-subtle
  // rounded-lg, px-2 lg:px-3, py-1 lg:py-1.5
  // hover:border-border-hover
</div>
```

---

## Component Library

The project uses **shadcn/ui** components, customized for the dark theme. Key components:

| Component | Location | Description |
|-----------|----------|-------------|
| Button | `src/components/ui/button.tsx` | 6 variants: default, destructive, outline, secondary, ghost, link |
| Input | `src/components/ui/input.tsx` | Dark styled input with focus states |
| Dialog | `src/components/ui/dialog.tsx` | Modal with glassmorphism styling |
| Card | `src/components/ui/card.tsx` | Container component with glass effect |
| Table | `src/components/ui/table.tsx` | Table components with custom text styles |
| Badge | `src/components/ui/badge.tsx` | Status indicators |
| Tooltip | `src/components/ui/tooltip.tsx` | Info tooltips with cyan border |
| Select | `src/components/ui/select.tsx` | Dropdown selection |

---

## Sidebar

**Location**: `src/components/Sidebar.tsx`
**Config**: `src/lib/sidebar-config.ts`

### Structure

```
Sidebar (w-[220px], bg-brand-main, border-r border-border-subtle)
├── Header (logo + brand)
├── Navigation (scrollable)
│   ├── Group Label (Liquid prefix in cyan, rest in text-secondary)
│   └── Nav Items
│       ├── Active: bg-brand-accent/10, text-brand-accent, left indicator bar
│       ├── Inactive: text-white/80, hover:bg-white/5
│       └── Children (submenu with border-l)
├── Admin Section (gold accent for admins only)
├── Account Section (login button or user card with XP badge)
├── Customize Button
└── Social Links
```

### Active State Pattern

```tsx
// Active nav item
<Link className={cn(
  "flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all",
  isActive
    ? "bg-brand-accent/10 text-brand-accent"
    : "text-white/80 hover:bg-white/5 hover:text-white"
)}>

// Active indicator bar
{isActive && (
  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-brand-accent rounded-r" />
)}
```

### Group Label Pattern

```tsx
<div className="px-3 text-label">
  <span className="text-brand-accent font-higuen">{firstWord} </span>
  <span className="text-text-secondary font-inter">{restOfWords}</span>
</div>
```

### Admin Section (Gold Variant)

Uses `text-brand-gold` and `bg-brand-gold/10` instead of accent cyan.

---

## Header

**Location**: `src/components/Header.tsx`

### Structure

```
Header (sticky top-0, backdrop-blur-xl, bg-brand-primary/80)
├── Left: Search Bar (hidden on mobile)
└── Right:
    ├── Stats (stat-card components)
    │   ├── HYPE Price (with color pulse on trade)
    │   ├── Buy Pressure (green/red based on value)
    │   ├── Fees (hourly/daily with gold icons)
    │   └── Assistance Fund
    └── Settings Selector
```

### Stat Card Pattern

```tsx
<div className={cn(
  "stat-card",
  conditionalBorderColor, // e.g., "border-green-500 animate-pulse"
  "group"
)}>
  <div className="flex items-center gap-1.5">
    <Icon size={11} className="text-brand-accent" />
    <span className="text-white text-label">Label</span>
  </div>
  <div className="text-white text-xs lg:text-sm font-medium group-hover:text-brand-accent transition-colors">
    {value}
  </div>
</div>
```

---

## Cards & Containers

### Glass Panel (Standard Card)

```tsx
<div className="glass-panel p-4">
  {/* Content */}
</div>

// With hover
<div className="glass-panel p-4 hover:border-border-hover transition-all">
```

### Stats Card Pattern

```tsx
<div className="glass-panel p-4 hover:border-border-hover transition-all group">
  <div className="flex items-center gap-3 mb-2">
    <div className="w-8 h-8 rounded-xl bg-brand-accent/10 flex items-center justify-center transition-transform group-hover:scale-110">
      <Icon size={16} className="text-brand-accent" />
    </div>
    <h3 className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">
      {title}
    </h3>
  </div>
  <span className="text-xl text-white font-bold">{value}</span>
</div>
```

### Card Component (shadcn)

```tsx
<Card>  {/* bg-brand-secondary/60, backdrop-blur-md, border-border-subtle, rounded-2xl */}
  <CardHeader>
    <CardTitle>{title}</CardTitle>
    <CardDescription>{description}</CardDescription>
  </CardHeader>
  <CardContent>
    {content}
  </CardContent>
</Card>
```

---

## Tables

### Table Structure

```tsx
<div className="glass-panel overflow-hidden">
  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
    <Table className="min-w-[900px] w-full">
      <TableHeader>
        <TableRow className="border-b border-border-subtle hover:bg-transparent">
          <TableHead className="py-3 px-3">
            <span className="text-table-header">{header}</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors">
          <TableCell className="py-3 px-3 text-table-cell">
            {content}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</div>
```

### Sortable Header

```tsx
<TableHead>
  <Button
    variant="ghost"
    onClick={onSort}
    className={`${isActive ? "text-brand-accent" : "text-text-secondary"} p-0 flex items-center gap-1 hover:text-white text-label`}
  >
    {label}
    <ArrowUpDown className="h-3 w-3" />
  </Button>
</TableHead>
```

### Table Empty State

```tsx
<TableRow>
  <TableCell colSpan={columns} className="text-center py-8">
    <div className="flex flex-col items-center justify-center">
      <Database className="w-10 h-10 mb-3 text-text-muted" />
      <p className="text-text-secondary text-sm mb-1">No data found</p>
      <p className="text-text-muted text-xs">Try again later</p>
    </div>
  </TableCell>
</TableRow>
```

---

## Buttons

### Variants (from shadcn Button)

```tsx
// Primary (cyan)
<Button variant="default">  // bg-primary text-primary-foreground

// Destructive (red)
<Button variant="destructive">  // bg-destructive

// Outline
<Button variant="outline">  // border, hover:bg-white/5

// Secondary
<Button variant="secondary">  // bg-secondary

// Ghost (most common)
<Button variant="ghost">  // hover:bg-white/5 hover:text-white

// Link
<Button variant="link">  // text-primary underline
```

### Sizes

```tsx
<Button size="default">  // h-9 px-4
<Button size="sm">       // h-8 px-3 text-xs
<Button size="lg">       // h-10 px-8
<Button size="icon">     // h-9 w-9
```

### Custom Button Patterns

```tsx
// Login button (sidebar)
<Button className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-bold">

// Icon button
<button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
  <Icon className="h-4 w-4 text-text-muted hover:text-white" />
</button>
```

---

## Inputs & Forms

### Input Component

```tsx
<Input
  placeholder="Search..."
  className="w-full pr-10 p-5 text-white placeholder:text-text-muted text-sm rounded-xl"
/>

// Base styles (from ui/input.tsx):
// bg-black/20, border-border-hover, focus:border-brand-accent/50
```

### Search Bar Pattern

```tsx
<div className="relative">
  <Input
    className="bg-brand-main/80 backdrop-blur-xl border border-border-hover rounded-xl shadow-sm transition-all hover:border-white/20 focus-within:border-brand-accent"
  />
  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gold hover:text-brand-accent">
    <Search className="h-4 w-4" />
  </button>
</div>
```

### Suggestions Dropdown

```tsx
<div className="absolute top-full left-0 right-0 mt-1 bg-brand-secondary/95 backdrop-blur-sm border border-border-hover rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
  <button className="w-full px-4 py-3 text-left hover-subtle">
    <div className="text-brand-gold text-sm font-medium">{label}</div>
    <div className="text-brand-accent text-xs font-mono">{subtext}</div>
  </button>
</div>
```

---

## Dialogs & Modals

### Dialog Content Styling

```tsx
<DialogContent className="bg-brand-secondary/95 backdrop-blur-xl border border-border-hover shadow-2xl shadow-black/40 rounded-2xl text-white max-w-md">
  <DialogHeader>
    <DialogTitle className="flex items-center gap-2 text-white font-inter">
      <Icon className="h-5 w-5 text-brand-gold" />
      Title
    </DialogTitle>
  </DialogHeader>
  {/* Content */}
</DialogContent>
```

### Overlay

```tsx
// Default overlay
<DialogOverlay className="bg-black/80" />
```

---

## Badges & Tags

### Status Badges

```tsx
// Buy/Success
<span className="px-2 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
  Buy
</span>

// Sell/Error
<span className="px-2 py-1 rounded-md text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
  Sell
</span>

// Accent (Cyan)
<span className="px-2 py-1 rounded-md text-xs font-medium bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
  Active
</span>

// Premium (Gold)
<span className="px-2 py-1 rounded-md text-xs font-medium bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
  Premium
</span>
```

### Percentage Change

```tsx
// Positive
<span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">
  +5.2%
</span>

// Negative
<span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-400">
  -3.1%
</span>
```

---

## Tabs

### Tab Container

```tsx
<div className="flex bg-brand-tertiary rounded-lg p-1 border border-border-subtle">
  {tabs.map(tab => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
        activeTab === tab.key
          ? 'bg-brand-accent text-brand-tertiary font-bold shadow-sm'
          : 'tab-inactive'
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
```

### Period Selector (Chart)

```tsx
<div className="flex bg-brand-dark rounded-lg p-1 border border-border-subtle gap-1">
  {periods.map(period => (
    <button
      key={period}
      onClick={() => onPeriodChange(period)}
      className={`px-2 py-1 text-xs font-medium transition-colors rounded-md ${
        selectedPeriod === period
          ? 'text-brand-tertiary bg-brand-accent font-bold'
          : 'text-text-secondary hover:text-zinc-200'
      }`}
    >
      {period}
    </button>
  ))}
</div>
```

---

## Loading & States

### Loading Spinner

```tsx
<div className="flex justify-center items-center h-[200px] glass-panel">
  <div className="flex flex-col items-center">
    <Loader2 className="h-6 w-6 animate-spin text-brand-accent mb-2" />
    <span className="text-text-muted text-sm">Loading...</span>
  </div>
</div>
```

### Error State

```tsx
<div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 text-center text-rose-400 text-sm backdrop-blur-md">
  Error: {error.message}
</div>
```

### Empty State

```tsx
<div className="flex flex-col items-center justify-center py-8 glass-panel">
  <Database className="w-10 h-10 mb-3 text-text-muted" />
  <p className="text-text-secondary text-sm mb-1">No data found</p>
  <p className="text-text-muted text-xs">Try again later</p>
</div>
```

---

## Icons

### Icon Library

Primary: **Lucide React** (`lucide-react`)
Secondary: **Iconify** (`@iconify/react`) for social icons

### Icon Sizes

| Context | Size | Class |
|---------|------|-------|
| Navigation | 18-20px | `w-5 h-5` |
| Button | 16px | `w-4 h-4` |
| Inline/Small | 12-14px | `w-3 h-3` |
| Stat icons | 11px | `size={11}` |
| Empty state | 40px | `w-10 h-10` |

### Icon Colors

```tsx
// Default
<Icon className="text-text-muted" />

// Accent
<Icon className="text-brand-accent" />

// Gold (stats, premium)
<Icon className="text-brand-gold" />

// Interactive
<Icon className="text-text-muted group-hover:text-white transition-colors" />
```

---

## Spacing & Layout

### Page Structure

```tsx
<div className="min-h-screen bg-brand-primary text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-brand-primary to-[#050505]">
  <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

  <div className="lg:ml-[220px]">  {/* Offset for sidebar on desktop */}
    {/* Sticky Header */}
    <div className="sticky top-0 z-40 backdrop-blur-xl bg-brand-primary/80 border-b border-border-subtle">
      <Header />
    </div>

    {/* Main Content */}
    <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
      {/* Page sections */}
    </main>
  </div>
</div>
```

### Common Spacing

| Use Case | Spacing |
|----------|---------|
| Page padding | `px-6 py-8` |
| Section gap | `space-y-8` |
| Card padding | `p-4` or `p-6` |
| Element gap | `gap-2`, `gap-3`, `gap-4` |
| Tight gap | `gap-1`, `gap-1.5` |
| Table cell padding | `py-3 px-3` |

---

## Responsive Design

### Breakpoints

| Breakpoint | Value | CSS Prefix |
|------------|-------|------------|
| Default | 0px | (none) |
| sm | 640px | `sm:` |
| md | 768px | `md:` |
| lg | 1024px | `lg:` |
| custom | 1227px | `custom:` |
| xl | 1280px | `xl:` |

### Mobile Patterns

```tsx
// Sidebar: hidden on mobile, fixed on desktop
<div className="lg:translate-x-0 -translate-x-full">

// Content offset for sidebar
<div className="lg:ml-[220px]">

// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">

// Hidden on mobile
<div className="hidden lg:block">

// Mobile-only
<div className="md:hidden">
```

---

## Animation

### Transitions

```tsx
// Color transitions
transition-colors

// All properties
transition-all

// Transform
transition-transform

// Specific duration
duration-200, duration-300
```

### Common Animations

```tsx
// Spin (loading)
animate-spin

// Pulse (alerts)
animate-pulse

// Scale on hover (icons)
group-hover:scale-105
group-hover:scale-110

// Fade in (dialogs)
animate-in fade-in-0
```

### Framer Motion (for complex animations)

Used in specific components like charts and animated elements.

---

## Migration Checklist

When updating existing components, replace:

| Legacy | New Token |
|--------|-----------|
| `text-zinc-400` | `text-text-secondary` |
| `text-zinc-500` | `text-text-muted` |
| `border-white/5` | `border-border-subtle` |
| `border-white/10` | `border-border-hover` |
| `bg-[#151A25]` | `bg-brand-secondary` |
| `bg-[#0B0E14]` | `bg-brand-main` |
| `bg-[#83E9FF]` | `bg-brand-accent` |
| `text-[#83E9FF]` | `text-brand-accent` |
| `text-[#F9E370]` | `text-brand-gold` |
| Manual glass styles | `glass-panel` class |
| Custom shadows | `shadow-premium` |

---

## File Reference

| Purpose | Location |
|---------|----------|
| Tailwind tokens | `tailwind.config.ts` |
| Global CSS & utilities | `src/app/globals.css` |
| Sidebar component | `src/components/Sidebar.tsx` |
| Sidebar config | `src/lib/sidebar-config.ts` |
| Header component | `src/components/Header.tsx` |
| UI components | `src/components/ui/` |
| Number formatting | `src/lib/formatters/numberFormatting.ts` |
| Date formatting | `src/lib/formatters/dateFormatting.ts` |
| Common components | `src/components/common/` |

---

## Quick Reference

### Most Used Patterns

```tsx
// Glass card
<div className="glass-panel p-4 hover:border-border-hover transition-all">

// Section title
<h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-4">

// Address link
<AddressDisplay address={addr} showCopy={true} />

// Loading
<Loader2 className="h-6 w-6 animate-spin text-brand-accent" />

// Empty icon
<Database className="w-10 h-10 text-text-muted" />

// Accent link
<Link className="text-brand-accent hover:text-white transition-colors font-mono text-sm">

// Ghost button
<Button variant="ghost" size="icon" className="hover:bg-white/5">
```
