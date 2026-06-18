// ==================== DONNÉES DE BASE ====================
export interface LinkPreview {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==================== RÉPONSES API ====================
export interface LinkPreviewResponse {
  success: boolean;
  data: LinkPreview;
  error?: string;
  code?: string;
}

export interface LinkPreviewBatchResponse {
  success: boolean;
  results: Array<{
    url: string;
    success: boolean;
    data: LinkPreview | null;
    error: string | null;
  }>;
}

// ==================== RÉSULTATS DE HOOKS ====================
export interface UseLinkPreviewResult {
  data: LinkPreview | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseLinkPreviewBatchResult {
  previews: Map<string, LinkPreview>;
  errors: Map<string, string>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getPreview: (url: string) => LinkPreview | null;
  getError: (url: string) => string | null;
} 