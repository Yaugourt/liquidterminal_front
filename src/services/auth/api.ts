import axios from 'axios';
import { AuthResponse, LoginCredentials } from './types';

const API_URL = process.env.NEXT_PUBLIC_API;

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
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

      const response = await axios.post(`${API_URL}/auth/login`, requestData, {
        headers: {
          'Authorization': `Bearer ${credentials.privyToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          throw error.response.data;
        }
        
        throw {
          success: false,
          message: error.message || 'An error occurred during login',
          code: `HTTP_${error.response?.status || 500}`
        };
      }
      
      throw {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        code: 'UNKNOWN_ERROR'
      };
    }
  },

  getUser: async (privyUserId: string, privyToken: string): Promise<AuthResponse> => {
    try {
      const response = await axios.get(`${API_URL}/auth/user/${privyUserId}`, {
        headers: {
          'Authorization': `Bearer ${privyToken}`,
        },
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          throw error.response.data;
        }
        
        throw {
          success: false,
          message: error.message || 'An error occurred while fetching user data',
          code: `HTTP_${error.response?.status || 500}`
        };
      }
      
      throw {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        code: 'UNKNOWN_ERROR'
      };
    }
  },
}; 