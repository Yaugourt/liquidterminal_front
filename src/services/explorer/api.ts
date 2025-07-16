import { 
    BlockDetailsResponse,
    TransactionDetailsResponse,
    TransferData,
    DeployData,
} from './types';
import { postExternal, getExternal } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
import { API_URLS } from '../api/constants';

/**
 * Récupère les détails d'un block spécifique
 */
export async function fetchBlockDetails(height: number): Promise<BlockDetailsResponse> {
    return withErrorHandling(async () => {
        const url = `${API_URLS.HYPERLIQUID_RPC}/explorer`;
        return await postExternal<BlockDetailsResponse>(url, {
            type: "blockDetails",
            height: height
        });
    }, 'fetching block details');
}

/**
 * Récupère les détails d'une transaction spécifique
 */
export async function fetchTransactionDetails(hash: string): Promise<TransactionDetailsResponse> {
    return withErrorHandling(async () => {
        const url = `${API_URLS.HYPERLIQUID_RPC}/explorer`;
        return await postExternal<TransactionDetailsResponse>(url, {
            type: "txDetails",
            hash: hash
        });
    }, 'fetching transaction details');
}

/**
 * Récupère les transferts depuis l'API Hypurrscan
 */
export async function fetchTransfers(): Promise<TransferData[]> {
    return withErrorHandling(async () => {
        const url = `${API_URLS.HYPURRSCAN_API}/transfers`;
        return await getExternal<TransferData[]>(url);
    }, 'fetching transfers');
}

/**
 * Récupère les déploiements depuis l'API Hypurrscan
 * @returns Liste des déploiements bruts
 */
export async function fetchDeploys(): Promise<DeployData[]> {
    return withErrorHandling(async () => {
        const url = `${API_URLS.HYPURRSCAN_API}/deploys`;
        return await getExternal<DeployData[]>(url);
    }, 'fetching deploys');
}

 