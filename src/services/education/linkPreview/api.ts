import { get, post, put, del } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { 
  LinkPreview,
  LinkPreviewResponse,
  LinkPreviewBatchResponse,
  LinkPreviewListResponse,
  LinkPreviewParams
} from './types';

/**
 * Récupère un preview de lien par URL
 */
export const getLinkPreview = async (url: string): Promise<LinkPreviewResponse> => {
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams();
    queryParams.append('url', url);
    
    const endpoint = `/link-preview?${queryParams.toString()}`;
    const response = await get<LinkPreviewResponse>(endpoint);
    if (!response || !response.data) throw new Error('Failed to fetch link preview');
    return response;
  }, 'fetching link preview');
};

/**
 * Récupère un preview de lien par ID
 */
export const getLinkPreviewById = async (id: string): Promise<LinkPreviewResponse> => {
  return withErrorHandling(async () => {
    return await get<LinkPreviewResponse>(`/link-preview/${id}`);
  }, 'fetching link preview by id');
};

/**
 * Récupère la liste des previews de liens
 */
export const getLinkPreviewsList = async (params?: LinkPreviewParams): Promise<LinkPreviewListResponse> => {
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    const endpoint = `/link-preview/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await get<LinkPreviewListResponse>(endpoint);
  }, 'fetching link previews list');
};

/**
 * Récupère plusieurs previews de liens en batch
 */
export const getLinkPreviewsBatch = async (urls: string[]): Promise<LinkPreviewBatchResponse> => {
  return withErrorHandling(async () => {
    return await post<LinkPreviewBatchResponse>('/link-preview/batch', { urls });
  }, 'fetching link previews batch');
};


