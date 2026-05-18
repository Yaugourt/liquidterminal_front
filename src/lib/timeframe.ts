/**
 * Identifiants de timeframe canoniques utilisés à travers l'app (UI).
 *
 * Source unique pour le composant `<TimeframeTabs>`. Chaque page choisit son
 * sous-ensemble via la prop `options`. La validation API côté Builders garde
 * son propre schéma Zod (`BuildersTimeframeSchema`), aligné sur ce type.
 */
export type Timeframe = '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

/** Libellé court affiché dans les onglets. */
export const TIMEFRAME_LABEL: Record<Timeframe, string> = {
  '1h': '1H',
  '24h': '24H',
  '7d': '7D',
  '30d': '30D',
  '90d': '90D',
  '1y': '1Y',
  all: 'All',
};

/** Durée approximative en millisecondes (`null` pour `all`). */
export const TIMEFRAME_MS: Record<Timeframe, number | null> = {
  '1h': 3_600_000,
  '24h': 86_400_000,
  '7d': 604_800_000,
  '30d': 2_592_000_000,
  '90d': 7_776_000_000,
  '1y': 31_536_000_000,
  all: null,
};
