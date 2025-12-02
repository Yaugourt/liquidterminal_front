import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { authService, User, AuthError, LoginCredentials } from "../index";

export function useAuth() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const { user: privyUser, authenticated, login: privyLogin, logout: privyLogout, getAccessToken } = usePrivy();
  const [userProcessed, setUserProcessed] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const ensureUserInitialized = useCallback(async () => {
    if (!authenticated || !privyUser) return false;
    
    const username = privyUser.twitter?.username || privyUser.farcaster?.username || privyUser.github?.username;
    if (!username) return false;

    try {
      const token = await getAccessToken();
      if (!token) return false;

      const credentials: LoginCredentials = {
        privyUserId: privyUser.id,
        name: username,
        privyToken: token,
        referrerName: localStorage.getItem('referrer') || undefined // ← AJOUTER LE REFERRER
      };

      const response = await authService.login(credentials);
      if (response.success && response.user) {
        setUser(response.user);
        setUserProcessed(true);
        localStorage.removeItem('referrer');
        return true;
      }
    } catch (err) {
      setError(err as AuthError);
    }
    return false;
  }, [authenticated, privyUser, getAccessToken]);

  const logout = useCallback(async () => {
    // Reset state first
    setUser(null);
    setUserProcessed(false);
    setError(null);
    
    // Clear all tokens and cache
    if (typeof window !== 'undefined') {
      // Clear all Privy-related keys + authToken from localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('privy') || key === 'authToken')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear axios cache
      try {
        const { clearCache } = await import('../../api/axios-config');
        clearCache();
      } catch {
        // Silent fail
      }
      
      // Clear auth tokens via service
      try {
        const { clearAuthTokens } = await import('../../api/privy.service');
        clearAuthTokens();
      } catch {
        // Silent fail
      }
    }
    
    // Logout from Privy
    privyLogout();
  }, [privyLogout]);

  const login = useCallback(async (credentials?: LoginCredentials) => {
    if (credentials) {
      try {
        setLoading(true);
        setError(null);
        
        const loginData: LoginCredentials = {
          ...credentials
        };
        
        const response = await authService.login(loginData);
        if (response.success && response.user) {
          setUser(response.user);
          setUserProcessed(true);
          
          // Optionnel : Notification si parrain assigné
          if (response.user.referredBy) {
    
          }
        }
      } catch (err) {
        setError(err as AuthError);
      } finally {
        setLoading(false);
      }
    } else {
      // Reset state before new login
      setUserProcessed(false);
      setUser(null);
      setError(null);
      
      // Clear any cached tokens before login
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('privy') || key === 'authToken')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear axios cache to force fresh requests
        try {
          const { clearCache } = await import('../../api/axios-config');
          clearCache();
        } catch {
          // Silent fail
        }
        
        // Clear auth tokens via service
        try {
          const { clearAuthTokens } = await import('../../api/privy.service');
          clearAuthTokens();
        } catch {
          // Silent fail
        }
      }
      privyLogin();
    }
  }, [privyLogin]);

  const fetchUser = useCallback(async (privyUserId: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessToken();
      if (!token) throw new Error('No access token available');
      
      const response = await authService.getUser(privyUserId, token);
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (err) {
      setError(err as AuthError);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (authenticated && privyUser && !userProcessed) {
      ensureUserInitialized();
    }
  }, [authenticated, privyUser, userProcessed, ensureUserInitialized]);

      return {
      user,
      loading,
      error,
      login,
      logout,
      fetchUser,
      ensureUserInitialized,
      isAuthenticated: authenticated,
      isInitialized,
      authenticated,
      privyUser,
      userProcessed
    };
} 