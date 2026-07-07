// ============================================
// TYPES BACKEND - Exactement comme demandé
// ============================================

import type { WikiLinkPreview } from '../types';

// Response types from backend
interface ReadListSummaryResponse {
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
  /** Items marked as read; drives the progress bar. */
  readCount: number;
}

interface ReadListItemResponse {
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
    /** Inlined by the backend; no /link-preview call needed for item cards. */
    linkPreview?: WikiLinkPreview | null;
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

// ============================================
// ALIASES pour compatibilité temporaire
// ============================================
export type ReadList = ReadListSummaryResponse;
export type ReadListItem = ReadListItemResponse;

// ============================================
// TYPES POUR LES READ LISTS PUBLIQUES
// ============================================

export interface PublicReadList {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  itemsCount: number;
  /** Items marked read across the list (returned by the public endpoint). */
  readCount?: number;
  creator: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PublicReadListWithItems extends PublicReadList {
  items: ReadListItem[];
}

export interface PublicReadListQueryParams {
  page?: number;
  limit?: number;
  sort?: 'createdAt' | 'updatedAt' | 'name';
  order?: 'asc' | 'desc';
  search?: string;
}

export interface PublicReadListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PublicReadListsResponse {
  success: boolean;
  data: PublicReadList[];
  pagination: PublicReadListPagination;
}

export interface ReadListCopyResponse {
  success: boolean;
  data: PublicReadListWithItems;
  message: string;
}