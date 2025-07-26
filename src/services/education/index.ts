// API functions
export { 
  fetchEducationalCategories, 
  fetchEducationalResources, 
  fetchResourcesByCategory, 
  fetchResourcesByCategories,
  createEducationalCategory,
  createEducationalResource,
  deleteEducationalResource
} from './api';

// Hooks
export { useEducationalCategories } from './hooks/useEducationalCategories';
export { useEducationalResourcesByCategories } from './hooks/useEducationalResourcesByCategories';
export { useCreateEducationalCategory } from './hooks/useCreateEducationalCategory';
export { useCreateEducationalResource } from './hooks/useCreateEducationalResource';
export { useDeleteEducationalResource } from './hooks/useDeleteEducationalResource';

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
  UseEducationalCategoriesOptions
} from './types';

// ReadList exports
export * from './readList'; 