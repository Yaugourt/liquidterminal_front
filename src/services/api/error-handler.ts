import { AxiosError } from 'axios';

// Interface pour les erreurs standardisées
export interface StandardError {
  success: false;
  message: string;
  code: string;
  response?: {
    status: number;
    data: any;
  };
}

/**
 * Gère les erreurs axios de façon standardisée
 */
export const handleAxiosError = (error: any, context: string): StandardError => {
  console.error(`Error ${context}:`, error);
  
  // Erreur axios
  if (error.isAxiosError || error.response) {
    const axiosError = error as AxiosError;
    
    // Erreur 401 - Non autorisé
    if (axiosError.response?.status === 401) {
      return {
        success: false,
        message: 'Invalid or expired token',
        code: 'UNAUTHORIZED',
        response: {
          status: axiosError.response.status,
          data: axiosError.response.data
        }
      };
    }
    
    // Erreur 400 - Mauvaise requête
    if (axiosError.response?.status === 400) {
      return {
        success: false,
        message: (axiosError.response.data as any)?.message || 'Bad request',
        code: 'BAD_REQUEST',
        response: {
          status: axiosError.response.status,
          data: axiosError.response.data
        }
      };
    }
    
    // Erreur 403 - Interdit
    if (axiosError.response?.status === 403) {
      return {
        success: false,
        message: 'Access forbidden',
        code: 'FORBIDDEN',
        response: {
          status: axiosError.response.status,
          data: axiosError.response.data
        }
      };
    }
    
    // Erreur 404 - Non trouvé
    if (axiosError.response?.status === 404) {
      return {
        success: false,
        message: 'Resource not found',
        code: 'NOT_FOUND',
        response: {
          status: axiosError.response.status,
          data: axiosError.response.data
        }
      };
    }
    
    // Erreur 500 - Erreur serveur
    if (axiosError.response?.status === 500) {
      return {
        success: false,
        message: 'Internal server error',
        code: 'SERVER_ERROR',
        response: {
          status: axiosError.response.status,
          data: axiosError.response.data
        }
      };
    }
    
    // Erreur de réseau
    if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
      return {
        success: false,
        message: 'Request timeout',
        code: 'TIMEOUT'
      };
    }
    
    if (axiosError.code === 'ERR_NETWORK') {
      return {
        success: false,
        message: 'Network error',
        code: 'NETWORK_ERROR'
      };
    }
    
    // Autres erreurs axios avec réponse
    if (axiosError.response) {
      return {
        success: false,
        message: (axiosError.response.data as any)?.message || `Failed to ${context}`,
        code: 'API_ERROR',
        response: {
          status: axiosError.response.status,
          data: axiosError.response.data
        }
      };
    }
    
    // Erreur axios sans réponse
    return {
      success: false,
      message: axiosError.message || `Failed to ${context}`,
      code: 'REQUEST_ERROR'
    };
  }
  
  // Erreur générique
  return {
    success: false,
    message: error instanceof Error ? error.message : `An unknown error occurred during ${context}`,
    code: 'UNKNOWN_ERROR'
  };
};

/**
 * Wrapper pour les appels d'API avec gestion d'erreur automatique
 */
export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  context: string
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    throw handleAxiosError(error, context);
  }
}; 