import { get, post, del, patch } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
import {
  CategoriesResponse,
  ResourcesResponse,
  CreateCategoryInput,
  CreateResourceInput,
  CategoryResponse,
  ResourceResponse,
  CsvUploadApiResponse,
  CategoryParams,
  WikiResourcesParams,
  ReportResourceInput,
  ReportResourceResponse,
  ApproveResourceInput,
  RejectResourceInput,
  PendingCountResponse,
  PopularResourcesResponse,
  EducationalResource,
  WikiLinkPreview
} from './types';
import { apiClient } from '../api/axios-config';
import { buildQueryParams } from '../common';
import { decodeHtmlEntities } from '@/lib/formatters/textFormatting';

/**
 * Link-preview text arrives HTML-encoded from the backend scraper
 * ("Q&amp;A"); decode it once at the service edge so every consumer
 * renders "&" and friends correctly.
 */
export const decodeLinkPreview = (
  preview: WikiLinkPreview | null | undefined
): WikiLinkPreview | null | undefined => {
  if (!preview) return preview;
  return {
    ...preview,
    title: preview.title ? decodeHtmlEntities(preview.title) : preview.title,
    description: preview.description ? decodeHtmlEntities(preview.description) : preview.description,
    siteName: preview.siteName ? decodeHtmlEntities(preview.siteName) : preview.siteName,
  };
};

const decodeResourcePreview = (resource: EducationalResource): EducationalResource => ({
  ...resource,
  linkPreview: decodeLinkPreview(resource.linkPreview),
});

/**
 * Récupère toutes les catégories éducatives
 */
export const fetchEducationalCategories = async (params?: CategoryParams): Promise<CategoriesResponse> => {
  return withErrorHandling(async () => {
    // Adapter les clés de paramètres pour correspondre à l'API (sortBy -> sort, sortOrder -> order)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiParams: Record<string, any> = { ...params };
    if (params?.sortBy) {
      apiParams.sort = params.sortBy;
      delete apiParams.sortBy;
    }
    if (params?.sortOrder) {
      apiParams.order = params.sortOrder;
      delete apiParams.sortOrder;
    }
    if (params?.withCounts) {
      apiParams.withCounts = 'true';
    } else {
      delete apiParams.withCounts;
    }

    const queryParams = buildQueryParams(apiParams);
    const endpoint = `/educational/categories?${queryParams.toString()}`;
    return await get<CategoriesResponse>(endpoint);
  }, 'fetching educational categories');
};

/**
 * Listing serveur de la bibliothèque (APPROVED only, previews inline).
 * Un seul appel remplace l'ancien fan-out une-requête-par-catégorie.
 */
export const fetchWikiResources = async (params?: WikiResourcesParams): Promise<ResourcesResponse> => {
  return withErrorHandling(async () => {
    const apiParams: Record<string, unknown> = {
      page: params?.page,
      limit: params?.limit,
      sort: params?.sort,
      order: params?.order,
      search: params?.search || undefined,
      categoryIds: params?.categoryIds && params.categoryIds.length > 0
        ? params.categoryIds.join(',')
        : undefined
    };

    const queryParams = buildQueryParams(apiParams);
    const response = await get<ResourcesResponse>(`/educational/resources?${queryParams.toString()}`);
    return { ...response, data: (response.data || []).map(decodeResourcePreview) };
  }, 'fetching wiki resources');
};

/**
 * Fetches every page of the library (server caps limit at 100 per page).
 * Interim helper for the grouped-by-category view; the PR 3 redesign
 * replaces it with real UI pagination. Hard-capped at 5 pages.
 */
export const fetchAllWikiResources = async (params?: WikiResourcesParams): Promise<ResourcesResponse> => {
  return withErrorHandling(async () => {
    const limit = 100;
    const MAX_PAGES = 5;
    const all: ResourcesResponse['data'] = [];
    let page = 1;
    let last: ResourcesResponse;

    do {
      last = await fetchWikiResources({ ...params, page, limit });
      all.push(...(last.data || []));
      page += 1;
    } while (last.pagination?.hasNext && page <= MAX_PAGES);

    return { ...last, data: all };
  }, 'fetching all wiki resources');
};

/**
 * Leaderboard "most saved": APPROVED resources ranked by how many read
 * lists include them. Feeds the library side rail.
 */
export const fetchPopularWikiResources = async (limit = 5): Promise<PopularResourcesResponse> => {
  return withErrorHandling(async () => {
    const response = await get<PopularResourcesResponse>(`/educational/resources/popular?limit=${limit}`);
    return { ...response, data: (response.data || []).map(decodeResourcePreview) };
  }, 'fetching popular wiki resources');
};

