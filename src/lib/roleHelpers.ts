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

/**
 * Vérifie si un utilisateur peut modifier des projets
 */
export const canEditProject = (user: User | null): boolean => {
  return hasRole(user, 'MODERATOR');
};

/**
 * Vérifie si un utilisateur peut supprimer des projets
 */
export const canDeleteProject = (user: User | null): boolean => {
  return hasRole(user, 'ADMIN');
};

/**
 * Vérifie si un utilisateur peut créer des catégories
 */
export const canCreateCategory = (user: User | null): boolean => {
  return hasRole(user, 'MODERATOR');
};

/**
 * Vérifie si un utilisateur peut modifier des catégories
 */
export const canEditCategory = (user: User | null): boolean => {
  return hasRole(user, 'MODERATOR');
};

/**
 * Vérifie si un utilisateur peut supprimer des catégories
 */
export const canDeleteCategory = (user: User | null): boolean => {
  return hasRole(user, 'ADMIN');
};

/**
 * Vérifie si un utilisateur peut gérer les ressources éducatives
 */
export const canManageEducationalResources = (user: User | null): boolean => {
  return hasRole(user, 'MODERATOR');
}; 