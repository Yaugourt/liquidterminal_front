import { get } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import type { AfBuybacksPayload } from './types';

/**
 * The Assistance Fund's HYPE buybacks, aggregated per UTC day by the backend
 * from the fund's on-chain buy fills: the last 13 completed days (only days it
 * read whole), the running day and its latest buys. The browser used to post
 * one `userFillsByTime` per day (~300 KB each, uncompressed) and got busy days
 * cut at 2,000 fills.
 */
export const fetchAfBuybacks = async (): Promise<AfBuybacksPayload> => {
  return withErrorHandling(async () => {
    const response = await get<{ success: boolean; data: AfBuybacksPayload }>(
      '/market/revenue/af-buybacks'
    );
    return response.data;
  }, 'fetching assistance fund buybacks');
};
