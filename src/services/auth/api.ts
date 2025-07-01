import axios from 'axios';
import { AuthResponse, LoginCredentials } from './types';
import { API_URLS } from '../api/base';

const API_URL = API_URLS.LOCAL_BACKEND;

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
      console.error('Login error:', error);
      
      if (axios.isAxiosError(error)) {
        // Gestion spécifique des codes d'erreur de l'API
        if (error.response?.status === 401) {
          throw {
            success: false,
            message: 'Invalid or expired token',
            code: 'UNAUTHORIZED'
          };
        }
        
        if (error.response?.status === 400) {
          throw {
            success: false,
            message: 'PrivyUserId does not match token',
            code: 'INVALID_USER'
          };
        }

        if (error.response?.data) {
          throw error.response.data;
        }
        
        throw {
          success: false,
          message: 'Server error occurred',
          code: 'SERVER_ERROR'
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
      console.error('Get user error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw {
            success: false,
            message: 'Invalid or expired token',
            code: 'UNAUTHORIZED'
          };
        }

        if (error.response?.data) {
          throw error.response.data;
        }
        
        throw {
          success: false,
          message: 'Server error occurred',
          code: 'SERVER_ERROR'
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