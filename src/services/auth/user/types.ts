import { User } from '../types';

// Types pour les réponses API
export interface AdminUsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
}

export interface AdminUserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface AdminUserDeleteResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      role: string;
    };
  };
}

// Types pour les paramètres de requête
export interface AdminUsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  verified?: boolean;
  role?: 'USER' | 'MODERATOR' | 'ADMIN';
  sort?: 'createdAt' | 'name' | 'email' | 'role';
  order?: 'asc' | 'desc';
}

// Types pour les mutations
export interface AdminUpdateUserInput {
  name?: string;
  email?: string;
  role?: 'USER' | 'MODERATOR' | 'ADMIN';
  verified?: boolean;
}

// Types pour les hooks
export interface UseAdminUsersResult {
  users: User[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface UseAdminUserResult {
  user: User | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseAdminUpdateUserResult {
  updateUser: (userId: number, data: AdminUpdateUserInput) => Promise<User | null>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseAdminDeleteUserResult {
  deleteUser: (userId: number) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

// Types pour les erreurs
export interface AdminUserError {
  success: false;
  message: string;
  code: 'INVALID_USER_ID' | 'USER_NOT_FOUND' | 'EMAIL_ALREADY_EXISTS' | 'CANNOT_DELETE_SELF' | 'UNAUTHENTICATED' | 'UNAUTHORIZED';
} 