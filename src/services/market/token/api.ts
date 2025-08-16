import { withErrorHandling } from '../../api/error-handler';
import { postExternal } from '../../api/axios-config';
import { buildHyperliquidUrl } from '../../api/constants';
import { TokenDetails, TokenDetailsRequest, TokenCandle, TokenCandleRequest } from './types';

/**
 * Récupère les détails d'un token par son tokenId
 */
export const fetchTokenDetails = async (tokenId: string): Promise<TokenDetails | null> => {
  return withErrorHandling(async () => {
    const requestBody: TokenDetailsRequest = {
      type: "tokenDetails",
      tokenId: tokenId
    };

    return await postExternal<TokenDetails>(buildHyperliquidUrl('HYPERLIQUID_INFO'), requestBody);
  }, 'fetching token details');
};

/**
 * Récupère les données de chandelles pour un token
 */
export const fetchTokenCandles = async (
  coin: string,
  interval: "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M",
  startTime: number,
  endTime: number
): Promise<TokenCandle[]> => {
  return withErrorHandling(async () => {
    const requestBody: TokenCandleRequest = {
      type: "candleSnapshot",
      req: {
        coin,
        interval,
        startTime,
        endTime
      }
    };

    const result = await postExternal<TokenCandle[]>(buildHyperliquidUrl('HYPERLIQUID_INFO'), requestBody);
    
    return result;
  }, 'fetching token candles');
};
