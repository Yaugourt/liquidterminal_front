# Migration Guide: Number Flow & Number Fade

## 📋 Vue d'ensemble

Ce guide explique comment migrer vers les animations **Number Flow** et **Number Fade** pour améliorer l'UX lors des mises à jour de données en temps réel.

## 🎯 Objectifs

- **Number Fade** : Transition douce avec fade in/out lors du changement de valeurs
- **Number Flow** : Animation slide up/down pour un effet dynamique
- **Améliorer l'UX** : Éviter les clignotements brutaux lors des mises à jour

## 🔧 1. Prérequis CSS

### Ajouter les animations dans `src/app/globals.css`

```css
/* Animations personnalisées pour Number Flow */
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

## 🧩 2. Composants d'animation

### Créer `src/components/ui/NumberAnimations.tsx`

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Composant Number Fade
export const NumberFade = ({ 
  value, 
  className,
  duration = 300 
}: { 
  value: string; 
  className?: string;
  duration?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        const timer2 = setTimeout(() => {
          setIsAnimating(false);
          prevValue.current = value;
        }, duration / 2);
        return () => clearTimeout(timer2);
      }, duration / 2);
      return () => clearTimeout(timer);
    }
  }, [value, duration]);

  return (
    <div 
      className={cn(
        "transition-opacity ease-in-out",
        isAnimating ? "opacity-30" : "opacity-100",
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {displayValue}
    </div>
  );
};

// Composant Number Flow
export const NumberFlow = ({ 
  value, 
  className,
  duration = 300 
}: { 
  value: string; 
  className?: string;
  duration?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
        prevValue.current = value;
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [value, duration]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div 
        className={cn(
          "transition-all ease-out",
          isAnimating ? "transform translate-y-[-100%] opacity-0" : "transform translate-y-0 opacity-100"
        )}
        style={{ transitionDuration: `${duration}ms` }}
      >
        {displayValue}
      </div>
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="transform translate-y-[100%] opacity-0"
            style={{ 
              animation: `slideUp ${duration}ms ease-out forwards` 
            }}
          >
            {value}
          </div>
        </div>
      )}
    </div>
  );
};

// Hook pour choisir le type d'animation
export const useNumberAnimation = (
  value: string,
  type: 'fade' | 'flow' | 'none' = 'none',
  className?: string,
  duration?: number
) => {
  if (type === 'fade') {
    return <NumberFade value={value} className={className} duration={duration} />;
  }
  if (type === 'flow') {
    return <NumberFlow value={value} className={className} duration={duration} />;
  }
  return <span className={className}>{value}</span>;
};
```

## 🔄 3. Migration des composants existants

### Exemple 1: Migration d'un StatCard

**Avant :**
```tsx
// src/components/dashboard/StatsCard.tsx
export function StatsCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-[#051728] border border-[#83E9FF4D] rounded-md p-3">
      <h3 className="text-xs text-[#FFFFFF80]">{title}</h3>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}
```

**Après :**
```tsx
// src/components/dashboard/StatsCard.tsx
import { NumberFade, NumberFlow } from '@/components/ui/NumberAnimations';

export function StatsCard({ 
  title, 
  value, 
  animationType = 'fade' 
}: { 
  title: string; 
  value: string;
  animationType?: 'fade' | 'flow' | 'none';
}) {
  const renderValue = () => {
    switch (animationType) {
      case 'fade':
        return <NumberFade value={value} className="text-sm font-medium text-white" />;
      case 'flow':
        return <NumberFlow value={value} className="text-sm font-medium text-white" />;
      default:
        return <span className="text-sm font-medium text-white">{value}</span>;
    }
  };

  return (
    <div className="bg-[#051728] border border-[#83E9FF4D] rounded-md p-3">
      <h3 className="text-xs text-[#FFFFFF80]">{title}</h3>
      {renderValue()}
    </div>
  );
}
```

### Exemple 2: Migration du StatsGrid

**Avant :**
```tsx
// src/components/dashboard/StatsGrid.tsx
export function StatsGrid() {
  const { stats, isLoading, error } = useDashboardStats();
  
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay />;

  return (
    <div className="grid grid-cols-5 gap-3">
      <StatsCard title="Users" value={formatNumber(stats.users)} />
      <StatsCard title="Volume" value={formatNumber(stats.volume)} />
      {/* ... autres stats */}
    </div>
  );
}
```

**Après :**
```tsx
// src/components/dashboard/StatsGrid.tsx
export function StatsGrid({ animationType = 'fade' }: { animationType?: 'fade' | 'flow' | 'none' }) {
  const { stats, isLoading, error } = useDashboardStats();
  
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay />;

  return (
    <div className="grid grid-cols-5 gap-3">
      <StatsCard 
        title="Users" 
        value={formatNumber(stats.users)} 
        animationType={animationType}
      />
      <StatsCard 
        title="Volume" 
        value={formatNumber(stats.volume)} 
        animationType={animationType}
      />
      {/* ... autres stats */}
    </div>
  );
}
```

## 🎨 4. Cas d'usage spécifiques

### Pour les prix en temps réel
```tsx
// src/components/market/PriceDisplay.tsx
import { NumberFlow } from '@/components/ui/NumberAnimations';

export function PriceDisplay({ price }: { price: number }) {
  return (
    <div className="flex items-center">
      <span className="text-gray-400 mr-1">$</span>
      <NumberFlow 
        value={price.toFixed(2)} 
        className="text-lg font-bold text-white"
        duration={400}
      />
    </div>
  );
}
```

