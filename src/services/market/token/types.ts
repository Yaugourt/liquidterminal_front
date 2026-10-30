// Types for token websocket data

interface TokenTrade {
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

interface TokenOrderBookLevel {
  px: string;          // Price as string
  sz: string;          // Size as string  
  n: number;           // Number of orders
}

interface TokenOrderBookData {
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

/**
 * `activeAssetCtx` (perp) / `activeSpotAssetCtx` (spot) frame, ~1/s, values as
 * decimal strings. Perp-only fields are absent on a spot frame.
 */
export interface TokenAssetCtxResponse {
  channel: string;     // "activeAssetCtx" | "activeSpotAssetCtx"
  data?: {
    coin: string;
    ctx?: {
      markPx?: string;
      prevDayPx?: string;
      dayNtlVlm?: string;
      oraclePx?: string;
      premium?: string;
      funding?: string;
      /** In coins, not USD. */
      openInterest?: string;
    };
  };
}

/**
 * Live 24h stats of the coin the token socket is on. Units as Hyperliquid
 * sends them: prices and `dayNtlVlm` in USD, `funding` hourly as a fraction,
 * `premium` as a fraction, `openInterest` in coins. The perp-only fields are
 * null on a spot coin.
 */
export interface TokenAssetCtx {
  /** Coin the frame was for (the socket's subscription name). */
  coin: string;
  markPx: number;
  prevDayPx: number;
  dayNtlVlm: number;
  oraclePx: number | null;
  premium: number | null;
  funding: number | null;
  openInterest: number | null;
}

export interface TokenWebSocketState {
  currentPrice: number;
  /** Latest asset context of the socket's coin (null until its first frame). */
  assetCtx: TokenAssetCtx | null;
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

/**
 * HL `tokenDetails` as the backend serves it (`/market/token-details/:tokenId`):
 * every scalar field as HL sends it, and the length of each address list in
 * place of the list (HYPE's genesis list alone is 5 MB).
 */
export interface TokenDetails {
  name: string;
  maxSupply: string;
  totalSupply: string;
  circulatingSupply: string;
  szDecimals: number;
  weiDecimals: number;
  midPx: string | null;
  markPx: string;
  prevDayPx: string;
  /** null for genesis tokens (HYPE, USDC, PURR). */
  deployer: string | null;
  deployGas: string | null;
  deployTime: string | null;
  seededUsdc: string;
  futureEmissions: string;
  /** Addresses credited at genesis (0 without a genesis). */
  genesisUserCount: number;
  /** Genesis balances granted to holders of an existing token. */
  genesisExistingTokenCount: number;
  nonCirculatingUserCount: number;
}

// Types for candle data API
export interface TokenCandle {
  T: number;      // End timestamp (epoch millis)
  c: string;      // Close price
  h: string;      // High price
  l: string;      // Low price
  o: string;      // Open price
  v: string;      // Volume
  t: number;      // Start timestamp (epoch millis)
  s: string;      // Symbol/coin
  i: string;      // Interval
  n: number;      // Number of trades
}

export interface TokenCandleRequest {
  type: "candleSnapshot";
  req: {
    coin: string;
    interval: CandleInterval;
    startTime: number;  // epoch millis
    endTime: number;    // epoch millis
  };
}

/** Candle intervals: 5s and 30s come from our indexer, the rest from Hyperliquid. */
export type CandleInterval = "5s" | "30s" | "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";
