export interface HypeTrade {
  coin: string;        // "@107" for HYPE
  side: "A" | "B";     // "A" for sell, "B" for buy
  px: string;          // Price as string
  sz: string;          // Size as string
  time: number;        // Timestamp
  hash: string;        // Transaction hash
  tid: number;         // Trade ID
  users: string[];     // Array of user addresses involved
}

export interface HypeTradeResponse {
  channel: string;     // "trades"
  data: HypeTrade[];
}

export interface HypePriceState {
  currentPrice: number;
  lastSide: "A" | "B" | null;
  isConnected: boolean;
  error: string | null;
}

export interface HypePriceStore extends HypePriceState {
  connect: () => void;
  disconnect: () => void;
  resetPriceAnimation: () => void;
}

export interface UseHypePriceResult {
  price: number | null;
  lastSide: "A" | "B" | null;
  isLoading: boolean;
  error: string | null;
}

// Interface pour étendre Window avec les propriétés WebSocket
export interface HypeWebSocketWindow extends Window {
  hypePriceWs?: WebSocket;
} 