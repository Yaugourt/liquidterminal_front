import { isAxiosError } from 'axios';
import { get, post, apiClient } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import {
  ProjectsResponse,
  CategoriesResponse,
  ProjectQueryParams,
  Project,
  CreateProjectInput,
  CreateProjectWithUploadInput,
  CreateCategoryInput,
  ProjectResponse,
  CategoryResponse,
  ProjectCsvUploadApiResponse,
  ProjectDefiLlamaOverview,
  ProjectDefiLlamaResponse,
  NormalizedMetrics,
  ProjectContext,
  ProjectTvlHistory,
  DefiLlamaChainStats,
} from './types';
import { buildQueryParams } from '../../common';

/**
 * Récupère tous les projets avec pagination et filtres
 */
export const fetchProjects = async (params?: ProjectQueryParams): Promise<ProjectsResponse> => {
  return withErrorHandling(async () => {
    // Pre-process params for specific backend requirements (comma-separated arrays)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processedParams: Record<string, any> = { ...params };

    if (params?.categoryIds && Array.isArray(params.categoryIds)) {
      processedParams.categoryIds = params.categoryIds.join(',');
    }

    const queryParams = buildQueryParams(processedParams);
    const endpoint = `/project?${queryParams.toString()}`;
    return await get<ProjectsResponse>(endpoint);
  }, 'fetching projects');
};

/**
 * Récupère un projet par ID.
 * Note: cette route backend renvoie le projet brut (pas d'enveloppe { success, data }).
 */
export const fetchProject = async (id: number): Promise<Project> => {
  return withErrorHandling(async () => {
    return await get<Project>(`/project/${id}`);
  }, 'fetching project');
};

/** Map the backend DefiLlama aggregate onto the source-agnostic metrics bundle. */
function toNormalizedMetrics(overview: ProjectDefiLlamaOverview): NormalizedMetrics {
  const asOf = Date.now();
  const metric = (value: number | null | undefined) =>
    typeof value === 'number' ? { value, source: 'DefiLlama', asOf } : undefined;

  return {
    tvl: metric(overview.tvl),
    volume24h: metric(overview.volume?.total24h),
    fees24h: metric(overview.fees?.total24h),
    revenue24h: metric(overview.revenue?.total24h),
    marketCap: metric(overview.mcap),
    price: overview.price
      ? { value: overview.price.price, source: 'DefiLlama', asOf: overview.price.timestamp * 1000 }
      : undefined,
  };
}

/**
 * DefiLlama metrics of a project (TVL, DEX volume, fees, revenue, token price),
 * aggregated by the backend from the project's `defillamaSlug`.
 * Returns `null` when the project isn't linked to DefiLlama (backend 404
 * `DEFILLAMA_SLUG_NOT_SET`) so callers can render an empty state without retrying.
 */
export const fetchProjectDefillamaMetrics = async (id: number): Promise<NormalizedMetrics | null> => {
  return withErrorHandling(async () => {
    try {
      const response = await get<ProjectDefiLlamaResponse>(`/project/${id}/defillama`);
      return toNormalizedMetrics(response.data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  }, 'fetching project DefiLlama metrics');
};

interface ProjectContextResponse {
  success: boolean;
  data: ProjectContext;
}

interface TvlHistoryResponse {
  success: boolean;
  data: ProjectTvlHistory;
}

interface ChainStatsResponse {
  success: boolean;
  data: DefiLlamaChainStats;
}

/**
 * Hyperliquid context of a project: chain banner figures, position (rank,
 * share, fees rank) and peers. Works for unlinked projects too (position
 * null, peers from the DB category).
 */
export const fetchProjectContext = async (id: number): Promise<ProjectContext> => {
  return withErrorHandling(async () => {
    const response = await get<ProjectContextResponse>(`/project/${id}/context`);
    return response.data;
  }, 'fetching project context');
};

/**
 * Daily TVL series (Hyperliquid L1 + all-chains) for a DefiLlama slug.
 */
export const fetchProjectTvlHistory = async (slug: string): Promise<ProjectTvlHistory> => {
  return withErrorHandling(async () => {
    const response = await get<TvlHistoryResponse>(`/defillama/tvl-history/${encodeURIComponent(slug)}`);
    return response.data;
  }, 'fetching project TVL history');
};

/**
 * Hyperliquid chain banner figures (TVL, fees 24h, DEX volume 24h, protocols tracked).
 */
export const fetchChainStats = async (): Promise<DefiLlamaChainStats> => {
  return withErrorHandling(async () => {
    const response = await get<ChainStatsResponse>('/defillama/chain-stats');
    return response.data;
  }, 'fetching Hyperliquid chain stats');
};

/**
 * Récupère toutes les catégories
 */
export const fetchCategories = async (): Promise<CategoriesResponse> => {
  return withErrorHandling(async () => {
    // Récupérer toutes les catégories sans pagination
    return await get<CategoriesResponse>('/category?limit=100');
  }, 'fetching categories');
};



/**
 * Crée un nouveau projet
 */
export const createProject = async (data: CreateProjectInput): Promise<ProjectResponse> => {
  return withErrorHandling(async () => {
    return await post<ProjectResponse>('/project', data);
  }, 'creating project');
};

/**
 * Crée un nouveau projet avec upload de fichier
 */
export const createProjectWithUpload = async (data: CreateProjectWithUploadInput): Promise<ProjectResponse> => {
  return withErrorHandling(async () => {
    const formData = new FormData();

    // Ajouter les champs texte
    formData.append('title', data.title);
    formData.append('desc', data.desc);
    if (data.twitter) formData.append('twitter', data.twitter);
    if (data.discord) formData.append('discord', data.discord);
    if (data.telegram) formData.append('telegram', data.telegram);
    if (data.website) formData.append('website', data.website);
    if (data.token) formData.append('token', data.token);
    if (data.categoryIds && data.categoryIds.length > 0) {
      // Envoyer comme JSON string - le backend devra parser
      formData.append('categoryIds', JSON.stringify(data.categoryIds));
    }

    // Ajouter le fichier si présent
    if (data.logo) {
      formData.append('logo', data.logo);
    }
    if (data.banner) {
      formData.append('banner', data.banner);
    }

    // Utiliser axios avec FormData - l'intercepteur gère l'auth automatiquement
    const response = await apiClient.post<ProjectResponse>('/project/with-upload', formData);

    return response.data;
  }, 'creating project with upload');
};

/**
 * Crée une nouvelle catégorie
 */
export const createCategory = async (data: CreateCategoryInput): Promise<CategoryResponse> => {
  return withErrorHandling(async () => {
    return await post<CategoryResponse>('/category', data);
  }, 'creating category');
};

/**
 * Upload un fichier CSV de projets
 */
export const uploadCsvProjects = async (file: File): Promise<ProjectCsvUploadApiResponse> => {
  return withErrorHandling(async () => {
    const formData = new FormData();
    formData.append('csv', file);

    const response = await apiClient.post<ProjectCsvUploadApiResponse>('/project/csv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }, 'uploading CSV projects');
}; 