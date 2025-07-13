export interface Project {
  id: number;
  title: string;
  desc: string;
  logo: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  website?: string;
  categoryId?: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  sort?: 'createdAt' | 'title' | 'updatedAt';
  order?: 'asc' | 'desc';
  search?: string;
  categoryId?: number;
}

// Hook result types
export interface UseProjectsResult {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UseProjectResult {
  project: Project | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseCategoriesResult {
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} 