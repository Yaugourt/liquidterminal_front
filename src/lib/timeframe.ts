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
