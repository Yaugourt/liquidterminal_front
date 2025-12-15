import { get, post, del } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
import {
  EducationalResource,
  CategoriesResponse,
  ResourcesResponse,
  CreateCategoryInput,
  CreateResourceInput,
  CategoryResponse,
  ResourceResponse,
  CsvUploadApiResponse,
  CategoryParams
} from './types';
import { apiClient } from '../api/axios-config';
import { buildQueryParams } from '../common';

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

    const queryParams = buildQueryParams(apiParams);
    const endpoint = `/educational/categories?${queryParams.toString()}`;
    return await get<CategoriesResponse>(endpoint);
  }, 'fetching educational categories');
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
 * Récupère les ressources éducatives avec filtres
 */
export const fetchEducationalResources = async (): Promise<ResourcesResponse> => {
  return withErrorHandling(async () => {
    // GET simple sans paramètres - le backend accepte tout maintenant
    const endpoint = `/educational/resources`;
    return await get<ResourcesResponse>(endpoint);
  }, 'fetching educational resources');
};

/**
 * Récupère les ressources d'une catégorie spécifique
 */
export const fetchResourcesByCategory = async (categoryId: number): Promise<{ success: boolean; data: EducationalResource[] }> => {
  return withErrorHandling(async () => {
    return await get<{ success: boolean; data: EducationalResource[] }>(`/educational/resources/category/${categoryId}`);
  }, 'fetching resources by category');
};

/**
 * Récupère les ressources de plusieurs catégories
 */
export const fetchResourcesByCategories = async (categoryIds: number[]): Promise<EducationalResource[]> => {
  return withErrorHandling(async () => {
    const allResources = await Promise.all(
      categoryIds.map(async id => {
        const response = await fetchResourcesByCategory(id);
        return response.data;
      })
    );

    // Fusionner et dédupliquer par ID
    const resourceMap = new Map();
    allResources.flat().forEach(resource => {
      resourceMap.set(resource.id, resource);
    });

    return Array.from(resourceMap.values());
  }, 'fetching resources by multiple categories');
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
