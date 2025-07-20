// ============================================
// TYPES BACKEND - Exactement comme demandé
// ============================================

// Response types from backend
export interface ReadListResponse {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  isPublic: boolean;
  creator: {
    id: number;
    name: string | null;
    email: string | null;
  };
  items: ReadListItemResponse[];
}

export interface ReadListSummaryResponse {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  isPublic: boolean;
  creator: {
    id: number;
    name: string | null;
    email: string | null;
  };
  itemsCount: number;
}

export interface ReadListItemResponse {
  id: number;
  readListId: number;
  resourceId: number;
  addedAt: Date;
  isRead: boolean;
  notes: string | null;
  order: number | null;
  resource: {
    id: number;
    url: string;
    createdAt: Date;
    creator: {
      id: number;
      name: string | null;
      email: string | null;
    };
  };
}

// Input types for API calls
export interface ReadListCreateInput {
  name: string;           // 2-255 chars
  description?: string;   // max 500 chars
  isPublic?: boolean;     // default false
}

export interface ReadListUpdateInput {
  name?: string;          // 2-255 chars
  description?: string;   // max 500 chars  
  isPublic?: boolean;
}

export interface ReadListItemCreateInput {
  resourceId: number;     // required
  notes?: string;         // max 1000 chars
  order?: number;         // min 0
  isRead?: boolean;       // default false
}

export interface ReadListItemUpdateInput {
  notes?: string;         // max 1000 chars
  order?: number;         // min 0
  isRead?: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Query parameters
export interface ReadListQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  isPublic?: boolean;
}

// ============================================
// ALIASES pour compatibilité temporaire
// ============================================
export type ReadList = ReadListSummaryResponse;
export type ReadListItem = ReadListItemResponse;
export type CreateReadListDto = ReadListCreateInput;
export type UpdateReadListDto = ReadListUpdateInput;
export type AddResourceDto = ReadListItemCreateInput;

// Types à supprimer plus tard
export interface ReorderItemsDto {
  itemIds: number[];
} 