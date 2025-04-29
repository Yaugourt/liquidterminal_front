import React, { createContext, useContext } from 'react';
import { useAuth } from '../services/auth/hooks/use-auth';
import { User, LoginCredentials, AuthError } from '../services/auth/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  login: (credentials?: LoginCredentials) => Promise<void>;
  logout: () => void;
  fetchUser: (privyUserId: string) => Promise<void>;
  isAuthenticated: boolean;
  isInitialized: boolean;
  // Propriétés de compatibilité avec l'ancien code
  authenticated: boolean;
  privyUser: any;
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