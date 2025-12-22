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

export interface ResourcesPaginatedResponse {
  data: EducationalResource[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
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

// ==================== TYPES POUR UPLOAD CSV ====================
export interface CsvUploadError {
  row: number;
  error: string;
  data: {
    link: string;
    category: string;
  };
}

export interface CsvUploadResult {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: CsvUploadError[];
  createdCategories: string[];
}

export interface CsvUploadResponse {
  success: true;
  message: string;
  data: CsvUploadResult;
}

export interface CsvUploadErrorResponse {
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

export interface ReportsResponse {
  success: true;
  data: ResourceReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== CODES D'ERREURS WIKI ====================
export type WikiErrorCode =
  | 'RATE_LIMIT_EXCEEDED'
  | 'CONTENT_FILTERED'
  | 'EDUCATIONAL_INVALID_URL'
  | 'EDUCATIONAL_RESOURCE_ALREADY_EXISTS'
  | 'DUPLICATE_REPORT'
  | 'REPORT_REASON_REQUIRED'
  | 'REPORT_REASON_TOO_LONG'
  | 'REJECTION_REASON_REQUIRED'
  | 'RESOURCE_ALREADY_REVIEWED';

export type ContentFilterReason =
  | 'BLACKLISTED_DOMAIN'
  | 'BLOCKED_EXTENSION'
  | 'MALWARE_PATTERN'
  | 'INJECTION_DETECTED'
  | 'URL_MANIPULATION'
  | 'PUNYCODE_DETECTED'
  | 'HOMOGRAPH_DETECTED'
  | 'HTTPS_REQUIRED';

export interface WikiApiError {
  success: false;
  error: string;
  code: WikiErrorCode;
  reason?: ContentFilterReason;
} 