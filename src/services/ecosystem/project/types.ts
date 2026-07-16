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

export interface UseProjectMetricsResult {
  /** Normalized metrics, `undefined` while loading or when the project isn't linked to DefiLlama. */
  metrics: NormalizedMetrics | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
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
