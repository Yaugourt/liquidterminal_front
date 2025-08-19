import { toast } from "sonner";

// Messages communs utilisés dans plusieurs contextes
export const commonMessages = {
  networkError: () => 
    toast.error("Connection error. Check your internet connection.", {
      action: { label: "Retry", onClick: () => window.location.reload() }
    }),
  
  serverError: () => 
    toast.error("Server error. Please try again later."),
  
  sessionExpired: () => 
    toast.error("Session expired. Please reconnect."),
  
  generic: (message?: string) => 
    toast.error(message || "An error occurred. Please try again.", {
      action: { label: "Retry", onClick: () => window.location.reload() }
    })
};

// Fonction utilitaire unifiée pour gérer les erreurs d'API
export const handleApiError = (error: unknown, context: 'readList' | 'wallet') => {
  if (error && typeof error === 'object' && 'response' in error && error.response) {
    const response = error.response as { status?: number };
    switch (response.status) {
      case 400:
        return commonMessages.generic("Invalid data provided");
      case 401:
        return commonMessages.sessionExpired();
      case 403:
        return commonMessages.generic("Access denied");
      case 404:
        return commonMessages.generic("Resource not found");
      case 409:
        return commonMessages.generic("Resource already exists");
      case 500:
        return commonMessages.serverError();
      default:
        const errorMessage = error && typeof error === 'object' && 'message' in error 
          ? (error.message as string) 
          : `Failed to perform ${context} operation`;
        return commonMessages.generic(errorMessage);
    }
  }
  
  if (error && typeof error === 'object' && 'code' in error) {
    const code = error.code as string;
    if (code === 'NETWORK_ERROR' || code === 'ERR_NETWORK') {
      return commonMessages.networkError();
    }
  }
  
  const errorMessage = error && typeof error === 'object' && 'message' in error 
    ? (error.message as string) 
    : `Failed to perform ${context} operation`;
  
  return commonMessages.generic(errorMessage);
};
