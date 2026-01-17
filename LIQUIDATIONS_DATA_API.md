# API Liquidations Data (Endpoint Unifié)

## Objectif

Combiner `/stats/all` et `/chart-data` en **un seul endpoint** pour réduire les appels API de 67%.

---

## Endpoint

### `GET /api/v1/liquidations/data`

Retourne stats ET buckets chart pour toutes les périodes en un seul appel.

---

## Response Format

```typescript
interface LiquidationsDataResponse {
    success: boolean;
    periods: {
        "2h": PeriodData;
        "4h": PeriodData;
        "8h": PeriodData;
        "12h": PeriodData;
        "24h": PeriodData;
    };
    metadata: {
        executionTimeMs: number;
        cachedAt: string;
    };
}

interface PeriodData {
    stats: {
        totalVolume: number;
        liquidationsCount: number;
        longCount: number;
        shortCount: number;
        topCoin: string;
        topCoinVolume: number;
        avgSize: number;
        maxLiq: number;
        longVolume: number;
        shortVolume: number;
    };
    chart: {
        interval: "5m" | "15m" | "30m";
        buckets: ChartBucket[];
    };
}

interface ChartBucket {
    timestamp: string;
    timestampMs: number;
    totalVolume: number;
    longVolume: number;
    shortVolume: number;
    liquidationsCount: number;
    longCount: number;
    shortCount: number;
}
```

---

## Exemple de Réponse

```json
{
  "success": true,
  "periods": {
    "2h": {
      "stats": {
        "totalVolume": 1234567.89,
        "liquidationsCount": 156,
        "longCount": 78,
        "shortCount": 78,
        "topCoin": "BTC",
        "topCoinVolume": 500000,
        "avgSize": 7913.38,
        "maxLiq": 125000,
        "longVolume": 600000,
        "shortVolume": 634567.89
      },
      "chart": {
        "interval": "5m",
        "buckets": [
          {
            "timestamp": "2026-01-15T20:00:00.000Z",
            "timestampMs": 1768446000000,
            "totalVolume": 45678.90,
            "longVolume": 20000,
            "shortVolume": 25678.90,
            "liquidationsCount": 12,
            "longCount": 5,
            "shortCount": 7
          }
        ]
      }
    },
    "4h": { ... },
    "8h": { ... },
    "12h": { ... },
    "24h": { ... }
  },
  "metadata": {
    "executionTimeMs": 45,
    "cachedAt": "2026-01-15T21:00:00.000Z"
  }
}
```

---

## Intervalles Chart par Période

| Période | Intervalle | Buckets |
| ------- | ---------- | ------- |
| 2h      | 5min       | 24      |
| 4h      | 5min       | 48      |
| 8h      | 15min      | 32      |
| 12h     | 15min      | 48      |
| 24h     | 30min      | 48      |

---

## Cache

**TTL : 60 secondes** (même que `/stats/all`)

---

## Implémentation Backend

```typescript
// Pseudo-code
async function getLiquidationsData() {
  // Réutiliser le cache existant de /stats/all
  const cached = await redis.get('liquidations:all-data');
  if (cached) return cached;

  // Fetch les 5000 liquidations (déjà fait dans stats/all)
  const liquidations = await fetchLiquidations(24h, 5000);

  // Calculer stats + buckets pour chaque période
  const periods = {};
  for (const period of ['2h', '4h', '8h', '12h', '24h']) {
    const filtered = filterByPeriod(liquidations, period);
    periods[period] = {
      stats: calculateStats(filtered),
      chart: {
        interval: getInterval(period),
        buckets: aggregateToBuckets(filtered, period)
      }
    };
  }

  await redis.set('liquidations:all-data', periods, 60);
  return periods;
}
```

---

## Migration Frontend

```typescript
// ❌ Avant : 2 endpoints
const stats = await fetch("/stats/all");
const chart = await fetch("/chart-data?period=24h");

// ✅ Après : 1 endpoint, tout en mémoire
const { periods } = await fetch("/liquidations/data");
// periods['24h'].stats pour les stats
// periods['24h'].chart.buckets pour le chart
```

---

## Gains

| Métrique                      | Avant    | Après    |
| ----------------------------- | -------- | -------- |
| Appels au chargement          | 3        | 1        |
| Appels par changement période | 1        | 0        |
| Payload estimé                | ~10KB x3 | ~25KB x1 |
