export interface ReadListItem {
  id: string;
  title: string;
  description: string;
  url: string;
  image?: string;
  category: string;
  addedAt: string;
  isRead: boolean;
  tags?: string[];
}

export interface ReadList {
  id: string;
  name: string;
  description?: string;
  items: ReadListItem[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

export interface CreateReadListRequest {
  name: string;
  description?: string;
  isPublic: boolean;
}

export interface AddToReadListRequest {
  readListId: string;
  item: Omit<ReadListItem, 'id' | 'addedAt' | 'isRead'>;
} 