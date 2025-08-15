// Types for token websocket data

export interface TokenTrade {
  coin: string;        // "@107" for token
  side: "A" | "B";     // "A" for sell, "B" for buy  
  px: string;          // Price as string
  sz: string;          // Size as string
  time: number;        // Timestamp
  hash: string;        // Transaction hash
  tid: number;         // Trade ID
  users: string[];     // Array of user addresses involved
}

export interface TokenTradeResponse {
  channel: string;     // "trades"
  data: TokenTrade[];
}

export interface TokenOrderBookLevel {
  px: string;          // Price as string
  sz: string;          // Size as string  
  n: number;           // Number of orders
}

export interface TokenOrderBookData {
  coin: string;        // "@107" for token
  time: number;        // Timestamp
  levels: [
    TokenOrderBookLevel[],  // Bids (index 0)
    TokenOrderBookLevel[]   // Asks (index 1)
  ];
}

export interface TokenOrderBookResponse {
  channel: string;     // "l2Book"
  data: TokenOrderBookData;
}

export interface TokenWebSocketState {
  currentPrice: number;
  lastSide: "A" | "B" | null;
  orderBook: {
    bids: TokenOrderBookLevel[];
    asks: TokenOrderBookLevel[];
  };
  trades: TokenTrade[];
  isConnected: boolean;
  error: string | null;
}

export interface TokenWebSocketStore extends TokenWebSocketState {
  connect: (coinId: string) => void;
  disconnect: () => void;
  resetPriceAnimation: () => void;
}

export interface UseTokenWebSocketResult {
  price: number | null;
  lastSide: "A" | "B" | null;
  orderBook: {
    bids: TokenOrderBookLevel[];
    asks: TokenOrderBookLevel[];
  };
  trades: TokenTrade[];
  isLoading: boolean;
  error: string | null;
}
