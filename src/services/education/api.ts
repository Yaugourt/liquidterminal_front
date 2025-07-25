import { get } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
import { 
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
