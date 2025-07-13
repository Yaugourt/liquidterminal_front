import { fetchWithConfig, fetchPaginated } from '../api/base';
import { 
  Project, 
  Category, 
  ProjectsResponse, 
  CategoriesResponse, 
  ProjectQueryParams 
} from './types';
import { getMockProjectsResponse, getMockCategoriesResponse, MOCK_PROJECTS } from './mock';

// TODO: Remove mock data when API is ready
const USE_MOCK_DATA = true;

/**
 * Récupère tous les projets avec pagination et filtres
 */
export const fetchProjects = async (params?: ProjectQueryParams): Promise<ProjectsResponse> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(getMockProjectsResponse(params));
  }

  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  const endpoint = `/api/project${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return fetchWithConfig<ProjectsResponse>(endpoint);
};

/**
 * Récupère un projet par ID
 */
export const fetchProject = async (id: number): Promise<{ success: boolean; data: Project }> => {
  if (USE_MOCK_DATA) {
    const project = MOCK_PROJECTS.find(p => p.id === id);
    return Promise.resolve({
      success: !!project,
      data: project!
    });
  }

  return fetchWithConfig<{ success: boolean; data: Project }>(`/api/project/${id}`);
};

/**
 * Récupère toutes les catégories
 */
export const fetchCategories = async (): Promise<CategoriesResponse> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(getMockCategoriesResponse());
  }

  return fetchWithConfig<CategoriesResponse>('/api/category');
};

/**
 * Récupère une catégorie par ID
 */
export const fetchCategory = async (id: number): Promise<{ success: boolean; data: Category }> => {
  if (USE_MOCK_DATA) {
    const categories = getMockCategoriesResponse().data;
    const category = categories.find(c => c.id === id);
    return Promise.resolve({
      success: !!category,
      data: category!
    });
  }

  return fetchWithConfig<{ success: boolean; data: Category }>(`/api/category/${id}`);
};

/**
 * Récupère les projets d'une catégorie
 */
export const fetchProjectsByCategory = async (categoryId: number): Promise<Project[]> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(MOCK_PROJECTS.filter(p => p.categoryId === categoryId));
  }

  const response = await fetchWithConfig<{ success: boolean; data: Project[] }>(
    `/api/project/category/${categoryId}`
  );
  return response.data;
}; 