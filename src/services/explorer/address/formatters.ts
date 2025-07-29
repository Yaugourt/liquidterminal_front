import { formatNumber } from '@/lib/numberFormatting';
import { SpotToken } from '@/services/market/spot/types';
import { PerpMarketData } from '@/services/market/perp/types';
import { NumberFormatType } from '@/store/number-format.store';

// Types pour les transactions
interface TransactionData {
  amount?: string;
  token?: string;
  price?: string;
  method?: string;
  from?: string;
  to?: string;
  [key: string]: unknown;
}

export interface TransactionFormatterConfig {
  spotTokens?: SpotToken[];
  perpMarkets?: PerpMarketData[];
  format: NumberFormatType;
  currentAddress?: string;
}

/**
 * Récupère le prix d'un token
 */
export const getTokenPrice = (tokenSymbol: string, spotTokens?: SpotToken[]): number => {
  if (!tokenSymbol) return 0;
  
  // Stablecoins ont toujours un prix de $1
  const stablecoins = ['usdc', 'usdt', 'dai', 'busd', 'tusd'];
  if (stablecoins.includes(tokenSymbol.toLowerCase())) {
    return 1;
  }
  
  if (!spotTokens) return 0;
  const token = spotTokens.find(t => 
    t.name.toLowerCase() === tokenSymbol.toLowerCase()
  );
  return token ? token.price : 0;
};

/**
 * Convertit le token (@107 -> HYPE)
 */
export const getTokenName = (
  token: string, 
  spotTokens?: SpotToken[], 
  perpMarkets?: PerpMarketData[]
): string => {
  if (!token || token === 'unknown') return token;
  
  let isSpotPrefix = false;
  let marketIndex: number;
  
  if (token.startsWith('@')) {
    marketIndex = parseInt(token.substring(1));
    isSpotPrefix = true;
  } else {
    marketIndex = parseInt(token);
  }
  
  if (isNaN(marketIndex)) return token;
  
  if (marketIndex > 10000 || isSpotPrefix) {
    const spotIndex = isSpotPrefix ? marketIndex : marketIndex - 10000;
    const spotToken = spotTokens?.find(t => t.marketIndex === spotIndex);
    return spotToken ? spotToken.name : token;
  } else {
    const perpMarket = perpMarkets?.find(t => t.index === marketIndex);
    return perpMarket ? perpMarket.name : token;
  }
};

// Cette version est plus avancée avec support des tokens et config

/**
 * Calcule la valeur avec direction (+ ou -)
 */
export const calculateValueWithDirection = (
  tx: TransactionData,
  config: TransactionFormatterConfig
): string => {
  if (!tx.amount || !tx.token || tx.token === 'unknown') return '-';
  
  const tokenName = getTokenName(tx.token, config.spotTokens, config.perpMarkets);
  
  let price: number;
  if (tx.price) {
    price = parseFloat(tx.price);
  } else {
    price = getTokenPrice(tokenName, config.spotTokens);
  }
  
  if (isNaN(price) || price === 0) return '-';
  
  const numericAmount = parseFloat(tx.amount.replace(/,/g, ''));
  if (isNaN(numericAmount)) return '-';
  
  const value = numericAmount * price;
  const formattedValue = formatNumber(value, config.format, {
    currency: '$',
    showCurrency: true
  });
  
  // Pour accountClassTransfer, pas de signe (transfert interne)
  if (tx.method === 'accountClassTransfer') {
    return formattedValue;
  }
  
  // Pour spotTransfer, ajouter le signe selon la direction
  if (tx.method === 'spotTransfer') {
    const isOutgoing = config.currentAddress && tx.from && tx.from.toLowerCase() === config.currentAddress.toLowerCase();
    const isIncoming = config.currentAddress && tx.to && tx.to.toLowerCase() === config.currentAddress.toLowerCase();
    
    if (isOutgoing) {
      return `-${formattedValue}`;
    } else if (isIncoming) {
      return `+${formattedValue}`;
    }
  }
  
  return formattedValue;
};

/**
 * Formate le montant avec direction selon le sens du transfert
 */
export const formatAmountWithDirection = (
  tx: TransactionData,
  config: TransactionFormatterConfig
): string => {
  if (!tx.amount || !tx.token || tx.token === 'unknown') return '-';
  
  const formattedAmount = formatNumber(parseFloat(tx.amount), config.format);
  const tokenName = getTokenName(tx.token, config.spotTokens, config.perpMarkets);
  const tokenDisplay = `${formattedAmount} ${tokenName}`;
  
  // Pour les positions Short/Long, appliquer la logique de signe en tenant compte de open/close
  if (tx.isShort) {
    if (tx.isClose) {
      return `+${tokenDisplay}`; // Close short: positif
    } else {
      return `-${tokenDisplay}`; // Open short: négatif
    }
  }
  if (tx.isLong) {
    if (tx.isClose) {
      return `-${tokenDisplay}`; // Close long: négatif
    } else {
      return `+${tokenDisplay}`; // Open long: positif
    }
  }
  
  // Pour accountClassTransfer et cStakingTransfer, pas de signe (transfert interne)
  if (tx.method === 'accountClassTransfer' || tx.method === 'cStakingTransfer') {
    return tokenDisplay;
  }
  
  // Pour spotTransfer, déterminer la direction
  if (tx.method === 'spotTransfer') {
    const isOutgoing = config.currentAddress && tx.from && tx.from.toLowerCase() === config.currentAddress.toLowerCase();
    const isIncoming = config.currentAddress && tx.to && tx.to.toLowerCase() === config.currentAddress.toLowerCase();
    
    if (isOutgoing) {
      return `-${tokenDisplay}`;
    } else if (isIncoming) {
      return `+${tokenDisplay}`;
    }
  }
  
  return tokenDisplay;
};

/**
 * Obtient la classe CSS de couleur selon le sens du transfert
 */
export const getAmountColorClass = (tx: TransactionData, config: TransactionFormatterConfig): string => {
  const currentAddress = config.currentAddress;
  // Pour les positions Short/Long, appliquer les couleurs en tenant compte de open/close
  if (tx.isShort) {
    if (tx.isClose) {
      return 'text-[#4ADE80]'; // Close short: vert
    } else {
      return 'text-[#FF5757]'; // Open short: rouge
    }
  }
  if (tx.isLong) {
    if (tx.isClose) {
      return 'text-[#FF5757]'; // Close long: rouge
    } else {
      return 'text-[#4ADE80]'; // Open long: vert
    }
  }
  
  // Pour accountClassTransfer et cStakingTransfer, toujours vert (transfert interne)
  if (tx.method === 'accountClassTransfer' || tx.method === 'cStakingTransfer') {
    return 'text-[#4ADE80]'; // Vert pour transfert interne
  }
  
  // Pour spotTransfer, déterminer la couleur selon la direction
  if (tx.method === 'spotTransfer') {
    const isOutgoing = currentAddress && tx.from && tx.from.toLowerCase() === currentAddress.toLowerCase();
    const isIncoming = currentAddress && tx.to && tx.to.toLowerCase() === currentAddress.toLowerCase();
    
    if (isOutgoing) {
      return 'text-[#FF5757]'; // Rouge pour sortant
    } else if (isIncoming) {
      return 'text-[#4ADE80]'; // Vert pour entrant
    }
  }
  
  return 'text-white'; // Blanc par défaut
};

// Note: formatAddress et formatHash sont déjà définis dans hooks/useTransactions.ts 