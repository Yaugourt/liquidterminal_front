// API functions
export {
  fetchEducationalCategories,
  fetchEducationalResources,
  fetchResourcesByCategory,
  fetchResourcesByCategories,
  createEducationalCategory,
  createEducationalResource,
  deleteEducationalResource,
  uploadCsvResources,
  // New submission/moderation API
  submitResource,
  fetchMySubmissions,
  reportResource,
  fetchPendingResources,
  fetchPendingCount,
  approveResource,
  rejectResource,
  fetchResourceReports
} from './api';

// Hooks
export { useEducationalCategories } from './hooks/useEducationalCategories';
export { useEducationalResourcesByCategories } from './hooks/useEducationalResourcesByCategories';
export { useCreateEducationalCategory } from './hooks/useCreateEducationalCategory';
export { useCreateEducationalResource } from './hooks/useCreateEducationalResource';
export { useDeleteEducationalResource } from './hooks/useDeleteEducationalResource';
export { useCsvUpload } from './hooks/useCsvUpload';
// New submission/moderation hooks
export { useSubmitResource } from './hooks/useSubmitResource';
export { useMySubmissions } from './hooks/useMySubmissions';
export { useReportResource } from './hooks/useReportResource';
export { usePendingResources } from './hooks/usePendingResources';
export { useModerationActions } from './hooks/useModerationActions';
export { usePendingCount } from './hooks/usePendingCount';

// Types
export type {
  EducationalCategory,
  EducationalResource,
  EducationalResourceCategory,
  CreateCategoryInput,
  CreateResourceInput,
  CategoryResponse,
  ResourceResponse,
  CategoriesResponse,
  ResourcesResponse,
  ResourceFilters,
  CategoryParams,
  UseEducationalCategoriesResult,
  UseEducationalResourcesResult,
  UseEducationalResourcesPaginatedResult,
  UseEducationalResourcesOptions,
  UseEducationalCategoriesOptions,
  CsvUploadError,
  CsvUploadResult,
  CsvUploadResponse,
  CsvUploadErrorResponse,
  CsvUploadApiResponse,
  // New types
  ResourceStatus,
  ResourceReport,
  ReportResourceInput,
  ReportResourceResponse,
  ApproveResourceInput,
  RejectResourceInput,
  PendingCountResponse,
  ReportsResponse,
  WikiErrorCode,
  ContentFilterReason,
  WikiApiError
} from './types';

// ReadList exports
export * from './readList'; 