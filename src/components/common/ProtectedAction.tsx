import React from 'react';
import { User } from '@/services/auth/types';
import { hasRole } from '@/lib/roleHelpers';

interface ProtectedActionProps {
  children: React.ReactNode;
  requiredRole: 'USER' | 'MODERATOR' | 'ADMIN';
  user: User | null;
  fallback?: React.ReactNode;
}

export function ProtectedAction({ 
  children, 
  requiredRole, 
  user, 
  fallback = null 
}: ProtectedActionProps) {
  if (!hasRole(user, requiredRole)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
} 