# Liquid Design System V4

> **Trading-grade interface + Liquid brand identity.** La version validée, prête pour implementation.

---

## 0. Philosophy

### Pourquoi V4

V4 est la synthèse de deux directions :

1. **Pro feel** (héritage V1) → solid surfaces, density élevée, monospace tabular pour les chiffres, pas de Higuen serif, rounded-lg `8px`. Code visuel "Bloomberg / TradingView" plutôt que "AI dashboard 2024".
2. **Brand identity Liquid préservée** → navy whisper sur les surfaces, gold pour les Builder Fees, gradient cyan subtil au sommet de la page. Code visuel "c'est *Liquid*", pas un dashboard générique.

L'idée : le user qui revient sur l'app la reconnaît immédiatement (couleurs Liquid présentes), mais l'œil pro voit que c'est plus sérieux que la V2 actuelle.

### Audience

V4 cible un public **mixte** :
- Traders sérieux qui veulent de la densité, des chiffres alignés, des données accessibles rapidement
- Newbies HyperLiquid qui ont besoin de contexte autour des charts, de légendes pour les acronymes (bps, etc.)

### Ce qui change vs V2 actuel

| Aspect | V2 | V4 |
|---|---|---|
| Background | `#0B0E14` neutral | `#0A0B0F` neutral (très proche) |
| Surfaces | `bg-[#151A25]/60` glass | `#0F1421` solid avec whisper navy |
| Border radius cards | `rounded-2xl` (16px) | `rounded-lg` (8px) |
| Police titres | Higuen Elegant Serif | Inter (Higuen drop) |
| Police chiffres | Inter | **JetBrains Mono tabular** |
| Glassmorphism | Partout | Supprimé |
| Shadows cards | `shadow-xl shadow-black/20` | Supprimées |
| Gold | Buttons CTAs, badges admin | **Réservé colonne Builder Fees** |
| Densité tables | Row ~48-56px | Row ~32px (+40% density) |

---

## 1. Palette officielle Liquid

| Couleur | Hex | Rôle V4 |
|---|---|---|
| Navy darkest | `#051728` | Texte sur boutons cyan, brand-text-on |
| Navy mid | `#112941` | Référence brand, peu utilisé directement |
| Cyan signature | `#83E9FF` | Accent principal, tab actif, badges, liens, top chart color |
| Cyan deep | `#1692AD` | **Action color** pour CTAs primaires, brand text en light mode |
| Gold | `#F9E370` | **Builder Fees column** (signature) + tier premium |
| Cyan logo softer | `#93D4ED` | Variante optionnelle pour états passifs |

---

## 2. Tokens de Couleur

### 2.1 Dark Mode

```css
:root,
[data-theme="dark"] {
  /* === SURFACES (V1 base + whisper navy pour identité) === */
  --bg-base: #0A0B0F;             /* neutral dark, presque pas de tint */
  --bg-surface: #0F1421;          /* whisper navy — la signature V4 */
  --bg-surface-2: #141B2A;        /* nested surfaces */
  --bg-surface-3: #1C2436;        /* hover, active */
  --bg-overlay: rgba(10, 11, 15, 0.80);
  
  /* === BORDERS === */
  --border-subtle: #1E2535;
  --border-default: #2C354A;
  --border-strong: #3D4760;
  
  /* === TEXT === */
  --text-primary: #E8EAED;
  --text-secondary: #9CA3AF;
  --text-tertiary: #6B7280;
  --text-disabled: #4B5563;
  
  /* === BRAND === */
  --brand: #83E9FF;               /* OFFICIAL cyan signature */
  --brand-hover: #A8F0FF;
  --brand-deep: #1692AD;          /* OFFICIAL cyan deep */
  --brand-bg: rgba(131, 233, 255, 0.10);
  --brand-bg-strong: rgba(131, 233, 255, 0.20);
  --brand-border: rgba(131, 233, 255, 0.30);
  --brand-text-on: #051728;       /* OFFICIAL navy comme texte sur cyan */
  
  /* === ACTION (primary CTAs) === */
  --action: #1692AD;
  --action-hover: #1FA8C4;
  --action-text: #FFFFFF;
  
  /* === SEMANTIC === */
  --success: #1FA85B;
  --success-bg: rgba(31, 168, 91, 0.12);
  --danger: #E53E3E;
  --danger-bg: rgba(229, 62, 62, 0.12);
  --warning: #F59E0B;
  --warning-bg: rgba(245, 158, 11, 0.12);
  
  /* === GOLD (Builder Fees column + Premium tier) === */
  --gold: #F9E370;
  --gold-bg: rgba(249, 227, 112, 0.10);
  --gold-border: rgba(249, 227, 112, 0.30);
}
```

