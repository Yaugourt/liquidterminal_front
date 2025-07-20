import { get, post, put, del } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
import { 
  EducationalCategory,
  EducationalResource,
  CategoriesResponse,
  ResourcesResponse,
  ResourceFilters,
  CategoryParams
} from './types';

/**
 * Récupère toutes les catégories éducatives
 */
export const fetchEducationalCategories = async (params?: CategoryParams): Promise<CategoriesResponse> => {
  return withErrorHandling(async () => {
    // GET simple sans paramètres - le backend accepte tout maintenant
    const endpoint = `/educational/categories`;
    return await get<CategoriesResponse>(endpoint);
  }, 'fetching educational categories');
};

/**
 * Récupère les ressources éducatives avec filtres
 */
export const fetchEducationalResources = async (filters: ResourceFilters = {}): Promise<ResourcesResponse> => {
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
 * Crée une nouvelle catégorie éducative
 */
export const createEducationalCategory = async (data: Partial<EducationalCategory>): Promise<EducationalCategory> => {
  return withErrorHandling(async () => {
    return await post<EducationalCategory>('/educational/categories', data);
  }, 'creating educational category');
};

/**
 * Crée une nouvelle ressource éducative
 */
export const createEducationalResource = async (data: Partial<EducationalResource>): Promise<EducationalResource> => {
  return withErrorHandling(async () => {
    return await post<EducationalResource>('/educational/resources', data);
  }, 'creating educational resource');
};

/**
 * Met à jour une catégorie éducative
 */
export const updateEducationalCategory = async (id: number, data: Partial<EducationalCategory>): Promise<EducationalCategory> => {
  return withErrorHandling(async () => {
    return await put<EducationalCategory>(`/educational/categories/${id}`, data);
  }, 'updating educational category');
};

/**
 * Met à jour une ressource éducative
 */
export const updateEducationalResource = async (id: number, data: Partial<EducationalResource>): Promise<EducationalResource> => {
  return withErrorHandling(async () => {
    return await put<EducationalResource>(`/educational/resources/${id}`, data);
  }, 'updating educational resource');
};

/**
 * Supprime une catégorie éducative
 */
export const deleteEducationalCategory = async (id: number): Promise<void> => {
  return withErrorHandling(async () => {
    await del(`/educational/categories/${id}`);
  }, 'deleting educational category');
};

/**
 * Supprime une ressource éducative
 */
export const deleteEducationalResource = async (id: number): Promise<void> => {
  return withErrorHandling(async () => {
    await del(`/educational/resources/${id}`);
  }, 'deleting educational resource');
}; 