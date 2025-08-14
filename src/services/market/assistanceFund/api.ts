import { postExternal } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { API_URLS } from '../../api/constants';
import { 
  SpotClearinghouseStateResponse, 
  SpotClearinghouseStateRequest,
  AssistanceFundData 
} from './types';

// Adresse du fonds d'assistance
const ASSISTANCE_FUND_ADDRESS = "0xfefefefefefefefefefefefefefefefefefefefe";

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
 * Récupère les données du fonds d'assistance (balance HYPE)
 */
export const fetchAssistanceFundData = async (hypePrice: number): Promise<AssistanceFundData> => {
  return withErrorHandling(async () => {
    const response = await fetchSpotClearinghouseState(ASSISTANCE_FUND_ADDRESS);
    
    // Trouver le balance HYPE dans les balances
    const hypeBalance = response.balances.find(balance => balance.coin === 'HYPE');
    
    if (!hypeBalance) {
      // Si pas de HYPE trouvé, retourner 0
      return {
        hypeBalance: 0,
        hypeValueUsd: 0
      };
    }

    // Convertir le balance string en nombre
    const hypeAmount = parseFloat(hypeBalance.total);
    const hypeValueUsd = hypeAmount * hypePrice;

    return {
      hypeBalance: hypeAmount,
      hypeValueUsd: hypeValueUsd
    };
  }, 'fetching assistance fund data');
};
