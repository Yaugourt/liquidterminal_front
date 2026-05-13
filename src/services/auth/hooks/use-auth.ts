import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { authService, User, AuthError, LoginCredentials } from "../index";
import { registerPrivyAccessTokenGetter, registerPrivyLogout } from "../../api/privy.service";

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

  // Bridge Privy SDK methods to module-level registry so axios interceptors
  // (outside React) can fetch tokens and trigger logout without touching localStorage.
  useEffect(() => {
    registerPrivyAccessTokenGetter(getAccessToken);
    registerPrivyLogout(privyLogout);
    return () => {
      registerPrivyAccessTokenGetter(null);
      registerPrivyLogout(null);
    };
  }, [getAccessToken, privyLogout]);

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
    setUser(null);
    setUserProcessed(false);
    setError(null);

    if (typeof window !== 'undefined') {
      try {
        const [{ clearCache }, { clearAuthTokens }] = await Promise.all([
          import('../../api/axios-config'),
          import('../../api/privy.service'),
        ]);
        clearCache();
        clearAuthTokens();
      } catch {
        // Silent fail
      }
    }

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
      
      if (typeof window !== 'undefined') {
        try {
          const [{ clearCache }, { clearAuthTokens }] = await Promise.all([
            import('../../api/axios-config'),
            import('../../api/privy.service'),
          ]);
          clearCache();
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