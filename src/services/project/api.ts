import { get, post, put, del, apiClient } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
import { 
  Project, 
  Category, 
  ProjectsResponse, 
  CategoriesResponse, 
  ProjectQueryParams,
  CreateProjectInput,
  CreateProjectWithUploadInput,
  CreateCategoryInput,
  UpdateProjectInput,
  UpdateCategoryInput,
  ProjectResponse,
  CategoryResponse,

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
          if (key === 'categoryIds' && Array.isArray(value)) {
            // Pour categoryIds, ajouter chaque ID comme paramètre séparé
            value.forEach(id => queryParams.append('categoryIds', id.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
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
    if (data.categoryIds) formData.append('categoryIds', JSON.stringify(data.categoryIds));
    
    // Ajouter le fichier si présent
    if (data.logo) {
      formData.append('logo', data.logo);
    }

    // Utiliser axios avec FormData - l'intercepteur gère l'auth automatiquement
    const response = await apiClient.post<ProjectResponse>('/project/with-upload', formData);
    
    return response.data;
  }, 'creating project with upload');
};

/**
 * Met à jour un projet existant
 */
export const updateProject = async (id: number, data: UpdateProjectInput): Promise<ProjectResponse> => {
  return withErrorHandling(async () => {
    return await put<ProjectResponse>(`/project/${id}`, data);
  }, 'updating project');
};

/**
 * Supprime un projet
 */
export const deleteProject = async (id: number): Promise<{ success: boolean; message?: string }> => {
  return withErrorHandling(async () => {
    return await del<{ success: boolean; message?: string }>(`/project/${id}`);
  }, 'deleting project');
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
 * Met à jour une catégorie existante
 */
export const updateCategory = async (id: number, data: UpdateCategoryInput): Promise<CategoryResponse> => {
  return withErrorHandling(async () => {
    return await put<CategoryResponse>(`/category/${id}`, data);
  }, 'updating category');
};

/**
 * Supprime une catégorie
 */
export const deleteCategory = async (id: number): Promise<{ success: boolean; message?: string }> => {
  return withErrorHandling(async () => {
    return await del<{ success: boolean; message?: string }>(`/category/${id}`);
  }, 'deleting category');
};

// ============================================
// NOUVELLES ROUTES POUR LA GESTION DES CATÉGORIES DE PROJETS
// ============================================

/**
 * Assigne des catégories à un projet
 */
export const assignProjectCategories = async (projectId: number, categoryIds: number[]): Promise<ProjectResponse> => {
  return withErrorHandling(async () => {
    return await post<ProjectResponse>(`/project/${projectId}/categories`, { categoryIds });
  }, 'assigning project categories');
};

/**
 * Retire des catégories d'un projet
 */
export const removeProjectCategories = async (projectId: number, categoryIds: number[]): Promise<ProjectResponse> => {
  return withErrorHandling(async () => {
    // Pour DELETE avec body, utiliser apiClient directement
    const response = await apiClient.delete<ProjectResponse>(`/project/${projectId}/categories`, {
      data: { categoryIds }
    });
    return response.data;
  }, 'removing project categories');
};

/**
 * Récupère les catégories d'un projet
 */
export const fetchProjectCategories = async (projectId: number): Promise<{ success: boolean; data: Category[] }> => {
  return withErrorHandling(async () => {
    return await get<{ success: boolean; data: Category[] }>(`/project/${projectId}/categories`);
  }, 'fetching project categories');
}; 