export interface BaseToken {
  name: string;
  logo: string | null;
  price: number;
  change24h: number;
  volume: number;
}

export interface SpotToken extends BaseToken {
  marketCap: number;
  supply: number;
}

export interface PerpToken extends BaseToken {
  openInterest: number;
  funding: number;
}

export type SortOrder = "asc" | "desc";

export type SpotSortableFields = "volume" | "marketCap" | "change24h" | "price" | "name";
export type PerpSortableFields = "volume" | "openInterest" | "change24h" | "price";

export interface TableState {
  sortField: SpotSortableFields | PerpSortableFields;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}

export interface StateComponentProps {
  message?: string;
}

export interface BaseTableProps {
  loading?: boolean;
} 