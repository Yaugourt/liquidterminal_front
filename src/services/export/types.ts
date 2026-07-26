export type ExportParamType = 'datetime' | 'string' | 'number' | 'enum' | 'address';

export type ExportGroup = 'Trading' | 'Chain' | 'Markets' | 'Capital' | 'Ecosystem';

export interface ExportParamSpec {
  key: string;
  label: string;
  type: ExportParamType;
  options?: string[];
  placeholder?: string;
  help?: string;
  /** Upstream rejects the call without it; the UI must block the export. */
  required?: boolean;
}

export interface ExportDataset {
  id: string;
  label: string;
  group: ExportGroup;
  description: string;
  /** Route the app itself reads this data from — shown for transparency.
   *  The upstream provider path is deliberately NOT exposed by the API. */
  publicPath: string;
  params: ExportParamSpec[];
  pagination: 'cursor' | 'offset' | 'none';
  maxRows: number;
}

export interface ExportLimits {
  maxRows: number;
  exportsPerWindow: number;
  windowMs: number;
}

export interface ExportCatalog {
  datasets: ExportDataset[];
  limits: ExportLimits;
}

export interface ExportQuota {
  limit: number;
  remaining: number;
  /** Seconds until the oldest export leaves the window; 0 when nothing is pending. */
  resetInSeconds: number;
}

export interface ExportPreview {
  rows: Record<string, unknown>[];
  /** Column keys discovered from the response, in first-seen order. */
  columns: string[];
  totalCount: number | null;
}

/** Values chosen in the form, keyed by param. Empty strings mean "unset". */
export type ExportParamValues = Record<string, string>;

export interface UseExportCatalogResult {
  catalog: ExportCatalog | undefined;
  datasets: ExportDataset[];
  isLoading: boolean;
  error: Error | null;
}

export interface UseExportQuotaResult {
  quota: ExportQuota | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseExportPreviewResult {
  preview: ExportPreview | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
