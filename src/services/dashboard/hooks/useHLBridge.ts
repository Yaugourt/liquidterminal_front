import { useState, useEffect } from 'react';
import { HLBridgeData, UseHLBridgeResult } from '../types';
import { fetchHLBridge } from '../api';

export function useHLBridge(): UseHLBridgeResult {
  const [bridgeData, setBridgeData] = useState<HLBridgeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchHLBridge();
      setBridgeData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch HL bridge data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    bridgeData,
    isLoading,
    error,
    refetch: fetchData
  };
} 