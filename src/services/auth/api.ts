import { apiClient, axiosWithConfig, get } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
import { AuthResponse, LoginCredentials } from './types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return withErrorHandling(async () => {
      if (!credentials.privyUserId || !credentials.name || !credentials.privyToken) {
        throw {
          success: false,
          message: 'Missing required fields',
          code: 'VALIDATION_ERROR'
        };
      }

      const requestData = {
        privyUserId: credentials.privyUserId,
        name: credentials.name
      };

      // Use axiosWithConfig with custom auth header
      return await axiosWithConfig<AuthResponse>(apiClient, {
        method: 'POST',
        url: '/auth/login',
        data: requestData,
        headers: {
          'Authorization': `Bearer ${credentials.privyToken}`,
        }
      }, {
        skipAuth: true // Skip auto auth token since we're providing custom auth
      });
    }, 'authenticating user');
  },

  getUser: async (privyUserId: string, privyToken: string): Promise<AuthResponse> => {
    return withErrorHandling(async () => {
      return await axiosWithConfig<AuthResponse>(apiClient, {
        method: 'GET',
        url: `/auth/user/${privyUserId}`,
        headers: {
          'Authorization': `Bearer ${privyToken}`,
        }
      }, {
        skipAuth: true // Skip auto auth token since we're providing custom auth
      });
    }, 'fetching user');
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    return withErrorHandling(async () => {
      return await get<AuthResponse>('/auth/me');
    }, 'fetching current user');
  },
}; 