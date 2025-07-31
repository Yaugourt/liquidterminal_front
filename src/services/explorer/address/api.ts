import { 
    UserTransactionsResponse,
    NonFundingLedgerUpdate,
    UserFill,
    FormattedUserTransaction,
    PortfolioApiResponse,
    OpenOrdersResponse,
} from './types';
import { postExternal } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { API_URLS } from '../../api/constants';
import { 
    processFillTransactions, 
    processUserTransactions, 
    processOrphanLedgerUpdates 
} from './processors';

export async function getUserTransactionsRaw(address: string): Promise<UserTransactionsResponse> {
    return withErrorHandling(async () => {
        const url = `${API_URLS.HYPERLIQUID_RPC}/explorer`;
        return await postExternal<UserTransactionsResponse>(url, {
            type: "userDetails",
            user: address
        });
    }, 'fetching raw transactions');
}

export async function getUserNonFundingLedgerUpdates(address: string): Promise<NonFundingLedgerUpdate[]> {
    return withErrorHandling(async () => {
        const url = `${API_URLS.HYPERLIQUID_API}/info`;
        return await postExternal<NonFundingLedgerUpdate[]>(url, {
            type: "userNonFundingLedgerUpdates",
            user: address,
            startTime: 1640995200000 
        });
    }, 'fetching ledger updates');
}

export async function getUserFills(address: string): Promise<UserFill[]> {
    return withErrorHandling(async () => {
        const url = `${API_URLS.HYPERLIQUID_API}/info`;
        return await postExternal<UserFill[]>(url, {
            type: "userFills",
            user: address
        });
    }, 'fetching user fills');
}

export async function getUserTransactions(address: string): Promise<FormattedUserTransaction[]> {
    return withErrorHandling(async () => {
        const [rawTransactions, ledgerUpdates, fills] = await Promise.all([
            getUserTransactionsRaw(address),
            getUserNonFundingLedgerUpdates(address),
            getUserFills(address)
        ]);

        const fillTransactions = processFillTransactions(fills, address);
        
        // Créer un Set des hashs déjà traités
        const processedHashes = new Set(fillTransactions.map(tx => tx.hash));
        const ledgerMap = new Map(ledgerUpdates.map(update => [update.hash, update]));
        const fillsMap = new Map(fills.map(fill => [fill.hash, fill]));
        
        const userTransactions = processUserTransactions(rawTransactions.txs, address, processedHashes, ledgerMap, fillsMap);
        
        // Ajout des ledgerUpdates orphelins (withdraw/deposit sans tx brute associée)
        const allHashes = new Set([
            ...fillTransactions.map(tx => tx.hash),
            ...userTransactions.map(tx => tx.hash)
        ]);
        const orphanLedgerUpdates = processOrphanLedgerUpdates(ledgerUpdates, allHashes, address);

        return [...fillTransactions, ...userTransactions, ...orphanLedgerUpdates]
            .sort((a, b) => b.time - a.time);
    }, 'fetching user transactions');
}

export async function fetchPortfolio(address: string): Promise<PortfolioApiResponse> {
    return withErrorHandling(async () => {
        const url = `${API_URLS.HYPERLIQUID_UI_API}/info`;
        return await postExternal<PortfolioApiResponse>(url, {
            type: 'portfolio',
            user: address,
        });
    }, 'fetching portfolio');
}

export async function getUserOpenOrders(address: string): Promise<OpenOrdersResponse> {
    return withErrorHandling(async () => {
        const url = `${API_URLS.HYPERLIQUID_API}/info`;
        return await postExternal<OpenOrdersResponse>(url, {
            type: "frontendOpenOrders",
            user: address
        });
    }, 'fetching open orders');
}

/**
 * Récupère les TWAP orders d'un utilisateur
 */
export const getUserTwapOrders = async (address: string): Promise<unknown[]> => {
  try {
    const response = await fetch(`https://api.hypurrscan.io/twap/${address}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
            // Silent error handling
    throw error;
  }
};

 