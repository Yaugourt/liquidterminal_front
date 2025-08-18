export interface Wallet {
  id: number;
  address: string;
  name: string;
  addedAt: Date;
}

export interface UserWallet {
  id: number;
  userId: number;
  walletId: number;
  name?: string;
  address?: string;
  addedAt: Date;
}

export interface WalletResponse {
  data: UserWallet[];
}

export interface AddWalletRequest {
  address: string;
  name?: string;
  // ❌ PAS de privyUserId !
}

export interface AddWalletResponse {
  success: boolean;
  userWallet?: UserWallet;
  message?: string;
}

export interface InitializeParams {
  privyUserId: string;
  username: string;
  privyToken: string;
}

// Types pour le store use-wallets
export interface WalletsState {
  wallets: Wallet[];
  userWallets: UserWallet[];
  activeWalletId: number | null;
  loading: boolean;
  error: string | null;
  
  initialize: (params: InitializeParams) => Promise<void>;
  reloadWallets: () => Promise<void>;
  addWallet: (address: string, name?: string) => Promise<Wallet | void>;
  removeWallet: (id: number) => Promise<void>;
  setActiveWallet: (id: number) => void;
  reorderWallets: (newOrder: number[]) => void;
  getActiveWallet: () => Wallet | undefined;
}

/**
 * Types pour les services de wallets
 */

/**
 * Balance de token Hyperliquid
 */
export interface HyperliquidBalance {
  coin: string;
  token: number;
  hold: string;
  total: string;
  entryNtl: string;
}

/**
 * Réponse de l'API Hyperliquid pour les balances de tokens
 */
export type HyperliquidBalancesResponse = HyperliquidBalance[];

/**
 * Paramètres pour la requête de balances de tokens
 */
export interface HyperliquidBalancesRequest {
  type: string;
  user: string;
}

/**
 * Résultat du hook pour récupérer les balances de tokens
 */
export interface UseHyperliquidBalancesResult {
  balances: HyperliquidBalance[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Types pour les positions perp de Hyperliquid
 */
export interface HyperliquidPerpPosition {
  coin: string;
  cumFunding: {
    allTime: string;
    sinceChange: string;
    sinceOpen: string;
  };
  entryPx: string;
  leverage: {
    rawUsd: string;
    type: string;
    value: number;
  };
  liquidationPx: string;
  marginUsed: string;
  maxLeverage: number;
  positionValue: string;
  returnOnEquity: string;
  szi: string;
  unrealizedPnl: string;
}

export interface HyperliquidPerpAssetPosition {
  position: HyperliquidPerpPosition;
  type: string;
}

export interface HyperliquidMarginSummary {
  accountValue: string;
  totalMarginUsed: string;
  totalNtlPos: string;
  totalRawUsd: string;
}

export interface HyperliquidPerpResponse {
  assetPositions: HyperliquidPerpAssetPosition[];
  crossMaintenanceMarginUsed: string;
  crossMarginSummary: HyperliquidMarginSummary;
  marginSummary: HyperliquidMarginSummary;
  time: number;
  withdrawable: string;
}

export interface HyperliquidPerpRequest {
  type: string;
  user: string;
} 