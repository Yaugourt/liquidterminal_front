import { get } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
import { 
  Project, 
  Category, 
  ProjectsResponse, 
  CategoriesResponse, 
  ProjectQueryParams 
} from './types';

/**
 * Récupère tous les projets avec pagination et filtres
 */
export const fetchProjects = async (params?: ProjectQueryParams): Promise<ProjectsResponse> => {
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/project${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await get<ProjectsResponse>(endpoint);
  }, 'fetching projects');
};

/**
 * Récupère un projet par ID
 */
export const fetchProject = async (id: number): Promise<{ success: boolean; data: Project }> => {
  return withErrorHandling(async () => {
    return await get<{ success: boolean; data: Project }>(`/project/${id}`);
  }, 'fetching project');
};

/**
 * Récupère toutes les catégories
 */
export const fetchCategories = async (): Promise<CategoriesResponse> => {
  return withErrorHandling(async () => {
    return await get<CategoriesResponse>('/category');
  }, 'fetching categories');
};

/**
 * Récupère une catégorie par ID
 */
export const fetchCategory = async (id: number): Promise<{ success: boolean; data: Category }> => {
  return withErrorHandling(async () => {
    return await get<{ success: boolean; data: Category }>(`/category/${id}`);
  }, 'fetching category');
};

/**
 * Récupère les projets d'une catégorie
 */
export const fetchProjectsByCategory = async (categoryId: number): Promise<Project[]> => {
  return withErrorHandling(async () => {
    const response = await get<{ success: boolean; data: Project[] }>(
      `/project/category/${categoryId}`
    );
    return response.data;
  }, 'fetching projects by category');
}; 