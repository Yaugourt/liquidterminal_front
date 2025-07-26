// ==================== DONNÉES DE BASE ====================
export interface EducationalCategory {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  creator: {
    id: number;
    name: string | null;
    email: string | null;
  };
}

export interface EducationalResource {
  id: number;
  url: string;
  createdAt: string;
  creator: {
    id: number;
    name: string | null;
    email: string | null;
  };
  categories: EducationalResourceCategory[];
}

export interface EducationalResourceCategory {
  id: number;
  category: {
    id: number;
    name: string;
    description: string | null;
  };
  assignedAt: string;
  assigner?: {
    id: number;
    name: string | null;
  } | null;
}

// ==================== TYPES POUR CRÉATION ====================
export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface CreateResourceInput {
  url: string;
  categoryIds: number[];
}

export interface CategoryResponse {
  success: boolean;
  data: EducationalCategory;
  message?: string;
}

export interface ResourceResponse {
  success: boolean;
  data: EducationalResource;
  message?: string;
}

// ==================== PARAMÈTRES DE REQUÊTE ====================
export interface ResourceFilters {
  categoryIds?: number[];
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'createdAt' | 'url';
  order?: 'asc' | 'desc';
}

export interface CategoryParams {
  limit?: number;
  page?: number;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ==================== RÉPONSES API ====================
export interface CategoriesResponse {
  success: boolean;
  data: EducationalCategory[];
  message?: string;
}

export interface ResourcesResponse {
  success: boolean;
  data: EducationalResource[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export interface ResourcesPaginatedResponse {
  data: EducationalResource[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  metadata?: {
    lastUpdate: number;
  };
}

// ==================== RÉSULTATS DE HOOKS ====================
export interface UseEducationalCategoriesResult {
  categories: EducationalCategory[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseEducationalResourcesResult {
  resources: EducationalResource[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseEducationalResourcesPaginatedResult extends UseEducationalResourcesResult {
  total: number;
  page: number;
  totalPages: number;
  updateParams: (params: Partial<ResourceFilters>) => void;
  metadata?: {
    lastUpdate: number;
  };
}

// ==================== OPTIONS DE HOOKS ====================
export interface UseEducationalResourcesOptions {
  limit?: number;
  defaultParams?: Partial<ResourceFilters>;
  initialData?: EducationalResource[];
  refreshInterval?: number;
}

export interface UseEducationalCategoriesOptions {
  initialData?: EducationalCategory[];
  refreshInterval?: number;
} 