/**
 * Crée une nouvelle catégorie éducative
 */
export const createEducationalCategory = async (data: CreateCategoryInput): Promise<CategoryResponse> => {
  return withErrorHandling(async () => {
    const response = await post<CategoryResponse>('/educational/categories', data);
    return response;
  }, 'creating educational category');
};

/**
 * Crée une nouvelle ressource éducative
 */
export const createEducationalResource = async (data: CreateResourceInput): Promise<ResourceResponse> => {
  return withErrorHandling(async () => {
    return await post<ResourceResponse>('/educational/resources', data);
  }, 'creating educational resource');
};

/**
 * Supprime une ressource éducative
 */
export const deleteEducationalResource = async (id: number): Promise<{ success: boolean; message: string }> => {
  return withErrorHandling(async () => {
    return await del<{ success: boolean; message: string }>(`/educational/resources/${id}`);
  }, 'deleting educational resource');
};

/**
 * Upload un fichier CSV de ressources éducatives
 */
export const uploadCsvResources = async (file: File): Promise<CsvUploadApiResponse> => {
  return withErrorHandling(async () => {
    const formData = new FormData();
    formData.append('csv', file);

    const response = await apiClient.post<CsvUploadApiResponse>('/educational/csv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }, 'uploading CSV resources');
};

// ==================== SOUMISSION UTILISATEUR ====================

/**
 * Soumet une ressource (tous utilisateurs connectés)
 * Retourne les headers X-RateLimit-* pour le rate limiting
 */
export interface SubmitResourceResult {
  response: ResourceResponse;
  rateLimitRemaining?: number;
  rateLimitLimit?: number;
}

export const submitResource = async (data: CreateResourceInput): Promise<SubmitResourceResult> => {
  const response = await apiClient.post<ResourceResponse>('/educational/resources', data);
  return {
    response: response.data,
    rateLimitRemaining: response.headers['x-ratelimit-remaining']
      ? parseInt(response.headers['x-ratelimit-remaining'])
      : undefined,
    rateLimitLimit: response.headers['x-ratelimit-limit']
      ? parseInt(response.headers['x-ratelimit-limit'])
      : undefined,
  };
};

/**
 * Récupère les soumissions de l'utilisateur connecté
 */
export const fetchMySubmissions = async (): Promise<ResourcesResponse> => {
  return withErrorHandling(async () => {
    const response = await get<ResourcesResponse>('/educational/resources/my-submissions');
    return { ...response, data: (response.data || []).map(decodeResourcePreview) };
  }, 'fetching my submissions');
};

// ==================== SIGNALEMENTS ====================

/**
 * Signale une ressource
 */
export const reportResource = async (resourceId: number, data: ReportResourceInput): Promise<ReportResourceResponse> => {
  return withErrorHandling(async () => {
    return await post<ReportResourceResponse>(`/educational/resources/${resourceId}/report`, data);
  }, 'reporting resource');
};

// ==================== MODÉRATION (MOD/ADMIN) ====================

/**
 * Récupère les ressources en attente de modération
 */
export const fetchPendingResources = async (page = 1, limit = 20): Promise<ResourcesResponse> => {
  return withErrorHandling(async () => {
    const response = await get<ResourcesResponse>(`/educational/resources/moderation/pending?page=${page}&limit=${limit}`);
    return { ...response, data: (response.data || []).map(decodeResourcePreview) };
  }, 'fetching pending resources');
};

/**
 * Récupère le nombre de ressources en attente
 */
export const fetchPendingCount = async (): Promise<PendingCountResponse> => {
  return withErrorHandling(async () => {
    return await get<PendingCountResponse>('/educational/resources/moderation/pending/count');
  }, 'fetching pending count');
};

/**
 * Approuve une ressource
 */
export const approveResource = async (resourceId: number, data?: ApproveResourceInput): Promise<ResourceResponse> => {
  return withErrorHandling(async () => {
    return await patch<ResourceResponse>(`/educational/resources/${resourceId}/approve`, data || {});
  }, 'approving resource');
};

/**
 * Rejette une ressource (raison obligatoire)
 */
export const rejectResource = async (resourceId: number, data: RejectResourceInput): Promise<ResourceResponse> => {
  return withErrorHandling(async () => {
    return await patch<ResourceResponse>(`/educational/resources/${resourceId}/reject`, data);
  }, 'rejecting resource');
};
