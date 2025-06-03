import { useState, useEffect, useRef, useCallback } from 'react';

interface UseDataFetchingOptions<T> {
  fetchFn: () => Promise<T>;
  refreshInterval?: number;
  dependencies?: any[];
  maxRetries?: number;
  retryDelay?: number;
}

export function useDataFetching<T>({
  fetchFn,
  refreshInterval = 20000,
  dependencies = [],
  maxRetries = 3,
  retryDelay = 1000
}: UseDataFetchingOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const retryCountRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isMountedRef = useRef<boolean>(true);
  const fetchFnRef = useRef(fetchFn);

  // Update fetchFn ref when it changes
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);
  
  // Cleanup function
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, []);

  const fetchData = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current) return;

    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchFnRef.current();
      
      if (!isMountedRef.current) return;
      
      setData(result);
      retryCountRef.current = 0;
    } catch (err) {
      if (!isMountedRef.current) return;

      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      if (retryCountRef.current < maxRetries) {
        const delay = retryDelay * Math.pow(2, retryCountRef.current);
        retryCountRef.current += 1;
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            fetchData();
          }
        }, delay);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [maxRetries, retryDelay]); // Removed fetchFn from dependencies

  // Initial fetch and refresh interval setup
  useEffect(() => {
    if (!isMountedRef.current) return;

    // Clear any existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    fetchData();
    
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (isMountedRef.current) {
          fetchData();
        }
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [fetchData, refreshInterval, ...dependencies]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
} 