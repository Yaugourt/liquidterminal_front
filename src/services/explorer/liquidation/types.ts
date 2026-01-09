/**
 * Types pour les liquidations basés sur l'API Hypedexer
 */

/**
 * Direction de la liquidation
 */
export type LiquidationDirection = 'Long' | 'Short';

/**
 * Structure d'une liquidation individuelle
 */
export interface Liquidation {
  time: string;              // ISO datetime "2026-01-08T10:28:36"
  time_ms: number;           // Timestamp en millisecondes
  coin: string;              // Symbole crypto (ex: "BTC", "ETH", "xyz:AAPL")
  hash: string;              // Hash de transaction
  liquidated_user: string;   // Adresse wallet liquidée
  size_total: number;        // Taille totale de la position
  notional_total: number;    // Valeur notionnelle en USD
  fill_px_vwap: number;      // Prix moyen pondéré (VWAP)
  mark_px: number;           // Prix mark
  method: string;            // Méthode (ex: "market")
  fee_total_liquidated: number; // Frais de liquidation
  liquidators: string[];     // Liste des adresses liquidateurs
  liquidator_count: number;  // Nombre de liquidateurs
  liq_dir: LiquidationDirection; // Direction de la liquidation
  tid: number;               // Trade ID (unique)
}

/**
 * Réponse de l'API pour les liquidations
 */
export interface LiquidationResponse {
  success: boolean;
  message: string;
  data: Liquidation[];
  total_count: number | null;
  execution_time_ms: number;
  next_cursor: string | null;  // Pour pagination : "<time_ms>:<tid>"
  has_more: boolean;
}

/**
 * Paramètres de requête pour les liquidations
 */
export interface LiquidationsParams {
  coin?: string;             // Symbole crypto (ex: BTC, ETH, SOL)
  user?: string;             // Adresse wallet du liquidated_user
  start_time?: string;       // Date/heure de début (ISO UTC)
  end_time?: string;         // Date/heure de fin (ISO UTC)
  amount_dollars?: number;   // Montant notionnel minimum en USD
  limit?: number;            // Nombre max de résultats (1-1000, défaut: 100)
  cursor?: string;           // Curseur keyset format <time_ms>:<tid>
  order?: 'ASC' | 'DESC';    // Tri par temps (défaut: DESC)
}

/**
 * Options pour le hook useLiquidations
 */
export interface UseLiquidationsOptions extends LiquidationsParams {
  refreshInterval?: number;  // Intervalle de rafraîchissement en ms
}

/**
 * Résultat du hook useLiquidations
 */
export interface UseLiquidationsResult {
  liquidations: Liquidation[];
  totalCount: number | null;
  nextCursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateParams: (params: Partial<LiquidationsParams>) => void;
  loadMore: () => void;
}

/**
 * Statistiques des liquidations (pour les stats cards)
 */
export interface LiquidationStats {
  volume24h: number;         // Volume total en USD sur 24h
  count24h: number;          // Nombre de liquidations sur 24h
  longCount: number;         // Nombre de liquidations Long
  shortCount: number;        // Nombre de liquidations Short
  topCoin: string;           // Coin le plus liquidé
  topCoinVolume: number;     // Volume du coin le plus liquidé
}
