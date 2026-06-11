interface BaseToken {
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

export type SpotSortableFields = "volume" | "marketCap" | "change24h" | "price" | "name";
