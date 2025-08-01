import { apiClient, axiosWithConfig, get } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
import { AuthResponse, LoginCredentials, ReferralStats, ReferralValidationResponse } from './types';

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
        name: credentials.name,
        referrerName: credentials.referrerName // ← NOUVEAU CHAMP REFERRAL
      };



      // Use axiosWithConfig with custom auth header
      const response = await axiosWithConfig<AuthResponse>(apiClient, {
        method: 'POST',
        url: '/auth/login',
        data: requestData, // Utiliser data pour POST
        headers: {
          'Authorization': `Bearer ${credentials.privyToken}`,
        }
      }, {
        skipAuth: true // Skip auto auth token since we're providing custom auth
      });


      return response;
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

  // NOUVELLES ROUTES POUR LE SYSTÈME DE REFERRAL
  getReferralStats: async (): Promise<ReferralStats> => {
    return withErrorHandling(async () => {
      const response = await get<{ success: boolean; data: ReferralStats }>('/auth/referral/stats');
      return response.data;
    }, 'fetching referral stats');
  },

  validateReferrer: async (name: string): Promise<boolean> => {
    return withErrorHandling(async () => {
      const response = await get<ReferralValidationResponse>(`/auth/referral/validate/${name}`);
      return response.data.isValid;
    }, 'validating referrer');
  },
}; 