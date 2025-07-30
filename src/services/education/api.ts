import { get, post, del } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
import { 
  EducationalResource,
  CategoriesResponse,
  ResourcesResponse,
  CreateCategoryInput,
  CreateResourceInput,
  CategoryResponse,
  ResourceResponse
} from './types';

/**
 * Récupère toutes les catégories éducatives
 */
export const fetchEducationalCategories = async (): Promise<CategoriesResponse> => {
  return withErrorHandling(async () => {
    // GET simple sans paramètres - le backend accepte tout maintenant
    const endpoint = `/educational/categories`;
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
