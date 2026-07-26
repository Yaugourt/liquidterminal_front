import { get, apiClient } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
import { ExportCatalog, ExportPreview, ExportQuota, ExportParamValues } from './types';

/** Ceiling for a 50k-row walk at ~1.5s per 500-row page, with room to spare. */
const EXPORT_TIMEOUT_MS = 5 * 60 * 1000;

interface Envelope<T> {
  success: boolean;
  data: T;
}

/** Drops unset fields so the backend never sees `coin=` and treats it as a filter. */
export const toQuery = (values: ExportParamValues): Record<string, string> => {
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    const trimmed = value?.trim();
    if (trimmed) query[key] = trimmed;
  }
  return query;
};

/** The dataset catalog. Public: it drives the picker before anyone signs in. */
export const fetchExportCatalog = async (): Promise<ExportCatalog> => {
  return withErrorHandling(async () => {
    const response = await get<Envelope<ExportCatalog>>('/export/datasets');
    return response.data;
  }, 'fetching export catalog');
};

/** Remaining exports for the signed-in user. */
export const fetchExportQuota = async (): Promise<ExportQuota> => {
  return withErrorHandling(async () => {
    // Uncached: the 30s client cache made a refetch right after an export
    // return the value from before it, so the UI still read "1 / 1 left".
    const response = await get<Envelope<ExportQuota>>('/export/quota', undefined, {
      useCache: false,
    });
    return response.data;
  }, 'fetching export quota');
};

/** First rows and column list. Free: never spends the quota. */
export const fetchExportPreview = async (
  datasetId: string,
  values: ExportParamValues
): Promise<ExportPreview> => {
  return withErrorHandling(async () => {
    const response = await get<Envelope<ExportPreview>>(
      `/export/${datasetId}/preview`,
      toQuery(values)
    );
    return response.data;
  }, 'fetching export preview');
};

export interface RunExportResult {
  fileName: string;
  /** Bytes received, so the UI can report what actually landed. */
  size: number;
}

/**
 * Runs the export and hands the browser a file.
 *
 * Downloaded through axios rather than a plain link because the endpoint needs
 * the Authorization header, which a browser navigation would not send. The cost
 * is buffering the CSV in memory instead of streaming it to disk — acceptable
 * at the 50k-row ceiling (a few MB), and the reason that ceiling exists.
 */
export const runExport = async (
  datasetId: string,
  values: ExportParamValues,
  columns?: string[]
): Promise<RunExportResult> => {
  const params: Record<string, string> = toQuery(values);
  if (columns?.length) params.columns = columns.join(',');

  const response = await apiClient.get(`/export/${datasetId}`, {
    params,
    responseType: 'blob',
    // The shared client times out at 10s, which covers the whole response, not
    // time-to-first-byte. Upstream pages take 1-3s each, so any export past a
    // handful of pages aborted mid-download: the provider was billed, the user
    // got nothing, and the quota was correctly refunded — an infinite retry
    // loop that costs money on every attempt.
    timeout: EXPORT_TIMEOUT_MS,
  });

  const blob = response.data as Blob;
  const fileName =
    parseFileName(response.headers?.['content-disposition']) ?? `${datasetId}.csv`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { fileName, size: blob.size };
};

/** Pulls the filename out of `attachment; filename="…"`. */
function parseFileName(disposition: unknown): string | null {
  if (typeof disposition !== 'string') return null;
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  return match?.[1]?.trim() ?? null;
}

/**
 * Turns a failed blob download into a readable message.
 *
 * The endpoint answers JSON on error, but `responseType: 'blob'` means axios
 * hands back a Blob containing that JSON, so the message has to be read out of
 * it rather than off `error.response.data`.
 */
export const readExportError = async (error: unknown): Promise<string> => {
  const response = (error as { response?: { data?: unknown; status?: number } })?.response;
  const data = response?.data;

  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const parsed = JSON.parse(text) as { error?: string; message?: string; code?: string };
      // Auth middleware answers `message`, the export routes answer `error`.
      if (parsed.error) return parsed.error;
      if (parsed.message) return parsed.message;
    } catch {
      // Not JSON — fall through to the generic message.
    }
  }

  if (data && typeof data === 'object' && 'error' in data) {
    const message = (data as { error?: unknown }).error;
    if (typeof message === 'string') return message;
  }

  if (error instanceof Error && error.message) return error.message;
  return 'Export failed';
};
