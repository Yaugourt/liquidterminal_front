import { get, put, del } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { 
  AdminUsersResponse, 
  AdminUserResponse, 
  AdminUserDeleteResponse,
  AdminUsersQueryParams,
  AdminUpdateUserInput
} from './types';

/**
 * Récupère tous les utilisateurs avec pagination et filtres (ADMIN uniquement)
 */
export const _fetchAdminUsers = async (params?: AdminUsersQueryParams): Promise<AdminUsersResponse> => {
  return withErrorHandling(_async () => {
    const queryParams = new URLSearchParams();
     // eslint-disable-line @typescript-eslint/no-unused-vars
    if (params) {
      Object.entries(params).forEach(_([key, _value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const _endpoint = `/user/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`; // eslint-disable-line @typescript-eslint/no-unused-vars
    return await get<AdminUsersResponse>(endpoint);
  }, 'fetching admin users');
};

/**
 * Récupère un utilisateur par ID (ADMIN uniquement)
 */
export const _fetchAdminUser = async (userId: number): Promise<AdminUserResponse> => {
  return withErrorHandling(_async () => {
    return await get<AdminUserResponse>(`/user/admin/users/${userId}`); // eslint-disable-line @typescript-eslint/no-unused-vars
  }, 'fetching admin user');
};

/**
 * Met à jour un utilisateur (ADMIN uniquement)
 */
export const _updateAdminUser = async (userId: number, data: AdminUpdateUserInput): Promise<AdminUserResponse> => {
  return withErrorHandling(_async () => {
    return await put<AdminUserResponse>(`/user/admin/users/${userId}`, data); // eslint-disable-line @typescript-eslint/no-unused-vars
  }, 'updating admin user');
};

/**
 * Supprime un utilisateur (ADMIN uniquement)
 */
export const _deleteAdminUser = async (userId: number): Promise<AdminUserDeleteResponse> => {
  return withErrorHandling(_async () => {
    return await del<AdminUserDeleteResponse>(`/user/admin/users/${userId}`); // eslint-disable-line @typescript-eslint/no-unused-vars
  }, 'deleting admin user');
}; 