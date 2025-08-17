// API functions
export { 
  fetchEducationalCategories, 
  fetchEducationalResources, 
  fetchResourcesByCategory, 
  fetchResourcesByCategories,
  createEducationalCategory,
  createEducationalResource,
  deleteEducationalResource,
  uploadCsvResources
} from './api';

// Hooks
export { useEducationalCategories } from './hooks/useEducationalCategories';
export { useEducationalResourcesByCategories } from './hooks/useEducationalResourcesByCategories';
export { useCreateEducationalCategory } from './hooks/useCreateEducationalCategory';
export { useCreateEducationalResource } from './hooks/useCreateEducationalResource';
export { useDeleteEducationalResource } from './hooks/useDeleteEducationalResource';
export { useCsvUpload } from './hooks/useCsvUpload';

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
  CsvUploadApiResponse
} from './types';

// ReadList exports
export * from './readList'; 