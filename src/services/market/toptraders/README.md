# Service Top Traders

Service pour récupérer et afficher le classement des meilleurs traders sur les dernières 24h.

## Architecture

Ce service suit l'architecture 4-layer standard du projet:

```
src/services/market/toptraders/
├── api.ts              # Appels API (Layer 1)
├── types.ts            # Interfaces TypeScript (Layer 2)
├── hooks/              # Hooks React (Layer 3)
│   └── useTopTraders.ts
├── index.ts            # Exports centralisés
├── README.md           # Documentation
└── USAGE_EXAMPLE.tsx   # Exemples d'utilisation
```

## Types de Tri Disponibles

| Sort Type | Description                                                     |
| --------- | --------------------------------------------------------------- |
| `pnl_pos` | Top traders par PnL positif (les plus profitables) - **Défaut** |
| `pnl_neg` | Top traders par PnL négatif (les plus grosses pertes)           |
| `volume`  | Top traders par volume de trading                               |
| `trades`  | Top traders par nombre de trades                                |

## Utilisation de Base

### Import

```typescript
import { useTopTraders } from "@/services/market/toptraders";
```

### Exemple Simple

```typescript
function MyComponent() {
  const { traders, isLoading, error } = useTopTraders({
    sort: 'pnl_pos',
    limit: 50
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {traders.map(trader => (
        <div key={trader.user}>
          {trader.user} - PnL: ${trader.totalPnl}
        </div>
      ))}
    </div>
  );
}
```

### Exemple avec Changement de Tri

```typescript
function TopTradersTable() {
  const [sort, setSort] = useState<TopTradersSortType>('pnl_pos');

  const { traders, metadata } = useTopTraders({ sort, limit: 20 });

  return (
    <div>
      <select value={sort} onChange={e => setSort(e.target.value)}>
        <option value="pnl_pos">Top Profits</option>
        <option value="pnl_neg">Top Losses</option>
        <option value="volume">Top Volume</option>
        <option value="trades">Most Active</option>
      </select>

      {/* Affichage des traders... */}
    </div>
  );
}
```

## Interface TopTrader

```typescript
interface TopTrader {
    user: string; // Adresse wallet (0x...)
    tradeCount: number; // Nombre de trades sur 24h
    totalVolume: number; // Volume total en USD
    winRate: number; // Taux de réussite (0-1, ex: 0.75 = 75%)
    totalPnl: number; // PnL total en USD (peut être négatif)
}
```

## Hook: useTopTraders

### Paramètres

```typescript
interface UseTopTradersOptions {
    sort?: TopTradersSortType; // Type de tri (défaut: 'pnl_pos')
    limit?: number; // Nombre de traders (défaut: 50, max: 50)
    initialData?: TopTrader[]; // Données initiales (optionnel)
}
```

### Retour

```typescript
interface UseTopTradersResult {
    traders: TopTrader[]; // Liste des traders
    metadata: {
        // Métadonnées de la réponse
        sort: TopTradersSortType;
        limit: number;
        executionTimeMs: number;
        cachedAt: string;
    } | null;
    isLoading: boolean; // État de chargement
    error: Error | null; // Erreur éventuelle
    refetch: () => Promise<void>; // Fonction de rafraîchissement
}
```

## Fonctionnement

### Rafraîchissement Automatique

- **Interval**: 60 secondes
- **Cache Backend**: ~55 secondes
- **Stratégie**: Le changement de tri est instantané car toutes les variantes sont pré-fetchées en background côté backend

### Gestion des Erreurs

- Utilise `withErrorHandling` pour gérer les erreurs de manière cohérente
- Retries automatiques: 3 tentatives
- Erreurs accessibles via la propriété `error` du hook

### Performance

- Utilise `useMemo` pour éviter les re-renders inutiles
- Cache automatique via `useDataFetching`
- Refresh interval optimisé pour s'aligner avec le cache backend

## Affichage des Données

### Win Rate

La valeur est entre 0 et 1. Multipliez par 100 pour afficher en pourcentage:

```typescript
{(trader.winRate * 100).toFixed(1)}%
```

### PnL

Peut être négatif (surtout avec `sort='pnl_neg'`):

```typescript
<span className={trader.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
  ${formatLargeNumber(Math.abs(trader.totalPnl))}
  {trader.totalPnl < 0 && ' loss'}
</span>
```

### Adresse Wallet

Utilisez le format court pour l'affichage:

```typescript
{trader.user.slice(0, 6)}...{trader.user.slice(-4)}
```

## Intégration dans une Page

1. **Import du hook**

```typescript
import { useTopTraders, TopTradersSortType } from "@/services/market/toptraders";
```

2. **Utilisation dans le composant**

```typescript
const { traders, isLoading, error, refetch } = useTopTraders({
    sort: "pnl_pos",
    limit: 50,
});
```

3. **Affichage avec les classes du design system**

- Utiliser le composant `Card` de `@/components/ui/card` pour les containers
- Utiliser `text-text-secondary` pour les labels
- Utiliser `text-emerald-400` pour les valeurs positives
- Utiliser `text-rose-400` pour les valeurs négatives

## Exemples Complets

Voir [USAGE_EXAMPLE.tsx](./USAGE_EXAMPLE.tsx) pour des exemples complets d'intégration avec:

- Table complète avec design system
- Filtres de tri
- Loading et error states
- Formatage des données

## API Endpoint

**Endpoint**: `GET /top-traders`

**Query Params**:

- `sort`: Type de classement (pnl_pos | pnl_neg | volume | trades)
- `limit`: Nombre de traders (1-50)

**Exemple**:

```
/top-traders?sort=pnl_pos&limit=20
```

## Notes Importantes

1. **Rafraîchissement**: Les données sont mises en cache côté backend pendant ~55s et rafraîchies toutes les 60s. Le hook est configuré en conséquence.

2. **Changement de Tri**: Instantané car toutes les variantes sont pré-fetchées en background côté backend.

3. **Win Rate**: Valeur entre 0 et 1 - multiplier par 100 pour l'affichage en pourcentage.

4. **PnL Négatif**: Avec `sort=pnl_neg`, le totalPnl sera négatif (traders en perte).

5. **Performance**: Utilise le système de cache et retry automatique de `useDataFetching`.
