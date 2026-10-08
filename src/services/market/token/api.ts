import { withErrorHandling } from '../../api/error-handler';
import { get, postExternal } from '../../api/axios-config';
import { buildHyperliquidUrl } from '../../api/constants';
import { TokenDetails, TokenCandle, TokenCandleRequest, CandleInterval } from './types';

const SUB_MINUTE = new Set<CandleInterval>(['5s', '30s']);

/**
 * HL `tokenDetails` of a spot token, read through the backend: it drops the
 * address lists the app only counts (HYPE's genesis list is 5.2 MB that HL
 * sends uncompressed) and reads HL at most once a minute for every visitor.
 */
export const fetchTokenDetails = async (tokenId: string): Promise<TokenDetails | null> => {
  return withErrorHandling(async () => {
    const response = await get<{ success: boolean; data: TokenDetails }>(
      `/market/token-details/${encodeURIComponent(tokenId)}`
    );
    return response.data;
  }, 'fetching token details');
};

/**
 * Récupère les données de chandelles pour un token
 */
export const fetchTokenCandles = async (
  coin: string,
  interval: CandleInterval,
  startTime: number,
  endTime: number
): Promise<TokenCandle[]> => {
  return withErrorHandling(async () => {
    // Sub-minute bars: our indexer (Hyperliquid's API starts at 1m).
    if (SUB_MINUTE.has(interval)) {
      const res = await get<{ success: boolean; data: TokenCandle[] }>('/indexer/candles', { coin, interval, startTime, endTime });
      return res.data ?? [];
    }
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
