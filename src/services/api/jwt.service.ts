/**
 * JWT Service - Gestion centralisée des tokens JWT et Privy
 */

import { JWTPayload } from './types';

// Constants
const EXPIRATION_BUFFER = 5 * 60; // 5 minutes en secondes

/**
 * Decode JWT token
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    if (!token || typeof token !== 'string') return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * Check if JWT is expired
 */
export const isJWTExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded?.exp) return true;
  
  return decoded.exp < Math.floor(Date.now() / 1000) + EXPIRATION_BUFFER;
};

/**
 * Validate JWT format and expiration
 */
export const isValidJWT = (token: string): boolean => {
  if (!token || typeof token !== 'string' || !token.startsWith('eyJ')) return false;
  return decodeJWT(token) !== null && !isJWTExpired(token);
};

/**
 * Format token for Authorization header
 * Always returns "Bearer <token>" format as required by backend
 */
export const formatAuthHeader = (token: string): string => {
  // If already has Bearer prefix, return as is
  if (token.startsWith('Bearer ')) return token;
  // Always add Bearer prefix
  return `Bearer ${token}`;
};
