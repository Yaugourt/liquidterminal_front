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
  wallet?: {
    id: number;
    address: string;
    addedAt: Date;
  };
  name?: string;
  address?: string;
  addedAt: Date;
}

export interface WalletResponse {
  data: UserWallet[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
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
  addWallet: (address: string, name?: string, walletListId?: number) => Promise<Wallet | void>;
  removeWallet: (id: number) => Promise<void>;
  setActiveWallet: (id: number | null) => void;
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

/**
 * Types pour les listes de wallets
 */
export interface WalletList {
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
  items: WalletListItem[];
  itemsCount: number;
}

export interface WalletListItem {
  id: number;
  walletListId: number;
  userWalletId: number;
  addedAt: Date;
  notes: string | null;
  order: number | null;
  userWallet: {
    id: number;
    name: string | null;
    addedAt: Date;
    User: {
      id: number;
      name: string | null;
      email: string | null;
    };
    Wallet: {
      id: number;
      address: string;
      addedAt: Date;
    };
  };
}

export interface CreateWalletListInput {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateWalletListInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface CreateWalletListItemInput {
  userWalletId: number;
  notes?: string;
  order?: number;
}

export interface UpdateWalletListItemInput {
  notes?: string;
  order?: number;
}

export interface WalletListResponse {
  data: WalletList[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Types pour le store wallet lists
 */
export interface WalletListsState {
  userLists: WalletList[];
  publicLists: WalletList[];
  activeListId: number | null;
  activeListItems: WalletListItem[];
  loading: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  loadUserLists: (params?: { search?: string; limit?: number }) => Promise<void>;
  loadPublicLists: (params?: { search?: string; limit?: number }) => Promise<void>;
  createList: (data: CreateWalletListInput) => Promise<WalletList>;
  updateList: (id: number, data: UpdateWalletListInput) => Promise<WalletList>;
  deleteList: (id: number) => Promise<void>;
  copyList: (id: number) => Promise<WalletList>;
  
  // Items management
  loadListItems: (listId: number) => Promise<void>;
  addWalletToList: (listId: number, data: CreateWalletListItemInput) => Promise<WalletListItem | void>;
  removeWalletFromList: (itemId: number) => Promise<void>;
  setActiveList: (id: number) => void;
  
  // Utility
  clearError: () => void;
  refreshUserLists: () => Promise<void>;
  refreshListItems: (listId: number) => Promise<void>;
  getListItems: (listId: number) => Promise<WalletListItem[]>;
}