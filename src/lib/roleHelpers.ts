import { User } from '@/services/auth/types';

/**
 * Vérifie si un utilisateur a un rôle spécifique ou supérieur
 */
export const hasRole = (user: User | null, requiredRole: 'USER' | 'MODERATOR' | 'ADMIN'): boolean => {
  if (!user) return false;
  
  const roleHierarchy = {
    'USER': 1,
    'MODERATOR': 2,
    'ADMIN': 3
  };
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};

/**
 * Vérifie si un utilisateur peut créer des projets
 */
export const canCreateProject = (user: User | null): boolean => {
  return hasRole(user, 'MODERATOR');
};