### 2.2 Light Mode

```css
[data-theme="light"] {
  /* === SURFACES (cool blue light, NOT warm cream) === */
  --bg-base: #F4F7FA;
  --bg-surface: #FFFFFF;
  --bg-surface-2: #EBF1F7;
  --bg-surface-3: #DCE5EF;
  --bg-overlay: rgba(15, 23, 42, 0.55);
  
  /* === BORDERS === */
  --border-subtle: #E2E8F0;
  --border-default: #CBD5E1;
  --border-strong: #94A3B8;
  
  /* === TEXT === */
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-tertiary: #94A3B8;
  --text-disabled: #CBD5E1;
  
  /* === BRAND === */
  --brand: #0891B2;               /* cyan deep pour contraste sur blanc */
  --brand-hover: #0E7490;
  --brand-deep: #051728;
  --brand-bg: rgba(8, 145, 178, 0.10);
  --brand-bg-strong: rgba(8, 145, 178, 0.18);
  --brand-border: rgba(8, 145, 178, 0.30);
  --brand-text-on: #FFFFFF;
  
  /* === ACTION === */
  --action: #0284C7;
  --action-hover: #0369A1;
  --action-text: #FFFFFF;
  
  /* === SEMANTIC === */
  --success: #059669;
  --success-bg: rgba(5, 150, 105, 0.10);
  --danger: #DC2626;
  --danger-bg: rgba(220, 38, 38, 0.10);
  --warning: #D97706;
  --warning-bg: rgba(217, 119, 6, 0.10);
  
  /* === GOLD === */
  --gold: #B7791F;                /* darkened pour contraste sur fond clair */
  --gold-bg: rgba(249, 227, 112, 0.30);
  --gold-border: rgba(183, 121, 31, 0.30);
}
```

### 2.3 Body — gradient Liquid ambient

Le gradient subtil au sommet de la page = marqueur de marque non-envahissant :

```css
body {
  background:
    radial-gradient(ellipse 100% 50% at 50% -10%, rgba(131, 233, 255, 0.035), transparent 70%),
    var(--bg-base);
}

[data-theme="light"] body {
  background:
    radial-gradient(ellipse 100% 50% at 50% -10%, rgba(22, 146, 173, 0.05), transparent 70%),
    var(--bg-base);
}
```

---

## 3. Typography

### 3.1 Polices

| Police | Usage | Source |
|---|---|---|
| **Inter** | Tous les textes UI | Google Fonts (`@400;500;600`) |
| **JetBrains Mono** | Tous les chiffres, hashes, addresses, timestamps | Google Fonts (`@400;500;600`) |
| ~~Higuen Elegant Serif~~ | **Supprimé** | — |

