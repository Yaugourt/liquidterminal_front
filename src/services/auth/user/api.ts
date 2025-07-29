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
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/user/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await get<AdminUsersResponse>(endpoint);
  }, 'fetching admin users');
};

/**
 * Récupère un utilisateur par ID (ADMIN uniquement)
 */
export const _fetchAdminUser = async (userId: number): Promise<AdminUserResponse> => {
  return withErrorHandling(async () => {
    return await get<AdminUserResponse>(`/user/admin/users/${userId}`);
  }, 'fetching admin user');
};

/**
 * Met à jour un utilisateur (ADMIN uniquement)
 */
export const updateAdminUser = async (userId: number, data: AdminUpdateUserInput): Promise<AdminUserResponse> => {
  return withErrorHandling(async () => {
    return await put<AdminUserResponse>(`/user/admin/users/${userId}`, data);
  }, 'updating admin user');
};

/**
 * Supprime un utilisateur (ADMIN uniquement)
 */
export const _deleteAdminUser = async (userId: number): Promise<AdminUserDeleteResponse> => {
  return withErrorHandling(async () => {
    return await del<AdminUserDeleteResponse>(`/user/admin/users/${userId}`);
  }, 'deleting admin user');
}; 