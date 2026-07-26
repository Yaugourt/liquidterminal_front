import { useCallback, useEffect, useState } from 'react';
import { fetchExportQuota } from '../api';
import { ExportQuota, UseExportQuotaResult } from '../types';

/**
 * Remaining exports for the signed-in user.
 *
 * Hand-rolled rather than built on `useDataFetching`, which has no `enabled`
 * option: this endpoint requires auth, so an unconditional hook would fire 401s
 * (and retry them) on every page a signed-out visitor opens.
 */
export const useExportQuota = (enabled: boolean): UseExportQuotaResult => {
  const [quota, setQuota] = useState<ExportQuota | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      setQuota(await fetchExportQuota());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load export quota'));
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setQuota(undefined);
      return;
    }
    void refetch();
  }, [enabled, refetch]);

  return { quota, isLoading, error, refetch };
};
