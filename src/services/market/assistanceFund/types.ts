// Types pour l'API spotClearinghouseState de Hyperliquid

export interface SpotBalance {
  coin: string;
  hold: string;
  total: string;
}

export interface SpotClearinghouseStateResponse {
  balances: SpotBalance[];
}

export interface SpotClearinghouseStateRequest {
  type: "spotClearinghouseState";
  user: string;
}

export interface AssistanceFundData {
  hypeBalance: number;
  hypeValueUsd: number;
}

export interface UseAssistanceFundResult {
  data: AssistanceFundData | null;
  isLoading: boolean;
  error: Error | null;
}
