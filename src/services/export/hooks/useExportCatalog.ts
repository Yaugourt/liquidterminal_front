import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchExportCatalog } from '../api';
import { ExportCatalog, UseExportCatalogResult } from '../types';

/**
 * The dataset catalog. Static for the lifetime of a deploy, so it is fetched
 * once and shared: every export surface reads the same manifest the backend
 * validates against.
 */
export const useExportCatalog = (): UseExportCatalogResult => {
  const { data, isLoading, error } = useDataFetching<ExportCatalog>({
    fetchFn: () => fetchExportCatalog(),
    refreshInterval: 0,
    dependencies: [],
    maxRetries: 2,
  });

  return {
    catalog: data ?? undefined,
    datasets: data?.datasets ?? [],
    isLoading,
    error,
  };
};