### Pour les métriques de dashboard
```tsx
// src/components/dashboard/MetricCard.tsx
import { NumberFade } from '@/components/ui/NumberAnimations';

export function MetricCard({ label, value, format }: MetricCardProps) {
  return (
    <div className="p-4 bg-card rounded-lg">
      <p className="text-sm text-muted-foreground">{label}</p>
      <NumberFade 
        value={format(value)} 
        className="text-2xl font-semibold"
        duration={250}
      />
    </div>
  );
}
```

## 🔧 5. Configuration par composant

### Créer un hook de configuration
```tsx
// src/hooks/useAnimationConfig.ts
export const useAnimationConfig = (componentType: string) => {
  const configs = {
    'stats-grid': { type: 'fade', duration: 300 },
    'price-display': { type: 'flow', duration: 400 },
    'metric-card': { type: 'fade', duration: 250 },
    'trading-data': { type: 'flow', duration: 200 },
  };

  return configs[componentType] || { type: 'none', duration: 0 };
};
```

### Utilisation
```tsx
export function TradingCard() {
  const animConfig = useAnimationConfig('trading-data');
  
  return (
    <NumberFlow 
      value={tradingValue} 
      duration={animConfig.duration}
      className="text-lg font-mono"
    />
  );
}
```

## 📊 6. Migration par étapes

### Phase 1: Composants critiques
1. **StatsGrid** - Fade (subtil pour dashboard)
2. **PriceDisplay** - Flow (dynamique pour prix)
3. **MetricCards** - Fade (élégant pour métriques)

### Phase 2: Composants secondaires
1. **VolumeDisplay** - Flow
2. **PercentageChange** - Fade
3. **CounterDisplay** - Flow

### Phase 3: Optimisation
1. **Performance monitoring**
2. **Animation timing** ajustements
3. **Accessibility** considerations

## ⚡ 7. Optimisations

### Lazy loading des animations
```tsx
// src/components/ui/LazyNumberAnimations.tsx
import { lazy, Suspense } from 'react';

const NumberFlow = lazy(() => import('./NumberAnimations').then(m => ({ default: m.NumberFlow })));
const NumberFade = lazy(() => import('./NumberAnimations').then(m => ({ default: m.NumberFade })));

export function LazyNumberAnimation({ type, ...props }) {
  if (type === 'flow') {
    return (
      <Suspense fallback={<span>{props.value}</span>}>
        <NumberFlow {...props} />
      </Suspense>
    );
  }
  
  return (
    <Suspense fallback={<span>{props.value}</span>}>
      <NumberFade {...props} />
    </Suspense>
  );
}
```

### Réduire les re-renders
```tsx
// src/components/ui/MemoizedNumberAnimations.tsx
import { memo } from 'react';
import { NumberFade, NumberFlow } from './NumberAnimations';

export const MemoizedNumberFade = memo(NumberFade);
export const MemoizedNumberFlow = memo(NumberFlow);
```

## 🧪 8. Tests

### Test des animations
```tsx
// src/components/ui/__tests__/NumberAnimations.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { NumberFade, NumberFlow } from '../NumberAnimations';

describe('NumberAnimations', () => {
  it('should animate value changes in NumberFade', async () => {
    const { rerender } = render(<NumberFade value="100" />);
    
    rerender(<NumberFade value="200" />);
    
    await waitFor(() => {
      expect(screen.getByText('200')).toBeInTheDocument();
    });
  });

  it('should handle rapid value changes in NumberFlow', async () => {
    const { rerender } = render(<NumberFlow value="100" />);
    
    rerender(<NumberFlow value="200" />);
    rerender(<NumberFlow value="300" />);
    
    await waitFor(() => {
      expect(screen.getByText('300')).toBeInTheDocument();
    });
  });
});
```

## 🎛️ 9. Configuration globale

### Créer un provider d'animations
```tsx
// src/contexts/AnimationContext.tsx
import { createContext, useContext } from 'react';

interface AnimationConfig {
  enableAnimations: boolean;
  defaultDuration: number;
  defaultType: 'fade' | 'flow' | 'none';
}

const AnimationContext = createContext<AnimationConfig>({
  enableAnimations: true,
  defaultDuration: 300,
  defaultType: 'fade'
});

export const useAnimationContext = () => useContext(AnimationContext);

export function AnimationProvider({ children, config }: { children: React.ReactNode; config: AnimationConfig }) {
  return (
    <AnimationContext.Provider value={config}>
      {children}
    </AnimationContext.Provider>
  );
}
```

## 🚀 10. Checklist de migration

### Préparation
- [ ] Ajouter les animations CSS dans `globals.css`
- [ ] Créer le fichier `NumberAnimations.tsx`
- [ ] Configurer le provider d'animations (optionnel)

### Migration des composants
- [ ] Identifier les composants avec des valeurs numériques
- [ ] Migrer `StatsGrid` avec `NumberFade`
- [ ] Migrer `PriceDisplay` avec `NumberFlow`
- [ ] Migrer `MetricCard` avec `NumberFade`

### Tests et optimisation
- [ ] Tester les performances avec de nombreuses animations
- [ ] Vérifier l'accessibilité (prefers-reduced-motion)
- [ ] Optimiser les re-renders avec memo
- [ ] Ajouter des tests unitaires

### Déploiement
- [ ] Tester en environnement de staging
- [ ] Monitorer les performances en production
- [ ] Recueillir les retours utilisateurs

## 🎯 Recommandations finales

1. **Commencer petit** : Migrer d'abord les composants les plus visibles
2. **Tester l'impact** : Mesurer les performances avant/après
3. **Cohérence** : Utiliser les mêmes durées pour des composants similaires
4. **Accessibilité** : Respecter `prefers-reduced-motion`
5. **Feedback** : Recueillir les retours utilisateurs sur l'UX

Cette migration améliorera significativement l'expérience utilisateur en rendant les mises à jour de données plus fluides et moins distrayantes. 