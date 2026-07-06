// API functions
export {
  fetchEducationalCategories,
  fetchWikiResources,
  fetchAllWikiResources,
  createEducationalCategory,
  createEducationalResource,
  deleteEducationalResource,
  uploadCsvResources,
  submitResource,
  fetchMySubmissions,
  reportResource,
  fetchPendingResources,
  fetchPendingCount,
  approveResource,
  rejectResource
} from './api';

// Hooks
export { useEducationalCategories } from './hooks/useEducationalCategories';
export { useWikiLibrary } from './hooks/useWikiLibrary';
export { useCreateEducationalCategory } from './hooks/useCreateEducationalCategory';
export { useCreateEducationalResource } from './hooks/useCreateEducationalResource';
export { useDeleteEducationalResource } from './hooks/useDeleteEducationalResource';
export { useCsvUpload } from './hooks/useCsvUpload';
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
  WikiLinkPreview,
  ResourceStatus,
  CategoryParams,
  WikiResourcesParams,
  CategoriesResponse,
  ResourcesResponse,
  CreateCategoryInput,
  CreateResourceInput,
  CategoryResponse,
  ResourceResponse,
  CsvUploadApiResponse,
  ResourceReport,
  ReportResourceInput,
  ReportResourceResponse,
  ApproveResourceInput,
  RejectResourceInput,
  PendingCountResponse
} from './types';

// ReadList exports
export * from './readList';
