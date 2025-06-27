import { BlockDetails, UseBlockDetailsResult, fetchBlockDetails } from '../index';
import { useDataFetching } from '@/hooks/useDataFetching';

export const useBlockDetails = (blockNumber: string): UseBlockDetailsResult => {
  const { data, isLoading, error } = useDataFetching<BlockDetails>({
    fetchFn: () => fetchBlockDetails(Number(blockNumber)).then(response => response.blockDetails),
    dependencies: [blockNumber],
    refreshInterval: 0
  });

  return {
    blockDetails: data,
    isLoading,
    error
  };
}; 