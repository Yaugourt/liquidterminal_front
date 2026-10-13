import { 
    BlockDetailsResponse,
    TransactionDetailsResponse,
    DeployData,
    GlobalAliasesData,
} from './types';
import { postExternal, get } from '../api/axios-config';
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
 * Récupère les déploiements (flux Hypurrscan relayé et mis en cache par le backend)
 * @returns Liste des déploiements bruts
 */
export async function fetchDeploys(): Promise<DeployData[]> {
    return withErrorHandling(async () => {
        const response = await get<{ success: boolean; data: DeployData[] }>('/explorer/deploys');
        return response.data;
    }, 'fetching deploys');
}

/**
 * Récupère les alias globaux (flux Hypurrscan relayé et mis en cache par le backend)
 * @returns Mapping des adresses vers leurs alias
 */
export async function fetchGlobalAliases(): Promise<GlobalAliasesData> {
    return withErrorHandling(async () => {
        const response = await get<{ success: boolean; data: GlobalAliasesData }>('/explorer/aliases');
        return response.data;
    }, 'fetching global aliases');
}

 