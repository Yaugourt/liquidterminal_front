/**
 * Common types for all stores
 */

// Base interfaces
export interface InitializeParams {
  privyUserId: string;
  username: string;
  privyToken: string;
}

// ReadList types
export interface CreateReadListData {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateReadListData {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface AddItemData {
  resourceId: number;
  notes?: string;
  order?: number;
  isRead?: boolean;
}

export interface UpdateItemData {
  notes?: string;
  order?: number;
  isRead?: boolean;
}


