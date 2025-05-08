import { FeesStats } from './types';
import { fetchWithConfig } from '../../api/base'; // Assuming base fetch utility



/**
 * Fetches the fees statistics.
 */
export const fetchFeesStats = async (): Promise<FeesStats> => {
  // fetchWithConfig is expected to prepend the base URL (e.g., http://localhost:3002)
  return fetchWithConfig<FeesStats>('/market/fees');
}; 