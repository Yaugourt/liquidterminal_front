export interface Project {
  id: number;
  title: string;
  desc: string;
  logo: string;
  banner?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  website?: string;
  token?: string;
  /** DefiLlama protocol slug when the project is tracked there (drives metrics). */
  defillamaSlug?: string | null;
  createdAt: string;
  updatedAt: string;
  categories?: Category[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  sort?: 'createdAt' | 'title' | 'updatedAt';
  order?: 'asc' | 'desc';
  search?: string;
  categoryIds?: number[];
}

// Hook result types
export interface UseProjectsResult {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UseCategoriesResult {
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// ==================== PROJECT METRICS (DeFiLlama-like, multi-source) ====================
// Mirrors the backend GET /project/:id/metrics payload (projectMetrics.types.ts).

export type ProjectDataSourceType =
  | 'HL_SPOT_TOKEN'
  | 'DEFILLAMA'
  | 'HL_BUILDER'
  | 'HL_VAULT'
  | 'MANUAL';

/** A single metric value tagged with its source and freshness. */
export interface MetricValue {
  value: number;
  source: string;
  unit?: string;
  asOf: number; // epoch ms
}

/** A point in a historical series. */
export interface SeriesPoint {
  t: number; // epoch ms
  v: number;
}

/** Source-agnostic metric bundle. Every field is optional — a project may expose only some. */
export interface NormalizedMetrics {
  tvl?: MetricValue;
  volume24h?: MetricValue;
  fees24h?: MetricValue;
  revenue24h?: MetricValue;
  price?: MetricValue;
  marketCap?: MetricValue;
  fdv?: MetricValue;
  change24h?: MetricValue;
  holders?: MetricValue;
  series?: {
    tvl?: SeriesPoint[];
    fees?: SeriesPoint[];
    volume?: SeriesPoint[];
  };
}

export interface ProjectMetrics {
  projectId: number;
  metrics: NormalizedMetrics;
  sources: ProjectDataSourceType[];
  updatedAt: number; // epoch ms
}

// ==================== DEFILLAMA OVERVIEW (GET /project/:id/defillama) ====================

/** Compact volume/fees/revenue block from the backend DefiLlama aggregate. */
export interface DefiLlamaMoneyBlock {
  total24h: number | null;
  total7d: number | null;
  total30d: number | null;
  totalAllTime: number | null;
  change_1d: number | null;
}

/** Current token price entry (from coins.llama.fi, proxied by the backend). */
export interface DefiLlamaCoinPrice {
  price: number;
  symbol: string;
  timestamp: number; // epoch seconds
  confidence: number;
}

/** Backend payload of GET /project/:id/defillama — every enrichment is nullable. */
export interface ProjectDefiLlamaOverview {
  slug: string;
  name: string;
  logo: string | null;
  category: string | null;
  chains: string[];
  gecko_id: string | null;
  tvl: number | null;
  mcap: number | null;
  currentChainTvls: Record<string, number> | null;
  price: DefiLlamaCoinPrice | null;
  volume: DefiLlamaMoneyBlock | null;
  fees: DefiLlamaMoneyBlock | null;
  revenue: DefiLlamaMoneyBlock | null;
}

export interface ProjectDefiLlamaResponse {
  success: boolean;
  data: ProjectDefiLlamaOverview;
}

/**
 * Full DefiLlama fundamentals of a project: the normalized snapshot plus the
 * multi-period fees/revenue blocks (24h/7d/30d/all-time) and the token symbol,
 * which the verdict design surfaces (Fees & revenue table, price KPI cell).
 */
export interface ProjectFundamentals {
  metrics: NormalizedMetrics;
  fees: DefiLlamaMoneyBlock | null;
  revenue: DefiLlamaMoneyBlock | null;
  tokenSymbol: string | null;
}

export interface UseProjectMetricsResult {
  /** Normalized metrics, `undefined` while loading or when the project isn't linked to DefiLlama. */
  metrics: NormalizedMetrics | undefined;
  /** Multi-period fees block (24h/7d/30d/all-time + Δ1d), when the protocol has a fees module. */
  fees: DefiLlamaMoneyBlock | null;
  /** Multi-period revenue block, when available. */
  revenue: DefiLlamaMoneyBlock | null;
  /** Token symbol from the price feed (e.g. "HPL"), when the project has a token. */
  tokenSymbol: string | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// ==================== HYPERLIQUID CONTEXT (GET /project/:id/context) ====================
// Mirrors the backend defillama-context.types.ts. All figures are chain-scoped
// ("on Hyperliquid L1"); global numbers live in the overview payload above.

export interface DefiLlamaChainStats {
  tvl: number | null;
  fees24h: number | null;
  volumeDex24h: number | null;
  protocolsTracked: number;
}

export interface ProjectPeer {
  rank: number;
  name: string;
  slug: string;
  hlTvl: number;
  shareOfCategoryPct: number | null;
  change7d: number | null;
  projectId: number | null;
  logo: string | null;
  isCurrent: boolean;
}

export interface ProjectPosition {
  slug: string;
  hlTvl: number;
  hlBorrowed: number | null;
  shareOfChainPct: number | null;
  category: string | null;
  categoryRank: number | null;
  categorySize: number | null;
  categoryTvl: number | null;
  shareOfCategoryPct: number | null;
  change7d: number | null;
  monoChain: boolean;
  fees24h: number | null;
  feesRank24h: number | null;
  feesRankCount: number | null;
  volume24h: number | null;
  volumeRank24h: number | null;
  volumeRankCount: number | null;
}

export interface ProjectContext {
  chain: DefiLlamaChainStats;
  position: ProjectPosition | null;
  peers: ProjectPeer[];
  peersScope: 'defillama-category' | 'db-category' | 'none';
}

/** One row of GET /defillama/projects-map — card decoration + TVL sort. */
export interface ProjectListMetric {
  projectId: number;
  slug: string;
  hlTvl: number | null;
  globalTvl: number | null;
  hlRank: number | null;
  category: string | null;
  categoryRank: number | null;
  fees24h: number | null;
  feesRank24h: number | null;
  change7d: number | null;
}

export interface UseProjectsMetricsMapResult {
  /** Map keyed by projectId; empty while loading or when nothing is linked. */
  metricsById: Map<number, ProjectListMetric>;
  isLoading: boolean;
  error: Error | null;
}

/** Backend payload of GET /defillama/tvl-history/:slug. */
export interface ProjectTvlHistory {
  slug: string;
  hl: SeriesPoint[] | null;
  global: SeriesPoint[] | null;
}

export interface UseProjectContextResult {
  context: ProjectContext | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseTvlHistoryResult {
  history: ProjectTvlHistory | undefined;
  isLoading: boolean;
  error: Error | null;
}

export interface UseChainStatsResult {
  stats: DefiLlamaChainStats | undefined;
  isLoading: boolean;
  error: Error | null;
}

// Types pour les mutations
export interface CreateProjectInput {
  title: string;
  desc: string;
  logo: string;
  banner?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  website?: string;
  token?: string;
  categoryIds?: number[];
}

// Nouveau type pour la création avec upload de fichier
export interface CreateProjectWithUploadInput {
  title: string;
  desc: string;
  logo?: File; // Fichier uploadé
  banner?: File; // Fichier uploadé
  twitter?: string;
  discord?: string;
  telegram?: string;
  website?: string;
  token?: string;
  categoryIds?: number[];
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

// Types de réponse pour les mutations
export interface ProjectResponse {
  success: boolean;
  data: Project;
  message?: string;
}

export interface CategoryResponse {
  success: boolean;
  data: Category;
  message?: string;
}

// Types pour les hooks de mutation
export interface UseCreateProjectResult {
  createProject: (data: CreateProjectInput) => Promise<Project | null>;
  createProjectWithUpload: (data: CreateProjectWithUploadInput) => Promise<Project | null>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseCreateCategoryResult {
  createCategory: (data: CreateCategoryInput) => Promise<Category | null>;
  isLoading: boolean;
  error: Error | null;
}

// ==================== TYPES POUR UPLOAD CSV PROJETS ====================
interface ProjectCsvUploadError {
  row: number;
  error: string;
  data: {
    title: string;
    desc: string;
    logo: string;
    category?: string;
    twitter?: string;
    discord?: string;
    telegram?: string;
    website?: string;
  };
}

interface ProjectCsvUploadResult {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: ProjectCsvUploadError[];
  createdCategories: string[];
  createdProjects: Project[];
}

interface ProjectCsvUploadResponse {
  success: true;
  message: string;
  data: ProjectCsvUploadResult;
}

interface ProjectCsvUploadErrorResponse {
  success: false;
  error: string;
  code: string;
}

export type ProjectCsvUploadApiResponse = ProjectCsvUploadResponse | ProjectCsvUploadErrorResponse; 
export interface UseProjectResult {
  project: Project | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
