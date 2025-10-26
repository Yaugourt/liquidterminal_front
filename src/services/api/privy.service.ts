/**
 * Privy Service - Gestion des tokens et authentification Privy
 */

import { isValidJWT } from './jwt.service';

// Extend Window interface for Privy context
declare global {
  interface Window {
    privy?: {
      getAccessToken?: () => Promise<string | null>;
      logout?: () => void;
    };
    __PRIVY_CONTEXT__?: {
      getAccessToken?: () => Promise<string | null>;
    };
  }
}

/**
 * Get token from localStorage fallback
 */
const getTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Check privy:pat first
    const privyPat = localStorage.getItem('privy:pat');
    if (privyPat) {
      const cleanToken = privyPat.replace(/^"|"$/g, '');
      if (isValidJWT(cleanToken)) return cleanToken;
    }
    
    // Fallback to authToken
    const authToken = localStorage.getItem('authToken');
    return authToken && isValidJWT(authToken) ? authToken : null;
  } catch {
    return null;
  }
};

/**
 * Get Privy access token
 */
export const getPrivyToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Try Privy API first
    const privy = window.privy;
    if (privy?.getAccessToken) {
      const token = await privy.getAccessToken();
      return token || null;
    }

    // Try Privy context fallback
    if (window.__PRIVY_CONTEXT__?.getAccessToken) {
      const token = await window.__PRIVY_CONTEXT__.getAccessToken();
      return token || null;
    }

    // Last resort: localStorage
    return getTokenFromStorage();
  } catch {
    return getTokenFromStorage();
  }
};

/**
 * Clear all auth tokens from storage
 */
export const clearAuthTokens = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear specific tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('privy:pat');
    
    // Clear all Privy-related keys
    Object.keys(localStorage)
      .filter(key => key.includes('privy'))
      .forEach(key => localStorage.removeItem(key));
  } catch {
    // Silent fail
  }
};

/**
 * Handle user logout
 */
export const handleLogout = async (): Promise<void> => {
  clearAuthTokens();
  
  if (typeof window === 'undefined') return;
  
  try {
    // Try Privy logout first
    const privy = window.privy;
    if (privy?.logout) {
      privy.logout();
      return;
    }
  } catch {
    // Fallback to manual cleanup
  }
  
  // Show toast notification
  try {
    const { toast } = await import('sonner');
    toast.error('Session expired. Please reconnect.', {
      duration: 5000
    });
  } catch {
    // Toast failed, silent fail
  }
};
