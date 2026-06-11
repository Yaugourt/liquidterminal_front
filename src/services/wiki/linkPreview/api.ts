import { get, post } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import {
  LinkPreviewResponse,
  LinkPreviewBatchResponse
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
 * Récupère plusieurs previews de liens en batch
 */
export const getLinkPreviewsBatch = async (urls: string[]): Promise<LinkPreviewBatchResponse> => {
  return withErrorHandling(async () => {
    return await post<LinkPreviewBatchResponse>('/link-preview/batch', { urls });
  }, 'fetching link previews batch');
};


