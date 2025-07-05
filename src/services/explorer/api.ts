import { 
    BlockDetailsResponse,
    TransactionDetailsResponse,
    TransferData,
    DeployData,
} from './types';
import { 
    fetchExternal, 
    buildHyperliquidRpcUrl,
    buildHypurrscanUrl,
} from '../api/base';



/**
 * Récupère les détails d'un block spécifique
 */
export async function fetchBlockDetails(height: number): Promise<BlockDetailsResponse> {
    try {
        const url = buildHyperliquidRpcUrl('EXPLORER_BLOCK_DETAILS');
        return await fetchExternal<BlockDetailsResponse>(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: "blockDetails",
                height: height
            })
        });
    } catch (error) {
        console.error('Error fetching block details:', error);
        throw error;
    }
}

/**
 * Récupère les détails d'une transaction spécifique
 */
export async function fetchTransactionDetails(hash: string): Promise<TransactionDetailsResponse> {
    try {
        const url = buildHyperliquidRpcUrl('EXPLORER_TX_DETAILS');
        return await fetchExternal<TransactionDetailsResponse>(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: "txDetails",
                hash: hash
            })
        });
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        throw error;
    }
}




export async function fetchTransfers(): Promise<TransferData[]> {
    try {
        const url = buildHypurrscanUrl('HYPURRSCAN_TRANSFERS');
        return await fetchExternal<TransferData[]>(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error fetching transfers:', error);
        throw error;
    }
}

/**
 * Récupère les déploiements depuis l'API Hypurrscan
 * @returns Liste des déploiements bruts
 */
export async function fetchDeploys(): Promise<DeployData[]> {
    try {
        const url = buildHypurrscanUrl('HYPURRSCAN_DEPLOYS');
        return await fetchExternal<DeployData[]>(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error fetching deploys:', error);
        throw error;
    }
}

 