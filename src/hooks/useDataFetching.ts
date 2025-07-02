import { useState, useEffect, useRef } from 'react';

interface UseDataFetchingOptions<T> {
  fetchFn: () => Promise<T>;
  refreshInterval?: number;
  dependencies?: any[];
  maxRetries?: number;
  retryDelay?: number;
  initialData?: T | null;
}

export function useDataFetching<T>({
  fetchFn,
  refreshInterval = 30000,
  dependencies = [],
  maxRetries = 3,
  retryDelay = 1000,
  initialData = null
}: UseDataFetchingOptions<T>) {
  // States
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Only keep necessary refs
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Cleanup effect
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Main fetch function with retry logic
  const fetchData = async (isRetry = false) => {
    if (!mountedRef.current) return;

    try {
      if (!isRetry) {
        setIsLoading(true);
        setError(null);
        setRetryCount(0);
      }

      const result = await fetchFn();
      
      if (mountedRef.current) {
        setData(result);
        setError(null);
        setRetryCount(0);
      }
    } catch (err) {
      if (!mountedRef.current) return;

      console.error('Error fetching data:', err);
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      
      if (retryCount < maxRetries) {
        const nextRetryCount = retryCount + 1;
        setRetryCount(nextRetryCount);
        const retryDelayWithBackoff = retryDelay * Math.pow(2, nextRetryCount - 1);
        

        
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        
        retryTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            fetchData(true);
          }
        }, retryDelayWithBackoff);
        
        setError(new Error(`Retry attempt ${nextRetryCount} of ${maxRetries}: ${error.message}`));
      } else {
        setError(error);
        setRetryCount(0);
      }
    } finally {
      if (mountedRef.current && !isRetry) {
        setIsLoading(false);
      }
    }
  };

  // Combined effect for both initial fetch and dependencies changes
  useEffect(() => {
    // Clear existing interval
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    // Fetch data when dependencies change
    fetchData();

    // Only set up interval if refreshInterval is positive
    if (refreshInterval > 0) {
      intervalIdRef.current = setInterval(fetchData, refreshInterval);
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [refreshInterval, ...dependencies]); // Include dependencies for refetching

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchData()
  };
} 