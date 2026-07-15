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
  ProjectMetricsResponse,
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

/**
 * Aggregated multi-source metrics of a project (TVL, volume, fees, token),
 * normalized by the backend. Optional fields depend on the mapped sources.
 * PARKED: the route is not deployed on the backend yet (404 for every id);
 * no page should call this until it ships.
 */
export const fetchProjectMetrics = async (id: number): Promise<ProjectMetricsResponse> => {
  return withErrorHandling(async () => {
    return await get<ProjectMetricsResponse>(`/project/${id}/metrics`);
  }, 'fetching project metrics');
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