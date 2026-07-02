import { postExternal } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { API_URLS } from '../../api/constants';
import { ASSISTANCE_FUND_ADDRESS } from '../hype/constants';
import {
  SpotClearinghouseStateResponse,
  SpotClearinghouseStateRequest,
  AssistanceFundRaw,
} from './types';

/**
 * Récupère l'état du clearinghouse spot pour une adresse donnée
 */
export const fetchSpotClearinghouseState = async (userAddress: string): Promise<SpotClearinghouseStateResponse> => {
  return withErrorHandling(async () => {
    const requestData: SpotClearinghouseStateRequest = {
      type: "spotClearinghouseState",
      user: userAddress
    };

    const response = await postExternal<SpotClearinghouseStateResponse>(
      `${API_URLS.HYPERLIQUID_API}/info`,
      requestData
    );

    return response;
  }, 'fetching spot clearinghouse state');
};

/**
 * Récupère les faits on-chain du fonds d'assistance (balance HYPE + cost basis).
 * Price-independent — la valorisation USD et le PnL sont calculés dans le hook
 * avec le prix HYPE live.
 */
export const fetchAssistanceFundData = async (): Promise<AssistanceFundRaw> => {
  return withErrorHandling(async () => {
    const response = await fetchSpotClearinghouseState(ASSISTANCE_FUND_ADDRESS);

    // Trouver le balance HYPE dans les balances
    const hypeBalance = response.balances.find(balance => balance.coin === 'HYPE');

    if (!hypeBalance) {
      return { hypeBalance: 0, costBasisUsd: 0, avgEntryPrice: 0 };
    }

    const hypeAmount = parseFloat(hypeBalance.total);
    const costBasisUsd = parseFloat(hypeBalance.entryNtl ?? '0');
    const avgEntryPrice = hypeAmount > 0 ? costBasisUsd / hypeAmount : 0;

    return { hypeBalance: hypeAmount, costBasisUsd, avgEntryPrice };
  }, 'fetching assistance fund data');
};
