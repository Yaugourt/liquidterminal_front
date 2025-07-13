import { useDataFetching } from '../../../hooks/useDataFetching';
import { fetchProject } from '../api';
import { UseProjectResult } from '../types';

export const useProject = (
  id: number | undefined,
  initialData?: { success: boolean; data: any }
): UseProjectResult => {
  const { data, isLoading, error, refetch } = useDataFetching<{ success: boolean; data: any }>({
    fetchFn: id ? () => fetchProject(id) : async () => ({ success: false, data: null }),
    initialData,
    dependencies: [id],
    refreshInterval: 60000 // 60 seconds
  });

  return {
    project: data?.data,
    isLoading,
    error,
    refetch
  };
}; 