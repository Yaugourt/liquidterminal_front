import { get, del, apiClient } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import {
  PublicGoodsResponse,
  PublicGoodDetailResponse,
  PublicGoodResponse,
  DeletePublicGoodResponse,
  PublicGoodQueryParams,
  CreatePublicGoodInput,
  UpdatePublicGoodInput,
  ReviewPublicGoodInput,
} from './types';

/**
 * Récupère tous les projets publics avec pagination et filtres
 * Par défaut retourne seulement les APPROVED
 */
export const fetchPublicGoods = async (params?: PublicGoodQueryParams): Promise<PublicGoodsResponse> => {
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/publicgoods${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await get<PublicGoodsResponse>(endpoint);
  }, 'fetching public goods');
};

/**
 * Récupère un projet public par ID
 */
export const fetchPublicGood = async (id: number): Promise<PublicGoodDetailResponse> => {
  return withErrorHandling(async () => {
    return await get<PublicGoodDetailResponse>(`/publicgoods/${id}`);
  }, 'fetching public good');
};

/**
 * Récupère mes projets soumis
 * Auth: JWT required
 */
export const fetchMyPublicGoods = async (params?: Omit<PublicGoodQueryParams, 'status'>): Promise<PublicGoodsResponse> => {
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/publicgoods/my-submissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await get<PublicGoodsResponse>(endpoint);
  }, 'fetching my public goods');
};

/**
 * Récupère les projets en attente de review
 * Auth: JWT required (MODERATOR ou ADMIN)
 */
export const fetchPendingPublicGoods = async (params?: Omit<PublicGoodQueryParams, 'status'>): Promise<PublicGoodsResponse> => {
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/publicgoods/pending${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await get<PublicGoodsResponse>(endpoint);
  }, 'fetching pending public goods');
};

/**
 * Crée un nouveau projet public
 * Auth: JWT required
 * Content-Type: multipart/form-data
 */
export const createPublicGood = async (data: CreatePublicGoodInput): Promise<PublicGoodResponse> => {
  return withErrorHandling(async () => {
    const formData = new FormData();
    
    // Section 1: Project
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('githubUrl', data.githubUrl);
    if (data.demoUrl) formData.append('demoUrl', data.demoUrl);
    if (data.websiteUrl) formData.append('websiteUrl', data.websiteUrl);
    formData.append('category', data.category);
    if (data.discordContact) formData.append('discordContact', data.discordContact);
    if (data.telegramContact) formData.append('telegramContact', data.telegramContact);
    
    // Section 2: Impact
    formData.append('problemSolved', data.problemSolved);
    formData.append('targetUsers', JSON.stringify(data.targetUsers));
    formData.append('hlIntegration', data.hlIntegration);
    formData.append('developmentStatus', data.developmentStatus);
    
    // Section 3: Team
    formData.append('leadDeveloperName', data.leadDeveloperName);
    formData.append('leadDeveloperContact', data.leadDeveloperContact);
    formData.append('teamSize', data.teamSize);
    formData.append('experienceLevel', data.experienceLevel);
    formData.append('technologies', JSON.stringify(data.technologies));
    
    // Section 4: Support (optional)
    if (data.supportTypes && data.supportTypes.length > 0) {
      formData.append('supportTypes', JSON.stringify(data.supportTypes));
    }
    if (data.contributorTypes && data.contributorTypes.length > 0) {
      formData.append('contributorTypes', JSON.stringify(data.contributorTypes));
    }
    if (data.budgetRange) {
      formData.append('budgetRange', data.budgetRange);
    }
    
    // Files (optional)
    if (data.logo) {
      formData.append('logo', data.logo);
    }
    if (data.banner) {
      formData.append('banner', data.banner);
    }
    if (data.screenshots && data.screenshots.length > 0) {
      data.screenshots.forEach((file) => {
        formData.append('screenshots', file);
      });
    }
    
    // Utiliser apiClient pour FormData (pas get/post car ils passent par JSON)
    const response = await apiClient.post<PublicGoodResponse>('/publicgoods', formData);
    return response.data;
  }, 'creating public good');
};

/**
 * Met à jour un projet public
 * Auth: JWT required (Owner ou ADMIN)
 * Content-Type: multipart/form-data
 */
export const updatePublicGood = async (id: number, data: UpdatePublicGoodInput): Promise<PublicGoodResponse> => {
  return withErrorHandling(async () => {
    const formData = new FormData();
    
    // Ajouter seulement les champs fournis
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.githubUrl !== undefined) formData.append('githubUrl', data.githubUrl);
    if (data.demoUrl !== undefined) formData.append('demoUrl', data.demoUrl);
    if (data.websiteUrl !== undefined) formData.append('websiteUrl', data.websiteUrl);
    if (data.category !== undefined) formData.append('category', data.category);
    if (data.discordContact !== undefined) formData.append('discordContact', data.discordContact);
    if (data.telegramContact !== undefined) formData.append('telegramContact', data.telegramContact);
    
    if (data.problemSolved !== undefined) formData.append('problemSolved', data.problemSolved);
    if (data.targetUsers !== undefined) formData.append('targetUsers', JSON.stringify(data.targetUsers));
    if (data.hlIntegration !== undefined) formData.append('hlIntegration', data.hlIntegration);
    if (data.developmentStatus !== undefined) formData.append('developmentStatus', data.developmentStatus);
    
    if (data.leadDeveloperName !== undefined) formData.append('leadDeveloperName', data.leadDeveloperName);
    if (data.leadDeveloperContact !== undefined) formData.append('leadDeveloperContact', data.leadDeveloperContact);
    if (data.teamSize !== undefined) formData.append('teamSize', data.teamSize);
    if (data.experienceLevel !== undefined) formData.append('experienceLevel', data.experienceLevel);
    if (data.technologies !== undefined) formData.append('technologies', JSON.stringify(data.technologies));
    
    if (data.supportTypes !== undefined) formData.append('supportTypes', JSON.stringify(data.supportTypes));
    if (data.contributorTypes !== undefined) formData.append('contributorTypes', JSON.stringify(data.contributorTypes));
    if (data.budgetRange !== undefined) formData.append('budgetRange', data.budgetRange);
    
    if (data.logo !== undefined) formData.append('logo', data.logo);
    if (data.banner !== undefined) formData.append('banner', data.banner);
    if (data.screenshots !== undefined && data.screenshots.length > 0) {
      data.screenshots.forEach((file) => {
        formData.append('screenshots', file);
      });
    }
    
    const response = await apiClient.put<PublicGoodResponse>(`/publicgoods/${id}`, formData);
    return response.data;
  }, 'updating public good');
};

/**
 * Supprime un projet public
 * Auth: JWT required (Owner ou ADMIN)
 */
export const deletePublicGood = async (id: number): Promise<DeletePublicGoodResponse> => {
  return withErrorHandling(async () => {
    return await del<DeletePublicGoodResponse>(`/publicgoods/${id}`);
  }, 'deleting public good');
};

/**
 * Review un projet public (approve ou reject)
 * Auth: JWT required (MODERATOR ou ADMIN)
 * Method: PATCH
 */
export const reviewPublicGood = async (id: number, reviewData: ReviewPublicGoodInput): Promise<PublicGoodResponse> => {
  return withErrorHandling(async () => {
    const response = await apiClient.patch<PublicGoodResponse>(`/publicgoods/${id}/review`, reviewData);
    return response.data;
  }, 'reviewing public good');
};

