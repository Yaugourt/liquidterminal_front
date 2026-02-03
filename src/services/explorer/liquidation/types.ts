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
  hours?: number;            // Fenêtre de temps en heures (pour recent endpoint)
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
 * Statistiques des liquidations pour une période
 */
export interface LiquidationStats {
  totalVolume: number;
  liquidationsCount: number;
  longCount: number;
  shortCount: number;
  topCoin: string;
  topCoinVolume: number;
  // Nouveaux champs ajoutés par le backend
  avgSize: number;      // Taille moyenne (totalVolume / liquidationsCount)
  maxLiq: number;       // Plus grosse liquidation
  longVolume: number;   // Volume total des Long
  shortVolume: number;  // Volume total des Short
}

/**
 * Réponse de l'API pour /stats/all (toutes les périodes)
 */
export interface LiquidationStatsAllResponse {
  success: boolean;
  stats: {
    "2h": LiquidationStats | null;
    "4h": LiquidationStats | null;
    "8h": LiquidationStats | null;
    "12h": LiquidationStats | null;
    "24h": LiquidationStats | null;
  };
  errors?: string[];
  metadata: {
    executionTimeMs: number;
    cachedAt: string;
  };
}

/**
 * Période disponible pour les données de chart
 */
export type ChartPeriod = "2h" | "4h" | "8h" | "12h" | "24h";

/**
 * Bucket de données agrégées pour le chart
 */
export interface ChartDataBucket {
  timestamp: string;       // ISO datetime (début du bucket)
  timestampMs: number;     // Pour le tri côté client
  totalVolume: number;     // Volume total en USD
  longVolume: number;      // Volume des longs liquidés
  shortVolume: number;     // Volume des shorts liquidés
  liquidationsCount: number; // Nombre total de liquidations
  longCount: number;       // Nombre de longs
  shortCount: number;      // Nombre de shorts
}

/**
 * Réponse de l'API pour /liquidations/chart-data
 */
export interface LiquidationChartDataResponse {
  success: boolean;
  period: ChartPeriod;
  interval: "5m" | "15m" | "30m";
  buckets: ChartDataBucket[];
  metadata: {
    bucketCount: number;
    totalLiquidations: number;
    totalVolume: number;
    executionTimeMs: number;
    cachedAt: string;
    dataSource: "stats-cache" | "historical-fetch";
  };
}

/**
 * Données combinées stats + chart pour une période
 */
export interface LiquidationsPeriodData {
  stats: LiquidationStats;
  chart: {
    interval: "5m" | "15m" | "30m";
    buckets: ChartDataBucket[];
  };
}

/**
 * Réponse de l'API pour /liquidations/data (endpoint unifié)
 */
export interface LiquidationsDataResponse {
  success: boolean;
  periods: {
    "2h": LiquidationsPeriodData;
    "4h": LiquidationsPeriodData;
    "8h": LiquidationsPeriodData;
    "12h": LiquidationsPeriodData;
    "24h": LiquidationsPeriodData;
  };
  metadata: {
    executionTimeMs: number;
    cachedAt: string;
  };
}

// ============================================
// WebSocket Types
// ============================================

/**
 * Filtres pour la subscription WebSocket liquidations
 */
export interface LiquidationWSFilters {
  coins?: string[];        // Filtrer par coins (ex: ["BTC", "ETH"])
  minAmountUsd?: number;   // Montant minimum en USD
  wallets?: string[];      // Filtrer par wallets liquidés
}

/**
 * Types de messages WebSocket
 */
export type LiquidationWSMessageType = 
  | 'connected' 
  | 'subscribed' 
  | 'liquidation' 
  | 'heartbeat' 
  | 'error';

/**
 * Message WebSocket reçu du serveur
 */
export interface LiquidationWSMessage {
  type: LiquidationWSMessageType;
  data?: Liquidation | { filters?: LiquidationWSFilters };
  timestamp: string;
  error?: string;
}

/**
 * Message de subscription envoyé au serveur
 */
export interface LiquidationWSSubscription {
  method: 'subscribe';
  subscription: {
    type: 'liquidation';
    filters?: LiquidationWSFilters;
  };
}

/**
 * État du store WebSocket liquidations
 */
export interface LiquidationWSStore {
  // État de connexion
  isConnected: boolean;
  isSubscribed: boolean;
  error: string | null;
  
  // Données temps réel
  recentLiquidations: Liquidation[];
  
  // Filtres actifs
  filters: LiquidationWSFilters;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  updateFilters: (filters: LiquidationWSFilters) => void;
  clearLiquidations: () => void;
  
  // Callback pour notifications externes
  onLiquidation?: (liq: Liquidation) => void;
  setOnLiquidation: (callback: ((liq: Liquidation) => void) | undefined) => void;
}

/**
 * Options pour le hook useLiquidationsWebSocket
 */
export interface UseLiquidationsWSOptions {
  enabled?: boolean;
  filters?: LiquidationWSFilters;
  onLiquidation?: (liq: Liquidation) => void;
  maxRecentItems?: number;
}
