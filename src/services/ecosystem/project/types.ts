export interface Project {
  id: number;
  title: string;
  desc: string;
  logo: string;
  banner?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  website?: string;
  token?: string;
  createdAt: string;
  updatedAt: string;
  categories?: Category[];
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
    hasNext: boolean;
    hasPrevious: boolean;
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
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  sort?: 'createdAt' | 'title' | 'updatedAt';
  order?: 'asc' | 'desc';
  search?: string;
  categoryIds?: number[];
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

// Types pour les mutations
export interface CreateProjectInput {
  title: string;
  desc: string;
  logo: string;
  banner?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  website?: string;
  token?: string;
  categoryIds?: number[];
}

// Nouveau type pour la création avec upload de fichier
export interface CreateProjectWithUploadInput {
  title: string;
  desc: string;
  logo?: File; // Fichier uploadé
  banner?: File; // Fichier uploadé
  twitter?: string;
  discord?: string;
  telegram?: string;
  website?: string;
  token?: string;
  categoryIds?: number[];
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  title?: string;
  desc?: string;
  logo?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  website?: string;
  categoryIds?: number[];
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
}

// Types de réponse pour les mutations
export interface ProjectResponse {
  success: boolean;
  data: Project;
  message?: string;
}

export interface CategoryResponse {
  success: boolean;
  data: Category;
  message?: string;
}

// Types pour les hooks de mutation
export interface UseCreateProjectResult {
  createProject: (data: CreateProjectInput) => Promise<Project | null>;
  createProjectWithUpload: (data: CreateProjectWithUploadInput) => Promise<Project | null>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseCreateCategoryResult {
  createCategory: (data: CreateCategoryInput) => Promise<Category | null>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseUpdateProjectResult {
  updateProject: (id: number, data: UpdateProjectInput) => Promise<Project | null>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseDeleteProjectResult {
  deleteProject: (id: number) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseBulkDeleteProjectsResult {
  bulkDeleteProjects: (projectIds: number[]) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

// Nouveaux types pour la gestion des catégories de projets
export interface AssignCategoriesInput {
  categoryIds: number[];
}

export interface RemoveCategoriesInput {
  categoryIds: number[];
}

export interface UseProjectCategoriesResult {
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  assignCategories: (categoryIds: number[]) => Promise<void>;
  removeCategories: (categoryIds: number[]) => Promise<void>;
  refetch: () => Promise<void>;
}

// ==================== TYPES POUR UPLOAD CSV PROJETS ====================
export interface ProjectCsvUploadError {
  row: number;
  error: string;
  data: {
    title: string;
    desc: string;
    logo: string;
    category?: string;
    twitter?: string;
    discord?: string;
    telegram?: string;
    website?: string;
  };
}

export interface ProjectCsvUploadResult {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: ProjectCsvUploadError[];
  createdCategories: string[];
  createdProjects: Project[];
}

export interface ProjectCsvUploadResponse {
  success: true;
  message: string;
  data: ProjectCsvUploadResult;
}

export interface ProjectCsvUploadErrorResponse {
  success: false;
  error: string;
  code: string;
}

export type ProjectCsvUploadApiResponse = ProjectCsvUploadResponse | ProjectCsvUploadErrorResponse; 