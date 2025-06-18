import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { authService } from "../api";
import { User, AuthError, LoginCredentials } from "../types";

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
        privyToken: token
      };

      const response = await authService.login(credentials);
      if (response.success && response.user) {
        setUser(response.user);
        setUserProcessed(true);
        return true;
      }
    } catch (err) {
      setError(err as AuthError);
    }
    return false;
  }, [authenticated, privyUser, getAccessToken]);

  const login = useCallback(async (credentials?: LoginCredentials) => {
    if (credentials) {
      try {
        setLoading(true);
        setError(null);
        const response = await authService.login(credentials);
        if (response.success && response.user) {
          setUser(response.user);
          setUserProcessed(true);
        }
      } catch (err) {
        setError(err as AuthError);
      } finally {
        setLoading(false);
      }
    } else {
      privyLogin();
    }
  }, [privyLogin]);

  const logout = useCallback(() => {
    setUser(null);
    setUserProcessed(false);
    privyLogout();
  }, [privyLogout]);

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