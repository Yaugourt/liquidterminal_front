/**
 * Common utilities for stores
 */

export const handleApiError = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { status?: number } }).response;
    switch (response?.status) {
      case 409: return 'Resource already exists';
      case 400: return 'Invalid data provided';
      case 404: return 'Resource not found';
      case 403: return 'Access denied';
      default: return defaultMessage;
    }
  }
  return defaultMessage;
};

/**
 * Utility for managing item order in localStorage
 */
export const createOrderManager = <T>(storageKey: string, getId: (item: T) => number) => ({
  /**
   * Restore items order from localStorage
   */
  restoreOrder: (items: T[]): T[] => {
    try {
      const savedOrder = localStorage.getItem(`${storageKey}-order`);
      if (!savedOrder) return items;
      
      const orderIds = JSON.parse(savedOrder) as number[];
      const itemMap = new Map(items.map(item => [getId(item), item]));
      
      // Items in saved order
      const orderedItems = orderIds
        .map(id => itemMap.get(id))
        .filter((item): item is T => item !== undefined);
      
      // Add new items not in saved order
      const usedIds = new Set(orderIds);
      const newItems = items.filter(item => !usedIds.has(getId(item)));
      
      return [...orderedItems, ...newItems];
    } catch {
      return items;
    }
  },
  
  /**
   * Save items order to localStorage
   */
  saveOrder: (items: T[]): void => {
    try {
      const order = items.map(getId);
      localStorage.setItem(`${storageKey}-order`, JSON.stringify(order));
    } catch {
      // Silent fail for localStorage errors
    }
  }
});

/**
 * Validates a name field with length constraints
 */
export const validateName = (
  name: string,
  options: {
    minLength?: number;
    maxLength?: number;
    fieldName?: string;
  } = {}
): void => {
  const {
    minLength = 2,
    maxLength = 255,
    fieldName = "Name"
  } = options;
  
  if (!name?.trim() || name.trim().length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters`);
  }
  
  if (name.length > maxLength) {
    throw new Error(`${fieldName} is too long (max ${maxLength} characters)`);
  }
};

/**
 * Validates an Ethereum wallet address
 */
export const validateWalletAddress = (address: string): string => {
  if (!address?.trim()) {
    throw new Error("Address is required");
  }
  
  const normalizedAddress = address.toLowerCase().trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(normalizedAddress)) {
    throw new Error("Invalid wallet address format");
  }
  
  return normalizedAddress;
};

/**
 * Parses UserWallet to Wallet format
 */
export const parseUserWallet = (uw: unknown): unknown | null => {
  // Type guard pour vérifier si c'est un objet
  if (!uw || typeof uw !== 'object') return null;
  
  const userWallet = uw as Record<string, unknown>;
  
  // Si nous avons un objet wallet complet
  if (userWallet.wallet && typeof userWallet.wallet === 'object') {
    const wallet = userWallet.wallet as Record<string, unknown>;
    return {
      id: wallet.id,
      address: wallet.address || userWallet.address || '',
      name: userWallet.name || `Wallet ${userWallet.id}`,
      addedAt: wallet.addedAt || userWallet.addedAt || new Date()
    };
  }
  
  // Si nous n'avons que les informations de base
  return {
    id: userWallet.walletId,
    address: userWallet.address || '',
    name: userWallet.name || `Wallet ${userWallet.walletId}`,
    addedAt: userWallet.addedAt || new Date()
  };
};

/**
 * Processes wallets API response
 */
export const processWalletsResponse = (response: { data?: unknown[] }): { wallets: unknown[], userWallets: unknown[] } => {
  if (!response?.data || !Array.isArray(response.data)) {
    throw new Error("Invalid response format from server");
  }
  
  const userWallets = response.data;
  const wallets = userWallets
    .map(parseUserWallet)
    .filter((wallet: unknown | null): wallet is unknown => {
      if (!wallet || typeof wallet !== 'object') return false;
      
      const walletObj = wallet as Record<string, unknown>;
      const isValid = typeof walletObj.id === 'number' &&
        typeof walletObj.name === 'string';
      
      return isValid;
    });
  
  return { wallets, userWallets };
};
