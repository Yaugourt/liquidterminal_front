import { SpotToken } from '@/services/market/spot/types';
import { PerpMarketData } from '@/services/market/perp/types';

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
