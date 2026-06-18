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

export type ResourceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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
  // Moderation fields
  status: ResourceStatus;
  reviewedAt?: string;
  reviewedBy?: number;
  reviewNotes?: string;
  reviewer?: {
    id: number;
    name: string | null;
  } | null;
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
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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
    hasNext: boolean;
    hasPrevious: boolean;
  };
  message?: string;
}

// ==================== RÉSULTATS DE HOOKS ====================
export interface UseEducationalCategoriesResult {
  categories: EducationalCategory[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
  };
  updateParams: (params: Partial<CategoryParams>) => void;
}

export interface UseEducationalResourcesResult {
  resources: EducationalResource[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// ==================== OPTIONS DE HOOKS ====================
export interface UseEducationalCategoriesOptions {
  initialData?: EducationalCategory[];
  refreshInterval?: number;
}

// ==================== TYPES POUR UPLOAD CSV ====================
interface CsvUploadError {
  row: number;
  error: string;
  data: {
    link: string;
    category: string;
  };
}

interface CsvUploadResult {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: CsvUploadError[];
  createdCategories: string[];
}

interface CsvUploadResponse {
  success: true;
  message: string;
  data: CsvUploadResult;
}

interface CsvUploadErrorResponse {
  success: false;
  error: string;
  code: string;
}

export type CsvUploadApiResponse = CsvUploadResponse | CsvUploadErrorResponse;

// ==================== TYPES POUR SIGNALEMENTS ====================
export interface ResourceReport {
  id: number;
  resourceId: number;
  reportedBy: number;
  reason: string;
  createdAt: string;
  reporter?: {
    id: number;
    name: string | null;
  };
}

export interface ReportResourceInput {
  reason: string;
}

export interface ReportResourceResponse {
  success: true;
  message: string;
  data: ResourceReport;
}

// ==================== TYPES POUR MODÉRATION ====================
export interface ApproveResourceInput {
  notes?: string;
}

export interface RejectResourceInput {
  notes: string; // Required for rejection
}

export interface PendingCountResponse {
  success: true;
  data: { count: number };
}