### 3.2 Stack

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'IBM Plex Mono', 'SF Mono', Menlo, monospace;
```

### 3.3 Classe utilitaire `.mono`

```css
.mono {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
```

**Règle :** chaque chiffre dans l'interface est dans un élément `.mono`. Sans exception. C'est le marqueur "vraie data" qui distingue V4 d'un dashboard générique.

### 3.4 Échelle

| Token | Taille | Line-height | Usage |
|---|---|---|---|
| `text-2xs` | 10px | 1.4 | Micro labels, table headers, captions |
| `text-xs` | 11px | 1.4 | Labels, badges, cells secondaires |
| `text-sm` | 13px | 1.5 | Corps de texte standard |
| `text-base` | 14px | 1.5 | Texte principal |
| `text-lg` | 16px | 1.4 | Sub-headings |
| `text-xl` | 18px | 1.3 | Section titles |
| `text-2xl` | 22px | 1.2 | Page titles |
| `text-3xl` | 28px | 1.1 | Hero stats (rare) |

### 3.5 Font-weights

Trois weights, jamais plus :
- `400` regular — corps de texte
- `500` medium — labels, headings, fees
- `600` semibold — emphasis, stat values

---

## 4. Espacement & Forme

Density V1 conservée — tight margins, info-dense layout.

### 4.1 Échelle d'espacement

| Token | Pixels | Usage |
|---|---|---|
| `1` | 4px | gap tight |
| `1.5` | 6px | gap items |
| `2` | 8px | **gap stats grid, two-col, padding inputs** |
| `2.5` | 10px | padding cells |
| `3` | 12px | **padding card standard** |
| `3.5` | 14px | padding card large |
| `4` | 16px | **section spacing (mb)** |
| `5` | 20px | between major sections |
| `6` | 24px | page-level |

### 4.2 Border radius

| Token | Valeur | Usage |
|---|---|---|
| `rounded` | 4px | Badges, pills micro |
| `rounded-md` | 6px | Buttons, inputs, tags |
| `rounded-lg` | **8px** | **Cards, sections (V4 standard)** |
| `rounded-xl` | 12px | Modals seulement |
| `rounded-full` | — | Avatars, status dots |

### 4.3 Shadows

Supprimées sur les cards (V2's `shadow-xl shadow-black/20` n'existe plus). Séparation visuelle = bordures + différenciation surfaces.

Conservées pour :
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.20);   /* dropdowns */
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.30);  /* tooltips, popovers */
--shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.40); /* modals */
```

### 4.4 Backdrop blur

Réservé strictement à :
- Header sticky (`backdrop-blur(8px)`)
- Modal overlays

Supprimé partout ailleurs.

---

## 5. Composants

### 5.1 Card standard

```tsx
<div className="bg-[--bg-surface] border border-[--border-subtle] rounded-lg">
  {/* content */}
</div>
```

### 5.2 Stat Card

```tsx
<div className="bg-[--bg-surface] border border-[--border-subtle] rounded-lg px-3.5 py-3">
  <div className="flex items-center justify-between mb-1.5">
    <span className="text-2xs uppercase tracking-wider text-[--text-tertiary] font-medium">
      Volume
    </span>
    <span className="text-2xs font-mono text-[--success]">+37.3%</span>
  </div>
  <div className="text-xl font-mono font-semibold tabular-nums text-[--text-primary]">
    $182,541,344
  </div>
</div>
```

### 5.3 Data Table (avec gold signature)

```tsx
<div className="bg-[--bg-surface] border border-[--border-subtle] rounded-lg overflow-hidden">
  <table className="w-full">
    <thead>
      <tr className="bg-[--bg-surface-2] border-b border-[--border-subtle]">
        <th className="px-3.5 py-2 text-left text-2xs uppercase tracking-wider 
                       text-[--text-tertiary] font-medium">Builder</th>
        <th className="px-3.5 py-2 text-right text-2xs uppercase tracking-wider 
                       text-[--text-tertiary] font-medium">Volume</th>
        <th className="px-3.5 py-2 text-right text-2xs uppercase tracking-wider 
                       text-[--text-tertiary] font-medium">Builder Fees</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-[--border-subtle] hover:bg-[--bg-surface-2] transition-colors">
        <td className="px-3.5 py-2 text-sm text-[--text-primary]">Phantom</td>
        <td className="px-3.5 py-2 text-sm font-mono tabular-nums text-right text-[--text-primary]">
          $35,612,754
        </td>
        {/* GOLD signature — colonne Builder Fees */}
        <td className="px-3.5 py-2 text-sm font-mono tabular-nums text-right text-[--gold] font-medium">
          $37,414.48
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

**Règle :** la colonne Builder Fees (et **seulement** celle-ci dans les tables) utilise le gold `#F9E370`. C'est le marqueur d'identité Liquid le plus reconnaissable.

CSS utility class :

```css
.fees-cell {
  color: var(--gold);
  font-weight: 500;
}
```

### 5.4 Tabs (pills)

```tsx
<div className="inline-flex bg-[--bg-surface-2] rounded-md p-0.5 border border-[--border-subtle]">
  {tabs.map(tab => (
    <button
      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
        active === tab.key
          ? 'bg-[--brand] text-[--brand-text-on]'
          : 'text-[--text-secondary] hover:text-[--text-primary]'
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
```

### 5.5 Badges

```tsx
// Success / Buy
<span className="px-1.5 py-0.5 rounded text-2xs font-mono font-medium
                 bg-[--success-bg] text-[--success]">BUY</span>

// Danger / Sell
<span className="px-1.5 py-0.5 rounded text-2xs font-mono font-medium
                 bg-[--danger-bg] text-[--danger]">SELL</span>

// Brand accent
<span className="px-1.5 py-0.5 rounded text-2xs font-mono font-medium
                 bg-[--brand-bg] text-[--brand]">NEW</span>

// Gold premium (rare, tier premium uniquement)
<span className="px-1.5 py-0.5 rounded text-2xs font-mono font-medium
                 bg-[--gold-bg] text-[--gold]">PREMIUM</span>
```

### 5.6 Boutons

```tsx
// Primary CTA (action color officiel)
<button className="px-3 py-1.5 rounded-md text-sm font-medium
                   bg-[--action] text-[--action-text]
                   hover:bg-[--action-hover] transition-colors">
  Connect Wallet
</button>

// Secondary
<button className="px-3 py-1.5 rounded-md text-sm font-medium
                   bg-[--bg-surface-2] text-[--text-primary]
                   border border-[--border-subtle]
                   hover:border-[--border-default] hover:bg-[--bg-surface-3]">
  Cancel
</button>

// Ghost
<button className="px-3 py-1.5 rounded-md text-sm font-medium
                   text-[--text-secondary]
                   hover:text-[--text-primary] hover:bg-[--bg-surface-2]">
  View All →
</button>

// Brand cyan (conversion CTAs forts, rare)
<button className="px-3 py-1.5 rounded-md text-sm font-medium
                   bg-[--brand] text-[--brand-text-on]
                   hover:bg-[--brand-hover]">
  Get Started
</button>
```

### 5.7 Inputs

```tsx
<input
  className="w-full px-3 py-2 rounded-md text-sm
             bg-[--bg-surface-2] border border-[--border-subtle]
             text-[--text-primary] placeholder:text-[--text-tertiary]
             focus:outline-none focus:border-[--brand] focus:bg-[--bg-surface]
             transition-colors"
  placeholder="Search token, address, tx..."
/>
```

---

## 6. Marqueurs d'identité V4

Quatre éléments visuels qui font dire au user "c'est *Liquid*" :

### 6.1 Surfaces avec whisper navy

```
V1 (générique) : --bg-surface: #11141B  (R=17, G=20, B=27)
V4 (Liquid)    : --bg-surface: #0F1421  (R=15, G=20, B=33)
```

Différence : B passe de 27 à 33, soit ~22% de plus. À l'œil c'est subtil mais le ressenti change : on sent le bleu marine de la marque sous la surface.

### 6.2 Gold pour Builder Fees

La colonne **Builder Fees** (et seulement elle) dans toutes les tables utilise `--gold` = `#F9E370`. Instant brand recognition quand on scroll.

Classe utility : `.fees-cell`.

### 6.3 Gradient cyan au sommet

`radial-gradient(ellipse 100% 50% at 50% -10%, rgba(131, 233, 255, 0.035), transparent 70%)` au-dessus du `--bg-base`.

3.5% d'opacité de cyan — à peine perceptible, mais donne une ambiance Liquid à la page.

### 6.4 Watermark "LIQUID" sur les charts

```tsx
<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
  <span className="text-6xl font-semibold text-[--brand] opacity-[0.025] 
                   tracking-widest select-none">
    LIQUID
  </span>
</div>
```

Sur tous les charts principaux. 2.5% d'opacité. Quand quelqu'un screenshot ton chart, c'est marqué Liquid.

---

## 7. Newbie touches

Petits ajouts contextuels qui aident les nouveaux utilisateurs sans alourdir.

### 7.1 Insight sous les donut charts

Plutôt que juste afficher la valeur totale, ajouter un commentaire de distribution :

```
Total 24h
$181.82M
Top 3 hold 33.9% · 10 slices
```

Pattern : `Top N hold X% · Y slices` (au lieu de juste `Top N: X%`).

### 7.2 Footer éducatif sous les charts

```tsx
<div className="mt-3.5 pt-2.5 border-t border-[--border-subtle] 
                flex justify-between items-center text-2xs text-[--text-tertiary]">
  <span>10 builders shown · sorted by volume</span>
  <span className="font-mono">bps = basis points (fees / volume)</span>
</div>
```

Explique les acronymes du domaine sans assumer que tout le monde les connaît.

### 7.3 Empty states avec guidance

```tsx
<div className="flex flex-col items-center justify-center py-12 px-4">
  <div className="w-10 h-10 rounded-full bg-[--bg-surface-2] flex items-center justify-center mb-3">
    <Database className="w-5 h-5 text-[--text-tertiary]" />
  </div>
  <p className="text-sm text-[--text-secondary] mb-1">No data available</p>
  <p className="text-xs text-[--text-tertiary]">Try a different filter or timeframe</p>
</div>
```

---

## 8. Charts & Data Viz

### 8.1 Palette charts

Brand-led, dérive seulement quand variété nécessaire :

```css
--chart-1: #83E9FF;  /* OFFICIAL brand cyan — primary */
--chart-2: #1692AD;  /* OFFICIAL cyan deep — secondary */
--chart-3: #F9E370;  /* OFFICIAL gold */
--chart-4: #A78BFA;  /* violet */
--chart-5: #F472B6;  /* pink */
--chart-6: #34D399;  /* emerald */
--chart-7: #FB923C;  /* orange */
--chart-8: #60A5FA;  /* blue clair */
```

**Règle :**
- 1 série → `#83E9FF`
- 2 séries → `#83E9FF` + `#1692AD`
- 3 séries → ajouter `#F9E370`
- 4+ → on ouvre la palette

### 8.2 Style chart par défaut

- Grid lines : `--border-subtle` à 50% opacity
- Axis labels : `--text-tertiary`, `text-2xs`, `font-mono`
- Tooltip : `--bg-surface` solid, border `--border-default`, valeurs en mono
- Animations : `200ms ease-out`, jamais plus

---

## 9. Layout patterns

### 9.1 Page structure

```tsx
<div className="min-h-screen bg-[--bg-base] text-[--text-primary] font-sans">
  <Sidebar />
  <div className="lg:pl-[220px]">
    <Header />
    <main className="px-5 py-5 max-w-[1920px] mx-auto space-y-4">
      {/* Sections */}
    </main>
  </div>
</div>
```

### 9.2 Sidebar

- Largeur : `220px`
- Background : `--bg-surface`
- Sections labelées en uppercase 10px tracking 0.08em

### 9.3 Header sticky

```tsx
<header className="sticky top-0 z-40 h-14 px-4
                   bg-[--bg-base]/95 backdrop-blur-sm
                   border-b border-[--border-subtle]
                   flex items-center gap-3">
  {/* Search, stats, CTA, avatar */}
</header>
```

Hauteur : 56px.

---

## 10. Light / Dark Mode

### 10.1 Stratégie

```css
:root,
[data-theme="dark"] { /* tokens dark */ }

[data-theme="light"] { /* tokens light */ }
```

### 10.2 Toggle component

```tsx
const ThemeToggle = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-1.5 rounded-md hover:bg-[--bg-surface-2] transition-colors"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};
```

### 10.3 Persistance

```tsx
const saved = localStorage.getItem('theme');
const systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = saved ?? (systemDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', initialTheme);
```

### 10.4 Rollout phase

1. **Phase 1** : Dark V4 (default, signature)
2. **Phase 2** : Light V4 (option settings, 2-3 semaines après)

---

## 11. Migration V2 → V4

### 11.1 Find & replace global

| V2 | V4 | Note |
|---|---|---|
| `bg-[#0B0E14]` | `bg-[--bg-base]` → `#0A0B0F` | très proche |
| `bg-[#151A25]/60 backdrop-blur-md` | `bg-[--bg-surface]` → `#0F1421` | **solid + navy whisper** |
| `bg-[#051728]` (sidebar) | `bg-[--bg-surface]` → `#0F1421` | |
| `border-white/5` | `border-[--border-subtle]` | |
| `border-white/10` | `border-[--border-default]` | |
| `rounded-2xl` | `rounded-lg` | systematic |
| `shadow-xl shadow-black/20` | (delete) | |
| `text-zinc-400` | `text-[--text-secondary]` | |
| `text-zinc-500` | `text-[--text-tertiary]` | |
| `text-[#83E9FF]` | `text-[--brand]` | |
| `bg-[#83E9FF]` (tab actif) | `bg-[--brand]` text=`--brand-text-on` | |
| `bg-[#F9E370]` (boutons gold) | `bg-[--action]` (passe en cyan deep) | gold restreint |
| `font-higuen` | (delete) | drop serif |
| Tous les chiffres `<span>` | wrappés dans `<span className="font-mono tabular-nums">` | **non-négociable** |

### 11.2 Colonne Builder Fees → gold

Dans toutes les tables qui affichent une colonne de fees ou Builder Fees, ajouter la classe `.fees-cell` sur les `<td>` :

```diff
- <td className="...">${fees}</td>
+ <td className="... fees-cell">${fees}</td>
```

CSS :
```css
.fees-cell {
  color: var(--gold);
  font-weight: 500;
}
```

### 11.3 Checklist par page

- [ ] Tokens CSS variables en place dans `globals.css`
- [ ] Background page → `--bg-base`
- [ ] Surfaces cards → `--bg-surface` solid (pas de `/60` ni `backdrop-blur`)
- [ ] `rounded-2xl` → `rounded-lg`
- [ ] Shadows supprimées sur cards
- [ ] Tous les chiffres en `.mono` (`font-mono tabular-nums`)
- [ ] `font-higuen` supprimé
- [ ] Colonne Builder Fees → `.fees-cell` (gold)
- [ ] Watermark "LIQUID" sur charts principaux
- [ ] Boutons primary → `--action` (`#1692AD`)
- [ ] Donut charts → ajouter insight `Top N hold X% · Y slices`
- [ ] Hbar charts → ajouter footer pédagogique
- [ ] Light mode testé

### 11.4 Ordre de migration recommandé

1. **`tokens.css`** — tous les CSS variables
2. **Composants base** (`src/components/ui/`)
   - `Card.tsx`
   - `StatCard.tsx`
   - `DataTable.tsx` (avec support `.fees-cell`)
   - `Tabs.tsx`
   - `Badge.tsx`
   - `Button.tsx`
   - `Input.tsx`
   - `ChartWatermark.tsx`
   - `ThemeToggle.tsx`
3. **Page Dashboard** (vitrine, plus de visibilité)
4. **Page Builders** (data-heavy, démontre densité + gold)
5. **Pages Spot / Perpetual** (gros volume d'usage)
6. **Page Address Details** + autres pages restantes

---

## 12. Application à l'écosystème Liquid

| Produit | Application V4 |
|---|---|
| **Liquid Terminal / Explorer** | Palette complète, gold limité aux colonnes Builder Fees |
| **Liquid Market** | Palette complète, gold limité aux colonnes Fees |
| **Liquid Ecosystem** | Palette complète, gold absent |
| **Liquid Wiki** | Palette complète, contenu long → line-height augmenté (1.6) |
| **Liquid Products (premium)** | Palette complète + gold autorisé sur tier premium |
| **Liquid Fidelity (NFT)** | **Gold predominant**, navy + cyan en support |

---

## 13. Fichiers à créer côté projet

```
src/
├── styles/
│   ├── tokens.css         # tous les CSS variables (sections 2.1, 2.2, 2.3)
│   └── themes.css         # logique data-theme switching
├── components/
│   └── ui/
│       ├── Card.tsx
│       ├── StatCard.tsx
│       ├── DataTable.tsx
│       ├── Tabs.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── ThemeToggle.tsx
│       └── ChartWatermark.tsx
└── lib/
    └── theme.ts           # init theme, persistance
```

---

## Résumé exécutif

### Ce qui change vs V2 actuel
- Surfaces solides + whisper navy (`#0F1421`) au lieu de glassmorphism
- `rounded-lg 8px` au lieu de `rounded-2xl 16px`
- Tous les chiffres en JetBrains Mono tabular
- Higuen supprimé, Inter only
- Densité +30%, padding réduit, info plus dense
- **Builder Fees colonne en gold `#F9E370`** = marqueur d'identité
- Action color officiel `#1692AD` pour CTAs primaires
- Light mode cool blue (pas warm cream)
- Watermark "LIQUID" sur charts
- Newbie touches : insight donut, légende bps

### Ce qui reste de V2
- Bg-base `#0A0B0F` quasi identique
- Sidebar à 220px
- Header sticky 56px
- La marque Liquid (cyan + navy + gold) reste lisible
- Structure des pages (sidebar + header + main)

### Risque migration : **moyen**
Le user qui revient sur l'app la reconnaît immédiatement (couleurs Liquid présentes, layout familier), mais sent que c'est plus polished. Pas de choc visuel.
