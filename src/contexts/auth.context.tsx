import React, { createContext, useContext } from 'react';
import { useAuth, LoginCredentials, AuthError } from '../services/auth';

interface AuthContextType {
  user: ReturnType<typeof useAuth>['user'];
  loading: boolean;
  error: AuthError | null;
  login: (credentials?: LoginCredentials) => Promise<void>;
  logout: () => void;
  fetchUser: (privyUserId: string) => Promise<void>;
  ensureUserInitialized: () => Promise<boolean>;
  isAuthenticated: boolean;
  isInitialized: boolean;
  // Propriétés de compatibilité avec l'ancien code
  authenticated: boolean;
  privyUser: ReturnType<typeof useAuth>['privyUser'];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}; 