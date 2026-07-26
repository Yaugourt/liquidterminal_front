import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchExportPreview } from '../api';
import { ExportDataset, ExportParamValues, ExportPreview, UseExportPreviewResult } from '../types';

const DEBOUNCE_MS = 400;

/**
 * First rows and columns for the current query.
 *
 * Debounced because it re-runs on every keystroke in the parameter form, and
 * refuses to fire while a required param is empty — upstream would answer 400
 * and the user would read an error they have not made yet.
 */
export const useExportPreview = (
  dataset: ExportDataset | undefined,
  values: ExportParamValues,
  enabled: boolean
): UseExportPreviewResult => {
  const [preview, setPreview] = useState<ExportPreview | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Serialised so the effect compares values, not object identity.
  const signature = JSON.stringify(values);
  const latestRequest = useRef(0);

  const missingRequired =
    dataset?.params.some((p) => p.required && !values[p.key]?.trim()) ?? false;

  const run = useCallback(async () => {
    if (!dataset || !enabled || missingRequired) return;
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchExportPreview(dataset.id, values);
      // Ignore a slow response overtaken by a newer one.
      if (latestRequest.current === requestId) setPreview(result);
    } catch (err) {
      if (latestRequest.current === requestId) {
        setError(err instanceof Error ? err : new Error('Failed to load preview'));
        setPreview(undefined);
      }
    } finally {
      if (latestRequest.current === requestId) setIsLoading(false);
    }
    // `values` is covered by `signature`; including it would defeat the debounce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, enabled, missingRequired, signature]);

  useEffect(() => {
    if (!dataset || !enabled || missingRequired) {
      setPreview(undefined);
      setError(null);
      return;
    }
    const timer = setTimeout(() => void run(), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [dataset, enabled, missingRequired, run]);

  return { preview, isLoading, error, refetch: run };
};
